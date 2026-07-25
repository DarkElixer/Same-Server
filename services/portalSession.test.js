const assert = require("assert");
const Module = require("module");

let axiosCalls = [];
let behavior = () => Promise.resolve({ data: { js: { token: "default-token" } } });

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "axios") {
    return (config) => {
      const url = typeof config === "string" ? config : config.url;
      const headers = config.headers || {};
      axiosCalls.push({ url, headers, config });
      return behavior(config);
    };
  }
  return originalLoad(request, parent, isMain);
};

const { getToken, invalidate, portalFetch, _setSession, _reset } = require("./portalSession");

async function runTests() {
  // Test 1: Cold start uses prehash=false
  axiosCalls = [];
  _reset();
  behavior = (cfg) => {
    const url = typeof cfg === "string" ? cfg : cfg.url;
    if (url.includes("action=handshake")) {
      return Promise.resolve({ data: { js: { token: "token-1" } } });
    }
    return Promise.resolve({ data: { js: { profile: "ok" } } });
  };
  const token1 = await getToken();
  assert.strictEqual(token1, "token-1");
  assert.strictEqual(axiosCalls.length, 2, "handshake + get_profile");
  assert.ok(axiosCalls[0].url.includes("prehash=false"), "cold start must use prehash=false");
  assert.ok(axiosCalls[1].url.includes("action=get_profile"), "must activate via get_profile");

  // Test 2: Single-flight concurrency - 5 concurrent calls -> 1 handshake + 1 profile call
  axiosCalls = [];
  _reset();
  let resolveHandshake;
  behavior = (cfg) => {
    const url = typeof cfg === "string" ? cfg : cfg.url;
    if (url.includes("action=handshake")) {
      return new Promise((res) => { resolveHandshake = res; });
    }
    return Promise.resolve({ data: { js: { profile: "ok" } } });
  };
  const promises = [getToken(), getToken(), getToken(), getToken(), getToken()];
  resolveHandshake({ data: { js: { token: "token-singleflight" } } });
  const tokens = await Promise.all(promises);
  assert.deepStrictEqual(tokens, Array(5).fill("token-singleflight"));
  assert.strictEqual(axiosCalls.length, 2, "5 concurrent calls must trigger only 1 handshake and 1 profile call");

  // Test 3: Refresh uses token=<prev> when session is expired
  axiosCalls = [];
  let simulatedTime = 1000;
  const mockNow = () => simulatedTime;

  _reset();
  behavior = (cfg) => {
    const url = typeof cfg === "string" ? cfg : cfg.url;
    if (url.includes("token=token-1")) {
      return Promise.resolve({ data: { js: { token: "token-refreshed" } } });
    }
    if (url.includes("action=handshake")) {
      return Promise.resolve({ data: { js: { token: "token-1" } } });
    }
    return Promise.resolve({ data: { js: { profile: "ok" } } });
  };

  const firstToken = await getToken(mockNow);
  assert.strictEqual(firstToken, "token-1");

  // Fast-forward time past 90s TTL
  simulatedTime += 95000;
  axiosCalls = [];

  const refreshedToken = await getToken(mockNow);
  assert.strictEqual(refreshedToken, "token-refreshed");
  assert.ok(axiosCalls[0].url.includes("token=token-1"), "refresh must use token=<prev>");
  assert.ok(!axiosCalls[0].url.includes("prehash=false"), "refresh must NOT use prehash=false");

  // Test 4: Fallback - if token= refresh fails/returns no token, falls back to prehash=false
  axiosCalls = [];
  _reset();
  simulatedTime = 1000;
  _setSession({ token: "expired-dead-token", expiresAt: 500 });

  behavior = (cfg) => {
    const url = typeof cfg === "string" ? cfg : cfg.url;
    if (url.includes("token=expired-dead-token")) {
      return Promise.resolve({ data: "Authorization failed." }); // refresh fails
    }
    if (url.includes("prehash=false")) {
      return Promise.resolve({ data: { js: { token: "token-fallback" } } });
    }
    return Promise.resolve({ data: { js: { profile: "ok" } } });
  };

  const fallbackToken = await getToken(mockNow);
  assert.strictEqual(fallbackToken, "token-fallback");
  assert.ok(axiosCalls[0].url.includes("token=expired-dead-token"), "first attempt tries token=<prev>");
  assert.ok(axiosCalls[1].url.includes("prehash=false"), "fallback attempt uses prehash=false");

  // Test 5: portalFetch auth failure triggers 1 invalidate + 1 retry; 2nd auth failure throws AUTH_FAILED
  axiosCalls = [];
  _reset();
  simulatedTime = 1000;

  behavior = (cfg) => {
    const url = typeof cfg === "string" ? cfg : cfg.url;
    if (url.includes("action=handshake")) {
      return Promise.resolve({ data: { js: { token: "token-fetch" } } });
    }
    if (url.includes("action=get_profile")) {
      return Promise.resolve({ data: { js: { profile: "ok" } } });
    }
    // API endpoint call returns auth failure
    return Promise.resolve({ data: "Authorization failed." });
  };

  await assert.rejects(
    async () => {
      await portalFetch("http://x/stalker_portal/server/load.php?type=vod&action=get_categories", {}, mockNow);
    },
    (err) => {
      assert.strictEqual(err.code, "AUTH_FAILED");
      assert.strictEqual(err.message, "Authorization failed.");
      return true;
    }
  );

  // Test 6: invalidate() keeps the previous token so recovery still uses the
  // token= refresh form instead of cold-handshaking a new portal session.
  axiosCalls = [];
  _reset();
  simulatedTime = 1000;
  behavior = (cfg) => {
    const url = typeof cfg === "string" ? cfg : cfg.url;
    if (url.includes("token=token-keep")) {
      return Promise.resolve({ data: { js: { token: "token-after-invalidate" } } });
    }
    if (url.includes("action=handshake")) {
      return Promise.resolve({ data: { js: { token: "token-keep" } } });
    }
    return Promise.resolve({ data: { js: { profile: "ok" } } });
  };

  assert.strictEqual(await getToken(mockNow), "token-keep");
  invalidate();
  axiosCalls = [];

  assert.strictEqual(await getToken(mockNow), "token-after-invalidate");
  assert.ok(axiosCalls[0].url.includes("token=token-keep"), "after invalidate, refresh must still use token=<prev>");
  assert.ok(!axiosCalls[0].url.includes("prehash=false"), "after invalidate, must not cold-handshake");

  // Test 7: an empty portal body is a transient error, not an auth failure
  // (a false positive there would burn a portal session on every empty response).
  axiosCalls = [];
  _reset();
  simulatedTime = 1000;
  behavior = (cfg) => {
    const url = typeof cfg === "string" ? cfg : cfg.url;
    if (url.includes("action=handshake")) {
      return Promise.resolve({ data: { js: { token: "token-empty" } } });
    }
    if (url.includes("action=get_profile")) {
      return Promise.resolve({ data: { js: { profile: "ok" } } });
    }
    return Promise.resolve({ data: "" });
  };

  await assert.rejects(
    async () => {
      await portalFetch("http://x/stalker_portal/server/load.php?type=vod&action=get_categories", {}, mockNow);
    },
    (err) => {
      assert.strictEqual(err.code, "EMPTY_RESPONSE");
      return true;
    }
  );
  const handshakeCalls = axiosCalls.filter((c) => c.url.includes("action=handshake"));
  assert.strictEqual(handshakeCalls.length, 1, "empty response must not trigger a re-handshake");

  console.log("portalSession self-check: all assertions passed");
}

runTests()
  .catch((err) => {
    console.error("portalSession self-check FAILED:", err);
    process.exit(1);
  })
  .finally(() => {
    Module._load = originalLoad;
  });
