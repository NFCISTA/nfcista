import { checkRateLimit } from "../lib/rateLimit.js";

async function runTests() {
  console.log("=== Testing Rate Limiter Logic ===");

  const dummyIp = "198.51.100.42";
  const testLimit = 5; // Use smaller limit for test verification
  const testWindow = 2000; // 2 seconds

  console.log(`\n1. Testing ${testLimit} requests under the limit...`);
  for (let i = 1; i <= testLimit; i++) {
    const res = await checkRateLimit(dummyIp, { limit: testLimit, windowMs: testWindow });
    console.log(`Request ${i}: success=${res.success}, remaining=${res.remaining}, limit=${res.limit}`);
    if (!res.success) {
      throw new Error(`Request ${i} unexpectedly failed!`);
    }
  }

  console.log("\n2. Testing request exceeding the limit (expecting success=false)...");
  const blockedRes = await checkRateLimit(dummyIp, { limit: testLimit, windowMs: testWindow });
  console.log(`Blocked Request: success=${blockedRes.success}, remaining=${blockedRes.remaining}, reset=${blockedRes.reset}s`);
  if (blockedRes.success) {
    throw new Error("Request beyond limit was NOT blocked!");
  }
  if (blockedRes.remaining !== 0) {
    throw new Error(`Expected remaining=0, got ${blockedRes.remaining}`);
  }

  console.log("\n3. Testing independent IP isolation...");
  const otherIp = "198.51.100.99";
  const otherRes = await checkRateLimit(otherIp, { limit: testLimit, windowMs: testWindow });
  console.log(`Different IP (${otherIp}): success=${otherRes.success}, remaining=${otherRes.remaining}`);
  if (!otherRes.success) {
    throw new Error("Different IP was incorrectly blocked!");
  }

  console.log("\n4. Testing window expiry and reset...");
  console.log("Waiting 2.1 seconds for window to reset...");
  await new Promise((r) => setTimeout(r, 2100));

  const resetRes = await checkRateLimit(dummyIp, { limit: testLimit, windowMs: testWindow });
  console.log(`After reset: success=${resetRes.success}, remaining=${resetRes.remaining}`);
  if (!resetRes.success) {
    throw new Error("Request after window expiry failed to reset!");
  }

  console.log("\n5. Testing fail-open safety on malformed input...");
  const failOpenRes = await checkRateLimit(null, { limit: testLimit, windowMs: testWindow });
  console.log(`Fail-open result: success=${failOpenRes.success}`);
  if (!failOpenRes.success) {
    throw new Error("Limiter did not fail-open on invalid input!");
  }

  // ── Upstash Redis REST Error & Fallback Testing ─────────────────────────────
  console.log("\n6. Testing Upstash non-OK HTTP status (e.g. 401 Unauthorized)...");
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const originalWarn = console.warn;

  let loggedWarnings = [];
  console.warn = (...args) => {
    loggedWarnings.push(args.join(" "));
  };

  try {
    process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "mock-secret-token";

    // Mock HTTP 401
    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ error: "Unauthorized" }),
    });

    const httpErrRes = await checkRateLimit("198.51.100.101", { limit: 10, windowMs: 60000 });
    console.log(`HTTP 401 fallback result: success=${httpErrRes.success}, remaining=${httpErrRes.remaining}`);
    if (!httpErrRes.success) {
      throw new Error("Limiter blocked request on HTTP 401 instead of falling back to memory!");
    }
    const hasStatusLog = loggedWarnings.some((w) => w.includes("HTTP 401"));
    if (!hasStatusLog) {
      throw new Error("Expected warning containing HTTP status code 401");
    }
    const hasTokenLeak = loggedWarnings.some((w) => w.includes("mock-secret-token") || w.includes("mock-redis.upstash.io"));
    if (hasTokenLeak) {
      throw new Error("SECURITY VIOLATION: Upstash credentials leaked in log output!");
    }

    console.log("\n7. Testing Upstash malformed pipeline responses (command error, string count, invalid JSON)...");

    // Case 7a: Pipeline error response [{ error: "ERR syntax error" }]
    loggedWarnings = [];
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => [{ error: "ERR syntax error" }, { result: "OK" }],
    });
    const malformed1 = await checkRateLimit("198.51.100.102", { limit: 10, windowMs: 60000 });
    console.log(`Malformed response (command error): success=${malformed1.success}, remaining=${malformed1.remaining}`);
    if (!malformed1.success) {
      throw new Error("Malformed pipeline response resulted in false rate-limit denial!");
    }

    // Case 7b: Non-numeric count [{ result: "not_a_number" }]
    loggedWarnings = [];
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => [{ result: "not_a_number" }],
    });
    const malformed2 = await checkRateLimit("198.51.100.103", { limit: 10, windowMs: 60000 });
    console.log(`Malformed response (string result): success=${malformed2.success}, remaining=${malformed2.remaining}`);
    if (!malformed2.success) {
      throw new Error("Non-numeric count resulted in false rate-limit denial!");
    }

    // Case 7c: Invalid JSON body
    loggedWarnings = [];
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("Unexpected token < in JSON");
      },
    });
    const malformed3 = await checkRateLimit("198.51.100.104", { limit: 10, windowMs: 60000 });
    console.log(`Malformed response (invalid JSON): success=${malformed3.success}, remaining=${malformed3.remaining}`);
    if (!malformed3.success) {
      throw new Error("Invalid JSON body resulted in false rate-limit denial!");
    }

    console.log("\n8. Testing valid Upstash pipeline response...");
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => [
        { result: 3 },
        { result: 1 },
        { result: 45000 },
      ],
    });
    const validRes = await checkRateLimit("198.51.100.105", { limit: 10, windowMs: 60000 });
    console.log(`Valid Upstash response: success=${validRes.success}, remaining=${validRes.remaining}, reset=${validRes.reset}s`);
    if (!validRes.success || validRes.remaining !== 7 || validRes.reset !== 45) {
      throw new Error(`Valid Upstash response parsing failed: ${JSON.stringify(validRes)}`);
    }

  } finally {
    globalThis.fetch = originalFetch;
    process.env.UPSTASH_REDIS_REST_URL = originalUrl;
    process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    console.warn = originalWarn;
  }

  console.log("\n>>> ALL RATE LIMITER UNIT TESTS PASSED <<<");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
