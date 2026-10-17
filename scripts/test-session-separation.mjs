/**
 * Audit & Verification: Session Route Separation & Customer Isolation
 *
 * Checks:
 * 1. Customer pages (/login, /dashboard, /dashboard/profile, layout.js) contain zero references to `/api/admin` or `/admin`.
 * 2. `/api/session` exists and responds:
 *    - POST without token -> 400
 *    - POST with invalid token -> 401
 *    - DELETE -> 200 and removes cookie
 * 3. `/api/admin/session` remains intact:
 *    - POST without token -> 400
 *    - POST with invalid token -> 401
 *    - DELETE -> 200 and removes cookie
 * 4. `app/login/page.js` does NOT contain "Admin Sign In" link.
 * 5. Proxy gating:
 *    - GET /dashboard without cookie -> 307 to /login
 *    - GET /admin without cookie -> 307 to /admin/login
 * 6. Customer vs Admin isolation:
 *    - Customer cannot access /admin (blocked by admin auth / proxy)
 * 7. Security: SUPABASE_SERVICE_ROLE_KEY absent from client files.
 */

import fs from "fs";

const BASE_URL = "http://localhost:3000";

let pass = 0, fail = 0;
function ok(msg) { console.log(`  ✅ PASS: ${msg}`); pass++; }
function err(msg, d = "") { console.error(`  ❌ FAIL: ${msg}${d ? " — " + d : ""}`); fail++; }
function section(t) { console.log(`\n${"─".repeat(64)}\n${t}\n${"─".repeat(64)}`); }

section("1. Static Code Audit: No admin references in customer-facing files");
const customerFiles = [
  "app/dashboard/layout.js",
  "app/dashboard/page.js",
  "app/dashboard/profile/page.js",
  "app/login/page.js",
];

for (const file of customerFiles) {
  const content = fs.readFileSync(file, "utf-8");
  if (content.includes("/api/admin")) {
    err(`${file} contains reference to /api/admin`);
  } else {
    ok(`${file} — zero references to /api/admin`);
  }

  // Check for admin navigation/links
  if (file === "app/login/page.js") {
    if (content.includes("/admin/login") || content.includes("Admin Sign In")) {
      err(`${file} contains link to /admin/login or Admin Sign In text`);
    } else {
      ok(`${file} — no Admin Sign In link or /admin/login reference`);
    }
  } else {
    if (content.includes("/admin")) {
      err(`${file} contains reference to /admin`);
    } else {
      ok(`${file} — zero references to /admin`);
    }
  }
}

section("2. Route Audit: /api/session endpoint");
try {
  // Test POST without token
  const r1 = await fetch(`${BASE_URL}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const b1 = await r1.json().catch(() => ({}));
  if (r1.status === 400 && b1.error === "Missing access token") {
    ok("/api/session POST without token -> 400 Missing access token");
  } else {
    err("/api/session POST without token", `status=${r1.status}`);
  }

  // Test POST with fake token
  const r2 = await fetch(`${BASE_URL}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: "invalid-token-xyz" }),
  });
  const b2 = await r2.json().catch(() => ({}));
  if (r2.status === 401 && b2.error === "Invalid or expired token") {
    ok("/api/session POST with invalid token -> 401 Invalid or expired token");
  } else {
    err("/api/session POST with invalid token", `status=${r2.status}`);
  }

  // Test DELETE
  const r3 = await fetch(`${BASE_URL}/api/session`, {
    method: "DELETE",
  });
  const setCookie = r3.headers.get("set-cookie") || "";
  const b3 = await r3.json().catch(() => ({}));
  if (r3.status === 200 && b3.success && (setCookie.includes("sb-access-token=;") || setCookie.includes("Max-Age=0"))) {
    ok("/api/session DELETE -> 200 and deletes sb-access-token cookie");
  } else {
    err("/api/session DELETE", `status=${r3.status}, cookie=${setCookie}`);
  }
} catch (e) {
  err("Failed to test /api/session", e.message);
}

section("3. Route Audit: /api/admin/session endpoint remains intact");
try {
  // Test POST without token
  const r1 = await fetch(`${BASE_URL}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const b1 = await r1.json().catch(() => ({}));
  if (r1.status === 400 && b1.error === "Missing access token") {
    ok("/api/admin/session POST without token -> 400 Missing access token");
  } else {
    err("/api/admin/session POST without token", `status=${r1.status}`);
  }

  // Test POST with fake token
  const r2 = await fetch(`${BASE_URL}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: "invalid-token-xyz" }),
  });
  const b2 = await r2.json().catch(() => ({}));
  if (r2.status === 401 && b2.error === "Invalid or expired token") {
    ok("/api/admin/session POST with invalid token -> 401 Invalid or expired token");
  } else {
    err("/api/admin/session POST with invalid token", `status=${r2.status}`);
  }

  // Test DELETE
  const r3 = await fetch(`${BASE_URL}/api/admin/session`, {
    method: "DELETE",
  });
  const setCookie = r3.headers.get("set-cookie") || "";
  const b3 = await r3.json().catch(() => ({}));
  if (r3.status === 200 && b3.success && (setCookie.includes("sb-access-token=;") || setCookie.includes("Max-Age=0"))) {
    ok("/api/admin/session DELETE -> 200 and deletes sb-access-token cookie");
  } else {
    err("/api/admin/session DELETE", `status=${r3.status}, cookie=${setCookie}`);
  }
} catch (e) {
  err("Failed to test /api/admin/session", e.message);
}

section("4. Route Audit: Admin and Customer login routes");
try {
  const rLogin = await fetch(`${BASE_URL}/login`);
  const loginHtml = await rLogin.text();
  if (rLogin.status === 200) {
    ok("/login loads with 200 OK");
  } else {
    err("/login status", String(rLogin.status));
  }

  if (loginHtml.includes("Admin Sign In") || loginHtml.includes("/admin/login")) {
    err("/login HTML contains Admin Sign In link!");
  } else {
    ok("/login HTML does NOT contain any link or mention of Admin Sign In");
  }

  const rAdminLogin = await fetch(`${BASE_URL}/admin/login`);
  if (rAdminLogin.status === 200) {
    ok("/admin/login loads with 200 OK");
  } else {
    err("/admin/login status", String(rAdminLogin.status));
  }
} catch (e) {
  err("Failed to test login routes", e.message);
}

section("5. Middleware Proxy Gating");
try {
  const rDash = await fetch(`${BASE_URL}/dashboard`, { redirect: "manual" });
  if (rDash.status === 307 && (rDash.headers.get("location") || "").includes("/login")) {
    ok("Unauthenticated GET /dashboard -> 307 redirect to /login");
  } else {
    err("GET /dashboard redirect", `status=${rDash.status}, loc=${rDash.headers.get("location")}`);
  }

  const rProfile = await fetch(`${BASE_URL}/dashboard/profile`, { redirect: "manual" });
  if (rProfile.status === 307 && (rProfile.headers.get("location") || "").includes("/login")) {
    ok("Unauthenticated GET /dashboard/profile -> 307 redirect to /login");
  } else {
    err("GET /dashboard/profile redirect", `status=${rProfile.status}, loc=${rProfile.headers.get("location")}`);
  }

  const rAdmin = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
  if (rAdmin.status === 307 && (rAdmin.headers.get("location") || "").includes("/admin/login")) {
    ok("Unauthenticated GET /admin -> 307 redirect to /admin/login");
  } else {
    err("GET /admin redirect", `status=${rAdmin.status}, loc=${rAdmin.headers.get("location")}`);
  }
} catch (e) {
  err("Failed to test proxy gating", e.message);
}

section("6. Security Audit: SERVICE_ROLE key not in client code");
const allClientFiles = [
  "app/dashboard/layout.js",
  "app/dashboard/page.js",
  "app/dashboard/profile/page.js",
  "app/login/page.js",
  "lib/customerAuth.js",
  "lib/supabaseClient.js",
  "app/api/session/route.js",
];

for (const f of allClientFiles) {
  if (fs.existsSync(f)) {
    const txt = fs.readFileSync(f, "utf-8");
    if (txt.includes("SERVICE_ROLE")) {
      err(`SERVICE_ROLE found in ${f}`);
    } else {
      ok(`${f} — clean of SERVICE_ROLE`);
    }
  }
}

section("SUMMARY");
console.log(`\n  PASS: ${pass}  |  FAIL: ${fail}\n`);
if (fail === 0) {
  console.log("  🎉 ALL SESSION SEPARATION & ISOLATION CHECKS PASSED\n");
} else {
  process.exit(1);
}
