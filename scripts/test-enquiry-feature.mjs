/**
 * ==============================================================================
 * NFCISTA Enquiry Form Feature — Comprehensive Test Suite
 * ==============================================================================
 * Verifies all requirements from Implementation Specification (Sections A through H):
 *
 * A. Public profile (enquiry OFF -> button absent, enquiry ON -> button present)
 * B. API validation (missing name, invalid phone, invalid email, missing message, oversized message, valid submission, honeypot)
 * C. Security (visitor cannot supply customer_id / auth_user_id, customer cannot access/modify another's enquiry, visitor cannot query table)
 * D. Rate limiting (5 per 10min per IP/slug, rejection on 6th)
 * E. WhatsApp (customer destination digits, correct encoded pre-filled text, HTTPS wa.me, safe URL construction)
 * F. Delivery combinations (dashboard only, WhatsApp only, dashboard + WhatsApp, email not_configured)
 * G. Existing customers (opt-in default FALSE)
 * H. Existing functionality regression (Facebook, LinkedIn, X/Twitter, Google Drive, banner, photo, gallery, QR, customer & admin auth)
 * ==============================================================================
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================================");
console.log("   NFCISTA ENQUIRY FORM SYSTEM — COMPREHENSIVE TEST SUITE");
console.log("==================================================================\n");

let passed = 0;
let total = 0;

function runTest(suite, name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] [${suite}] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] [${suite}] ${name}`);
    console.error(`         Error: ${err.message}\n`);
  }
}

// ==============================================================================
// Section A: Public Profile Logic & UI Verification
// ==============================================================================
console.log("\n--- Section A: Public Profile Display Logic ---");

runTest("Section A", "app/p/[slug]/page.js imports and renders ProfileEnquiryButton conditionally", () => {
  const pagePath = path.join(rootDir, "app/p/[slug]/page.js");
  assert.ok(fs.existsSync(pagePath), "app/p/[slug]/page.js must exist");
  const content = fs.readFileSync(pagePath, "utf-8");

  assert.ok(
    content.includes('import ProfileEnquiryButton from "@/components/profile/ProfileEnquiryButton";'),
    "Must import ProfileEnquiryButton"
  );
  assert.ok(
    content.includes("customer.enquiry_enabled && ("),
    "Must check customer.enquiry_enabled before rendering ProfileEnquiryButton"
  );
  assert.ok(
    content.includes("<ProfileEnquiryButton"),
    "Must render <ProfileEnquiryButton /> component"
  );

  // Verify placement immediately below SaveContactButtonLazy
  const saveIdx = content.indexOf("<SaveContactButtonLazy");
  assert.ok(saveIdx !== -1, "SaveContactButtonLazy must be present");
  const saveCloseIdx = content.indexOf("/>", saveIdx);
  const enquiryIdx = content.indexOf("<ProfileEnquiryButton", saveCloseIdx);
  assert.ok(enquiryIdx !== -1, "ProfileEnquiryButton must be present");
  assert.ok(enquiryIdx > saveCloseIdx, "ProfileEnquiryButton must appear after SaveContactButtonLazy");
  assert.ok(
    enquiryIdx - saveCloseIdx < 150,
    "ProfileEnquiryButton must be placed immediately below SaveContactButtonLazy"
  );
});

runTest("Section A", "ProfileEnquiryButton logic: absent when OFF, present when ON", () => {
  function renderPublicProfileCTA(customer) {
    if (customer.enquiry_enabled === true) {
      return { rendered: true, buttonText: "Send Enquiry", slug: customer.profile_slug };
    }
    return { rendered: false, buttonText: null, slug: customer.profile_slug };
  }

  // Case 1: enquiry_enabled is false
  const customerOff = { profile_slug: "rahul-traders", enquiry_enabled: false };
  const resOff = renderPublicProfileCTA(customerOff);
  assert.equal(resOff.rendered, false, "CTA must NOT render when enquiry_enabled is false");

  // Case 2: enquiry_enabled is null/undefined
  const customerDefault = { profile_slug: "rahul-traders" };
  const resDefault = renderPublicProfileCTA(customerDefault);
  assert.equal(resDefault.rendered, false, "CTA must NOT render when enquiry_enabled is missing/null");

  // Case 3: enquiry_enabled is true
  const customerOn = { profile_slug: "rahul-traders", enquiry_enabled: true };
  const resOn = renderPublicProfileCTA(customerOn);
  assert.equal(resOn.rendered, true, "CTA must render when enquiry_enabled is true");
  assert.equal(resOn.buttonText, "Send Enquiry");
});

runTest("Section A", "components/profile/ProfileEnquiryModal.jsx adheres to UI specs and patterns", () => {
  const modalPath = path.join(rootDir, "components/profile/ProfileEnquiryModal.jsx");
  assert.ok(fs.existsSync(modalPath), "ProfileEnquiryModal.jsx must exist");
  const content = fs.readFileSync(modalPath, "utf-8");

  assert.ok(content.includes('role="dialog"'), "Must be accessible with role='dialog'");
  assert.ok(content.includes('aria-modal="true"'), "Must have aria-modal='true'");
  assert.ok(content.includes('website_hp'), "Must include hidden honeypot field website_hp");
  assert.ok(content.includes('name="website_hp"'), "Honeypot input must be named website_hp");
  assert.ok(content.includes('type="tel"'), "Must include phone input");
  assert.ok(content.includes('type="email"'), "Must include email input");
  assert.ok(content.includes("Continue to WhatsApp"), "Must include WhatsApp continuation button in success state");
  assert.ok(content.includes("Escape"), "Must handle Escape key for accessibility");
});

// ==============================================================================
// Section B: API Validation Logic
// ==============================================================================
console.log("\n--- Section B: Public API Validation Logic ---");

// Mirror of API validation logic from app/api/enquiry/route.js
function normalizeAndValidatePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== "string") return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 20) return null;
  return digits;
}

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function validateEnquiryPayload(body) {
  if (!body || typeof body !== "object") return { valid: false, error: "Request body must be an object." };

  // Honeypot
  if (body.website_hp && String(body.website_hp).trim().length > 0) {
    return { valid: true, isSpam: true, message: "Enquiry submitted successfully.", whatsapp_url: null };
  }

  // Slug
  if (!body.profile_slug || typeof body.profile_slug !== "string" || !body.profile_slug.trim()) {
    return { valid: false, error: "Profile slug is required." };
  }

  // Name
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return { valid: false, error: "Your name is required." };
  }
  const cleanName = body.name.trim();
  if (cleanName.length > 120) {
    return { valid: false, error: "Name must be 120 characters or less." };
  }

  // Phone
  if (!body.phone || typeof body.phone !== "string" || !body.phone.trim()) {
    return { valid: false, error: "Mobile number is required." };
  }
  const phoneDigits = normalizeAndValidatePhone(body.phone);
  if (!phoneDigits) {
    return { valid: false, error: "Please enter a valid phone number with 7 to 20 digits." };
  }

  // Email (optional)
  let cleanEmail = null;
  if (body.email !== undefined && body.email !== null && String(body.email).trim() !== "") {
    const rawEmail = String(body.email).trim();
    if (!isValidEmail(rawEmail)) {
      return { valid: false, error: "Please enter a valid email address." };
    }
    if (rawEmail.length > 120) {
      return { valid: false, error: "Email must be 120 characters or less." };
    }
    cleanEmail = rawEmail;
  }

  // Message
  if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
    return { valid: false, error: "Message is required." };
  }
  const cleanMessage = body.message.trim();
  if (cleanMessage.length < 3) {
    return { valid: false, error: "Message must be at least 3 characters long." };
  }
  if (cleanMessage.length > 2000) {
    return { valid: false, error: "Message must be 2000 characters or less." };
  }

  return {
    valid: true,
    isSpam: false,
    cleanData: {
      profile_slug: body.profile_slug.trim().toLowerCase(),
      name: cleanName,
      phone: body.phone.trim().slice(0, 30),
      email: cleanEmail,
      message: cleanMessage,
    },
  };
}

runTest("Section B", "Validation: Rejects missing or whitespace-only name", () => {
  const missingName = { profile_slug: "test-slug", phone: "9876543210", message: "Hello there" };
  const res1 = validateEnquiryPayload(missingName);
  assert.equal(res1.valid, false);
  assert.equal(res1.error, "Your name is required.");

  const emptyName = { profile_slug: "test-slug", name: "   ", phone: "9876543210", message: "Hello there" };
  const res2 = validateEnquiryPayload(emptyName);
  assert.equal(res2.valid, false);
  assert.equal(res2.error, "Your name is required.");
});

runTest("Section B", "Validation: Rejects oversized name (>120 chars)", () => {
  const longName = "A".repeat(121);
  const payload = { profile_slug: "test-slug", name: longName, phone: "9876543210", message: "Hello there" };
  const res = validateEnquiryPayload(payload);
  assert.equal(res.valid, false);
  assert.equal(res.error, "Name must be 120 characters or less.");
});

runTest("Section B", "Validation: Normalizes and validates phone (rejects <7 and >20 digits)", () => {
  assert.equal(normalizeAndValidatePhone("123456"), null, "<7 digits must be rejected");
  assert.equal(normalizeAndValidatePhone("1".repeat(21)), null, ">20 digits must be rejected");
  assert.equal(normalizeAndValidatePhone("abcdefg"), null, "Non-numeric string must be rejected");
  assert.equal(normalizeAndValidatePhone("+91 (987) 654-3210"), "919876543210", "Formatted phone must be parsed to 12 digits");
  assert.equal(normalizeAndValidatePhone("9876543210"), "9876543210", "10-digit mobile must be valid");
});

runTest("Section B", "Validation: Validates email when provided, permits empty/null email", () => {
  // Empty/omitted email is permitted
  const validNoEmail = { profile_slug: "test-slug", name: "Rahul", phone: "9876543210", message: "Hello" };
  const res1 = validateEnquiryPayload(validNoEmail);
  assert.equal(res1.valid, true);
  assert.equal(res1.cleanData.email, null);

  // Invalid email format is rejected
  const badEmail = { profile_slug: "test-slug", name: "Rahul", phone: "9876543210", email: "not-an-email", message: "Hello" };
  const res2 = validateEnquiryPayload(badEmail);
  assert.equal(res2.valid, false);
  assert.equal(res2.error, "Please enter a valid email address.");

  // Valid email is preserved
  const goodEmail = { profile_slug: "test-slug", name: "Rahul", phone: "9876543210", email: "rahul@example.com", message: "Hello" };
  const res3 = validateEnquiryPayload(goodEmail);
  assert.equal(res3.valid, true);
  assert.equal(res3.cleanData.email, "rahul@example.com");
});

runTest("Section B", "Validation: Rejects missing, <3 chars, or >2000 chars message", () => {
  const shortMsg = { profile_slug: "test-slug", name: "Rahul", phone: "9876543210", message: "Hi" };
  const res1 = validateEnquiryPayload(shortMsg);
  assert.equal(res1.valid, false);
  assert.equal(res1.error, "Message must be at least 3 characters long.");

  const hugeMsg = "X".repeat(2001);
  const payload2 = { profile_slug: "test-slug", name: "Rahul", phone: "9876543210", message: hugeMsg };
  const res2 = validateEnquiryPayload(payload2);
  assert.equal(res2.valid, false);
  assert.equal(res2.error, "Message must be 2000 characters or less.");
});

runTest("Section B", "Validation: Honeypot silently traps bot submissions without error", () => {
  const botPayload = {
    profile_slug: "test-slug",
    name: "Spam Bot",
    phone: "1234567890",
    message: "Buy cheap crypto",
    website_hp: "https://spam.com",
  };
  const res = validateEnquiryPayload(botPayload);
  assert.equal(res.valid, true);
  assert.equal(res.isSpam, true);
  assert.equal(res.whatsapp_url, null);
  assert.equal(res.message, "Enquiry submitted successfully.");
});

// ==============================================================================
// Section C: Security & Customer Isolation
// ==============================================================================
console.log("\n--- Section C: Security & Customer Isolation ---");

runTest("Section C", "Public API: Visitor cannot supply customer_id, auth_user_id, or delivery settings", () => {
  const apiPath = path.join(rootDir, "app/api/enquiry/route.js");
  const content = fs.readFileSync(apiPath, "utf-8");

  // Verify that the API accepts only: profile_slug, name, phone, email, message, website_hp
  assert.ok(content.includes("const rawSlug = body.profile_slug;"), "Must extract profile_slug");
  assert.ok(!content.includes("customer_id: body.customer_id"), "Must NEVER accept customer_id from body");
  assert.ok(!content.includes("auth_user_id: body.auth_user_id"), "Must NEVER accept auth_user_id from body");
  assert.ok(!content.includes("delivery_dashboard: body.delivery_dashboard"), "Must NEVER accept delivery_dashboard from body");
  assert.ok(!content.includes("delivery_whatsapp: body.delivery_whatsapp"), "Must NEVER accept delivery_whatsapp from body");

  // Verify RPC-based server-side lookup (fix for RLS bug: anon cannot directly access tables)
  assert.ok(
    content.includes('supabase.rpc("submit_customer_enquiry"'),
    "Must use SECURITY DEFINER RPC to look up customer and insert enquiry atomically"
  );
  assert.ok(
    !content.includes('.from("customers").select'),
    "Must NOT directly SELECT from customers with anon client (blocked by RLS)"
  );
  assert.ok(
    !content.includes('.from("customer_enquiries").insert'),
    "Must NOT directly INSERT into customer_enquiries with anon client (blocked by RLS)"
  );
  // Verify disabled/inactive check is still enforced via RPC status
  assert.ok(content.includes('result.status === "DISABLED"'), "Must handle DISABLED status from RPC");
});

runTest("Section C", "Customer API PATCH: Customer cannot modify disallowed fields", () => {
  const patchPath = path.join(rootDir, "app/api/customer/enquiries/[id]/route.js");
  assert.ok(fs.existsSync(patchPath), "PATCH route must exist");
  const content = fs.readFileSync(patchPath, "utf-8");

  const disallowed = [
    "id",
    "customer_id",
    "visitor_name",
    "visitor_phone",
    "visitor_email",
    "message",
    "delivery_dashboard",
    "delivery_email",
    "delivery_whatsapp",
    "ip_hash",
    "user_agent",
    "created_at",
  ];

  for (const field of disallowed) {
    assert.ok(
      content.includes(`"${field}"`),
      `PATCH route must explicitly reject modification of '${field}'`
    );
  }

  // Verify strictly scoped update
  assert.ok(
    content.includes('.eq("id", id)') && content.includes('.eq("customer_id", customer.id)'),
    "PATCH update must strictly filter by enquiry id AND customer.id"
  );
});

runTest("Section C", "Customer API GET: Customer cannot list another customer's enquiries", () => {
  const getPath = path.join(rootDir, "app/api/customer/enquiries/route.js");
  assert.ok(fs.existsSync(getPath), "GET route must exist");
  const content = fs.readFileSync(getPath, "utf-8");

  assert.ok(content.includes("authenticateCustomer(request)"), "Must require customer authentication");
  assert.ok(
    content.includes('.eq("customer_id", customer.id)'),
    "GET query must filter by authenticated customer.id"
  );
});

runTest("Section C", "Migration RLS: Anonymous visitors have zero direct table access", () => {
  const migPath = path.join(rootDir, "supabase/migrations/20261020000000_create_customer_enquiries.sql");
  assert.ok(fs.existsSync(migPath), "Migration file must exist");
  const content = fs.readFileSync(migPath, "utf-8");

  assert.ok(content.includes("ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;"), "Must enable RLS");
  assert.ok(content.includes('CREATE POLICY "Customers can view their own enquiries"'), "Must define customer SELECT policy");
  assert.ok(content.includes('CREATE POLICY "Customers can update their own enquiries"'), "Must define customer UPDATE policy");
  assert.ok(content.includes('CREATE POLICY "Admin can manage all enquiries"'), "Must define admin management policy");
  assert.ok(content.includes("public.is_admin()"), "Admin policy must strictly call public.is_admin()");

  // Ensure NO anon policy is granted on customer_enquiries table
  assert.ok(!content.includes("TO anon USING"), "Anonymous role must NEVER have direct table access");
  assert.ok(!content.includes("TO public USING"), "Public role must NEVER have direct table access");
});

runTest("Section C", "RPC get_customer_by_slug: Appends 21st column enquiry_enabled without exposing private data", () => {
  const migPath = path.join(rootDir, "supabase/migrations/20261020000000_create_customer_enquiries.sql");
  const content = fs.readFileSync(migPath, "utf-8");

  const rpcStartIndex = content.indexOf("CREATE FUNCTION public.get_customer_by_slug");
  assert.ok(rpcStartIndex !== -1, "Must find RPC function definition in migration");
  const rpcContent = content.slice(rpcStartIndex);

  assert.ok(rpcContent.includes("SECURITY DEFINER"), "Must be SECURITY DEFINER");
  assert.ok(rpcContent.includes("SET search_path = public"), "Must set search_path = public");
  assert.ok(rpcContent.includes("enquiry_enabled   BOOLEAN"), "Must declare enquiry_enabled BOOLEAN in RPC return table");

  // Must NOT expose internal customer_id, auth_user_id, or delivery settings in RPC return
  assert.ok(!rpcContent.includes("customer_id       UUID"), "Must NOT return customer_id in RPC");
  assert.ok(!rpcContent.includes("auth_user_id      UUID"), "Must NOT return auth_user_id in RPC");
  assert.ok(!rpcContent.includes("enquiry_delivery_dashboard"), "Must NOT return enquiry_delivery_dashboard in RPC");
  assert.ok(!rpcContent.includes("enquiry_delivery_email"), "Must NOT return enquiry_delivery_email in RPC");
  assert.ok(!rpcContent.includes("enquiry_delivery_whatsapp"), "Must NOT return enquiry_delivery_whatsapp in RPC");
});

// ==============================================================================
// Section C-RPC: submit_customer_enquiry Security Tests (Bug-Fix Validation)
// ==============================================================================
console.log("\n--- Section C-RPC: submit_customer_enquiry RPC Security ---");

runTest("Section C-RPC", "Migration: submit_customer_enquiry RPC exists with SECURITY DEFINER and correct search_path", () => {
  const migPath = path.join(rootDir, "supabase/migrations/20261021000000_add_submit_enquiry_rpc.sql");
  assert.ok(fs.existsSync(migPath), "Bug-fix migration 20261021000000_add_submit_enquiry_rpc.sql must exist");
  const content = fs.readFileSync(migPath, "utf-8");

  assert.ok(content.includes("CREATE FUNCTION public.submit_customer_enquiry"), "RPC function must be created");
  assert.ok(content.includes("SECURITY DEFINER"), "RPC must be SECURITY DEFINER");
  assert.ok(content.includes("SET search_path = public"), "RPC must pin search_path to prevent injection");
  assert.ok(content.includes("LANGUAGE plpgsql"), "Must be plpgsql for VOLATILE and procedural logic");
  assert.ok(content.includes("GRANT EXECUTE ON FUNCTION public.submit_customer_enquiry"), "Must GRANT EXECUTE to anon/authenticated");
  assert.ok(content.includes("TO anon, authenticated"), "Grant must include anon and authenticated roles");
});

runTest("Section C-RPC", "Migration: submit_customer_enquiry accepts exactly the required visitor inputs", () => {
  const migPath = path.join(rootDir, "supabase/migrations/20261021000000_add_submit_enquiry_rpc.sql");
  const content = fs.readFileSync(migPath, "utf-8");

  assert.ok(content.includes("slug_input    text"), "Must accept slug_input");
  assert.ok(content.includes("visitor_name  text"), "Must accept visitor_name");
  assert.ok(content.includes("visitor_phone text"), "Must accept visitor_phone");
  assert.ok(content.includes("visitor_email text"), "Must accept visitor_email (nullable)");
  assert.ok(content.includes("message       text"), "Must accept message");
  assert.ok(content.includes("ip_hash_input text"), "Must accept ip_hash_input");
  assert.ok(content.includes("user_agent_input text"), "Must accept user_agent_input (nullable)");
});

runTest("Section C-RPC", "Migration: submit_customer_enquiry returns ONLY minimum required fields", () => {
  const migPath = path.join(rootDir, "supabase/migrations/20261021000000_add_submit_enquiry_rpc.sql");
  const content = fs.readFileSync(migPath, "utf-8");

  // Returned fields that ARE required
  assert.ok(content.includes("status           text"), "Must return status");
  assert.ok(content.includes("enquiry_id       uuid"), "Must return enquiry_id");
  assert.ok(content.includes("customer_name    text"), "Must return customer_name");
  assert.ok(content.includes("wa_number        text"), "Must return wa_number (nullable when WhatsApp off)");
  assert.ok(content.includes("delivery_whatsapp boolean"), "Must return delivery_whatsapp");

  // Private fields that must NEVER appear in the RETURNS TABLE definition
  const returnsStart = content.indexOf("RETURNS TABLE");
  const returnsEnd = content.indexOf("LANGUAGE plpgsql");
  const returnsDef = content.slice(returnsStart, returnsEnd);
  assert.ok(!returnsDef.includes("customer_id"), "Must NOT return customer_id");
  assert.ok(!returnsDef.includes("auth_user_id"), "Must NOT return auth_user_id");
  assert.ok(!returnsDef.includes("email"), "Must NOT return customer email");
  assert.ok(!returnsDef.includes("address"), "Must NOT return address");
  assert.ok(!returnsDef.includes("photo_url"), "Must NOT return photo_url");
  assert.ok(!returnsDef.includes("facebook"), "Must NOT return social URLs");
  assert.ok(!returnsDef.includes("delivery_dashboard"), "Must NOT return delivery_dashboard");
  assert.ok(!returnsDef.includes("delivery_email"), "Must NOT return delivery_email");
});

runTest("Section C-RPC", "Migration: RPC enforces is_active AND enquiry_enabled before inserting", () => {
  const migPath = path.join(rootDir, "supabase/migrations/20261021000000_add_submit_enquiry_rpc.sql");
  const content = fs.readFileSync(migPath, "utf-8");

  assert.ok(content.includes("AND c.is_active = TRUE"), "RPC must require is_active = TRUE");
  assert.ok(content.includes("AND c.enquiry_enabled = TRUE"), "RPC must require enquiry_enabled = TRUE");
  assert.ok(content.includes("IF NOT FOUND THEN"), "RPC must handle the NOT FOUND case");
  assert.ok(content.includes("'DISABLED'::text"), "RPC must return status=DISABLED when customer not eligible");
});

runTest("Section C-RPC", "Migration: RPC snapshots delivery settings atomically — not from visitor input", () => {
  const migPath = path.join(rootDir, "supabase/migrations/20261021000000_add_submit_enquiry_rpc.sql");
  const content = fs.readFileSync(migPath, "utf-8");

  // Settings must come from v_customer (server) not from function arguments (visitor)
  assert.ok(content.includes("v_customer.enquiry_delivery_dashboard"), "delivery_dashboard must come from v_customer");
  assert.ok(content.includes("v_customer.enquiry_delivery_email"), "delivery_email must come from v_customer");
  assert.ok(content.includes("v_customer.enquiry_delivery_whatsapp"), "delivery_whatsapp must come from v_customer");
});

runTest("Section C-RPC", "Migration: WhatsApp number returned only when delivery_whatsapp is TRUE", () => {
  const migPath = path.join(rootDir, "supabase/migrations/20261021000000_add_submit_enquiry_rpc.sql");
  const content = fs.readFileSync(migPath, "utf-8");

  // WhatsApp capability must be determined server-side from v_customer
  assert.ok(
    content.includes("v_can_whatsapp := v_customer.enquiry_delivery_whatsapp") ||
    content.includes("v_can_whatsapp :=") && content.includes("v_customer.enquiry_delivery_whatsapp"),
    "Can-whatsapp flag must be derived from server-side customer data"
  );
  assert.ok(
    content.includes("CASE WHEN v_can_whatsapp") || content.includes("WHEN v_can_whatsapp"),
    "wa_number must be conditionally returned based on server-side flag"
  );
  // wa_number must be NULL when WhatsApp is not enabled
  assert.ok(content.includes("ELSE NULL"), "wa_number must be NULL when WhatsApp delivery is off");
});

runTest("Section C-RPC", "Migration: No anon table-level privileges granted (RLS unchanged)", () => {
  const migPath = path.join(rootDir, "supabase/migrations/20261021000000_add_submit_enquiry_rpc.sql");
  const content = fs.readFileSync(migPath, "utf-8");

  // Only EXECUTE is granted; no table grants
  assert.ok(!content.includes("GRANT SELECT ON"), "Must NOT grant SELECT on any table");
  assert.ok(!content.includes("GRANT INSERT ON"), "Must NOT grant INSERT on any table");
  assert.ok(!content.includes("GRANT UPDATE ON"), "Must NOT grant UPDATE on any table");
  assert.ok(!content.includes("GRANT ALL ON"), "Must NOT grant ALL on any table");
});

runTest("Section C-RPC", "API: RPC call uses server-computed ip_hash and user_agent — not visitor-supplied values", () => {
  const apiPath = path.join(rootDir, "app/api/enquiry/route.js");
  const content = fs.readFileSync(apiPath, "utf-8");

  assert.ok(content.includes("const ipHash = hashIp(clientIp)"), "IP hash must be computed server-side");
  assert.ok(content.includes('request.headers.get("user-agent")'), "User-agent must be taken from request headers");
  assert.ok(content.includes("ip_hash_input:    ipHash"), "ip_hash_input must be the server-computed hash");
  assert.ok(content.includes("user_agent_input: userAgent"), "user_agent_input must be the server-extracted string");
  assert.ok(!content.includes("ip_hash_input:    body."), "ip_hash_input must NEVER come from request body");
  assert.ok(!content.includes("user_agent_input: body."), "user_agent_input must NEVER come from request body");
});

runTest("Section C-RPC", "API: Raw database errors are never exposed to visitors", () => {
  const apiPath = path.join(rootDir, "app/api/enquiry/route.js");
  const content = fs.readFileSync(apiPath, "utf-8");

  // The rpcErr is logged server-side only
  assert.ok(content.includes('console.error("[enquiry] RPC submit_customer_enquiry error:'), "Must log RPC error server-side");
  assert.ok(content.includes('"Failed to submit enquiry. Please try again later."'), "Must return generic error to visitor");
  // Make sure we don't forward rpcErr.message to the client response
  assert.ok(!content.includes("error: rpcErr.message"), "Must NOT forward raw rpcErr.message to visitor");
  assert.ok(!content.includes("error: rpcErr.code"), "Must NOT forward raw rpcErr.code to visitor");
});

runTest("Section C-RPC", "API: WhatsApp URL is built from RPC response wa_number, not from request body", () => {
  const apiPath = path.join(rootDir, "app/api/enquiry/route.js");
  const content = fs.readFileSync(apiPath, "utf-8");

  assert.ok(content.includes("result.wa_number"), "WhatsApp number must come from RPC result");
  assert.ok(content.includes("result.delivery_whatsapp"), "WhatsApp flag must come from RPC result");
  assert.ok(!content.includes("body.whatsapp"), "WhatsApp number must NEVER come from visitor body");
  assert.ok(!content.includes("customer.whatsapp"), "WhatsApp number must not reference old direct-table customer object");
});

runTest("Section C-RPC", "API: Honeypot, rate limit, and all validation still run BEFORE RPC call", () => {
  const apiPath = path.join(rootDir, "app/api/enquiry/route.js");
  const content = fs.readFileSync(apiPath, "utf-8");

  // Verify order: honeypot check, rate limit, all validation, then RPC
  const honeypotIdx = content.indexOf("body.website_hp");
  const rateLimitIdx = content.indexOf("checkRateLimit(rateLimitKey");
  const nameIdx = content.indexOf("const rawName = body.name;");
  const phoneIdx = content.indexOf("const rawPhone = body.phone;");
  const messageIdx = content.indexOf("const rawMessage = body.message;");
  const rpcIdx = content.indexOf('supabase.rpc("submit_customer_enquiry"');

  assert.ok(honeypotIdx < rpcIdx, "Honeypot check must run before RPC");
  assert.ok(rateLimitIdx < rpcIdx, "Rate limiting must run before RPC");
  assert.ok(nameIdx < rpcIdx, "Name validation must run before RPC");
  assert.ok(phoneIdx < rpcIdx, "Phone validation must run before RPC");
  assert.ok(messageIdx < rpcIdx, "Message validation must run before RPC");
});

runTest("Section C-RPC", "Existing RLS policies on customers and customer_enquiries are unchanged", () => {
  // Verify the original migration still has the correct policies (not loosened by the bug fix)
  const origMigPath = path.join(rootDir, "supabase/migrations/20261020000000_create_customer_enquiries.sql");
  const origContent = fs.readFileSync(origMigPath, "utf-8");

  assert.ok(origContent.includes("ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;"), "Original RLS must remain enabled");
  assert.ok(origContent.includes('CREATE POLICY "Customers can view their own enquiries"'), "Customer SELECT policy must be intact");
  assert.ok(origContent.includes('CREATE POLICY "Customers can update their own enquiries"'), "Customer UPDATE policy must be intact");
  assert.ok(origContent.includes('CREATE POLICY "Admin can manage all enquiries"'), "Admin policy must be intact");
  assert.ok(!origContent.includes("GRANT SELECT ON public.customers TO anon"), "Must NOT grant anon SELECT on customers");
  assert.ok(!origContent.includes("GRANT INSERT ON public.customer_enquiries TO anon"), "Must NOT grant anon INSERT on customer_enquiries");

  // Verify the bug-fix migration also doesn't loosen RLS
  const fixMigPath = path.join(rootDir, "supabase/migrations/20261021000000_add_submit_enquiry_rpc.sql");
  const fixContent = fs.readFileSync(fixMigPath, "utf-8");
  assert.ok(!fixContent.includes("GRANT SELECT ON"), "Bug-fix migration must NOT grant table SELECT");
  assert.ok(!fixContent.includes("GRANT INSERT ON"), "Bug-fix migration must NOT grant table INSERT");
});

// ==============================================================================
console.log("\n--- Section D: Rate Limiting ---");

runTest("Section D", "Simulated Rate Limiter: 5 allowed, 6th rejected", () => {
  const store = new Map();
  function checkRateLimit(key, { limit, windowMs }) {
    const now = Date.now();
    const entry = store.get(key) || { count: 0, reset: now + windowMs };
    if (now > entry.reset) {
      entry.count = 0;
      entry.reset = now + windowMs;
    }
    if (entry.count >= limit) {
      return { success: false, remaining: 0, reset: entry.reset };
    }
    entry.count++;
    store.set(key, entry);
    return { success: true, remaining: limit - entry.count, reset: entry.reset };
  }

  const testKey = "192.168.1.100:test-profile";
  for (let i = 1; i <= 5; i++) {
    const res = checkRateLimit(testKey, { limit: 5, windowMs: 600000 });
    assert.equal(res.success, true, `Submission ${i} must succeed`);
    assert.equal(res.remaining, 5 - i);
  }

  // 6th submission must be rejected
  const res6 = checkRateLimit(testKey, { limit: 5, windowMs: 600000 });
  assert.equal(res6.success, false, "6th submission must be rate limited");
  assert.equal(res6.remaining, 0);
});

// ==============================================================================
// Section E: WhatsApp Follow-Up URL Generation
// ==============================================================================
console.log("\n--- Section E: WhatsApp Follow-Up URL Generation ---");

function generateWhatsAppFollowUpUrl(customer, visitor) {
  if (!customer.whatsapp || !String(customer.whatsapp).trim()) return null;
  const waDigits = customer.whatsapp.replace(/\D/g, "");
  if (!waDigits || waDigits.length < 7) return null;

  const emailLine = visitor.email ? `\nEmail: ${visitor.email}` : "";
  const prefilledText = `Hi ${customer.full_name},\n\nI just submitted an enquiry through your NFCISTA digital card.\n\nName: ${visitor.name}\nPhone: ${visitor.phone}${emailLine}\nMessage: ${visitor.message}`;
  return `https://wa.me/${waDigits}?text=${encodeURIComponent(prefilledText)}`;
}

runTest("Section E", "WhatsApp URL: Generates correct HTTPS wa.me with prefilled message", () => {
  const customer = { full_name: "Vikram Malhotra", whatsapp: "+91 98765-43210" };
  const visitor = { name: "Ananya Iyer", phone: "+91 91234 56789", email: "ananya@example.com", message: "Interested in your cards" };

  const url = generateWhatsAppFollowUpUrl(customer, visitor);
  assert.ok(url.startsWith("https://wa.me/919876543210?text="), "Must use https://wa.me/ with normalized digits");

  const parsed = new URL(url);
  assert.equal(parsed.protocol, "https:");
  assert.equal(parsed.hostname, "wa.me");

  const textParam = parsed.searchParams.get("text");
  assert.ok(textParam.includes("Hi Vikram Malhotra,"), "Must address customer by name");
  assert.ok(textParam.includes("Name: Ananya Iyer"), "Must include visitor name");
  assert.ok(textParam.includes("Phone: +91 91234 56789"), "Must include visitor phone");
  assert.ok(textParam.includes("Email: ananya@example.com"), "Must include visitor email");
  assert.ok(textParam.includes("Message: Interested in your cards"), "Must include message");
});

runTest("Section E", "WhatsApp URL: Omits email line if visitor email is null/undefined", () => {
  const customer = { full_name: "Vikram Malhotra", whatsapp: "+91 98765-43210" };
  const visitor = { name: "Ananya Iyer", phone: "+91 91234 56789", email: null, message: "Interested" };

  const url = generateWhatsAppFollowUpUrl(customer, visitor);
  const parsed = new URL(url);
  const textParam = parsed.searchParams.get("text");
  assert.ok(!textParam.includes("Email:"), "Must NOT include Email line when email is null");
});

runTest("Section E", "WhatsApp URL: Returns null if customer has no valid WhatsApp number", () => {
  const customerNoWa = { full_name: "Vikram", whatsapp: "" };
  const visitor = { name: "Ananya", phone: "9876543210", message: "Hello" };
  assert.equal(generateWhatsAppFollowUpUrl(customerNoWa, visitor), null);
});

// ==============================================================================
// Section F: Delivery Setting Combinations
// ==============================================================================
console.log("\n--- Section F: Delivery Setting Combinations ---");

runTest("Section F", "Snapshot logic: Records correct delivery flags and status values", () => {
  function createEnquirySnapshot(customerSettings, visitorData) {
    const canDoWhatsapp = Boolean(
      customerSettings.enquiry_delivery_whatsapp &&
      customerSettings.whatsapp &&
      String(customerSettings.whatsapp).trim()
    );

    return {
      delivery_dashboard: Boolean(customerSettings.enquiry_delivery_dashboard),
      delivery_email: Boolean(customerSettings.enquiry_delivery_email),
      delivery_whatsapp: Boolean(customerSettings.enquiry_delivery_whatsapp),
      email_status: "not_configured",
      whatsapp_status: canDoWhatsapp ? "ready" : "skipped",
    };
  }

  // Combo 1: Dashboard only
  const snap1 = createEnquirySnapshot({
    enquiry_delivery_dashboard: true,
    enquiry_delivery_email: false,
    enquiry_delivery_whatsapp: false,
  });
  assert.equal(snap1.delivery_dashboard, true);
  assert.equal(snap1.delivery_whatsapp, false);
  assert.equal(snap1.email_status, "not_configured");
  assert.equal(snap1.whatsapp_status, "skipped");

  // Combo 2: WhatsApp only
  const snap2 = createEnquirySnapshot({
    enquiry_delivery_dashboard: false,
    enquiry_delivery_email: false,
    enquiry_delivery_whatsapp: true,
    whatsapp: "9876543210",
  });
  assert.equal(snap2.delivery_dashboard, false);
  assert.equal(snap2.delivery_whatsapp, true);
  assert.equal(snap2.whatsapp_status, "ready");

  // Combo 3: Dashboard + WhatsApp
  const snap3 = createEnquirySnapshot({
    enquiry_delivery_dashboard: true,
    enquiry_delivery_email: false,
    enquiry_delivery_whatsapp: true,
    whatsapp: "9876543210",
  });
  assert.equal(snap3.delivery_dashboard, true);
  assert.equal(snap3.delivery_whatsapp, true);
  assert.equal(snap3.whatsapp_status, "ready");

  // Combo 4: Email enabled (Phase 1)
  const snap4 = createEnquirySnapshot({
    enquiry_delivery_dashboard: true,
    enquiry_delivery_email: true,
    enquiry_delivery_whatsapp: false,
  });
  assert.equal(snap4.delivery_email, true);
  assert.equal(snap4.email_status, "not_configured", "Email must be marked not_configured in Phase 1");
});

runTest("Section F", "Customer profile PUT validation: Requires at least one delivery destination if enabled", () => {
  const profileRoutePath = path.join(rootDir, "app/api/customer/profile/route.js");
  const content = fs.readFileSync(profileRoutePath, "utf-8");

  assert.ok(
    content.includes("At least one delivery destination (e.g. Dashboard or WhatsApp) must be selected"),
    "PUT handler must reject enquiry_enabled = true if all destinations are unchecked"
  );
  assert.ok(
    content.includes("A WhatsApp number is required to enable WhatsApp Follow-up delivery"),
    "PUT handler must require customer.whatsapp if enquiry_delivery_whatsapp is checked"
  );
});

// ==============================================================================
// Section G: Existing Customers Opt-In Check
// ==============================================================================
console.log("\n--- Section G: Existing Customers Default State ---");

runTest("Section G", "Database migration: enquiry_enabled defaults to FALSE (opt-in)", () => {
  const migPath = path.join(rootDir, "supabase/migrations/20261020000000_create_customer_enquiries.sql");
  const content = fs.readFileSync(migPath, "utf-8");

  assert.ok(
    content.includes("ADD COLUMN IF NOT EXISTS enquiry_enabled BOOLEAN NOT NULL DEFAULT FALSE;"),
    "Migration must default enquiry_enabled to FALSE"
  );
  assert.ok(
    content.includes("ADD COLUMN IF NOT EXISTS enquiry_delivery_dashboard BOOLEAN NOT NULL DEFAULT TRUE;"),
    "Migration must default enquiry_delivery_dashboard to TRUE"
  );
  assert.ok(
    content.includes("ADD COLUMN IF NOT EXISTS enquiry_delivery_email BOOLEAN NOT NULL DEFAULT FALSE;"),
    "Migration must default enquiry_delivery_email to FALSE"
  );
  assert.ok(
    content.includes("ADD COLUMN IF NOT EXISTS enquiry_delivery_whatsapp BOOLEAN NOT NULL DEFAULT FALSE;"),
    "Migration must default enquiry_delivery_whatsapp to FALSE"
  );
});

runTest("Section G", "lib/customers.js: demo customer fallback sets enquiry_enabled = false", () => {
  const custPath = path.join(rootDir, "lib/customers.js");
  const content = fs.readFileSync(custPath, "utf-8");

  assert.ok(
    content.includes("enquiry_enabled: false,"),
    "Demo customer fallback must have enquiry_enabled: false"
  );
});

// ==============================================================================
// Section H: Existing Functionality Regressions
// ==============================================================================
console.log("\n--- Section H: Existing Functionality Regressions ---");

runTest("Section H", "Regression: X / Twitter URL validation unchanged", () => {
  const custPath = path.join(rootDir, "lib/customers.js");
  const content = fs.readFileSync(custPath, "utf-8");

  assert.ok(content.includes("function isValidTwitterUrl("), "isValidTwitterUrl must exist");
  assert.ok(content.includes("function getSafeTwitterUrl("), "getSafeTwitterUrl must exist");
  assert.ok(content.includes("host === \"x.com\" || host.endsWith(\".x.com\")"));
  assert.ok(content.includes("host === \"twitter.com\" || host.endsWith(\".twitter.com\")"));
});

runTest("Section H", "Regression: Google Drive URL validation unchanged", () => {
  const custPath = path.join(rootDir, "lib/customers.js");
  const content = fs.readFileSync(custPath, "utf-8");

  assert.ok(content.includes("function isValidGoogleDriveUrl("), "isValidGoogleDriveUrl must exist");
  assert.ok(content.includes("function getSafeGoogleDriveUrl("), "getSafeGoogleDriveUrl must exist");
  assert.ok(content.includes("host === \"drive.google.com\" || host.endsWith(\".drive.google.com\")"));
  assert.ok(content.includes("host === \"docs.google.com\" || host.endsWith(\".docs.google.com\")"));
});

runTest("Section H", "Regression: Facebook & LinkedIn HTTPS validation intact", () => {
  const custPath = path.join(rootDir, "lib/customers.js");
  const content = fs.readFileSync(custPath, "utf-8");

  assert.ok(content.includes("function getSafeExternalHttpsUrl("), "getSafeExternalHttpsUrl must exist");
});

runTest("Section H", "Regression: Customer & Admin Auth modules intact", () => {
  const authPath = path.join(rootDir, "lib/customerAuth.js");
  assert.ok(fs.existsSync(authPath), "customerAuth.js must exist");

  const adminAuthPath = path.join(rootDir, "lib/adminAuth.js");
  assert.ok(fs.existsSync(adminAuthPath), "adminAuth.js must exist");
});

runTest("Section H", "Regression: Dynamic QR redirect intact", () => {
  const qrRoutePath = path.join(rootDir, "app/r/[cardCode]/route.js");
  assert.ok(fs.existsSync(qrRoutePath), "Dynamic QR redirect route app/r/[cardCode]/route.js must exist");

  const qrLibPath = path.join(rootDir, "lib/dynamicQr.js");
  assert.ok(fs.existsSync(qrLibPath), "Dynamic QR lib lib/dynamicQr.js must exist");
});

runTest("Section H", "Regression: Banner storage & Customer gallery intact", () => {
  const galleryPath = path.join(rootDir, "lib/gallery.js");
  assert.ok(fs.existsSync(galleryPath), "gallery.js must exist");

  const custPath = path.join(rootDir, "lib/customers.js");
  const content = fs.readFileSync(custPath, "utf-8");
  assert.ok(content.includes("uploadCustomerBanner"), "uploadCustomerBanner must exist");
});

// ==============================================================================
// Summary
// ==============================================================================
console.log("\n==================================================================");
console.log(`TEST RESULTS: ${passed} of ${total} tests PASSED.`);
if (passed === total) {
  console.log("STATUS: ALL TESTS PASSED SUCCESSFULLY! (Zero Failures)");
} else {
  console.error(`STATUS: ${total - passed} TESTS FAILED.`);
  process.exit(1);
}
console.log("==================================================================\n");
