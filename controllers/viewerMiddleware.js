// Viewer middleware.
//
// Reads the anonymous `X-Viewer-Key` header (a UUID v4 minted by the
// browser on first visit and persisted in localStorage), upserts a row
// in the `Viewer` table keyed on `deviceKey`, bumps `lastSeenAt`, and
// attaches `req.viewer = { id, deviceKey }` for downstream handlers.

const prisma = require("../config/prisma");

// Accepts any RFC 4122 UUID. We don't insist on v4 specifically because
// some clients/test scripts may generate v7 etc., and the only property
// we care about is "globally unique opaque string".
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports = async function viewerMiddleware(req, res, next) {
  const deviceKey = req.header("X-Viewer-Key");

  if (!deviceKey || !UUID_RE.test(deviceKey)) {
    return res.status(400).json({ error: "missing viewer key" });
  }

  try {
    const viewer = await prisma.viewer.upsert({
      where: { deviceKey },
      create: { deviceKey },
      update: { lastSeenAt: new Date() },
      select: { id: true, deviceKey: true },
    });

    req.viewer = viewer;
    next();
  } catch (err) {
    // Avoid leaking Prisma internals to the client.
    console.error("viewerMiddleware error:", err);
    res.status(500).json({ error: "viewer lookup failed" });
  }
};
