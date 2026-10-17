/**
 * Production verification script for Admin Restriction Deployment
 * Target: https://nfcista.vercel.app
 */

const BASE = "https://nfcista.vercel.app";
let pass = 0, fail = 0;

function ok(msg) { console.log(`  ✅ PASS: ${msg}`); pass++; }
function err(msg, d = "") { console.error(`  ❌ FAIL: ${msg}${d ? " — " + d : ""}`); fail++; }
function section(t) { console.log(`\n${"─".repeat(64)}\n${t}\n${"─".repeat(64)}`); }

// ─── 1. Core pages status ────────────────────────────────────────────────────
section("1. Core Pages HTTP Status Codes");
for (const [path, expected] of [
  ["/login", 200],
  ["/dashboard", 307],
  ["/dashboard/profile", 307],
  ["/admin/login", 200],
  ["/admin", 307],
  ["/admin/gallery", 307],
  ["/admin/products", 307],
  ["/admin/qr-codes", 307],
]) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  if (res.status === expected) {
    ok(`${path} → ${res.status}`);
  } else {
    err(`${path} expected ${expected}`, `got ${res.status}`);
  }
}

// ─── 2. Admin APIs require authentication and reject unauthorized ────────────
section("2. Admin API Endpoints — Unauthenticated calls rejected with 401");
const adminEndpoints = [
  ["GET", "/api/admin/gallery"],
  ["POST", "/api/admin/gallery"],
  ["POST", "/api/admin/gallery/upload"],
  ["POST", "/api/admin/gallery/reorder"],
  ["GET", "/api/admin/products"],
  ["POST", "/api/admin/products"],
  ["POST", "/api/admin/products/upload"],
  ["GET", "/api/admin/dynamic-qr/inventory"],
  ["GET", "/api/admin/dynamic-qr/printable"],
  ["POST", "/api/admin/dynamic-qr/generate"],
  ["POST", "/api/admin/customers/create-login"],
];

for (const [method, path] of adminEndpoints) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? "{}" : undefined,
  });
  if (res.status === 401) {
    ok(`${method} ${path} → 401 Unauthorized`);
  } else {
    err(`${method} ${path} expected 401`, `got ${res.status}`);
  }
}

// ─── 3. Customer APIs remain intact ──────────────────────────────────────────
section("3. Customer API Endpoints — Unauthenticated calls rejected with 401");
const custEndpoints = [
  ["GET", "/api/customer/profile"],
  ["POST", "/api/customer/photo"],
  ["DELETE", "/api/customer/photo"],
  ["GET", "/api/customer/gallery"],
  ["POST", "/api/customer/gallery"],
  ["PUT", "/api/customer/gallery"],
  ["DELETE", "/api/customer/gallery"],
  ["POST", "/api/customer/gallery/upload"],
  ["POST", "/api/customer/gallery/reorder"],
  ["DELETE", "/api/customer/gallery/image"],
];

for (const [method, path] of custEndpoints) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: ["POST", "PUT"].includes(method) ? "{}" : undefined,
  });
  if (res.status === 401) {
    ok(`${method} ${path} → 401 Unauthorized`);
  } else {
    err(`${method} ${path} expected 401`, `got ${res.status}`);
  }
}

// ─── 4. Admin Session API rejection on non-admin ────────────────────────────
section("4. Session Endpoint Verification");
{
  const r1 = await fetch(`${BASE}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  r1.status === 400 ? ok("POST /api/admin/session (empty) → 400") : err("POST /api/admin/session expected 400", String(r1.status));

  const r2 = await fetch(`${BASE}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  r2.status === 400 ? ok("POST /api/session (empty) → 400") : err("POST /api/session expected 400", String(r2.status));

  const r3 = await fetch(`${BASE}/api/session`, { method: "DELETE" });
  r3.status === 200 ? ok("DELETE /api/session → 200") : err("DELETE /api/session expected 200", String(r3.status));
}

// ─── 5. Login pages content audit ─────────────────────────────────────────────
section("5. Login Pages Content Verification");
{
  const rCust = await fetch(`${BASE}/login`);
  const custHtml = await rCust.text();
  if (!custHtml.includes("/admin") && !custHtml.includes("Admin Sign In")) {
    ok("/login has ZERO admin references");
  } else {
    err("/login still contains admin references");
  }

  const rAdmin = await fetch(`${BASE}/admin/login`);
  const adminHtml = await rAdmin.text();
  if (adminHtml.includes("NFCISTA Admin")) {
    ok("/admin/login contains NFCISTA Admin portal title");
  } else {
    err("/admin/login missing admin title");
  }
}

// ─── 6. Public Card Profile ──────────────────────────────────────────────────
section("6. Public Profile (/p/test-customer)");
{
  const res = await fetch(`${BASE}/p/test-customer`);
  if (res.status === 200 || res.status === 404) {
    ok(`/p/test-customer loads properly (HTTP ${res.status})`);
  } else {
    err(`/p/test-customer returned unexpected HTTP ${res.status}`);
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────
section("PRODUCTION VERIFICATION SUMMARY");
console.log(`\n  Total checks: ${pass + fail}`);
console.log(`  PASS: ${pass}  |  FAIL: ${fail}\n`);

if (fail === 0) {
  console.log("  🎉 ALL PRODUCTION VERIFICATION CHECKS PASSED\n");
  process.exit(0);
} else {
  console.error(`  ❌ ${fail} CHECK(S) FAILED\n`);
  process.exit(1);
}
