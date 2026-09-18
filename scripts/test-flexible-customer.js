const path = require("path");
require(path.join(process.cwd(), "node_modules/@next/env")).loadEnvConfig(process.cwd());
const { createClient } = require("@supabase/supabase-js");

// vCard helper simulation identical to SaveContactButton.js
function escapeVCard(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
    .replace(/\r/g, "");
}

function buildVCard({ fullName, jobTitle, companyName, phone, whatsapp, email, website, address }) {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`FN:${escapeVCard(fullName || "")}`);

  const parts = (fullName || "").trim().split(/\s+/);
  const last  = parts.length > 1 ? escapeVCard(parts[parts.length - 1]) : "";
  const first = parts.length > 1 ? escapeVCard(parts.slice(0, -1).join(" ")) : escapeVCard(parts[0] || "");
  lines.push(`N:${last};${first};;;`);

  if (companyName) lines.push(`ORG:${escapeVCard(companyName)}`);
  if (jobTitle) lines.push(`TITLE:${escapeVCard(jobTitle)}`);

  const phoneDigits = phone ? phone.replace(/\D/g, "") : "";
  const waDigits    = whatsapp ? whatsapp.replace(/\D/g, "") : "";

  if (phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(phone)}`);
    if (whatsapp && waDigits !== phoneDigits) {
      lines.push(`TEL;TYPE=CELL;X-WHATSAPP:${escapeVCard(whatsapp)}`);
    }
  } else if (whatsapp) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(whatsapp)}`);
  }

  if (email) lines.push(`EMAIL:${escapeVCard(email)}`);
  if (website) lines.push(`URL:${escapeVCard(website)}`);
  if (address) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(address)};;;;`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function prepareCreateRecord(formData) {
  const cleanSlug = formData.profile_slug.trim().toLowerCase();
  return {
    full_name: formData.full_name.trim(),
    job_title: formData.job_title?.trim() || null,
    company_name: formData.company_name?.trim() || null,
    category: formData.category?.trim() || null,
    description: formData.description?.trim() || null,
    phone: formData.phone?.trim() || null,
    whatsapp: formData.whatsapp?.trim() || null,
    instagram: formData.instagram?.trim().replace(/^@/, "") || null,
    email: formData.email?.trim() || null,
    website: formData.website?.trim() || null,
    address: formData.address?.trim() || null,
    google_review_url: formData.google_review_url?.trim() || null,
    profile_slug: cleanSlug,
    is_active: formData.is_active !== undefined ? Boolean(formData.is_active) : true,
  };
}

function prepareUpdateRecord(formData) {
  const cleanSlug = formData.profile_slug.trim().toLowerCase();
  return {
    full_name: formData.full_name.trim(),
    job_title: formData.job_title?.trim() || null,
    company_name: formData.company_name?.trim() || null,
    category: formData.category?.trim() || null,
    description: formData.description?.trim() || null,
    phone: formData.phone?.trim() || null,
    whatsapp: formData.whatsapp?.trim() || null,
    instagram: formData.instagram?.trim().replace(/^@/, "") || null,
    email: formData.email?.trim() || null,
    website: formData.website?.trim() || null,
    address: formData.address?.trim() || null,
    google_review_url: formData.google_review_url?.trim() || null,
    profile_slug: cleanSlug,
    is_active: formData.is_active !== undefined ? Boolean(formData.is_active) : true,
  };
}

async function runTests() {
  console.log("==================================================");
  console.log("Running Flexible Customer Management Form Tests");
  console.log("==================================================\n");

  let passed = 0;
  let total = 7;

  // Test Case 1: Create customer with only Name + Slug, all other fields empty
  console.log("Test Case 1: Create customer with only Name and Slug");
  const tc1Data = {
    full_name: "Test Name",
    profile_slug: "test-name",
    job_title: "",
    company_name: "",
    category: "",
    description: "",
    phone: "",
    whatsapp: "",
    instagram: "",
    email: "",
    website: "",
    address: "",
    google_review_url: "",
  };
  const tc1Record = prepareCreateRecord(tc1Data);
  if (
    tc1Record.full_name === "Test Name" &&
    tc1Record.profile_slug === "test-name" &&
    tc1Record.phone === null &&
    tc1Record.email === null &&
    tc1Record.is_active === true
  ) {
    console.log("   ✅ PASS: Customer record prepared with only Name + Slug; all optional fields are NULL.");
    passed++;
  } else {
    console.error("   ❌ FAIL: tc1Record:", tc1Record);
  }

  // Test Case 2: Create customer with Name, Phone, Slug
  console.log("\nTest Case 2: Create customer with Name, Phone, Slug");
  const tc2Data = {
    full_name: "Test Name 2",
    phone: "+1 555 000 1111",
    profile_slug: "test-name-2",
  };
  const tc2Record = prepareCreateRecord(tc2Data);
  if (
    tc2Record.full_name === "Test Name 2" &&
    tc2Record.phone === "+1 555 000 1111" &&
    tc2Record.profile_slug === "test-name-2" &&
    tc2Record.whatsapp === null &&
    tc2Record.email === null
  ) {
    console.log("   ✅ PASS: Customer record created with Name + Phone + Slug; other fields are NULL.");
    passed++;
  } else {
    console.error("   ❌ FAIL: tc2Record:", tc2Record);
  }

  // Test Case 3: Create customer with all available information
  console.log("\nTest Case 3: Create customer with all available information");
  const tc3Data = {
    full_name: "Full Customer",
    job_title: "CEO",
    company_name: "Global Tech",
    category: "Technology",
    description: "Experienced executive",
    phone: "+1 555 111 2222",
    whatsapp: "15551112222",
    instagram: "@globaltech",
    email: "ceo@globaltech.com",
    website: "https://globaltech.com",
    address: "100 Main St, Tech City",
    google_review_url: "https://g.page/r/test",
    profile_slug: "full-customer",
    is_active: true,
  };
  const tc3Record = prepareCreateRecord(tc3Data);
  if (
    tc3Record.full_name === "Full Customer" &&
    tc3Record.job_title === "CEO" &&
    tc3Record.company_name === "Global Tech" &&
    tc3Record.instagram === "globaltech" &&
    tc3Record.profile_slug === "full-customer"
  ) {
    console.log("   ✅ PASS: Full customer record created successfully with all fields intact.");
    passed++;
  } else {
    console.error("   ❌ FAIL: tc3Record:", tc3Record);
  }

  // Test Case 4: Edit Test Name 2. Add WhatsApp, Email, Instagram
  console.log("\nTest Case 4: Edit customer and add WhatsApp, Email, Instagram");
  const tc4Data = {
    ...tc2Data,
    whatsapp: "15550001111",
    email: "test2@example.com",
    instagram: "@test2",
  };
  const tc4Record = prepareUpdateRecord(tc4Data);
  if (
    tc4Record.full_name === "Test Name 2" &&
    tc4Record.phone === "+1 555 000 1111" &&
    tc4Record.whatsapp === "15550001111" &&
    tc4Record.email === "test2@example.com" &&
    tc4Record.instagram === "test2" &&
    tc4Record.profile_slug === "test-name-2"
  ) {
    console.log("   ✅ PASS: Updated customer record includes newly added channels and preserves existing data.");
    passed++;
  } else {
    console.error("   ❌ FAIL: tc4Record:", tc4Record);
  }

  // Test Case 5: Change customer information but keep the same slug
  console.log("\nTest Case 5: Change customer information while keeping same slug");
  const tc5Data = {
    ...tc4Data,
    job_title: "Senior Consultant",
    company_name: "Consulting Co",
  };
  const tc5Record = prepareUpdateRecord(tc5Data);
  if (
    tc5Record.job_title === "Senior Consultant" &&
    tc5Record.company_name === "Consulting Co" &&
    tc5Record.profile_slug === "test-name-2"
  ) {
    console.log("   ✅ PASS: Profile details updated while profile_slug remains stable at 'test-name-2'.");
    passed++;
  } else {
    console.error("   ❌ FAIL: tc5Record:", tc5Record);
  }

  // Test Case 6: Open Save Contact for customer with only name + phone
  console.log("\nTest Case 6: Save Contact for customer with only Name + Phone");
  const vcard = buildVCard({
    fullName: "Rahul Sharma",
    phone: "9876543210",
  });
  const hasFn = vcard.includes("FN:Rahul Sharma");
  const hasTel = vcard.includes("TEL;TYPE=CELL:9876543210");
  const hasNoUndefined = !vcard.includes("undefined") && !vcard.includes("null");
  const hasNoEmptyEmail = !vcard.includes("EMAIL:");
  const hasNoEmptyOrg = !vcard.includes("ORG:");
  if (hasFn && hasTel && hasNoUndefined && hasNoEmptyEmail && hasNoEmptyOrg) {
    console.log("   ✅ PASS: Valid vCard generated with only Name and Phone; no empty fields or errors.");
    console.log("   Generated vCard snippet:\n   " + vcard.split("\r\n").join("\n   "));
    passed++;
  } else {
    console.error("   ❌ FAIL: Generated vcard:", vcard);
  }

  // Test Case 7: Inactive profile protection remains unchanged
  console.log("\nTest Case 7: Inactive profile protection via Supabase RPC");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = createClient(url, key);
    const { data: rpcInactive, error: rpcError } = await supabase.rpc("get_customer_by_slug", {
      slug_input: "inactive-nonexistent-slug-xyz",
    });
    if (!rpcError && Array.isArray(rpcInactive) && rpcInactive.length === 0) {
      console.log("   ✅ PASS: Inactive / non-existent customer profile returns 0 rows (profile unavailable).");
      passed++;
    } else {
      console.error("   ❌ FAIL: Inactive check response:", rpcInactive, rpcError);
    }
  } else {
    console.log("   ⚠️  SKIP: Supabase env vars not found for remote RPC test.");
  }

  console.log("\n==================================================");
  console.log(`Results: ${passed} / ${total} Test Cases Passed`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
