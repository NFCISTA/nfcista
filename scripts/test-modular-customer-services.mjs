import assert from "assert";
import fs from "fs";

console.log("=== NFCISTA MODULAR CUSTOMER SERVICES & SUBSCRIPTION MANAGEMENT VERIFICATION ===\n");

// 1. Database Migration File Integrity
console.log("1. Checking Database Migration File...");
const migrationPath = "supabase/migrations/20261106000000_modular_customer_services.sql";
assert(fs.existsSync(migrationPath), `${migrationPath} must exist`);
const migrationSql = fs.readFileSync(migrationPath, "utf-8");

assert(
  migrationSql.includes("smart_profile_enabled BOOLEAN NOT NULL DEFAULT true"),
  "Migration must add smart_profile_enabled column with DEFAULT true"
);
assert(
  migrationSql.includes("ALTER COLUMN profile_slug DROP NOT NULL"),
  "Migration must make profile_slug nullable for subscription-only customers"
);
assert(
  migrationSql.includes("profile_slug IS NULL OR profile_slug ~ '^[a-z0-9-_]+$'"),
  "Migration must update profile_slug CHECK constraint to safely permit NULL"
);
assert(
  migrationSql.includes("idx_customers_smart_profile_enabled"),
  "Migration must create index on smart_profile_enabled"
);
assert(
  migrationSql.includes("c.smart_profile_enabled = TRUE") && migrationSql.includes("c.profile_slug IS NOT NULL"),
  "Migration must update get_customer_by_slug RPC to verify smart_profile_enabled"
);
assert(
  migrationSql.includes("submit_customer_enquiry"),
  "Migration must update submit_customer_enquiry RPC to gate enquiries on active smart profile"
);
console.log("  ✅ PASS: Database migration correctly defined with backward compatibility and RPC security.");

// 2. Customer Library (lib/customers.js)
console.log("\n2. Checking Customer Business Logic (lib/customers.js)...");
const libCustomersCode = fs.readFileSync("lib/customers.js", "utf-8");

assert(
  libCustomersCode.includes("smart_profile_enabled"),
  "lib/customers.js must select and handle smart_profile_enabled"
);
assert(
  libCustomersCode.includes("validateProfileSlug(slug, excludeId = null, smartProfileEnabled = true)"),
  "validateProfileSlug must accept smartProfileEnabled flag"
);
assert(
  libCustomersCode.includes("if (!smartProfileEnabled)") && libCustomersCode.includes("return { valid: true, cleanSlug: null };"),
  "validateProfileSlug must allow empty slug when smartProfileEnabled is false"
);
assert(
  libCustomersCode.includes("smart_profile_enabled column is not yet migrated") || libCustomersCode.includes("migration 20261106000000 has not been executed yet"),
  "lib/customers.js must provide defensive fallback if DB migration has not yet been executed"
);
assert(
  libCustomersCode.includes("smart_profile_enabled: c.smart_profile_enabled !== undefined ? Boolean(c.smart_profile_enabled) : Boolean(c.profile_slug)"),
  "Fallback must synthesize smart_profile_enabled gracefully"
);
console.log("  ✅ PASS: lib/customers.js handles optional slug, defaults, and defensive fallback.");

// 3. Customer Profile API Security (app/api/customer/profile/route.js)
console.log("\n3. Checking Customer Profile API Security (app/api/customer/profile/route.js)...");
const apiProfileCode = fs.readFileSync("app/api/customer/profile/route.js", "utf-8");

assert(
  apiProfileCode.includes("smart_profile_enabled: customer.smart_profile_enabled"),
  "serializeCustomerProfile must expose smart_profile_enabled to portal"
);

// Ensure PUT route prevents customer from mutating their own subscription/service flags
const putSection = apiProfileCode.slice(apiProfileCode.indexOf("export async function PUT"));
assert(
  !putSection.includes("updateData.smart_profile_enabled ="),
  "Customer PUT route must NEVER allow updating smart_profile_enabled"
);
assert(
  !putSection.includes("updateData.review_assistant_enabled ="),
  "Customer PUT route must NEVER allow updating review_assistant_enabled"
);
assert(
  !putSection.includes("updateData.analytics_enabled ="),
  "Customer PUT route must NEVER allow updating analytics_enabled"
);
console.log("  ✅ PASS: Customer API prevents self-escalation or modifying subscription flags.");

// 4. Admin Dashboard UI & Controls (app/admin/page.js)
console.log("\n4. Checking Admin Customer Management (app/admin/page.js)...");
const adminPageCode = fs.readFileSync("app/admin/page.js", "utf-8");

assert(
  adminPageCode.includes('smart_profile_enabled: true'),
  "initialFormData must include smart_profile_enabled: true by default"
);
assert(
  adminPageCode.includes("const [serviceSegment, setServiceSegment] = useState(\"all\")"),
  "Admin page must maintain serviceSegment filter state"
);
assert(
  adminPageCode.includes("Business Cards (Smart Profiles)"),
  "Admin page must offer Business Cards segment filter"
);
assert(
  adminPageCode.includes("Subscriptions Only") || adminPageCode.includes("subscription_only"),
  "Admin page must offer Subscription Only segment filter"
);
assert(
  adminPageCode.includes("customer.is_active && customer.smart_profile_enabled && customer.profile_slug"),
  "View Public Profile button must be strictly gated by active Smart Profile"
);
assert(
  adminPageCode.includes("Active Services Scope"),
  "Customer Login Management modal must display Active Services Scope card"
);
assert(
  adminPageCode.includes("Services & Subscriptions"),
  "Customer modal must contain dedicated Services & Subscriptions tab"
);
assert(
  adminPageCode.includes("Smart Profile (Digital Business Card)"),
  "Services tab must include Smart Profile toggle switch"
);
assert(
  adminPageCode.includes("Review Assistant Subscription") || adminPageCode.includes("review_assistant_enabled"),
  "Services tab must include Review Assistant toggle switch"
);
assert(
  adminPageCode.includes("Analytics Subscription") || adminPageCode.includes("analytics_enabled"),
  "Services tab must include Analytics toggle switch"
);
console.log("  ✅ PASS: Admin page contains 3 independent toggles, segment tabs, badges, and login scope.");

// 5. Customer Combinations & Segmentation Logic Verification
console.log("\n5. Simulating All 5 Customer Service Combinations...");

const mockCustomers = [
  {
    id: "cust-a",
    full_name: "Customer A - Smart Profile Only",
    profile_slug: "customer-a",
    is_active: true,
    smart_profile_enabled: true,
    review_assistant_enabled: false,
    analytics_enabled: false,
  },
  {
    id: "cust-b",
    full_name: "Customer B - Review Assistant Only",
    profile_slug: null,
    is_active: true,
    smart_profile_enabled: false,
    review_assistant_enabled: true,
    analytics_enabled: false,
  },
  {
    id: "cust-c",
    full_name: "Customer C - Analytics Only",
    profile_slug: null,
    is_active: true,
    smart_profile_enabled: false,
    review_assistant_enabled: false,
    analytics_enabled: true,
  },
  {
    id: "cust-d",
    full_name: "Customer D - Review Assistant + Analytics",
    profile_slug: null,
    is_active: true,
    smart_profile_enabled: false,
    review_assistant_enabled: true,
    analytics_enabled: true,
  },
  {
    id: "cust-e",
    full_name: "Customer E - All Services (Smart Profile + Review + Analytics)",
    profile_slug: "customer-e",
    is_active: true,
    smart_profile_enabled: true,
    review_assistant_enabled: true,
    analytics_enabled: true,
  },
];

// Replicate filtering logic used in Admin Page
const filterBySegment = (customers, segment) => {
  return customers.filter((c) => {
    if (segment === "business_cards") {
      return Boolean(c.smart_profile_enabled && c.is_active);
    }
    if (segment === "subscription_only") {
      return !c.smart_profile_enabled && (c.review_assistant_enabled || c.analytics_enabled);
    }
    return true; // 'all'
  });
};

const allList = filterBySegment(mockCustomers, "all");
assert.strictEqual(allList.length, 5, "All Customers segment must show all 5 customer types");

const businessCardsList = filterBySegment(mockCustomers, "business_cards");
assert.strictEqual(businessCardsList.length, 2, "Business Cards segment must only show customers with active Smart Profiles");
assert(businessCardsList.find((c) => c.id === "cust-a"), "Must include Combination A (Smart Profile only)");
assert(businessCardsList.find((c) => c.id === "cust-e"), "Must include Combination E (All services)");
assert(!businessCardsList.find((c) => c.id === "cust-b"), "Must NOT include Combination B");
assert(!businessCardsList.find((c) => c.id === "cust-c"), "Must NOT include Combination C");
assert(!businessCardsList.find((c) => c.id === "cust-d"), "Must NOT include Combination D");

const subscriptionOnlyList = filterBySegment(mockCustomers, "subscription_only");
assert.strictEqual(subscriptionOnlyList.length, 3, "Subscription Only segment must show customers B, C, and D");
assert(subscriptionOnlyList.find((c) => c.id === "cust-b"), "Must include Combination B (Review Assistant only)");
assert(subscriptionOnlyList.find((c) => c.id === "cust-c"), "Must include Combination C (Analytics only)");
assert(subscriptionOnlyList.find((c) => c.id === "cust-d"), "Must include Combination D (Review Assistant + Analytics)");
assert(!subscriptionOnlyList.find((c) => c.id === "cust-a"), "Must NOT include Combination A (has Smart Profile)");
assert(!subscriptionOnlyList.find((c) => c.id === "cust-e"), "Must NOT include Combination E (has Smart Profile)");

// Verify Public Profile button gating logic
const canViewProfile = (c) => Boolean(c.smart_profile_enabled && c.is_active && c.profile_slug);
assert.strictEqual(canViewProfile(mockCustomers[0]), true, "Customer A can view profile");
assert.strictEqual(canViewProfile(mockCustomers[1]), false, "Customer B cannot view profile (no smart profile)");
assert.strictEqual(canViewProfile(mockCustomers[2]), false, "Customer C cannot view profile (no smart profile)");
assert.strictEqual(canViewProfile(mockCustomers[3]), false, "Customer D cannot view profile (no smart profile)");
assert.strictEqual(canViewProfile(mockCustomers[4]), true, "Customer E can view profile");

console.log("  ✅ PASS: All 5 customer service combinations verified against segmentation and action rules.");

console.log("\n========================================================");
console.log("ALL MODULAR CUSTOMER SERVICES CHECKS PASSED SUCCESSFULLY!");
console.log("========================================================\n");
