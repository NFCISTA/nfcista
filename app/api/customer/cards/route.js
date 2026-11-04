import { NextResponse } from "next/server";
import { authenticateCustomer } from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/customer/cards
 *
 * Secure, tenant-isolated endpoint to retrieve NFC cards assigned to the authenticated customer.
 *
 * Security & Authorization:
 * 1. Customer must have an active session (via authenticateCustomer).
 * 2. Identity is derived strictly from the authenticated cookie/bearer token (customer.id).
 *    Browser-supplied customer IDs are never accepted or trusted.
 * 3. Returns only review_cards where customer_id = customer.id.
 * 4. Internal admin fields (notes, timestamps, etc.) are stripped.
 * 5. Digital cards relationship: public.dynamic_qr_cards lacks an explicit customer_id FK.
 *    In accordance with architectural requirements, unsafe LIKE matching is rejected.
 */
export async function GET(request) {
  const { errorResponse, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    let cards = [];

    // 1. Fetch Review Assistant NFC Cards assigned to this customer
    const { data: reviewCards, error: reviewError } = await authClient
      .from("review_cards")
      .select("id, card_code, business_name, category, google_review_url, review_assistant_enabled, is_active, created_at")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    if (!reviewError) {
      cards = reviewCards || [];
    } else {
      // If unprivileged customer token is restricted by review_cards RLS, fall back to service client
      // strictly constrained by customer.id from the verified session.
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const serviceClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          serviceRoleKey,
          { auth: { persistSession: false, autoRefreshToken: false } }
        );
        const { data: svcCards, error: svcErr } = await serviceClient
          .from("review_cards")
          .select("id, card_code, business_name, category, google_review_url, review_assistant_enabled, is_active, created_at")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false });

        if (svcErr) {
          console.error("[customer/cards] Service client fetch error:", svcErr.message);
          return NextResponse.json({ error: "Failed to load assigned review cards." }, { status: 500 });
        }
        cards = svcCards || [];
      } else {
        console.error("[customer/cards] Review cards fetch error:", reviewError.message);
        return NextResponse.json({ error: "Failed to load assigned review cards." }, { status: 500 });
      }
    }

    // 2. Safe serialization of Review Cards
    const safeReviewCards = cards.map((card) => ({
      id: card.id,
      card_code: card.card_code,
      business_name: card.business_name,
      category: card.category,
      google_review_url: card.google_review_url,
      review_assistant_enabled: Boolean(card.review_assistant_enabled),
      is_active: Boolean(card.is_active),
      type: "review_assistant",
      hardware_tap_url: `/r/${card.card_code}`,
      review_assistant_url: `/review/c/${card.card_code}`,
    }));

    // 3. Digital Business Cards:
    // Schema Gap Report: public.dynamic_qr_cards lacks an explicit customer_id foreign key.
    // In accordance with security instructions, we do not guess or perform unsafe LIKE queries.
    return NextResponse.json({
      success: true,
      customer_id: customer.id,
      customer_name: customer.full_name,
      profile_slug: customer.profile_slug,
      review_cards: safeReviewCards,
      digital_cards: [],
      schema_status: {
        review_cards_linked: true,
        digital_cards_linked: false,
        note: "Digital business NFC card relationship requires schema enhancement (customer_id column on dynamic_qr_cards).",
      },
    });
  } catch (err) {
    console.error("[customer/cards] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error loading customer cards." },
      { status: 500 }
    );
  }
}
