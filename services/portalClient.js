const axios = require("axios");

const CACHE_TTL_DEFAULT = 5 * 60 * 1000;
const cache = new Map(); // cacheKey -> { data, expires }
const inflight = new Map(); // cacheKey -> Promise (in-flight de-dupe / single-flight)

// ponytail: single shared breaker for the one upstream portal host, per-host breakers if multi-portal ever happens
const breaker = { failures: 0, threshold: 5, openUntil: 0, cooldownMs: 15000 };

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
 * cache/coalescing. Pass cacheKey (no ttl) to only coalesce concurrent
 * identical requests (e.g. handshake); pass cacheKey + ttl to also cache
 * the result across calls (e.g. genres/categories).
 */
async function portalRequest(url, { headers, cacheKey, ttl, shouldCache, timeout = 8000 } = {}) {
  console.log(`[portalRequest] Called for URL: ${url} (cacheKey: ${cacheKey || 'none'})`);
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

  const exec = requestWithBackoff(() => axios(url, { headers, timeout }))
    .then((response) => {
      const data = response.data;
      console.log(`[portalRequest] Received response data type: ${typeof data}`);
      if (cacheKey && (!shouldCache || shouldCache(data))) {
        cache.set(cacheKey, { data, expires: Date.now() + (ttl || 0) });
      }
      return data;
    })
    .finally(() => {
      if (cacheKey) inflight.delete(cacheKey);
    });

  if (cacheKey) inflight.set(cacheKey, exec);
  return exec;
}

module.exports = { portalRequest, requestWithBackoff, isBreakerOpen };
