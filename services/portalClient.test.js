// ponytail self-check: run with `node services/portalClient.test.js`
const assert = require("assert");
const Module = require("module");

// Stub out axios before requiring portalClient, so no real network call happens.
let callCount = 0;
let behavior = () => Promise.resolve({ data: { ok: true } });
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "axios") {
    return (...args) => {
      callCount += 1;
      return behavior(...args);
    };
  }
  return originalLoad(request, parent, isMain);
};

const { portalRequest } = require("./portalClient");

async function main() {
  // 1. Basic success + cache hit (second call with same ttl'd key skips axios)
  callCount = 0;
  behavior = () => Promise.resolve({ data: { js: "genres" } });
  const a = await portalRequest("http://x/genres", { cacheKey: "genres", ttl: 60000 });
  const b = await portalRequest("http://x/genres", { cacheKey: "genres", ttl: 60000 });
  assert.deepStrictEqual(a, { js: "genres" });
  assert.deepStrictEqual(b, { js: "genres" });
  assert.strictEqual(callCount, 1, "second call should hit cache, not axios");

  // 2. In-flight coalescing: two concurrent calls with same key -> one axios call
  callCount = 0;
  let resolveFn;
  behavior = () => new Promise((resolve) => { resolveFn = resolve; });
  const p1 = portalRequest("http://x/coalesce", { cacheKey: "coalesce" });
  const p2 = portalRequest("http://x/coalesce", { cacheKey: "coalesce" });
  resolveFn({ data: { js: "shared" } });
  const [r1, r2] = await Promise.all([p1, p2]);
  assert.deepStrictEqual(r1, { js: "shared" });
  assert.deepStrictEqual(r2, { js: "shared" });
  assert.strictEqual(callCount, 1, "concurrent identical requests should coalesce into one axios call");

  // 3. Retries on 429 then succeeds
  callCount = 0;
  let attempts = 0;
  behavior = () => {
    attempts += 1;
    if (attempts < 3) {
      const err = new Error("rate limited");
      err.response = { status: 429, headers: {} };
      return Promise.reject(err);
    }
    return Promise.resolve({ data: { js: "ok-after-retries" } });
  };
  const r = await portalRequest("http://x/retry-key-unique");
  assert.deepStrictEqual(r, { js: "ok-after-retries" });
  assert.strictEqual(attempts, 3, "should retry on 429 until success");

  // 4. Does not retry on non-retryable status (e.g. 401)
  callCount = 0;
  attempts = 0;
  behavior = () => {
    attempts += 1;
    const err = new Error("auth failed");
    err.response = { status: 401, headers: {} };
    return Promise.reject(err);
  };
  await assert.rejects(() => portalRequest("http://x/auth-fail-unique"), /auth failed/);
  assert.strictEqual(attempts, 1, "should not retry on 401");

  // 5. shouldCache guard: a "failure" response body (no HTTP error) must not be cached
  callCount = 0;
  behavior = () => Promise.resolve({ data: "Authorization failed." });
  const fail1 = await portalRequest("http://x/authfail", {
    cacheKey: "authfail",
    ttl: 60000,
    shouldCache: (data) => data !== "Authorization failed.",
  });
  const fail2 = await portalRequest("http://x/authfail", {
    cacheKey: "authfail",
    ttl: 60000,
    shouldCache: (data) => data !== "Authorization failed.",
  });
  assert.strictEqual(fail1, "Authorization failed.");
  assert.strictEqual(fail2, "Authorization failed.");
  assert.strictEqual(callCount, 2, "failure responses must not be cached, each call should re-hit axios");

  console.log("portalClient self-check: all assertions passed");
}

main()
  .catch((err) => {
    console.error("portalClient self-check FAILED:", err);
    process.exit(1);
  })
  .finally(() => {
    Module._load = originalLoad;
  });
