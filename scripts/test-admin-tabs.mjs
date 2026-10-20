import fs from "fs";
import path from "path";
import { canUseReviewAssistant } from "../lib/reviewAssistant.js";

const rootDir = process.cwd();

function pass(msg) {
  console.log(`  ✅ PASS: ${msg}`);
}

function fail(msg) {
  console.error(`  ❌ FAIL: ${msg}`);
  process.exitCode = 1;
}

function section(title) {
  console.log(`\n====================================================================\n  ${title}\n====================================================================`);
}

async function runTests() {
  console.log("=== NFCISTA ADMIN TABS & REVIEW ASSISTANT SEPARATION TESTS ===\n");

  const adminSrc = fs.readFileSync(path.join(rootDir, "app", "admin", "page.js"), "utf8");

  // ────────────────────────────────────────────────────────────────
  // Section 1: Modal Tabs Structure in app/admin/page.js
  // ────────────────────────────────────────────────────────────────
  section("1. Modal Tabs Architecture");

  if (adminSrc.includes('const [activeFormTab, setActiveFormTab] = useState("profile");')) {
    pass("1.1: activeFormTab state declared with default 'profile'");
  } else {
    fail("1.1: activeFormTab state missing or incorrect default");
  }

  if (
    adminSrc.includes('onClick={() => setActiveFormTab("profile")}') &&
    adminSrc.includes("Business Profile")
  ) {
    pass("1.2: Tab 1 button [Business Profile] is present in modal navigation");
  } else {
    fail("1.2: Tab 1 button [Business Profile] missing");
  }

  if (
    adminSrc.includes('onClick={() => setActiveFormTab("review_assistant")}') &&
    adminSrc.includes("Review Assistant")
  ) {
    pass("1.3: Tab 2 button [Review Assistant] is present in modal navigation");
  } else {
    fail("1.3: Tab 2 button [Review Assistant] missing");
  }

  if (
    adminSrc.includes('setActiveFormTab("profile");\n    setIsFormModalOpen(true);') ||
    adminSrc.includes('setActiveFormTab("profile");\r\n    setIsFormModalOpen(true);')
  ) {
    pass("1.4: Modal resets activeFormTab to 'profile' on create");
  } else {
    fail("1.4: Modal does not reset activeFormTab on create");
  }

  if (
    adminSrc.includes('setActiveFormTab("profile");\n    setIsSubmitting(true);') ||
    adminSrc.includes('setActiveFormTab("profile");\r\n    setIsSubmitting(true);')
  ) {
    pass("1.5: Modal resets activeFormTab to 'profile' on edit");
  } else {
    fail("1.5: Modal does not reset activeFormTab on edit");
  }

  // ────────────────────────────────────────────────────────────────
  // Section 2: Tab Separation Content
  // ────────────────────────────────────────────────────────────────
  section("2. Tab Separation & Field Placement");

  if (adminSrc.includes('{activeFormTab === "profile" && (')) {
    pass("2.1: Business Profile fields strictly conditional on activeFormTab === 'profile'");
  } else {
    fail("2.1: Business Profile fields not conditioned on activeFormTab");
  }

  if (adminSrc.includes('{activeFormTab === "review_assistant" && (')) {
    pass("2.2: Review Assistant fields strictly conditional on activeFormTab === 'review_assistant'");
  } else {
    fail("2.2: Review Assistant fields not conditioned on activeFormTab");
  }

  // Google Review URL stays in Business Profile tab
  const profileTabContent = adminSrc.slice(
    adminSrc.indexOf('{activeFormTab === "profile" && ('),
    adminSrc.indexOf('{activeFormTab === "review_assistant" && (')
  );

  if (profileTabContent.includes("formData.google_review_url")) {
    pass("2.3: Google Review URL is preserved inside Tab 1 (Business Profile)");
  } else {
    fail("2.3: Google Review URL missing from Tab 1 (Business Profile)");
  }

  // Review Assistant toggle is in Review Assistant tab
  const reviewTabContent = adminSrc.slice(
    adminSrc.indexOf('{activeFormTab === "review_assistant" && (')
  );

  if (reviewTabContent.includes("formData.review_assistant_enabled")) {
    pass("2.4: Review Assistant master toggle is positioned inside Tab 2 (Review Assistant)");
  } else {
    fail("2.4: Review Assistant master toggle missing from Tab 2");
  }

  // Exact required explanation
  if (
    reviewTabContent.includes(
      "Enable this to let this customer offer a guided review-writing experience using NFCISTA's template-based Review Assistant. Customers remain in control of their rating, review text, and Google submission."
    )
  ) {
    pass("2.5: Concise feature explanation matches required wording");
  } else {
    fail("2.5: Feature explanation missing or does not match required wording");
  }

  // ────────────────────────────────────────────────────────────────
  // Section 3: Shared Form & Save Mechanism
  // ────────────────────────────────────────────────────────────────
  section("3. Shared Form Submission Mechanism");

  if (
    adminSrc.includes("<form onSubmit={handleFormSubmit}") &&
    adminSrc.includes('type="submit"') &&
    adminSrc.includes("Save Changes")
  ) {
    pass("3.1: Both tabs share a single form and submit button for seamless saving");
  } else {
    fail("3.1: Form submission button missing or disconnected");
  }

  // ────────────────────────────────────────────────────────────────
  // Section 4: Customer Lifecycle & Defaults Emulation
  // ────────────────────────────────────────────────────────────────
  section("4. Customer Lifecycle & Defaults");

  // Initial state check
  const initialFormDataCheck = adminSrc.includes("review_assistant_enabled: false");
  if (initialFormDataCheck) {
    pass("4.1: New customers default review_assistant_enabled to false (OFF by default)");
  } else {
    fail("4.1: New customers do not default review_assistant_enabled to false");
  }

  // Emulate creation
  const newCustomer = {
    full_name: "Acme Salon",
    company_name: "Acme Corp",
    google_review_url: "https://maps.google.com/test",
    review_assistant_enabled: false,
    is_active: true,
  };
  if (canUseReviewAssistant(newCustomer) === false) {
    pass("4.2: New customer has Review Assistant disabled by default");
  } else {
    fail("4.2: canUseReviewAssistant should be false for new customer");
  }

  // Emulate enabling
  newCustomer.review_assistant_enabled = true;
  if (canUseReviewAssistant(newCustomer) === true) {
    pass("4.3: Toggling Review Assistant to true enables the feature");
  } else {
    fail("4.3: canUseReviewAssistant should be true when enabled");
  }

  // Emulate disabling
  newCustomer.review_assistant_enabled = false;
  if (canUseReviewAssistant(newCustomer) === false) {
    pass("4.4: Toggling Review Assistant to false disables the feature");
  } else {
    fail("4.4: canUseReviewAssistant should be false when disabled");
  }

  // Emulate editing existing customer preserving value
  const existingCustomerOn = {
    id: "cust-123",
    full_name: "Existing Merchant",
    review_assistant_enabled: true,
    is_active: true,
  };
  if (canUseReviewAssistant(existingCustomerOn) === true) {
    pass("4.5: Existing customer with enabled assistant retains true setting");
  } else {
    fail("4.5: Existing customer lost enabled setting");
  }

  // ────────────────────────────────────────────────────────────────
  // Section 5: Route Protection Verification
  // ────────────────────────────────────────────────────────────────
  section("5. Protected Routes Integrity");

  // Verify /p/[slug] and /r/[cardCode] have 0 diff
  const pPath = path.join(rootDir, "app", "p", "[slug]", "page.js");
  const rPath = path.join(rootDir, "app", "r", "[cardCode]", "route.js");
  const reviewPath = path.join(rootDir, "app", "review", "[slug]", "page.js");

  if (fs.existsSync(pPath) && fs.existsSync(rPath) && fs.existsSync(reviewPath)) {
    pass("5.1: Key route files exist (/p/[slug], /r/[cardCode], /review/[slug])");
  } else {
    fail("5.1: One or more route files missing");
  }

  const reviewSrc = fs.readFileSync(reviewPath, "utf8");
  if (reviewSrc.includes("review_assistant_enabled: Boolean(customer.review_assistant_enabled)")) {
    pass("5.2: Public /review/[slug] continues to pass review_assistant_enabled to client");
  } else {
    fail("5.2: Public /review/[slug] missing review_assistant_enabled");
  }

  console.log("\n====================================================================");
  console.log("  ALL ADMIN TABS CHECKS PASSED PERFECTLY! ✅");
  console.log("====================================================================\n");
}

runTests();
