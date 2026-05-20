// usePlaybackTracking
//
// Wires JW Player events for the two non-live players (VOD movie and
// series episode) to the /me/playback endpoint. Returns a `playerProps`
// object that the caller should spread onto its <ReactJwPlayer> so the
// hook can hook into `onReady`. Also exposes `resumePositionSec` for
// the player to seek to on start.
//
// Resume strategy: on mount we GET /me/progress; if 2% < percent < 95%
// and `finished` is false we expose the position. The hook then calls
// `window.jwplayer(playerId).seek(...)` after `onReady` fires. We seek
// once and remember that we've done it so subsequent ready events
// (e.g. autoplay continuation) don't loop us back.

import { useCallback, useEffect, useRef } from "react";
import {
  getProgress,
  postPlayback,
  sendPlaybackBeacon,
} from "../services/apiMe";

const HEARTBEAT_THROTTLE_MS = 15_000;

function pickIdentity({ contentType, contentId, episodeId }) {
  return `${contentType}::${contentId}::${episodeId || ""}`;
}

function withMeta(state, extras = {}) {
  return {
    contentType: state.contentType,
    contentId: state.contentId,
    seasonId: state.seasonId,
    episodeId: state.episodeId,
    seriesNo: state.seriesNo,
    title: state.title,
    posterUrl: state.posterUrl,
    ...extras,
  };
}

export default function usePlaybackTracking({
  playerId,
  contentType,
  contentId,
  seasonId,
  episodeId,
  seriesNo,
  title,
  posterUrl,
  enabled = true,
}) {
  // Keep latest meta in a ref so the JW callbacks (registered once)
  // always see the freshest title / poster / season / etc.
  const stateRef = useRef({
    contentType,
    contentId,
    seasonId,
    episodeId,
    seriesNo,
    title,
    posterUrl,
  });
  useEffect(() => {
    stateRef.current = {
      contentType,
      contentId,
      seasonId,
      episodeId,
      seriesNo,
      title,
      posterUrl,
    };
  }, [contentType, contentId, seasonId, episodeId, seriesNo, title, posterUrl]);

  const lastSendAtRef = useRef(0);
  const lastPositionRef = useRef(0);
  const lastDurationRef = useRef(0);
  const finishedRef = useRef(false);
  const resumeTargetRef = useRef(null); // seconds to seek to on ready
  const didResumeRef = useRef(false);
  const teardownRef = useRef(null);
  const identityRef = useRef(
    pickIdentity({ contentType, contentId, episodeId })
  );

  // Reset state whenever the tracked content changes (e.g. next episode).
  useEffect(() => {
    const nextIdentity = pickIdentity({ contentType, contentId, episodeId });
    if (nextIdentity !== identityRef.current) {
      identityRef.current = nextIdentity;
      lastSendAtRef.current = 0;
      lastPositionRef.current = 0;
      lastDurationRef.current = 0;
      finishedRef.current = false;
      resumeTargetRef.current = null;
      didResumeRef.current = false;
    }
  }, [contentType, contentId, episodeId]);

  // Resume lookup.
  useEffect(() => {
    if (!enabled || !contentType || !contentId) return;
    let cancelled = false;
    const identityAtFetch = pickIdentity({ contentType, contentId, episodeId });

    getProgress({ contentType, contentId, episodeId })
      .then((res) => {
        if (cancelled) return;
        if (identityAtFetch !== identityRef.current) return;
        const p = res?.progress;
        if (!p) return;
        finishedRef.current = !!p.finished;
        if (
          !p.finished &&
          p.percent > 0.02 &&
          p.percent < 0.95 &&
          typeof p.positionSec === "number"
        ) {
          resumeTargetRef.current = p.positionSec;
          // If onReady already fired before /me/progress resolved, try
          // to seek now.
          tryResume(playerId);
        }
      })
      .catch(() => {
        /* non-blocking */
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, contentType, contentId, episodeId, playerId]);

  // -- send helpers ---------------------------------------------------

  const buildPayload = useCallback((positionSec, durationSec) => {
    const state = stateRef.current;
    return withMeta(state, {
      positionSec: Math.max(0, Math.floor(positionSec)),
      durationSec: Math.max(0, Math.floor(durationSec)),
    });
  }, []);

  const sendNow = useCallback(
    (positionSec, durationSec, opts = {}) => {
      if (!enabled) return;
      const dur = durationSec || lastDurationRef.current;
      if (!dur || dur <= 0) return;
      const pos = Math.max(0, positionSec || 0);
      lastPositionRef.current = pos;
      lastDurationRef.current = dur;
      lastSendAtRef.current = Date.now();
      const payload = buildPayload(pos, dur);
      if (opts.beacon) {
        sendPlaybackBeacon(payload);
        return;
      }
      postPlayback(payload).catch(() => {
        /* swallow */
      });
    },
    [enabled, buildPayload]
  );

  const sendThrottled = useCallback(
    (positionSec, durationSec) => {
      if (!enabled) return;
      const now = Date.now();
      if (now - lastSendAtRef.current < HEARTBEAT_THROTTLE_MS) {
        lastPositionRef.current = positionSec;
        lastDurationRef.current = durationSec;
        return;
      }
      sendNow(positionSec, durationSec);
    },
    [enabled, sendNow]
  );

  // -- JW Player attachment ------------------------------------------

  function tryResume(id) {
    if (didResumeRef.current) return;
    if (resumeTargetRef.current == null) return;
    if (typeof window === "undefined" || !window.jwplayer) return;
    const jw = window.jwplayer(id);
    if (!jw || typeof jw.seek !== "function") return;
    // JW reports state == 'idle' before playback begins. Calling seek
    // before duration is known is a no-op for some skins, so we wait
    // until duration is reported.
    const duration =
      typeof jw.getDuration === "function" ? jw.getDuration() : 0;
    if (!duration || duration <= 0) return;
    try {
      jw.seek(resumeTargetRef.current);
      didResumeRef.current = true;
    } catch {
      /* ignore */
    }
  }

  const attach = useCallback(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !window.jwplayer) return;
    const jw = window.jwplayer(playerId);
    if (!jw || typeof jw.on !== "function") return;

    const onTime = (e) => {
      const pos = e?.position ?? 0;
      const dur = e?.duration ?? lastDurationRef.current;
      lastPositionRef.current = pos;
      lastDurationRef.current = dur;
      sendThrottled(pos, dur);
      // Late resume retry if duration only became known mid-playback.
      if (!didResumeRef.current && resumeTargetRef.current != null) {
        tryResume(playerId);
      }
    };
    const onPause = (e) => {
      const pos = e?.position ?? lastPositionRef.current;
      const dur = lastDurationRef.current;
      sendNow(pos, dur);
    };
    const onSeek = (e) => {
      // JW passes `position` (pre-seek) and `offset` (target).
      const pos = e?.offset ?? e?.position ?? lastPositionRef.current;
      const dur = lastDurationRef.current;
      sendNow(pos, dur);
    };
    const onComplete = () => {
      const dur = lastDurationRef.current;
      finishedRef.current = true;
      sendNow(dur, dur);
    };

    jw.on("time", onTime);
    jw.on("pause", onPause);
    jw.on("seek", onSeek);
    jw.on("complete", onComplete);

    teardownRef.current = () => {
      try {
        if (typeof jw.off === "function") {
          jw.off("time", onTime);
          jw.off("pause", onPause);
          jw.off("seek", onSeek);
          jw.off("complete", onComplete);
        }
      } catch {
        /* JW may already have torn the player down */
      }
    };

    // Try to apply pending resume immediately if /me/progress beat us.
    tryResume(playerId);
  }, [enabled, playerId, sendNow, sendThrottled]);

  const handleReady = useCallback(() => {
    attach();
  }, [attach]);

  // Force-flush on unmount (page navigation, route change).
  useEffect(() => {
    return () => {
      if (teardownRef.current) {
        teardownRef.current();
        teardownRef.current = null;
      }
      if (
        enabled &&
        lastDurationRef.current > 0 &&
        lastPositionRef.current >= 0 &&
        !finishedRef.current
      ) {
        sendNow(lastPositionRef.current, lastDurationRef.current, {
          beacon: true,
        });
      }
    };
    // We intentionally depend only on `enabled` — we want this cleanup
    // to run on real unmount, not on every meta change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    handleReady,
    resumePositionSec: resumeTargetRef.current,
  };
}
