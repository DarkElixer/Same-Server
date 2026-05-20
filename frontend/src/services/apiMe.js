// /me/* client.
//
// Owns the anonymous viewer key minted in the browser on first visit,
// and wraps the four /me endpoints. The header is *only* attached
// here, never on the existing Stalker proxy calls in apiVod/apiLive.

const VIEWER_KEY_STORAGE = "viewerKey";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for ancient browsers — manual v4.
  const rand = (n) =>
    [...crypto.getRandomValues(new Uint8Array(n))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  const a = rand(4);
  const b = rand(2);
  // v4 sets the high nibble of byte 6 to 0x4 and of byte 8 to 0x8-0xb.
  const c = "4" + rand(2).slice(1);
  const d = ((8 + Math.floor(Math.random() * 4)).toString(16) + rand(2).slice(1));
  const e = rand(6);
  return `${a}-${b}-${c}-${d}-${e}`;
}

export function getViewerKey() {
  let key = null;
  try {
    key = localStorage.getItem(VIEWER_KEY_STORAGE);
  } catch {
    // localStorage may be unavailable (Safari private mode, SSR, etc.).
  }
  if (!key || !UUID_RE.test(key)) {
    key = generateUuid();
    try {
      localStorage.setItem(VIEWER_KEY_STORAGE, key);
    } catch {
      /* ignore */
    }
  }
  return key;
}

async function meFetch(path, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    "X-Viewer-Key": getViewerKey(),
    ...(opts.headers || {}),
  };
  const res = await fetch(path, { ...opts, headers });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json())?.error || "";
    } catch {
      /* ignore */
    }
    throw new Error(`/me request failed (${res.status}) ${detail}`);
  }
  return res.json();
}

export function postPlayback(payload) {
  return meFetch("/me/playback", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProgress({ contentType, contentId, episodeId }) {
  const params = new URLSearchParams({ contentType, contentId });
  if (episodeId) params.set("episodeId", episodeId);
  return meFetch(`/me/progress?${params.toString()}`);
}

export function getContinueWatching(limit = 20) {
  const params = new URLSearchParams({ limit: String(limit) });
  return meFetch(`/me/continue?${params.toString()}`);
}

export function getHistory({ limit = 50, cursor } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return meFetch(`/me/history?${params.toString()}`);
}

// Best-effort fire-and-forget write used by the unmount path. Uses
// `sendBeacon` so the request survives navigation; falls back to
// `fetch({ keepalive: true })`. The viewer key still has to ride
// through, but `sendBeacon` does not let us set custom headers — so we
// post a Blob and the server reads the key from the JSON body via a
// duplicate field. We instead use fetch+keepalive whenever possible
// because it preserves the `X-Viewer-Key` header the server expects.
export function sendPlaybackBeacon(payload) {
  const body = JSON.stringify(payload);
  try {
    return fetch("/me/playback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Viewer-Key": getViewerKey(),
      },
      body,
      keepalive: true,
    });
  } catch {
    // Last-ditch: sendBeacon can't carry the X-Viewer-Key header, so
    // it's a no-op fallback that at least won't throw during unload.
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(
          "/me/playback",
          new Blob([body], { type: "application/json" })
        );
      } catch {
        /* swallow */
      }
    }
    return Promise.resolve();
  }
}
