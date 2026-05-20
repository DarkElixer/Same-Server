#!/usr/bin/env node
/**
 * scripts/smoke-me.js
 *
 * Smoke-test the /me/* endpoints against a running server. Useful after
 * configuring Supabase + running `npx prisma migrate deploy` to confirm
 * the wiring end-to-end.
 *
 * Usage:
 *   node scripts/smoke-me.js                    # http://localhost:3152
 *   node scripts/smoke-me.js https://your-host  # custom base URL
 *
 * Env (optional):
 *   VIEWER_KEY=<uuid>     # reuse a key across runs (default: generated)
 *   CONTENT_ID=<id>       # movie id to fake-watch (default: smoke-1)
 */

const baseUrl = (process.argv[2] || "http://localhost:3152").replace(/\/$/, "");
const viewerKey = process.env.VIEWER_KEY || crypto.randomUUID();
const contentId = process.env.CONTENT_ID || "smoke-1";

const headers = {
  "Content-Type": "application/json",
  "X-Viewer-Key": viewerKey,
};

async function req(method, path, body) {
  const res = await fetch(baseUrl + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  console.log(`${method} ${path} → ${res.status}`);
  console.log(JSON.stringify(parsed, null, 2));
  console.log("");
  if (!res.ok) throw new Error(`${method} ${path} failed`);
  return parsed;
}

(async () => {
  console.log(`base=${baseUrl}`);
  console.log(`viewerKey=${viewerKey}`);
  console.log(`contentId=${contentId}\n`);

  // 1. heartbeat ~30s into a 100s movie
  await req("POST", "/me/playback", {
    contentType: "movie",
    contentId,
    positionSec: 30,
    durationSec: 100,
    title: "Smoke Test Movie",
  });

  // 2. heartbeat ~70s — still in progress
  await req("POST", "/me/playback", {
    contentType: "movie",
    contentId,
    positionSec: 70,
    durationSec: 100,
    title: "Smoke Test Movie",
  });

  // 3. progress lookup
  await req("GET", `/me/progress?contentType=movie&contentId=${contentId}`);

  // 4. continue watching
  await req("GET", "/me/continue?limit=10");

  // 5. history
  await req("GET", "/me/history?limit=10");

  console.log("smoke OK");
})().catch((err) => {
  console.error("smoke FAIL:", err.message);
  process.exit(1);
});
