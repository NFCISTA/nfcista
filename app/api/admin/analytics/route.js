import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";
import {
  getKolkataDateRange,
  aggregateAnalyticsEvents,
  VALID_DATE_FILTERS,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics
 *
 * Secure analytics API for NFCISTA Administrators.
 * Access restricted to authenticated administrators (hellonfcista@gmail.com).
 *
 * Query Parameters:
 * - filter: "today" | "week" | "month" | "overall" (defaults to "today")
 * - card_code: (optional) Filter metrics for a single review card
 */
export async function GET(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "today";
    const cardCodeFilter = searchParams.get("card_code")?.trim().toUpperCase();

    const dateRange = getKolkataDateRange(filter);

    // 1. Fetch all active review cards with business details
    const { data: cards, error: cardsError } = await authClient
      .from("review_cards")
      .select("id, card_code, business_name, category, review_assistant_enabled, is_active, customer_id")
      .order("created_at", { ascending: false });

    if (cardsError) {
      if (cardsError.code === "PGRST205" || cardsError.code === "42P01") {
        return NextResponse.json({
          migration_pending: true,
          totals: { card_visits: 0, page_views: 0, drafts_generated: 0, drafts_copied: 0, google_clicks: 0 },
          rates: { review_intent_rate: 0, draft_copy_rate: 0 },
          by_card: {},
          cards: [],
          filter: dateRange.filter,
        });
      }
      console.error("[admin-analytics] Cards fetch error:", cardsError.message);
      return NextResponse.json({ error: "Failed to load review cards." }, { status: 500 });
    }

    // 2. Build query for review_card_events
    let eventsQuery = authClient
      .from("review_card_events")
      .select("card_code, event_type, created_at");

    if (dateRange.startDate) {
      eventsQuery = eventsQuery.gte("created_at", dateRange.startDate);
    }
    if (dateRange.endDate) {
      eventsQuery = eventsQuery.lte("created_at", dateRange.endDate);
    }
    if (cardCodeFilter) {
      eventsQuery = eventsQuery.eq("card_code", cardCodeFilter);
    }

    const { data: events, error: eventsError } = await eventsQuery;

    if (eventsError) {
      if (eventsError.code === "PGRST205" || eventsError.code === "42P01") {
        return NextResponse.json({
          migration_pending: true,
          totals: { card_visits: 0, page_views: 0, drafts_generated: 0, drafts_copied: 0, google_clicks: 0 },
          rates: { review_intent_rate: 0, draft_copy_rate: 0 },
          by_card: {},
          cards: cards || [],
          filter: dateRange.filter,
        });
      }
      console.error("[admin-analytics] Events fetch error:", eventsError.message);
      return NextResponse.json({ error: "Failed to load analytics events." }, { status: 500 });
    }

    // 3. Aggregate metrics
    const aggregated = aggregateAnalyticsEvents(events || []);

    // Enrich by_card with business names and metadata
    const enrichedCards = (cards || []).map((c) => {
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
      filter: dateRange.filter,
      date_range: {
        start: dateRange.startDate,
        end: dateRange.endDate,
        timezone: "Asia/Kolkata",
      },
      totals: aggregated.totals,
      rates: aggregated.rates,
      cards: enrichedCards,
      selected_card: cardCodeFilter || null,
    });
  } catch (err) {
    console.error("[admin-analytics] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
