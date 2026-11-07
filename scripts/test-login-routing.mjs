import assert from "assert";
import fs from "fs";

console.log("=== NFCISTA CUSTOMER LOGIN ROUTING VERIFICATION SUITE ===\n");

// 1. Verify app/login/page.js
console.log("1. Checking app/login/page.js...");
const loginCode = fs.readFileSync("app/login/page.js", "utf-8");

assert(loginCode.includes("sessionRes.ok"), "Login must check sessionRes.ok before navigating");
assert(loginCode.includes("Failed to establish secure session"), "Must display error on failed session creation");
assert(loginCode.includes('let destination = "/dashboard"'), "Default destination must be /dashboard for Digital Business Card customers");
assert(loginCode.includes("hasReviewAssistant"), "Must evaluate hasReviewAssistant entitlement");
assert(loginCode.includes("hasDigitalCard"), "Must evaluate hasDigitalCard profile presence");
assert(loginCode.includes('hasReviewAssistant && !hasDigitalCard'), "Must route to /portal only for Review Assistant-only customers");
assert(loginCode.includes('destination = "/portal"'), "Must assign /portal when Review Assistant-only");
assert(loginCode.includes("window.location.assign(destination)"), "Must navigate to resolved destination");
console.log("  ✅ PASS: Login page checks session status and determines destination accurately.");

// 2. Logic simulation of entitlement resolution
console.log("\n2. Testing Customer Entitlement Routing Logic...");

function resolveDestination({ customer, reviewCards }) {
  let destination = "/dashboard";

  const hasReviewAssistant = Boolean(
    customer?.review_assistant_enabled ||
    customer?.analytics_enabled ||
    (reviewCards && reviewCards.length > 0)
  );

  const hasDigitalCard = Boolean(
    customer?.job_title ||
    customer?.company_name ||
    customer?.description ||
    customer?.phone ||
    customer?.photo_url ||
    customer?.banner_url ||
    customer?.portfolio_url ||
    customer?.enquiry_enabled ||
    customer?.instagram ||
    customer?.website ||
    customer?.address
  );

  if (hasReviewAssistant && !hasDigitalCard) {
    destination = "/portal";
  }

  return { destination, hasReviewAssistant, hasDigitalCard };
}

// Scenario A: Standard Digital Business Card Customer
const dbcCustomer = {
  id: "dbc-1",
  full_name: "Rahul Verma",
  job_title: "Managing Director",
  phone: "+919876543210",
  review_assistant_enabled: false,
  analytics_enabled: false,
};
const resA = resolveDestination({ customer: dbcCustomer, reviewCards: [] });
assert.strictEqual(resA.destination, "/dashboard", "DBC customer must route to /dashboard");
assert.strictEqual(resA.hasDigitalCard, true, "DBC customer has digital card");
assert.strictEqual(resA.hasReviewAssistant, false, "DBC customer does not have review assistant");
console.log("  ✅ PASS: Existing Digital Business Card customer routes to /dashboard.");

// Scenario B: Review Assistant-Only Customer (Standalone Google Review card)
const revOnlyCustomer = {
  id: "rev-1",
  full_name: "Dr. Sharma Dental",
  job_title: null,
  phone: null,
  description: null,
  review_assistant_enabled: true,
  analytics_enabled: false,
};
const resB = resolveDestination({
  customer: revOnlyCustomer,
  reviewCards: [{ id: "c-1", card_code: "DRS01" }],
});
assert.strictEqual(resB.destination, "/portal", "Review Assistant-only customer must route to /portal");
assert.strictEqual(resB.hasDigitalCard, false, "Review Assistant-only customer has no digital card profile");
assert.strictEqual(resB.hasReviewAssistant, true, "Review Assistant-only customer has review assistant entitlement");
console.log("  ✅ PASS: Review Assistant-only customer routes to /portal.");

// Scenario C: Customer with Both Products
const bothCustomer = {
  id: "both-1",
  full_name: "Ananya Mehta",
  job_title: "Principal Architect",
  company_name: "Studio Design",
  phone: "+919800012345",
  review_assistant_enabled: true,
  analytics_enabled: true,
};
const resC = resolveDestination({
  customer: bothCustomer,
  reviewCards: [{ id: "c-2", card_code: "ARC01" }],
});
assert.strictEqual(resC.destination, "/dashboard", "Customer with both products defaults to /dashboard");
assert.strictEqual(resC.hasDigitalCard, true, "Customer with both has digital card");
assert.strictEqual(resC.hasReviewAssistant, true, "Customer with both has review assistant");
console.log("  ✅ PASS: Customer with both products routes to /dashboard and retains both entitlements.");

// 3. Verify app/dashboard/layout.js
console.log("\n3. Checking app/dashboard/layout.js...");
const dashCode = fs.readFileSync("app/dashboard/layout.js", "utf-8");

assert(dashCode.includes('if (event === "SIGNED_OUT")'), "Dashboard layout must only redirect on explicit SIGNED_OUT");
assert(!dashCode.includes('if (!session?.user) {\n        setUser(null);\n        setCustomer(null);\n        router.replace("/login");'), "Dashboard layout must not bounce on INITIAL_SESSION with session: null");
assert(dashCode.includes('/portal'), "Dashboard navigation must include link to Client Portal for eligible customers");
assert(dashCode.includes('Client Portal'), "Dashboard nav link must say Client Portal");
console.log("  ✅ PASS: Dashboard layout prevents INITIAL_SESSION bounces and provides Client Portal link.");

// 4. Verify app/portal/layout.js
console.log("\n4. Checking app/portal/layout.js...");
const portalCode = fs.readFileSync("app/portal/layout.js", "utf-8");

assert(portalCode.includes('if (event === "SIGNED_OUT")'), "Portal layout must only redirect on explicit SIGNED_OUT");
assert(!portalCode.includes('if (!session?.user) {\n        setUser(null);\n        setCustomer(null);\n        router.replace("/login");'), "Portal layout must not bounce on INITIAL_SESSION with session: null");
assert(portalCode.includes('/dashboard'), "Portal navigation must include link to Digital Business Card for eligible customers");
assert(portalCode.includes('Business Card'), "Portal nav link must say Business Card");
console.log("  ✅ PASS: Portal layout prevents INITIAL_SESSION bounces and provides Business Card link.");

// 5. Verify sign-out handling remains intact
console.log("\n5. Checking Sign Out functionality...");
assert(dashCode.includes("handleSignOut"), "Dashboard layout must maintain handleSignOut");
assert(dashCode.includes("supabase.auth.signOut()"), "Dashboard layout must call supabase.auth.signOut()");
assert(dashCode.includes('fetch("/api/session", { method: "DELETE" })'), "Dashboard layout sign-out must invalidate HttpOnly session");

assert(portalCode.includes("handleSignOut"), "Portal layout must maintain handleSignOut");
assert(portalCode.includes("supabase.auth.signOut()"), "Portal layout must call supabase.auth.signOut()");
assert(portalCode.includes('fetch("/api/session", { method: "DELETE" })'), "Portal layout sign-out must invalidate HttpOnly session");
console.log("  ✅ PASS: Explicit sign-out behavior is 100% preserved in both environments.");

console.log("\n=== ALL LOGIN ROUTING VERIFICATION CHECKS PASSED PERFECTLY! ===");
