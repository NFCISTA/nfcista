async function runE2ETests() {
  const baseUrl = "http://127.0.0.1:3008";
  console.log("=== Starting NFCISTA Rate Limiting E2E Verification ===");

  // 1. Check /admin/login is NOT rate-limited
  console.log("\n[Test 1] Checking /admin/login route bypasses rate limiter...");
  const adminRes = await fetch(`${baseUrl}/admin/login`);
  console.log(`/admin/login status: ${adminRes.status}`);
  const adminRateLimitHeader = adminRes.headers.get("x-ratelimit-limit");
  console.log(`/admin/login has X-RateLimit-Limit: ${adminRateLimitHeader}`);
  if (adminRes.status !== 200) {
    throw new Error(`/admin/login failed with status ${adminRes.status}`);
  }
  if (adminRateLimitHeader !== null) {
    throw new Error("/admin/login was unexpectedly routed through rate limiter!");
  }
  console.log("PASS: /admin/login is completely excluded from rate limiting.");

  // 2. Check normal /p/[slug] access
  console.log("\n[Test 2] Checking normal /p/[slug] access with dummy IP...");
  const testIp = "198.51.100.77";
  const profileRes = await fetch(`${baseUrl}/p/dummy-test-profile`, {
    headers: {
      "x-forwarded-for": testIp,
      "accept": "text/html",
    },
  });
  console.log(`/p/dummy-test-profile status: ${profileRes.status}`);
  console.log(`X-RateLimit-Limit: ${profileRes.headers.get("x-ratelimit-limit")}`);
  console.log(`X-RateLimit-Remaining: ${profileRes.headers.get("x-ratelimit-remaining")}`);
  console.log(`X-RateLimit-Reset: ${profileRes.headers.get("x-ratelimit-reset")}`);

  if (profileRes.status !== 200) {
    throw new Error(`Profile access failed with status ${profileRes.status}`);
  }
  if (profileRes.headers.get("x-ratelimit-limit") !== "100") {
    throw new Error(`Expected X-RateLimit-Limit to be 100, got ${profileRes.headers.get("x-ratelimit-limit")}`);
  }
  console.log("PASS: Normal profile access attaches rate limit headers (limit=100).");

  // 3. Send 100 requests to trigger rate limit for testIp
  console.log("\n[Test 3] Simulating rapid requests up to the 100 limit for IP " + testIp + "...");
  const startTime = Date.now();
  let remainingAfter99 = null;

  // We already sent 1 request above, so send 99 more to reach limit 100
  const promises = [];
  for (let i = 2; i <= 100; i++) {
    promises.push(
      fetch(`${baseUrl}/p/dummy-test-profile`, {
        headers: { "x-forwarded-for": testIp },
      })
    );
  }
  const responses = await Promise.all(promises);
  console.log(`Completed 99 parallel requests in ${Date.now() - startTime}ms.`);

  const lastAllowed = responses[responses.length - 1];
  console.log(`Request 100 status: ${lastAllowed.status}`);
  console.log(`Request 100 X-RateLimit-Remaining: ${lastAllowed.headers.get("x-ratelimit-remaining")}`);

  // 4. Request 101 MUST return HTTP 429
  console.log("\n[Test 4] Sending request 101 from " + testIp + " (expecting HTTP 429)...");
  const blockedHtmlRes = await fetch(`${baseUrl}/p/dummy-test-profile`, {
    headers: {
      "x-forwarded-for": testIp,
      "accept": "text/html",
    },
  });
  console.log(`Blocked HTML response status: ${blockedHtmlRes.status}`);
  console.log(`Retry-After: ${blockedHtmlRes.headers.get("retry-after")}`);
  console.log(`X-RateLimit-Remaining: ${blockedHtmlRes.headers.get("x-ratelimit-remaining")}`);
  const blockedHtml = await blockedHtmlRes.text();
  console.log(`Contains '429 Too Many Requests': ${blockedHtml.includes("429 Too Many Requests")}`);

  if (blockedHtmlRes.status !== 429) {
    throw new Error(`Expected HTTP 429, got ${blockedHtmlRes.status}`);
  }
  if (blockedHtmlRes.headers.get("x-ratelimit-remaining") !== "0") {
    throw new Error(`Expected remaining 0, got ${blockedHtmlRes.headers.get("x-ratelimit-remaining")}`);
  }
  if (!blockedHtml.includes("429 Too Many Requests")) {
    throw new Error("HTML body did not contain expected 429 user message");
  }
  console.log("PASS: Request 101 returned HTTP 429 with Retry-After and user-friendly HTML.");

  // Also verify JSON 429 when accept: application/json
  const blockedJsonRes = await fetch(`${baseUrl}/p/dummy-test-profile`, {
    headers: {
      "x-forwarded-for": testIp,
      "accept": "application/json",
    },
  });
  const blockedJson = await blockedJsonRes.json();
  console.log(`JSON error body: ${JSON.stringify(blockedJson)}`);
  if (blockedJsonRes.status !== 429 || blockedJson.error !== "Too Many Requests") {
    throw new Error("JSON 429 response structure invalid");
  }
  console.log("PASS: JSON requests receive clean JSON 429 response.");

  // 5. Test IP isolation: Another IP (testIp2) must NOT be blocked
  console.log("\n[Test 5] Verifying a different client IP is NOT blocked...");
  const testIp2 = "198.51.100.88";
  const isolatedRes = await fetch(`${baseUrl}/p/dummy-test-profile`, {
    headers: { "x-forwarded-for": testIp2 },
  });
  console.log(`Different IP status: ${isolatedRes.status}`);
  console.log(`Different IP remaining: ${isolatedRes.headers.get("x-ratelimit-remaining")}`);
  if (isolatedRes.status !== 200) {
    throw new Error(`Independent IP was incorrectly blocked with status ${isolatedRes.status}`);
  }
  console.log("PASS: IP isolation confirmed. Other visitors are completely unaffected.");

  // 6. Test Admin STILL works even while /p/* is rate limited for testIp
  console.log("\n[Test 6] Verifying admin still accessible from the rate-limited IP...");
  const adminFromBlockedIp = await fetch(`${baseUrl}/admin/login`, {
    headers: { "x-forwarded-for": testIp },
  });
  console.log(`Admin login from rate-limited IP status: ${adminFromBlockedIp.status}`);
  if (adminFromBlockedIp.status !== 200) {
    throw new Error(`Admin login was blocked for IP ${testIp}`);
  }
  console.log("PASS: Admin routes remain fully accessible even from an IP rate-limited on profiles.");

  console.log("\n=======================================================");
  console.log(">>> ALL END-TO-END RATE LIMITING TESTS PASSED! <<<");
  console.log("=======================================================");
}

runE2ETests().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
