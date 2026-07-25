const axios = require("axios");
const http = require("http");
const https = require("https");

const agentOpts = { keepAlive: true, maxSockets: 64, maxFreeSockets: 16 };
const httpAgent = new http.Agent(agentOpts);
const httpsAgent = new https.Agent(agentOpts);

const CACHE_MAX_ENTRIES = 500;
const cache = new Map(); // cacheKey -> { data, expires }
const inflight = new Map(); // cacheKey -> Promise (in-flight de-dupe / single-flight)

// ponytail: single shared breaker for the one upstream portal host
const breaker = { failures: 0, authFailures: 0, threshold: 5, openUntil: 0, cooldownMs: 15000 };

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isBreakerOpen() {
  return Date.now() < breaker.openUntil;
}

function recordResult(ok) {
  if (ok) {
    breaker.failures = 0;
    return;
  }
  breaker.failures += 1;
  if (breaker.failures >= breaker.threshold) {
    breaker.openUntil = Date.now() + breaker.cooldownMs;
    breaker.failures = 0;
    console.warn(`[portalClient] Circuit breaker OPENED for ${breaker.cooldownMs}ms due to repeated failures.`);
  }
}

function isEmptyResponse(data) {
  return data === undefined || data === null || data === "";
}

// An empty body is NOT treated as an auth failure: a false positive here costs a
// full re-handshake (a new portal session for this MAC), so empty responses are
// surfaced as transient upstream errors instead.
function isAuthFailure(data) {
  if (isEmptyResponse(data)) return false;
  if (data === "Authorization failed.") return true;
  if (typeof data === "string") return !data.trim().startsWith("{"); // HTML error page
  if (data.js === false) return true;
  return false;
}

function recordAuthResult(data) {
  if (isAuthFailure(data)) {
    breaker.authFailures += 1;
    if (breaker.authFailures >= 10) {
      breaker.openUntil = Date.now() + breaker.cooldownMs;
      breaker.authFailures = 0;
      console.warn(`[portalClient] Circuit breaker OPENED for ${breaker.cooldownMs}ms due to repeated auth failures.`);
    }
  } else {
    breaker.authFailures = 0;
  }
}

async function requestWithBackoff(fn, { retries = 3, baseDelay = 500 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[portalClient] Outbound HTTP request attempt ${attempt + 1}/${retries + 1}`);
      const result = await fn();
      recordResult(true);
      return result;
    } catch (err) {
      console.error(`[portalClient] Attempt ${attempt + 1} failed: ${err.message} (code: ${err.code || 'N/A'}, status: ${err.response?.status || 'N/A'})`);
      const status = err.response?.status;
      if (status !== 429 && status !== 503) {
        // Only record circuit breaker failure for 5xx server errors or network failure, not 4xx client/auth errors
        if (!status || status >= 500) {
          recordResult(false);
        }
        throw err;
      }
      recordResult(false);
      if (attempt === retries) throw err;
      const retryAfter = Number(err.response?.headers?.["retry-after"]) * 1000;
      const backoff = retryAfter || baseDelay * 2 ** attempt;
      const jitter = Math.random() * 250;
      console.log(`[portalClient] Backing off for ${Math.round(backoff + jitter)}ms...`);
      await wait(backoff + jitter);
    }
  }
}

/**
 * Fetch a stalker-portal URL through backoff + circuit breaker + optional
 * cache/coalescing.
 */
async function portalRequest(url, { headers, cacheKey, ttl, shouldCache, timeout = 8000 } = {}) {
  const actionMatch = String(url).match(/[?&]action=([^&]+)/);
  const actionStr = actionMatch ? actionMatch[1] : String(url).split("?")[0];
  console.log(`[portalRequest] Called for action: ${actionStr} (cacheKey: ${cacheKey || 'none'})`);
  if (cacheKey) {
    const hit = cache.get(cacheKey);
    if (hit && hit.expires > Date.now()) {
      console.log(`[portalRequest] Cache HIT for key: ${cacheKey}`);
      return hit.data;
    }
    if (inflight.has(cacheKey)) {
      console.log(`[portalRequest] In-flight coalescing HIT for key: ${cacheKey}`);
      return inflight.get(cacheKey);
    }
  }

  if (isBreakerOpen()) {
    console.warn(`[portalRequest] Circuit breaker is currently OPEN, rejecting request.`);
    const err = new Error("Portal temporarily unavailable, please retry shortly.");
    err.code = "CIRCUIT_OPEN";
    throw err;
  }

  const exec = requestWithBackoff(() => axios(url, { headers, timeout, httpAgent, httpsAgent }))
    .then((response) => {
      const data = response.data;
      console.log(`[portalRequest] Received response data type: ${typeof data}`);
      if (isEmptyResponse(data)) {
        recordResult(false); // a 200 with no body is a broken upstream, not an auth problem
        const err = new Error("Empty response from portal");
        err.code = "EMPTY_RESPONSE";
        throw err;
      }
      recordAuthResult(data);
      if (cacheKey && ttl && !isAuthFailure(data) && (!shouldCache || shouldCache(data))) {
        if (cache.has(cacheKey)) {
          cache.delete(cacheKey);
        } else if (cache.size >= CACHE_MAX_ENTRIES) {
          const oldestKey = cache.keys().next().value;
          if (oldestKey !== undefined) cache.delete(oldestKey);
        }
        cache.set(cacheKey, { data, expires: Date.now() + ttl });
      }
      return data;
    })
    .finally(() => {
      if (cacheKey) inflight.delete(cacheKey);
    });

  if (cacheKey) inflight.set(cacheKey, exec);
  return exec;
}

module.exports = {
  portalRequest,
  requestWithBackoff,
  isBreakerOpen,
  isAuthFailure,
  httpAgent,
  httpsAgent,
};
