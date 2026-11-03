import { NextResponse } from "next/server";
import { authenticateCustomer } from "@/lib/customerAuth";
import {
  getKolkataDateRange,
  aggregateAnalyticsEvents,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

/**
 * GET /api/customer/analytics
 *
 * Secure, tenant-isolated analytics endpoint for authenticated customers.
 *
 * Access Rules:
 * 1. Customer must have an active session (via authenticateCustomer).
 * 2. Customer must have analytics_enabled = true on public.customers.
 *    If analytics_enabled is false, returns 403 Forbidden.
 * 3. Customer can view ONLY review cards assigned to their customer record
 *    where review_cards.customer_id = customer.id.
 * 4. Events query is strictly constrained to the customer's assigned card_codes.
 *
 * Query Parameters:
 * - filter: "today" | "week" | "month" | "overall" (defaults to "today")
 */
export async function GET(request) {
  const { errorResponse, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    // 1. Strict Authorization Gate: Customer must have analytics enabled
    if (!customer.analytics_enabled) {
      return NextResponse.json(
        {
          error: "Analytics access is not enabled for your account. Please contact NFCISTA support.",
          analytics_enabled: false,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "today";
    const dateRange = getKolkataDateRange(filter);

    // 2. Fetch review cards assigned specifically to this customer
    const { data: assignedCards, error: cardsError } = await authClient
      .from("review_cards")
      .select("id, card_code, business_name, category, review_assistant_enabled, is_active")
      .eq("customer_id", customer.id)
      .eq("is_active", true);

    if (cardsError) {
      console.error("[customer-analytics] Cards fetch error:", cardsError.message);
      return NextResponse.json({ error: "Failed to load assigned review cards." }, { status: 500 });
    }

    const cards = assignedCards || [];
    const cardCodes = cards.map((c) => c.card_code);

    // If no review cards are assigned to this customer yet, return empty state cleanly
    if (cardCodes.length === 0) {
      return NextResponse.json({
        analytics_enabled: true,
        filter: dateRange.filter,
        date_range: {
          start: dateRange.startDate,
          end: dateRange.endDate,
          timezone: "Asia/Kolkata",
        },
        has_assigned_cards: false,
        cards: [],
        totals: {
          card_visits: 0,
          page_views: 0,
          drafts_generated: 0,
          drafts_copied: 0,
          google_clicks: 0,
        },
        rates: {
          review_intent_rate: 0,
          draft_copy_rate: 0,
        },
      });
    }

    // 3. Query events strictly matching assigned card codes (RLS also reinforces this)
    let eventsQuery = authClient
      .from("review_card_events")
      .select("card_code, event_type, created_at")
      .in("card_code", cardCodes);

    if (dateRange.startDate) {
      eventsQuery = eventsQuery.gte("created_at", dateRange.startDate);
    }
    if (dateRange.endDate) {
      eventsQuery = eventsQuery.lte("created_at", dateRange.endDate);
    }

    const { data: events, error: eventsError } = await eventsQuery;

    if (eventsError) {
      console.error("[customer-analytics] Events query error:", eventsError.message);
      return NextResponse.json({ error: "Failed to load analytics metrics." }, { status: 500 });
    }

    // 4. Aggregate metrics
    const aggregated = aggregateAnalyticsEvents(events || []);

    const enrichedCards = cards.map((c) => {
      const stats = aggregated.by_card[c.card_code] || {
        card_code: c.card_code,
        card_visits: 0,
        page_views: 0,
        drafts_generated: 0,
        drafts_copied: 0,
        google_clicks: 0,
      };

      const intentRate = stats.page_views > 0
        ? Number(((stats.google_clicks / stats.page_views) * 100).toFixed(1))
        : 0;

      return {
        ...c,
        metrics: {
          ...stats,
          review_intent_rate: intentRate,
        },
      };
    });

    return NextResponse.json({
      analytics_enabled: true,
      has_assigned_cards: true,
      filter: dateRange.filter,
      date_range: {
        start: dateRange.startDate,
        end: dateRange.endDate,
        timezone: "Asia/Kolkata",
      },
      totals: aggregated.totals,
      rates: aggregated.rates,
      cards: enrichedCards,
    });
  } catch (err) {
    console.error("[customer-analytics] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
