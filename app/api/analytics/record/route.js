import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";
import { isValidReviewCardCode, normalizeCardCode } from "@/lib/reviewCards";
import { VALID_EVENT_TYPES } from "@/lib/analytics";

export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/record
 *
 * Secure, abuse-protected event ingestion for NFCISTA Review Assistant.
 *
 * Validates:
 * 1. Client IP rate limiting (60 events per minute per IP).
 * 2. Payload shape: { card_code, event_type }.
 * 3. Card code format: 3-32 alphanumeric characters.
 * 4. Event type: whitelist in VALID_EVENT_TYPES.
 * 5. Calls database RPC record_review_card_event which verifies:
 *    - Card exists
 *    - Card is_active = true
 *    - Card review_assistant_enabled = true
 *
 * Security & Privacy:
 * - NEVER records review draft text, customer notes, IP address, or user agents in analytics.
 * - Fails safely without leaking internal database errors to client.
 */
export async function POST(request) {
  try {
    const clientIp = getClientIp(request);

    // Rate limiting: 60 event recordings per minute per IP
    const rateCheck = await checkRateLimit(`analytics_record:${clientIp}`, {
      limit: 60,
      windowMs: 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many analytics requests." },
        { status: 429, headers: { "Retry-After": String(rateCheck.reset) } }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const { card_code, event_type } = body || {};

    if (!card_code || !isValidReviewCardCode(card_code)) {
      return NextResponse.json({ error: "Invalid card code." }, { status: 400 });
    }

    if (!event_type || !VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json({ error: "Invalid event type." }, { status: 400 });
    }

    const cleanCardCode = normalizeCardCode(card_code);

    if (!isSupabaseConfigured || !supabase) {
      // Graceful fallback for non-database preview environments
      return NextResponse.json({ success: true, recorded: false });
    }

    // Call abuse-protected PostgreSQL RPC
    const { data: recorded, error } = await supabase.rpc("record_review_card_event", {
      p_card_code: cleanCardCode,
      p_event_type: event_type,
    });

    if (error) {
      console.error("[analytics-record] RPC error:", error.message);
      // Return 200 with recorded: false so client analytics calls never throw user-facing errors
      return NextResponse.json({ success: true, recorded: false });
    }

    return NextResponse.json({ success: true, recorded: Boolean(recorded) });
  } catch (err) {
    console.error("[analytics-record] Unexpected error:", err);
    return NextResponse.json({ success: true, recorded: false });
  }
}
