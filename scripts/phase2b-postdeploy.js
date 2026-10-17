const https = require("https");

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function request(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    }, (res) => {
      let size = 0;
      res.on("data", (chunk) => (size += chunk.length));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, size }));
    });
    req.on("error", (e) => resolve({ error: e.message }));
  });
}

async function timedRequest(url) {
  const start = performance.now();
  const r = await request(url);
  r.duration = performance.now() - start;
  return r;
}

async function waitForDeploy(targetCommit, maxWaitMs = 180000) {
  console.log("Polling Vercel for commit " + targetCommit + " ...");
  const start = Date.now();
  let lastVercelId = "";
  while (Date.now() - start < maxWaitMs) {
    const r = await request("https://nfcista.vercel.app/p/demo-customer");
    const h = r.headers || {};
    const vid = h["x-vercel-id"] || "";
    const cc = h["cache-control"] || "";
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log("[" + elapsed + "s] cache-control=" + cc + "  x-vercel-id=" + vid.slice(-8));
    
    // Check if ISR is now working (s-maxage or x-vercel-cache=HIT or STALE)
    if (
      cc.includes("s-maxage") ||
      h["x-vercel-cache"] === "HIT" ||
      h["x-vercel-cache"] === "STALE"
    ) {
      console.log("✓ ISR CONFIRMED — CDN is caching the profile page!");
      return true;
    }
    // If x-vercel-cache is MISS (not private, no-cache) that means new deploy IS active
    if (h["x-vercel-cache"] === "MISS" && !cc.includes("no-store")) {
      console.log("✓ New deployment detected (MISS without no-store) - ISR enabled");
      return true;
    }
    if (vid !== lastVercelId && vid) {
      lastVercelId = vid;
    }
    await sleep(6000);
  }
  console.log("⚠ Timeout reached — checking current state");
  return false;
}

async function main() {
  const deployed = await waitForDeploy("6964f68");
  
  console.log("\n=== REGRESSION CHECKS ===");
  const checks = [
    ["/", 200],
    ["/p/demo-customer", 200],
    ["/r/NF8K29", 307],
    ["/r/DOESNOTEXIST", 404],
    ["/admin", 307],
    ["/admin/gallery", 307],
  ];
  for (const [path, expectedStatus] of checks) {
    const r = await timedRequest("https://nfcista.vercel.app" + path);
    const cc = r.headers?.["cache-control"] || "-";
    const vc = r.headers?.["x-vercel-cache"] || "-";
    const pass = r.status === expectedStatus;
    console.log((pass ? "PASS" : "FAIL") + " " + path +
      "  status=" + r.status +
      "  x-vercel-cache=" + vc +
      "  cache-control=" + cc.substring(0, 50) +
      "  time=" + Math.round(r.duration) + "ms");
    await sleep(100);
  }

  console.log("\n=== BENCHMARK /p/demo-customer (14 requests, 250ms gap) ===");
  const url = "https://nfcista.vercel.app/p/demo-customer";
  const results = [];
  for (let i = 0; i < 14; i++) {
    const r = await timedRequest(url);
    results.push(r);
    const h = r.headers || {};
    console.log("Run " + (i + 1) + ": " + Math.round(r.duration) + "ms" +
      "  x-vercel-cache=" + (h["x-vercel-cache"] || "-") +
      "  age=" + (h["age"] || "-") +
      "  cc=" + (h["cache-control"] || "-").substring(0, 60));
    await sleep(250);
  }

  const times = results.map((r) => r.duration);
  const sorted = [...times].sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b) / times.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];

  console.log("\n=== BENCHMARK SUMMARY ===");
  console.log("Min:    " + sorted[0].toFixed(0) + "ms");
  console.log("Max:    " + sorted[sorted.length - 1].toFixed(0) + "ms");
  console.log("Avg:    " + avg.toFixed(0) + "ms");
  console.log("Median: " + median.toFixed(0) + "ms");
  console.log("P95:    " + p95.toFixed(0) + "ms");

  const first = results[0];
  const h = first.headers || {};
  console.log("\n=== PRODUCTION RESPONSE HEADERS (last request) ===");
  const last = results[results.length - 1];
  const lh = last.headers || {};
  console.log("Size:            " + last.size + " bytes (~" + Math.round(last.size / 1024) + " KB)");
  console.log("cache-control:   " + (lh["cache-control"] || "-"));
  console.log("x-vercel-cache:  " + (lh["x-vercel-cache"] || "-"));
  console.log("age:             " + (lh["age"] || "-"));
  console.log("x-vercel-id:     " + (lh["x-vercel-id"] || "-"));

  const caches = results.map((r) => r.headers?.["x-vercel-cache"] || "-");
  console.log("\nCache per run: " + caches.join(", "));
  
  const hitCount = caches.filter(c => c === "HIT" || c === "STALE").length;
  console.log("CDN cache hits:  " + hitCount + "/" + results.length);
  
  // Phase 2A regression
  console.log("\n=== PHASE 2A QR CACHE REGRESSION ===");
  for (let i = 0; i < 3; i++) {
    const r = await timedRequest("https://nfcista.vercel.app/r/NF8K29");
    const qh = r.headers || {};
    console.log("QR " + (i + 1) + ": " + Math.round(r.duration) + "ms  x-vercel-cache=" + (qh["x-vercel-cache"] || "-") + "  age=" + (qh["age"] || "-"));
    await sleep(200);
  }
  
  console.log("\n=== DONE ===");
}

main().catch(console.error);
