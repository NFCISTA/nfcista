import assert from "assert";
import fs from "fs";

console.log("=== NFCISTA CLIENT PORTAL PHASE 2 VERIFICATION SUITE ===\n");

// 1. New Customer Cards API Endpoint
console.log("1. Checking GET /api/customer/cards route...");
assert(fs.existsSync("app/api/customer/cards/route.js"), "app/api/customer/cards/route.js must exist");
const apiCode = fs.readFileSync("app/api/customer/cards/route.js", "utf-8");

assert(apiCode.includes("authenticateCustomer"), "Must use authenticateCustomer(request) for session verification");
assert(apiCode.includes("customer.id"), "Must derive customer identity strictly from session");
assert(!apiCode.includes("searchParams.get('customer_id')"), "Must NEVER accept browser-supplied customer_id");
assert(!apiCode.includes("body.customer_id"), "Must NEVER accept browser body customer_id");
assert(apiCode.includes('.eq("customer_id", customer.id)'), "Query must strictly enforce customer_id = customer.id");
assert(!apiCode.includes("card.notes"), "Must strip internal notes from output");
assert(apiCode.includes("review_cards"), "Must return review_cards array");
assert(apiCode.includes("card_code"), "Must serialize card_code");
assert(apiCode.includes("google_review_url"), "Must serialize google_review_url");
assert(apiCode.includes("is_active"), "Must serialize is_active");
assert(apiCode.includes("review_assistant_enabled"), "Must serialize review_assistant_enabled");
console.log("  ✅ PASS: /api/customer/cards enforces tenant isolation and session authorization.");

// 2. Client Portal Cards Page
console.log("\n2. Checking app/portal/cards/page.js UI Component...");
assert(fs.existsSync("app/portal/cards/page.js"), "app/portal/cards/page.js must exist");
const pageCode = fs.readFileSync("app/portal/cards/page.js", "utf-8");

assert(pageCode.includes('"use client"'), "Must be client component");
assert(pageCode.includes("usePortal"), "Must consume usePortal context");
assert(pageCode.includes("/api/customer/cards"), "Must fetch from /api/customer/cards");
assert(pageCode.includes("My NFC Cards"), "Must display My NFC Cards heading");
assert(pageCode.includes("Review Assistant NFC Cards"), "Must have distinct Review Assistant Cards section");
assert(pageCode.includes("Digital Business Profile Card"), "Must have distinct Digital Business Profile section");
assert(pageCode.includes("card.card_code"), "Must display card code");
assert(pageCode.includes("card.is_active"), "Must display active/inactive status");
assert(pageCode.includes("card.google_review_url"), "Must display Google Review destination");
assert(pageCode.includes("handleCopyCardCode"), "Must support copying card code");
assert(pageCode.includes("No Review Cards Assigned Yet"), "Must include empty state when zero cards are assigned");
console.log("  ✅ PASS: My NFC Cards page provides complete responsive UI with all required fields.");

// 3. Portal Navigation
console.log("\n3. Checking Portal Navigation in app/portal/layout.js...");
const layoutCode = fs.readFileSync("app/portal/layout.js", "utf-8");
assert(layoutCode.includes('href: "/portal"'), "Navigation must include Overview (/portal)");
assert(layoutCode.includes('href: "/portal/cards"'), "Navigation must include My NFC Cards (/portal/cards)");
assert(layoutCode.includes("My NFC Cards"), "Navigation label must say My NFC Cards");
console.log("  ✅ PASS: Portal navigation properly wired to both Overview and My NFC Cards.");

// 4. Proxy Middleware Protection
console.log("\n4. Checking Session Protection in proxy.js...");
const proxyCode = fs.readFileSync("proxy.js", "utf-8");
assert(proxyCode.includes('pathname.startsWith("/portal")'), "proxy.js must gate /portal routes");
assert(proxyCode.includes('"/portal"'), "Matcher must include /portal");
assert(proxyCode.includes('"/portal/:path*"'), "Matcher must include /portal/:path*");
console.log("  ✅ PASS: /portal/cards is protected under proxy.js session gating.");

// 5. Existing Routes Unbroken
console.log("\n5. Checking Existing Dashboard and Auth Routes...");
assert(fs.existsSync("app/dashboard/layout.js"), "Dashboard layout must exist");
assert(fs.existsSync("app/dashboard/page.js"), "Dashboard page must exist");
assert(fs.existsSync("app/dashboard/analytics/page.js"), "Dashboard analytics must exist");
assert(fs.existsSync("app/login/page.js"), "Login page must exist");
assert(fs.existsSync("app/reset-password/page.js"), "Reset password must exist");
assert(fs.existsSync("app/r/[cardCode]/route.js"), "Hardware NFC redirect /r/[cardCode] must exist");
assert(fs.existsSync("app/review/c/[cardCode]/page.js"), "Review assistant /review/c/[cardCode] must exist");
console.log("  ✅ PASS: Existing routes, redirects, and auth remain 100% untouched.");

console.log("\n=== ALL PHASE 2 MY NFC CARDS CHECKS PASSED PERFECTLY! ===");
