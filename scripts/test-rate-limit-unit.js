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

  console.log("\n>>> ALL RATE LIMITER UNIT TESTS PASSED <<<");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
