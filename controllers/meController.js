// /me/* controller — anonymous viewer playback persistence.
//
// All handlers expect `viewerMiddleware` to have populated
// `req.viewer = { id, deviceKey }`.

const prisma = require("../config/prisma");

// ContentType enum mirror — kept in sync with prisma/schema.prisma.
const CONTENT_TYPES = { movie: "MOVIE", series: "SERIES" };

// Threshold above which an item is treated as "finished".
const FINISHED_PERCENT = 0.9;

// Rate-limit window for PlaybackEvent inserts (ms).
const EVENT_DEDUPE_WINDOW_MS = 60 * 1000;

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

function normaliseContentType(raw) {
  if (typeof raw !== "string") return null;
  return CONTENT_TYPES[raw.toLowerCase()] || null;
}

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

function serverError(res, err, context) {
  console.error(`/me ${context} error:`, err);
  return res.status(500).json({ error: "internal error" });
}

function serialiseProgress(row) {
  if (!row) return null;
  return {
    contentType: row.contentType === "MOVIE" ? "movie" : "series",
    contentId: row.contentId,
    seasonId: row.seasonId,
    episodeId: row.episodeId,
    seriesNo: row.seriesNo,
    positionSec: row.positionSec,
    durationSec: row.durationSec,
    percent: row.percent,
    finished: row.finished,
    title: row.title,
    posterUrl: row.posterUrl,
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : row.updatedAt,
  };
}

// --------------------------------------------------------------------
// POST /me/playback — heartbeat / pause / seek / complete write path.
// --------------------------------------------------------------------
exports.postPlayback = async (req, res) => {
  try {
    const {
      contentType: rawType,
      contentId,
      seasonId,
      episodeId,
      seriesNo,
      positionSec,
      durationSec,
      title,
      posterUrl,
    } = req.body || {};

    const contentType = normaliseContentType(rawType);
    if (!contentType) {
      return badRequest(res, "invalid contentType");
    }
    if (typeof contentId !== "string" || !contentId) {
      return badRequest(res, "missing contentId");
    }
    if (typeof positionSec !== "number" || !Number.isFinite(positionSec) || positionSec < 0) {
      return badRequest(res, "invalid positionSec");
    }
    if (typeof durationSec !== "number" || !Number.isFinite(durationSec) || durationSec <= 0) {
      return badRequest(res, "invalid durationSec");
    }
    if (contentType === "SERIES" && (typeof episodeId !== "string" || !episodeId)) {
      return badRequest(res, "series requires episodeId");
    }

    const percent = clamp(positionSec / durationSec, 0, 1);
    const finished = percent >= FINISHED_PERCENT;
    const episodeKey = episodeId || "";
    const positionInt = Math.floor(positionSec);
    const durationInt = Math.floor(durationSec);

    const viewerId = req.viewer.id;

    // Check whether `finished` is flipping false → true. We need the
    // current state to decide whether to force-write a PlaybackEvent
    // (spec: always insert when finished flips false→true, even if
    // we're inside the 60s dedupe window).
    const existing = await prisma.watchProgress.findUnique({
      where: {
        viewer_content_episode: {
          viewerId,
          contentType,
          contentId,
          episodeKey,
        },
      },
      select: { finished: true },
    });
    const finishedJustFlipped = finished && !(existing && existing.finished);

    const upserted = await prisma.watchProgress.upsert({
      where: {
        viewer_content_episode: {
          viewerId,
          contentType,
          contentId,
          episodeKey,
        },
      },
      create: {
        viewerId,
        contentType,
        contentId,
        seasonId: seasonId || null,
        episodeId: episodeId || null,
        episodeKey,
        seriesNo: seriesNo || null,
        positionSec: positionInt,
        durationSec: durationInt,
        percent,
        finished,
        title: typeof title === "string" ? title : null,
        posterUrl: typeof posterUrl === "string" ? posterUrl : null,
      },
      update: {
        positionSec: positionInt,
        durationSec: durationInt,
        percent,
        finished,
        title: typeof title === "string" ? title : undefined,
        posterUrl: typeof posterUrl === "string" ? posterUrl : undefined,
      },
    });

    // Rate-limit PlaybackEvent writes to one per (viewer, content,
    // episode) per minute, but always record completion transitions so
    // downstream trending logic sees the signal.
    let shouldInsertEvent = finishedJustFlipped;
    if (!shouldInsertEvent) {
      const since = new Date(Date.now() - EVENT_DEDUPE_WINDOW_MS);
      const recent = await prisma.playbackEvent.findFirst({
        where: {
          viewerId,
          contentType,
          contentId,
          episodeId: episodeId || null,
          occurredAt: { gt: since },
        },
        select: { id: true },
      });
      shouldInsertEvent = !recent;
    }

    if (shouldInsertEvent) {
      await prisma.playbackEvent.create({
        data: {
          viewerId,
          contentType,
          contentId,
          episodeId: episodeId || null,
          positionSec: positionInt,
          durationSec: durationInt,
        },
      });
    }

    return res.json({
      ok: true,
      percent: upserted.percent,
      finished: upserted.finished,
    });
  } catch (err) {
    return serverError(res, err, "POST /playback");
  }
};

// --------------------------------------------------------------------
// GET /me/progress?contentType=&contentId=&episodeId= — single lookup.
// --------------------------------------------------------------------
exports.getProgress = async (req, res) => {
  try {
    const contentType = normaliseContentType(req.query.contentType);
    const contentId = req.query.contentId;
    const episodeId = req.query.episodeId;

    if (!contentType) return badRequest(res, "invalid contentType");
    if (typeof contentId !== "string" || !contentId) {
      return badRequest(res, "missing contentId");
    }

    const episodeKey =
      typeof episodeId === "string" && episodeId ? episodeId : "";

    const row = await prisma.watchProgress.findUnique({
      where: {
        viewer_content_episode: {
          viewerId: req.viewer.id,
          contentType,
          contentId,
          episodeKey,
        },
      },
    });

    if (!row) return res.json({ progress: null });

    return res.json({
      progress: {
        positionSec: row.positionSec,
        durationSec: row.durationSec,
        percent: row.percent,
        finished: row.finished,
        updatedAt: row.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    return serverError(res, err, "GET /progress");
  }
};

// --------------------------------------------------------------------
// GET /me/continue?limit=20 — latest in-progress items, one per title.
// --------------------------------------------------------------------
exports.getContinueWatching = async (req, res) => {
  try {
    const limit = clamp(parseInt(req.query.limit, 10) || 20, 1, 100);
    const viewerId = req.viewer.id;

    // DISTINCT ON keeps the row with the most-recent updatedAt per
    // (content_type, content_id) — i.e. the most recently watched
    // episode of a series, or the only row for a movie.
    const rows = await prisma.$queryRaw`
      SELECT DISTINCT ON (content_type, content_id)
        id,
        content_type        AS "contentType",
        content_id          AS "contentId",
        season_id           AS "seasonId",
        episode_id          AS "episodeId",
        series_no           AS "seriesNo",
        position_sec        AS "positionSec",
        duration_sec        AS "durationSec",
        percent,
        finished,
        title,
        poster_url          AS "posterUrl",
        updated_at          AS "updatedAt"
      FROM watch_progress
      WHERE viewer_id = ${viewerId}::uuid
        AND finished = false
        AND percent BETWEEN 0.02 AND 0.95
      ORDER BY content_type, content_id, updated_at DESC
    `;

    // DISTINCT ON forces an ORDER BY on its key columns first, so we
    // re-sort the resulting set by recency and trim to `limit`.
    const items = rows
      .map(serialiseProgress)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .slice(0, limit);

    return res.json({ items });
  } catch (err) {
    return serverError(res, err, "GET /continue");
  }
};

// --------------------------------------------------------------------
// GET /me/history?limit=50&cursor=<isoDate> — paginated history.
// --------------------------------------------------------------------
exports.getHistory = async (req, res) => {
  try {
    const limit = clamp(parseInt(req.query.limit, 10) || 50, 1, 100);

    let cursorDate;
    if (req.query.cursor) {
      const parsed = new Date(req.query.cursor);
      if (Number.isNaN(parsed.getTime())) {
        return badRequest(res, "invalid cursor");
      }
      cursorDate = parsed;
    }

    const rows = await prisma.watchProgress.findMany({
      where: {
        viewerId: req.viewer.id,
        ...(cursorDate ? { updatedAt: { lt: cursorDate } } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    const items = rows.map(serialiseProgress);
    const nextCursor =
      items.length === limit ? items[items.length - 1].updatedAt : null;

    return res.json({ items, nextCursor });
  } catch (err) {
    return serverError(res, err, "GET /history");
  }
};
