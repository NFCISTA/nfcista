import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getKolkataComponents,
  kolkataMidnightToUtc,
  getKolkataDateRange,
  aggregateAnalyticsEvents,
  VALID_EVENT_TYPES,
  VALID_DATE_FILTERS,
} from "../lib/analytics.js";

console.log("=== NFCISTA Review Assistant Analytics Test Suite ===\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    process.exitCode = 1;
  }
}

// ── 1. Event Types & Date Filter Whitelist ──────────────────────────────────
test("Event Types and Date Filters conform to strict whitelist", () => {
  assert.equal(VALID_EVENT_TYPES.length, 5);
  assert.ok(VALID_EVENT_TYPES.includes("card_visit"));
  assert.ok(VALID_EVENT_TYPES.includes("page_view"));
  assert.ok(VALID_EVENT_TYPES.includes("draft_generated"));
  assert.ok(VALID_EVENT_TYPES.includes("draft_copied"));
  assert.ok(VALID_EVENT_TYPES.includes("google_click"));

  assert.equal(VALID_DATE_FILTERS.length, 4);
  assert.ok(VALID_DATE_FILTERS.includes("today"));
  assert.ok(VALID_DATE_FILTERS.includes("week"));
  assert.ok(VALID_DATE_FILTERS.includes("month"));
  assert.ok(VALID_DATE_FILTERS.includes("overall"));
});

// ── 2. Timezone & Date Range Calculation (Asia/Kolkata UTC+05:30) ───────────
test("kolkataMidnightToUtc accurately calculates UTC offset for IST 00:00:00", () => {
  // Midnight 2026-11-04 in IST (UTC+05:30) is 2026-11-03 18:30:00 UTC
  const utcStr = kolkataMidnightToUtc(2026, 11, 4);
  assert.equal(utcStr, "2026-11-03T18:30:00.000Z");
});

test("getKolkataDateRange produces valid ISO boundaries for all filters", () => {
  // Reference date: Wednesday, Nov 4, 2026 at 10:00:00 IST
  const refDate = new Date("2026-11-04T04:30:00.000Z"); // 10:00:00 IST

  const todayRange = getKolkataDateRange("today", refDate);
  assert.equal(todayRange.filter, "today");
  assert.equal(todayRange.startDate, "2026-11-03T18:30:00.000Z"); // IST Midnight today
  assert.equal(todayRange.endDate, refDate.toISOString());

  const monthRange = getKolkataDateRange("month", refDate);
  assert.equal(monthRange.filter, "month");
  assert.equal(monthRange.startDate, "2026-10-31T18:30:00.000Z"); // 2026-11-01 00:00:00 IST

  // Week starting Monday: Nov 4, 2026 is Wed. Monday was Nov 2, 2026.
  // Midnight Nov 2 IST is Nov 1 18:30:00 UTC
  const weekRange = getKolkataDateRange("week", refDate);
  assert.equal(weekRange.filter, "week");
  assert.equal(weekRange.startDate, "2026-11-01T18:30:00.000Z");

  const overallRange = getKolkataDateRange("overall", refDate);
  assert.equal(overallRange.filter, "overall");
  assert.equal(overallRange.startDate, null);
  assert.equal(overallRange.endDate, refDate.toISOString());
});

// ── 3. Distinct Metrics & Conversion Rates ──────────────────────────────────
test("aggregateAnalyticsEvents maintains distinct metrics without combining card visits and pageviews", () => {
  const mockEvents = [
    { card_code: "NF8K29", event_type: "card_visit" },
    { card_code: "NF8K29", event_type: "card_visit" },
    { card_code: "NF8K29", event_type: "page_view" },
    { card_code: "NF8K29", event_type: "page_view" },
    { card_code: "NF8K29", event_type: "page_view" },
    { card_code: "NF8K29", event_type: "draft_generated" },
    { card_code: "NF8K29", event_type: "draft_generated" },
    { card_code: "NF8K29", event_type: "draft_copied" },
    { card_code: "NF8K29", event_type: "google_click" },
  ];

  const aggregated = aggregateAnalyticsEvents(mockEvents);

  assert.equal(aggregated.totals.card_visits, 2, "card_visits is exactly 2");
  assert.equal(aggregated.totals.page_views, 3, "page_views is exactly 3");
  assert.equal(aggregated.totals.drafts_generated, 2, "drafts_generated is exactly 2");
  assert.equal(aggregated.totals.drafts_copied, 1, "drafts_copied is exactly 1");
  assert.equal(aggregated.totals.google_clicks, 1, "google_clicks is exactly 1");

  // Rate assertions:
  // review_intent_rate: 1 click / 3 pageviews = 33.3%
  assert.equal(aggregated.rates.review_intent_rate, 33.3);
  // draft_copy_rate: 1 copy / 2 generated = 50.0%
  assert.equal(aggregated.rates.draft_copy_rate, 50.0);

  // By card breakdown
  assert.ok(aggregated.by_card["NF8K29"]);
  assert.equal(aggregated.by_card["NF8K29"].card_visits, 2);
  assert.equal(aggregated.by_card["NF8K29"].page_views, 3);
});

// ── 4. Database Migration & RLS Security ────────────────────────────────────
test("Migration file 20261105000000_create_review_card_analytics.sql enforces strict schema and RLS", () => {
  const migPath = path.resolve("supabase/migrations/20261105000000_create_review_card_analytics.sql");
  assert.ok(fs.existsSync(migPath), "migration file exists");
  const content = fs.readFileSync(migPath, "utf-8");

  assert.ok(content.includes("analytics_enabled BOOLEAN NOT NULL DEFAULT false"), "analytics_enabled column present");
  assert.ok(content.includes("customer_id UUID REFERENCES public.customers(id)"), "customer_id foreign key present");
  assert.ok(content.includes("CREATE TABLE IF NOT EXISTS public.review_card_events"), "review_card_events table present");
  assert.ok(content.includes("ALTER TABLE public.review_card_events ENABLE ROW LEVEL SECURITY"), "RLS enabled on events");
  assert.ok(content.includes("GRANT SELECT ON TABLE public.review_card_events TO authenticated"), "SELECT granted to authenticated for RLS");
  assert.ok(content.includes("REVOKE ALL ON TABLE public.review_card_events FROM anon"), "Direct anon access revoked");
  assert.ok(content.includes("c.analytics_enabled = true"), "Customer RLS policy checks analytics_enabled = true");
  assert.ok(content.includes("c.auth_user_id = auth.uid()"), "Customer RLS policy enforces tenant isolation via auth.uid()");
  assert.ok(content.includes("public.is_admin()"), "Admin RLS policy restricts to admin");
  assert.ok(content.includes("record_review_card_event"), "Abuse-protected ingestion RPC defined");
  assert.ok(content.includes("review_assistant_enabled = true"), "RPC verifies review_assistant_enabled is active");
});

// ── 5. Ingestion API Endpoint Verification ──────────────────────────────────
test("app/api/analytics/record/route.js enforces rate limiting, format validation, and RPC ingestion", () => {
  const routePath = path.resolve("app/api/analytics/record/route.js");
  assert.ok(fs.existsSync(routePath), "record API route exists");
  const code = fs.readFileSync(routePath, "utf-8");

  assert.ok(code.includes("checkRateLimit"), "Rate limit checked");
  assert.ok(code.includes("isValidReviewCardCode"), "Card code format validated");
  assert.ok(code.includes("VALID_EVENT_TYPES.includes"), "Event type whitelist validated");
  assert.ok(code.includes("record_review_card_event"), "PostgreSQL RPC invoked");
});

// ── 6. Tenant-Isolated Customer API Verification ────────────────────────────
test("app/api/customer/analytics/route.js enforces 403 when disabled and tenant isolation", () => {
  const routePath = path.resolve("app/api/customer/analytics/route.js");
  assert.ok(fs.existsSync(routePath), "customer analytics API route exists");
  const code = fs.readFileSync(routePath, "utf-8");

  assert.ok(code.includes("authenticateCustomer"), "Customer session authenticated");
  assert.ok(code.includes("!customer.analytics_enabled"), "403 check on analytics_enabled");
  assert.ok(code.includes(".eq(\"customer_id\", customer.id)"), "Card query strictly scoped to customer.id");
  assert.ok(code.includes("Asia/Kolkata"), "Asia/Kolkata timezone indicated");
});

// ── 7. Admin Analytics API Verification ─────────────────────────────────────
test("app/api/admin/analytics/route.js enforces admin authorization and comprehensive aggregation", () => {
  const routePath = path.resolve("app/api/admin/analytics/route.js");
  assert.ok(fs.existsSync(routePath), "admin analytics API route exists");
  const code = fs.readFileSync(routePath, "utf-8");

  assert.ok(code.includes("authenticateAdmin"), "Admin authenticated");
  assert.ok(code.includes("getKolkataDateRange"), "Kolkata date range applied");
  assert.ok(code.includes("aggregateAnalyticsEvents"), "Aggregates events");
});

// ── 8. Frontend UI Integration Verification ─────────────────────────────────
test("Frontend dashboards and navigation items are properly hooked", () => {
  const clientCode = fs.readFileSync(path.resolve("components/review/StandaloneReviewClient.jsx"), "utf-8");
  assert.ok(clientCode.includes("recordedPageViewRef"), "Pageview deduplication ref present");
  assert.ok(clientCode.includes("trackAnalyticsEvent(\"page_view\")"), "Pageview tracked");
  assert.ok(clientCode.includes("trackAnalyticsEvent(\"draft_generated\")"), "Draft generation tracked");
  assert.ok(clientCode.includes("trackAnalyticsEvent(\"draft_copied\")"), "Draft copy tracked");
  assert.ok(clientCode.includes("trackAnalyticsEvent(\"google_click\")"), "Google click tracked");

  const layoutCode = fs.readFileSync(path.resolve("app/dashboard/layout.js"), "utf-8");
  assert.ok(layoutCode.includes("customer?.analytics_enabled"), "Customer dashboard conditionally adds Analytics tab");

  const customerPage = fs.readFileSync(path.resolve("app/dashboard/analytics/page.js"), "utf-8");
  assert.ok(customerPage.includes("No Review Cards Connected Yet"), "Customer empty state for no cards present");
  assert.ok(customerPage.includes("Analytics Not Enabled"), "Customer disabled state present");
  assert.ok(customerPage.includes("Google Review clicks measure customers who tapped through"), "Google click disclosure notice present");

  const adminPage = fs.readFileSync(path.resolve("app/admin/analytics/page.js"), "utf-8");
  assert.ok(adminPage.includes("Review Assistant Analytics"), "Admin analytics page present");
  assert.ok(adminPage.includes("Performance by Review Card"), "Admin card breakdown table present");
});

console.log(`\nAnalytics Test Results: ${passed} / ${total} passed.\n`);
if (passed !== total) {
  process.exit(1);
}
