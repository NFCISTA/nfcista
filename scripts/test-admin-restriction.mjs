/**
 * Test suite to verify strict admin access restriction to hellonfcista@gmail.com
 * and ensure customer accounts (like techyclix12@email.com) are rejected as admin
 * while remaining fully functional as customers.
 */
import fs from "fs";

let pass = 0, fail = 0;
function ok(msg) { console.log(`  ✅ PASS: ${msg}`); pass++; }
function err(msg, d = "") { console.error(`  ❌ FAIL: ${msg}${d ? " — " + d : ""}`); fail++; }
function section(t) { console.log(`\n${"─".repeat(64)}\n${t}\n${"─".repeat(64)}`); }

// ─── 1. Static Code Audit: lib/adminAuth.js ──────────────────────────────────
section("1. Static Code Audit: lib/adminAuth.js");
{
  const code = fs.readFileSync("lib/adminAuth.js", "utf-8");
  if (code.includes("hellonfcista@gmail.com")) {
    ok("lib/adminAuth.js strictly checks for hellonfcista@gmail.com");
  } else {
    err("lib/adminAuth.js missing hellonfcista@gmail.com check");
  }

  if (code.includes("403") && code.includes("Forbidden: Administrator privileges required.")) {
    ok("lib/adminAuth.js returns 403 Forbidden for non-admin emails");
  } else {
    err("lib/adminAuth.js missing 403 Forbidden response");
  }
}

// ─── 2. Static Code Audit: proxy.js ──────────────────────────────────────────
section("2. Static Code Audit: proxy.js");
{
  const code = fs.readFileSync("proxy.js", "utf-8");
  if (code.includes('data.user.email?.toLowerCase() !== "hellonfcista@gmail.com"')) {
    ok("proxy.js rejects any non-admin email from /admin and /admin/*");
  } else {
    err("proxy.js missing email check for /admin");
  }

  if (code.includes('redirect') && code.includes('cookies.delete("sb-access-token")')) {
    ok("proxy.js deletes sb-access-token cookie on unauthorized admin access attempt");
  } else {
    err("proxy.js does not clear cookie on unauthorized access");
  }
}

// ─── 3. Static Code Audit: app/api/admin/session/route.js ────────────────────
section("3. Static Code Audit: app/api/admin/session/route.js");
{
  const code = fs.readFileSync("app/api/admin/session/route.js", "utf-8");
  if (code.includes('data.user.email?.toLowerCase() !== "hellonfcista@gmail.com"')) {
    ok("app/api/admin/session/route.js rejects non-admin users with 403");
  } else {
    err("app/api/admin/session/route.js missing admin email check");
  }
}

// ─── 4. Static Code Audit: app/admin/login/page.js ────────────────────────────
section("4. Static Code Audit: app/admin/login/page.js");
{
  const code = fs.readFileSync("app/admin/login/page.js", "utf-8");
  if (code.includes('hellonfcista@gmail.com')) {
    ok("app/admin/login/page.js verifies hellonfcista@gmail.com before allowing session");
  } else {
    err("app/admin/login/page.js missing admin email verification");
  }

  if (code.includes("supabase.auth.signOut()")) {
    ok("app/admin/login/page.js immediately signs out unauthorized users");
  } else {
    err("app/admin/login/page.js does not sign out unauthorized users");
  }
}

// ─── 5. Static Code Audit: app/admin/layout.js ───────────────────────────────
section("5. Static Code Audit: app/admin/layout.js");
{
  const code = fs.readFileSync("app/admin/layout.js", "utf-8");
  if (code.includes('hellonfcista@gmail.com')) {
    ok("app/admin/layout.js restricts rendering and session to hellonfcista@gmail.com");
  } else {
    err("app/admin/layout.js missing admin email restriction");
  }

  if (code.includes("DELETE") && code.includes("/api/admin/session")) {
    ok("app/admin/layout.js clears admin session cookie for non-admin users");
  } else {
    err("app/admin/layout.js missing session cleanup");
  }
}

// ─── 6. Migration SQL Audit ──────────────────────────────────────────────────
section("6. Migration SQL Audit: supabase/migrations/20261007000001_restrict_admin_to_owner.sql");
{
  const sql = fs.readFileSync("supabase/migrations/20261007000001_restrict_admin_to_owner.sql", "utf-8");
  if (sql.includes("DELETE FROM public.admin_users") && sql.includes("hellonfcista@gmail.com")) {
    ok("Migration removes non-owner rows from admin_users");
  } else {
    err("Migration missing admin_users cleanup");
  }

  if (sql.includes("public.is_admin()") && sql.includes("hellonfcista@gmail.com")) {
    ok("Migration updates public.is_admin() to strictly check hellonfcista@gmail.com");
  } else {
    err("Migration missing public.is_admin() update");
  }
}

// ─── 7. Customer Auth Integrity ──────────────────────────────────────────────
section("7. Customer Auth Integrity");
{
  const custLogin = fs.readFileSync("app/login/page.js", "utf-8");
  if (!custLogin.includes("hellonfcista@gmail.com")) {
    ok("Customer /login page does NOT restrict to admin email (any customer can login)");
  } else {
    err("Customer /login mistakenly restricted by admin email");
  }

  const custAuth = fs.readFileSync("lib/customerAuth.js", "utf-8");
  if (!custAuth.includes("hellonfcista@gmail.com")) {
    ok("lib/customerAuth.js correctly authenticates any customer via public.customers.auth_user_id");
  } else {
    err("lib/customerAuth.js mistakenly restricted by admin email");
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────
section("ADMIN AUTHORIZATION RESTRICTION SUMMARY");
console.log(`\n  PASS: ${pass}  |  FAIL: ${fail}\n`);
if (fail === 0) {
  console.log("  🎉 ALL ADMIN AUTHORIZATION AUDIT CHECKS PASSED\n");
  process.exit(0);
} else {
  console.error("  ❌ CHECKS FAILED\n");
  process.exit(1);
}
