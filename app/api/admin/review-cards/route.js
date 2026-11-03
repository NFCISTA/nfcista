import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { authenticateAdmin } from "@/lib/adminAuth";
import {
  isValidReviewCardCode,
  normalizeCardCode,
  validateGoogleReviewUrl,
} from "@/lib/reviewCards";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/**
 * GET /api/admin/review-cards
 * Lists all standalone review cards (ordered newest-first).
 * Verified admin only.
 */
export async function GET(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { data: cards, error } = await authClient
      .from("review_cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // Graceful handling if migration hasn't been executed yet
      if (error.code === "PGRST205" || error.code === "42P01") {
        return NextResponse.json({
          cards: [],
          migration_pending: true,
          message: "The review_cards table is not yet created in Supabase.",
        });
      }

      console.error("[admin-review-cards] Error fetching cards:", error.message);
      return NextResponse.json(
        { error: "Failed to load review cards." },
        { status: 500 }
      );
    }

    return NextResponse.json({ cards: cards || [] });
  } catch (err) {
    console.error("[admin-review-cards] Unexpected error in GET:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/review-cards
 * Creates a standalone review card record.
 * Verified admin only.
 */
export async function POST(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const {
      card_code,
      business_name,
      category = "retail",
      google_review_url,
      review_assistant_enabled = false, // Safeguard: Defaults to FALSE
      is_active = true,
      notes = null,
      customer_id = null,
    } = body || {};

    // 1. Validate Card Code
    if (!isValidReviewCardCode(card_code)) {
      return NextResponse.json(
        { error: "Invalid card code format. Must be 3 to 32 uppercase alphanumeric characters (e.g. NF8K29)." },
        { status: 400 }
      );
    }
    const cleanCardCode = normalizeCardCode(card_code);

    // 2. Validate Business Name
    const cleanBusinessName = String(business_name || "").trim();
    if (!cleanBusinessName || cleanBusinessName.length > 150) {
      return NextResponse.json(
        { error: "Business name is required (up to 150 characters)." },
        { status: 400 }
      );
    }

    // 3. Safeguard 1: Strict Google Review URL Validation
    const urlValidation = validateGoogleReviewUrl(google_review_url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { error: urlValidation.error },
        { status: 400 }
      );
    }

    // 4. Validate Category
    const cleanCategory = String(category || "retail").trim().toLowerCase().slice(0, 50);

    // 5. Insert Record
    const insertPayload = {
      card_code: cleanCardCode,
      business_name: cleanBusinessName,
      category: cleanCategory,
      google_review_url: urlValidation.normalizedUrl,
      review_assistant_enabled: Boolean(review_assistant_enabled), // Explicit boolean
      is_active: Boolean(is_active),
      notes: notes ? String(notes).trim().slice(0, 500) : null,
      customer_id: isValidUuid(customer_id) ? customer_id : null,
    };

    const { data: created, error } = await authClient
      .from("review_cards")
      .insert([insertPayload])
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `Card code "${cleanCardCode}" is already in use by another review card.` },
          { status: 409 }
        );
      }
      console.error("[admin-review-cards] Insert error:", error.message);
      return NextResponse.json(
        { error: "Failed to create review card. Please check database permissions." },
        { status: 500 }
      );
    }

    // Safeguard 3: Cache Invalidation
    try {
      revalidateTag(`review-card:${cleanCardCode.toLowerCase()}`);
    } catch {
      // Non-blocking in non-Next environment
    }

    return NextResponse.json({ success: true, card: created }, { status: 201 });
  } catch (err) {
    console.error("[admin-review-cards] Unexpected error in POST:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/review-cards
 * Updates an existing review card configuration.
 * Verified admin only.
 */
export async function PATCH(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const { id, card_code, business_name, category, google_review_url, review_assistant_enabled, is_active, notes, customer_id } =
      body || {};

    if (!isValidUuid(id)) {
      return NextResponse.json({ error: "Valid Review Card ID is required." }, { status: 400 });
    }

    const updatePayload = {};

    if (business_name !== undefined) {
      const cleanName = String(business_name).trim();
      if (!cleanName || cleanName.length > 150) {
        return NextResponse.json(
          { error: "Business name must be between 1 and 150 characters." },
          { status: 400 }
        );
      }
      updatePayload.business_name = cleanName;
    }

    if (category !== undefined) {
      updatePayload.category = String(category).trim().toLowerCase().slice(0, 50);
    }

    if (google_review_url !== undefined) {
      const urlValidation = validateGoogleReviewUrl(google_review_url);
      if (!urlValidation.valid) {
        return NextResponse.json({ error: urlValidation.error }, { status: 400 });
      }
      updatePayload.google_review_url = urlValidation.normalizedUrl;
    }

    if (review_assistant_enabled !== undefined) {
      updatePayload.review_assistant_enabled = Boolean(review_assistant_enabled);
    }

    if (is_active !== undefined) {
      updatePayload.is_active = Boolean(is_active);
    }

    if (notes !== undefined) {
      updatePayload.notes = notes ? String(notes).trim().slice(0, 500) : null;
    }

    if (customer_id !== undefined) {
      updatePayload.customer_id = isValidUuid(customer_id) ? customer_id : null;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields provided to update." }, { status: 400 });
    }

    const { data: updated, error } = await authClient
      .from("review_cards")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[admin-review-cards] Update error:", error.message);
      return NextResponse.json({ error: "Failed to update review card." }, { status: 500 });
    }

    // Safeguard 3: Cache Invalidation for the updated card
    const targetCode = updated?.card_code || card_code;
    if (targetCode) {
      try {
        revalidateTag(`review-card:${String(targetCode).toLowerCase()}`);
      } catch {}
    }

    return NextResponse.json({ success: true, card: updated });
  } catch (err) {
    console.error("[admin-review-cards] Unexpected error in PATCH:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/review-cards
 * Safeguard 4: Safe deletion with protection against accidental removal of active cards.
 * Verified admin only.
 */
export async function DELETE(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    if (!isValidUuid(id)) {
      return NextResponse.json({ error: "Valid Review Card ID is required." }, { status: 400 });
    }

    // First check existing card status
    const { data: existing, error: fetchErr } = await authClient
      .from("review_cards")
      .select("id, card_code, is_active, business_name")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Review card not found." }, { status: 404 });
    }

    // Safeguard 4: Protection against accidental removal of active cards
    if (existing.is_active && !force) {
      return NextResponse.json(
        {
          error: `Cannot delete an active Review Card. Card "${existing.card_code}" (${existing.business_name}) is currently ACTIVE. Please deactivate the card first before deleting, or confirm force deletion.`,
          requires_confirmation: true,
          card_code: existing.card_code,
          is_active: true,
        },
        { status: 400 }
      );
    }

    const { error: delError } = await authClient
      .from("review_cards")
      .delete()
      .eq("id", id);

    if (delError) {
      console.error("[admin-review-cards] Delete error:", delError.message);
      return NextResponse.json({ error: "Failed to delete review card." }, { status: 500 });
    }

    // Invalidate cache
    try {
      revalidateTag(`review-card:${existing.card_code.toLowerCase()}`);
    } catch {}

    return NextResponse.json({
      success: true,
      deleted_code: existing.card_code,
      message: `Review card ${existing.card_code} deleted successfully.`,
    });
  } catch (err) {
    console.error("[admin-review-cards] Unexpected error in DELETE:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
