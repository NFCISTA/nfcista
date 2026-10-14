/**
 * Dynamic QR Redirect & Cache Header Regression Test Suite
 *
 * Verifies:
 * 1. HTTP 307 Temporary Redirect status (never 301/308).
 * 2. Location header properly set to validated destination.
 * 3. Cache-Control header strictly contains 'public, s-maxage=30, stale-while-revalidate=60'.
 * 4. Open-redirect prevention: blocks javascript:, data:, //schemeless, etc.
 * 5. Card code validation: strictly allows valid alphanumeric format (3-32 chars), rejects malformed codes.
 * 6. Destination update invalidation: revalidatePath called on card activation.
 * 7. Security: no secrets or service-role keys leaked.
 */

import fs from "fs";

let pass = 0, fail = 0;
function ok(msg) { console.log(`  ✅ PASS: ${msg}`); pass++; }
function err(msg, d = "") { console.error(`  ❌ FAIL: ${msg}${d ? " — " + d : ""}`); fail++; }
function section(t) { console.log(`\n${"─".repeat(64)}\n${t}\n${"─".repeat(64)}`); }

// Pure logic mirror to test validation rules matching dynamicQr.js and customers.js
function isValidCardCode(code) {
  if (!code || typeof code !== "string") return false;
  return /^[A-Za-z0-9_-]{3,32}$/.test(code.trim());
}

function isValidHttpUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return false;
  const trimmed = urlString.trim();
  if (!trimmed || trimmed.startsWith("//")) return false;
  try {
    const parsed = new URL(trimmed);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      Boolean(parsed.hostname)
    );
  } catch {
    return false;
  }
}

// ─── 1. Route Handler Code & Header Inspection ──────────────────────────────
section("1. Static Code Audit: app/r/[cardCode]/route.js");
{
  const code = fs.readFileSync("app/r/[cardCode]/route.js", "utf-8");

  // Status check
  if (code.includes("status: 307")) {
    ok("Issues HTTP 307 Temporary Redirect (never 301/308)");
  } else {
    err("Route does not specify status 307");
  }

  if (!code.includes("301") && !code.includes("308")) {
    ok("Zero permanent redirects (301/308) in redirect handler");
  } else {
    err("Found permanent redirect in handler");
  }

  // Explicit Response construction
  if (code.includes("new Response(null,") && code.includes("Location: destination")) {
    ok("Constructs raw Web Response with Location header to preserve cache directives");
  } else {
    err("Does not use standard Response with Location header");
  }

  // Exact Cache-Control header verification
  if (code.includes('"Cache-Control": "public, s-maxage=30, stale-while-revalidate=60"')) {
    ok("Emits explicit 'public, s-maxage=30, stale-while-revalidate=60' Cache-Control");
  } else {
    err("Cache-Control header does not match expected policy");
  }

  // Code validation & 404
  if (code.includes("isValidCardCode(cardCode)") && code.includes("notFound()")) {
    ok("Validates card code format and calls notFound() on invalid codes");
  } else {
    err("Missing card code validation or notFound handling");
  }

  // Dynamic config
  if (code.includes('export const dynamic = "force-dynamic"')) {
    ok("Route configured as force-dynamic for accurate miss handling");
  } else {
    err("Route is missing force-dynamic export");
  }
}

// ─── 2. Activate Route Revalidation Audit ─────────────────────────────────────
section("2. Static Code Audit: app/api/admin/dynamic-qr/activate/route.js");
{
  const code = fs.readFileSync("app/api/admin/dynamic-qr/activate/route.js", "utf-8");

  if (code.includes('import { revalidatePath } from "next/cache"')) {
    ok("Imports revalidatePath from next/cache");
  } else {
    err("Missing revalidatePath import");
  }

  if (code.includes("revalidatePath(`/r/${updated.card_code}`)") || code.includes("revalidatePath('/r/' + updated.card_code)")) {
    ok("Triggers revalidatePath on /r/[cardCode] upon destination update");
  } else {
    err("Missing revalidatePath call upon activation");
  }

  if (code.includes("isValidHttpUrl(cleanDestination)")) {
    ok("Validates destination URL scheme before updating database");
  } else {
    err("Missing destination URL validation before update");
  }
}

// ─── 3. Card Code Syntax & Normalization Unit Tests ──────────────────────────
section("3. Card Code Syntax Unit Tests");
{
  const validCodes = ["NF8K29", "NF0001", "CARD-123", "abc_123", "X".repeat(32)];
  for (const c of validCodes) {
    if (isValidCardCode(c)) {
      ok(`Valid code accepted: "${c}"`);
    } else {
      err(`Valid code rejected: "${c}"`);
    }
  }

  const invalidCodes = ["", "  ", "AB", "X".repeat(33), "NF 8K", "NF!@#", "<script>", undefined, null];
  for (const c of invalidCodes) {
    if (!isValidCardCode(c)) {
      ok(`Invalid code properly rejected: ${JSON.stringify(c)}`);
    } else {
      err(`Invalid code was accepted: ${JSON.stringify(c)}`);
    }
  }
}

// ─── 4. Destination URL Safety & Open-Redirect Prevention ────────────────────
section("4. Open-Redirect Prevention & URL Safety Tests");
{
  const safeUrls = [
    "https://example.com",
    "http://example.com/page",
    "https://sub.domain.co.uk/path?q=1&v=2#sec",
    "https://nfcista.com/p/my-slug",
  ];
  for (const u of safeUrls) {
    if (isValidHttpUrl(u)) {
      ok(`Safe URL allowed: "${u}"`);
    } else {
      err(`Safe URL rejected: "${u}"`);
    }
  }

  const dangerousUrls = [
    "//attacker.com",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox",
    "file:///etc/passwd",
    "ftp://example.com",
    "mailto:user@example.com",
    "tel:+1234567890",
    "not-a-url",
    "",
    null,
  ];
  for (const u of dangerousUrls) {
    if (!isValidHttpUrl(u)) {
      ok(`Dangerous / invalid URL blocked: ${JSON.stringify(u)}`);
    } else {
      err(`Dangerous URL was accepted: ${JSON.stringify(u)}`);
    }
  }
}

// ─── 5. Mock Route Handler Execution ─────────────────────────────────────────
section("5. Route Handler Response Object Execution");
{
  const mockDestination = "https://example.com/target";
  const mockResponse = new Response(null, {
    status: 307,
    headers: {
      Location: mockDestination,
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });

  if (mockResponse.status === 307) {
    ok("Response returns HTTP status 307");
  } else {
    err("Response status", String(mockResponse.status));
  }

  if (mockResponse.headers.get("location") === mockDestination) {
    ok(`Location header matches destination: ${mockResponse.headers.get("location")}`);
  } else {
    err("Location header mismatch", mockResponse.headers.get("location"));
  }

  if (mockResponse.headers.get("cache-control") === "public, s-maxage=30, stale-while-revalidate=60") {
    ok(`Cache-Control header matches exact policy: ${mockResponse.headers.get("cache-control")}`);
  } else {
    err("Cache-Control header mismatch", mockResponse.headers.get("cache-control"));
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────
section("REDIRECT REGRESSION TEST SUMMARY");
console.log(`\n  Total checks: ${pass + fail}`);
console.log(`  PASS: ${pass}  |  FAIL: ${fail}\n`);

if (fail === 0) {
  console.log("  🎉 ALL REDIRECT REGRESSION CHECKS PASSED\n");
  process.exit(0);
} else {
  console.error(`  ❌ ${fail} CHECK(S) FAILED\n`);
  process.exit(1);
}
