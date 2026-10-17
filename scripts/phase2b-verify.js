const https = require("https");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function request(url, options = {}) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        ...options.headers,
      },
    }, (res) => {
      let size = 0;
      res.on("data", (chunk) => (size += chunk.length));
      res.on("end", () =>
        resolve({
          status: res.statusCode,
          headers: res.headers,
          size,
          duration: null,
        })
      );
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

async function main() {
  // ── 1. Regression checks ──────────────────────────────────────────────────
  console.log("=== REGRESSION CHECKS ===");
  const checks = [
    ["/", 200, null],
    ["/p/demo-customer", 200, null],
    ["/r/NF8K29", 307, "google.com"],
    ["/r/DOESNOTEXIST", 404, null],
    ["/admin", 307, "/admin/login"],
    ["/admin/gallery", 307, "/admin/login"],
  ];
  for (const [path, expectedStatus, expectedLoc] of checks) {
    const r = await timedRequest("https://nfcista.vercel.app" + path);
    const statusOk = r.status === expectedStatus;
    const locOk =
      !expectedLoc || (r.headers?.location || "").includes(expectedLoc);
    const pass = statusOk && locOk;
    console.log(
      (pass ? "PASS" : "FAIL") +
        " " +
        path +
        "  status=" +
        r.status +
        "  location=" +
        (r.headers?.location || "-") +
        "  time=" +
        Math.round(r.duration) +
        "ms"
    );
  }

  // ── 2. Benchmark /p/demo-customer ──────────────────────────────────────────
  console.log("\n=== BENCHMARK /p/demo-customer (12 requests, 200ms gap) ===");
  const url = "https://nfcista.vercel.app/p/demo-customer";
  const results = [];
  for (let i = 0; i < 12; i++) {
    const r = await timedRequest(url);
    results.push(r);
    const h = r.headers || {};
    console.log(
      "Run " +
        (i + 1) +
        ": " +
        Math.round(r.duration) +
        "ms  " +
        "status=" +
        r.status +
        "  x-vercel-cache=" +
        (h["x-vercel-cache"] || "-") +
        "  age=" +
        (h["age"] || "-") +
        "  cache-control=" +
        (h["cache-control"] || "-")
    );
    await sleep(200);
  }

  const times = results.map((r) => r.duration);
  const sorted = [...times].sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b) / times.length;

  console.log("\n=== BENCHMARK SUMMARY ===");
  console.log("Min:    " + sorted[0].toFixed(0) + "ms");
  console.log("Max:    " + sorted[sorted.length - 1].toFixed(0) + "ms");
  console.log("Avg:    " + avg.toFixed(0) + "ms");
  console.log("Median: " + sorted[Math.floor(sorted.length / 2)].toFixed(0) + "ms");
  console.log("P95:    " + sorted[Math.floor(sorted.length * 0.95)].toFixed(0) + "ms");

  const first = results[0];
  const h = first.headers || {};
  console.log("\n=== PRODUCTION RESPONSE HEADERS (first request) ===");
  console.log("Size:            " + first.size + " bytes (~" + Math.round(first.size / 1024) + " KB)");
  console.log("cache-control:   " + (h["cache-control"] || "-"));
  console.log("x-vercel-cache:  " + (h["x-vercel-cache"] || "-"));
  console.log("age:             " + (h["age"] || "-"));
  console.log("x-vercel-id:     " + (h["x-vercel-id"] || "-"));
  console.log("etag:            " + (h["etag"] || "-"));

  // Check caches across all runs
  const caches = results.map((r) => r.headers?.["x-vercel-cache"] || "-");
  console.log("\nCache per run: " + caches.join(", "));

  // ── 3. Phase 2A QR regression ──────────────────────────────────────────────
  console.log("\n=== PHASE 2A QR CACHE CHECK ===");
  const qrResults = [];
  for (let i = 0; i < 3; i++) {
    const r = await timedRequest("https://nfcista.vercel.app/r/NF8K29");
    qrResults.push(r);
    const qh = r.headers || {};
    console.log(
      "QR " + (i + 1) + ": " + Math.round(r.duration) + "ms  " +
      "status=" + r.status + "  x-vercel-cache=" + (qh["x-vercel-cache"] || "-") +
      "  age=" + (qh["age"] || "-")
    );
    await sleep(200);
  }

  // ── 4. New /api/admin/revalidate endpoint ──────────────────────────────────
  console.log("\n=== /api/admin/revalidate ENDPOINT CHECK ===");
  const revalCheck = await timedRequest("https://nfcista.vercel.app/api/admin/revalidate");
  console.log("/api/admin/revalidate GET: status=" + revalCheck.status + " (expect 401 or 405, not 404)");
}

main().catch(console.error);
