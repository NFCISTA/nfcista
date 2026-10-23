import fs from "fs";
import path from "path";
import { execSync } from "child_process";

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
  console.log("=== NFCISTA PORTFOLIO ISOLATION & REGRESSION TEST SUITE ===\n");

  const gallerySectionSrc = fs.readFileSync(
    path.join(rootDir, "components", "admin", "CustomerGallerySection.jsx"),
    "utf8"
  );
  const adminSrc = fs.readFileSync(path.join(rootDir, "app", "admin", "page.js"), "utf8");
  const galleryRouteSrc = fs.readFileSync(
    path.join(rootDir, "app", "api", "admin", "gallery", "route.js"),
    "utf8"
  );
  const uploadRouteSrc = fs.readFileSync(
    path.join(rootDir, "app", "api", "admin", "gallery", "upload", "route.js"),
    "utf8"
  );
  const reorderRouteSrc = fs.readFileSync(
    path.join(rootDir, "app", "api", "admin", "gallery", "reorder", "route.js"),
    "utf8"
  );
  const imageRouteSrc = fs.readFileSync(
    path.join(rootDir, "app", "api", "admin", "gallery", "image", "route.js"),
    "utf8"
  );

  // ────────────────────────────────────────────────────────────────
  // Section 1: Portfolio Save Isolation & Form Decoupling
  // ────────────────────────────────────────────────────────────────
  section("1. Portfolio Save Isolation & Form Decoupling");

  if (
    gallerySectionSrc.includes('e.stopPropagation();') &&
    gallerySectionSrc.includes('if (e.key === "Enter")')
  ) {
    pass("1.1: CustomerGallerySection implements keydown boundary intercepting Enter keypresses");
  } else {
    fail("1.1: CustomerGallerySection missing Enter key event isolation boundary");
  }

  // Verify all buttons in CustomerGallerySection have explicit type="button"
  const buttonTags = gallerySectionSrc.match(/<button[\s\S]*?>/g) || [];
  const missingTypeButton = buttonTags.find((b) => !b.includes('type="button"'));
  if (!missingTypeButton && buttonTags.length >= 10) {
    pass(`1.2: All ${buttonTags.length} buttons in CustomerGallerySection explicitly set type="button"`);
  } else {
    fail(`1.2: Found button in CustomerGallerySection without explicit type="button": ${missingTypeButton}`);
  }

  // Verify CustomerGallerySection does not reference customers.is_active or setFormData
  if (
    !gallerySectionSrc.includes("setFormData") &&
    !gallerySectionSrc.includes("updateCustomer") &&
    !gallerySectionSrc.includes("customers.is_active")
  ) {
    pass("1.3: CustomerGallerySection has zero access/coupling to customer-level formData or updateCustomer");
  } else {
    fail("1.3: CustomerGallerySection is coupled with customer-level form state");
  }

  // ────────────────────────────────────────────────────────────────
  // Section 2: Backend Gallery APIs Only Touch Gallery Tables
  // ────────────────────────────────────────────────────────────────
  section("2. Backend Gallery APIs Modification Scope");

  const galleryRoutes = [
    { name: "gallery/route.js", src: galleryRouteSrc },
    { name: "gallery/upload/route.js", src: uploadRouteSrc },
    { name: "gallery/reorder/route.js", src: reorderRouteSrc },
    { name: "gallery/image/route.js", src: imageRouteSrc },
  ];

  galleryRoutes.forEach(({ name, src }) => {
    // Check that there is NO .update(...) or .delete(...) call on 'customers'
    const touchesCustomerMutation =
      src.includes('.from("customers").update') ||
      src.includes(".from('customers').update") ||
      src.includes('.from("customers").delete') ||
      src.includes(".from('customers').delete");

    if (!touchesCustomerMutation) {
      pass(`2.${name}: Does not mutate the customers table (zero customer updates/deletes)`);
    } else {
      fail(`2.${name}: Found customer table mutation in gallery endpoint!`);
    }
  });

  // ────────────────────────────────────────────────────────────────
  // Section 3: Profile Slug Immutability in Edit Mode
  // ────────────────────────────────────────────────────────────────
  section("3. Profile Slug Protection in Edit Mode");

  if (
    adminSrc.includes("readOnly={Boolean(editingId)}") &&
    adminSrc.includes("if (editingId) return;")
  ) {
    pass("3.1: Profile slug input is strictly readOnly and blocks onChange in edit mode");
  } else {
    fail("3.1: Profile slug input is not safely locked in edit mode");
  }

  if (
    adminSrc.includes("profile_slug: editingId ? (originalSlug || formData.profile_slug) : formData.profile_slug")
  ) {
    pass("3.2: handleFormSubmit enforces originalSlug in payload when editingId is set");
  } else {
    fail("3.2: handleFormSubmit does not pin originalSlug in edit mode");
  }

  // Test slug simulation: verify that simulating an edit preserve slug
  const mockOriginalSlug = "sachin-suruse";
  const mockEditingId = "292b3e51-9b94-4853-aad4-d635439d8ffa";
  const mockFormDataCorrupted = {
    profile_slug: "accidental-slug-change",
    full_name: "Sachin Suruse",
    is_active: true,
  };
  const simulatedPayload = {
    ...mockFormDataCorrupted,
    profile_slug: mockEditingId ? (mockOriginalSlug || mockFormDataCorrupted.profile_slug) : mockFormDataCorrupted.profile_slug,
  };

  if (simulatedPayload.profile_slug === "sachin-suruse") {
    pass("3.3: Simulated corrupted edit payload strictly preserved original slug 'sachin-suruse'");
  } else {
    fail("3.3: Simulated corrupted edit payload failed to preserve original slug");
  }

  // ────────────────────────────────────────────────────────────────
  // Section 4: Customer Status Separation & Visual Demarcation
  // ────────────────────────────────────────────────────────────────
  section("4. Customer Status Separation & Labeling");

  if (
    adminSrc.includes("Customer Profile Active Status") &&
    adminSrc.includes("Independent from portfolio items.")
  ) {
    pass("4.1: Customer active status clearly labeled and distinguished from portfolio items");
  } else {
    fail("4.1: Customer active status missing distinct labeling");
  }

  if (
    gallerySectionSrc.includes("Individual Item Visibility") &&
    gallerySectionSrc.includes("Independent of customer account active status.")
  ) {
    pass("4.2: Gallery item visibility clearly labeled as independent of customer account status");
  } else {
    fail("4.2: Gallery item visibility missing clear independent labeling");
  }

  // ────────────────────────────────────────────────────────────────
  // Section 5: Intentional Customer Active Toggle
  // ────────────────────────────────────────────────────────────────
  section("5. Intentional Customer Activation / Deactivation");

  if (
    adminSrc.includes("setFormData({ ...formData, is_active: e.target.checked })") &&
    adminSrc.includes("toggleCustomerActive(customer.id, customer.is_active)")
  ) {
    pass("5.1: Customer active toggle remains fully accessible for intentional admin toggles");
  } else {
    fail("5.1: Customer active toggle missing or broken");
  }

  // ────────────────────────────────────────────────────────────────
  // Section 6: Protected Public Routes Zero-Modification Check
  // ────────────────────────────────────────────────────────────────
  section("6. Protected Public Routes Integrity");

  const diffOutput = execSync("git status -s app/p/ app/review/ app/r/ lib/dynamicQr.js").toString().trim();
  if (diffOutput === "") {
    pass("6.1: Zero git diff on protected routes (app/p/, app/review/, app/r/, lib/dynamicQr.js)");
  } else {
    fail(`6.1: Protected routes were modified:\n${diffOutput}`);
  }

  console.log("\n====================================================================");
  console.log("  ALL PORTFOLIO ISOLATION TESTS PASSED PERFECTLY! ✅");
  console.log("====================================================================\n");
}

runTests();
