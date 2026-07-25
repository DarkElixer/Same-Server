const { headers: baseHeaders } = require("../constants/data");
const { portalRequest, isAuthFailure } = require("./portalClient");

let session = null; // { token, expiresAt }
let refreshing = null; // Promise<string> | null
// Survives invalidate() so the recovery path can still try the `token=` refresh
// form instead of always cold-handshaking (a cold handshake starts a NEW portal
// session for this MAC and can invalidate tokens other requests are holding).
let lastToken = null;

function getTTL() {
  const envVal = Number(process.env.TOKEN_TTL_MS);
  return !isNaN(envVal) && envVal > 0 ? envVal : 90000;
}

async function performTokenRefresh(nowFn = Date.now) {
  const portal = process.env.portal;
  const mac = process.env.mac;
  const serial = process.env.serial;
  const deviceid = process.env.deviceid;
  const deviceid2 = process.env.deviceid2;
  const sig = "";

  const prevToken = session?.token || lastToken;
  let data = null;

  // Try refreshing existing token if available
  if (prevToken) {
    const refreshUrl = `http://${portal}/stalker_portal/server/load.php?type=stb&action=handshake&token=${encodeURIComponent(prevToken)}&JsHttpRequest=1-xml`;
    try {
      data = await portalRequest(refreshUrl, { headers: baseHeaders });
    } catch (err) {
      data = null;
    }
  }

  // Fallback to cold start handshake if no prevToken or refresh failed/returned no token
  if (!data || !data.js || !data.js.token) {
    // prevToken is dead — drop it so subsequent refreshes don't keep retrying it
    lastToken = null;
    const coldUrl = `http://${portal}/stalker_portal/server/load.php?type=stb&action=handshake&prehash=false&JsHttpRequest=1-xml`;
    data = await portalRequest(coldUrl, { headers: baseHeaders });
  }

  if (!data || !data.js || !data.js.token) {
    const err = new Error("Handshake failed: missing token in portal response");
    err.code = "AUTH_FAILED";
    throw err;
  }

  const newToken = data.js.token;

  // Activate token via get_profile
  const profileUrl = `http://${portal}/stalker_portal/server/load.php?type=stb&action=get_profile&hd=1&sn=${serial}&device_id=${deviceid}&device_id2=${deviceid2}&signature=${sig}&metrics={\"mac\":\"${mac}\",\"sn\":\"${serial}\",\"model\":\"MAG254\",\"type\":\"STB\",\"uid\":\"${deviceid}\",\"random\":\"${newToken}\"}&JsHttpRequest=1-xml`;
  await portalRequest(profileUrl, {
    headers: { ...baseHeaders, Authorization: `Bearer ${newToken}` },
  });

  const ttl = getTTL();
  lastToken = newToken;
  session = {
    token: newToken,
    expiresAt: nowFn() + ttl,
  };

  return newToken;
}

async function getToken(nowFn = Date.now) {
  if (session && nowFn() < session.expiresAt) {
    return session.token;
  }

  if (refreshing) {
    return refreshing;
  }

  refreshing = performTokenRefresh(nowFn).finally(() => {
    refreshing = null;
  });

  return refreshing;
}

function invalidate() {
  session = null; // lastToken is kept on purpose — see its declaration
}

async function portalFetch(url, opts = {}) {
  const token = await getToken();
  const reqHeaders = {
    ...baseHeaders,
    ...(opts.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const data = await portalRequest(url, { ...opts, headers: reqHeaders });

  if (isAuthFailure(data)) {
    console.warn(`[portalFetch] Auth failure detected for URL action. Invalidating session and retrying once...`);
    invalidate();
    const newToken = await getToken();
    const retryHeaders = {
      ...baseHeaders,
      ...(opts.headers || {}),
      Authorization: `Bearer ${newToken}`,
    };
    const retryData = await portalRequest(url, { ...opts, headers: retryHeaders });

    if (isAuthFailure(retryData)) {
      const err = new Error("Authorization failed.");
      err.code = "AUTH_FAILED";
      throw err;
    }

    return retryData;
  }

  return data;
}

// Test helper methods
function _getSession() {
  return session;
}

function _setSession(s) {
  session = s;
}

function _reset() {
  session = null;
  lastToken = null;
  refreshing = null;
}

module.exports = {
  getToken,
  invalidate,
  portalFetch,
  _getSession,
  _setSession,
  _reset,
};
