import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";
import { isValidCardCode, getQrUrl } from "@/lib/dynamicQr";
import { isValidHttpUrl } from "@/lib/customers";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/dynamic-qr/activate?cardCode=...
 *
 * Looks up current destination and status for a specific card code.
 * Requires admin authorization.
 */
export async function GET(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const cardCode = searchParams.get("cardCode");

  if (!cardCode || typeof cardCode !== "string") {
    return NextResponse.json(
      { error: "Missing required cardCode parameter." },
      { status: 400 }
    );
  }

  const normalizedCode = cardCode.trim().toUpperCase();
  if (!isValidCardCode(normalizedCode)) {
    return NextResponse.json(
      { error: "Invalid card code format." },
      { status: 400 }
    );
  }

  try {
    const { data: card, error } = await authClient
      .from("dynamic_qr_cards")
      .select("card_code, destination_url, is_active, updated_at")
      .eq("card_code", normalizedCode)
      .maybeSingle();

    if (error) {
      console.error("Card lookup error:", error.message);
      return NextResponse.json(
        { error: "Failed to look up card." },
        { status: 500 }
      );
    }

    if (!card) {
      return NextResponse.json(
        { error: "Card code not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      card_code: card.card_code,
      destination_url: card.destination_url,
      is_active: card.is_active,
      qr_url: getQrUrl(card.card_code),
      updated_at: card.updated_at,
    });
  } catch (err) {
    console.error("Unexpected error in GET dynamic-qr:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/dynamic-qr/activate
 *
 * Updates destination_url and activates a Dynamic QR card.
 * Body: { cardCode: string, destinationUrl: string }
 * Requires admin authorization.
 */
export async function POST(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const { cardCode, destinationUrl } = body || {};

  // 1. Server-side validation: Card Code
  if (!cardCode || typeof cardCode !== "string") {
    return NextResponse.json(
      { error: "Card code is required." },
      { status: 400 }
    );
  }

  const normalizedCode = cardCode.trim().toUpperCase();
  if (!isValidCardCode(normalizedCode)) {
    return NextResponse.json(
      { error: "Invalid card code format. Expected alphanumeric code (e.g. NF8K29)." },
      { status: 400 }
    );
  }

  // 2. Server-side validation: Destination URL
  if (!destinationUrl || typeof destinationUrl !== "string") {
    return NextResponse.json(
      { error: "Destination URL is required." },
      { status: 400 }
    );
  }

  const cleanDestination = destinationUrl.trim();
  if (!isValidHttpUrl(cleanDestination)) {
    return NextResponse.json(
      { error: "Invalid destination URL. Must be a valid web address starting with http:// or https://." },
      { status: 400 }
    );
  }

  try {
    // 3. Verify card exists before updating
    const { data: existing, error: findError } = await authClient
      .from("dynamic_qr_cards")
      .select("id, card_code, destination_url, is_active")
      .eq("card_code", normalizedCode)
      .maybeSingle();

    if (findError) {
      console.error("Card existence check error:", findError.message);
      return NextResponse.json(
        { error: "Database query failed." },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: "Card code not found." },
        { status: 404 }
      );
    }

    // 4. Update the destination and ensure card is active
    const { data: updated, error: updateError } = await authClient
      .from("dynamic_qr_cards")
      .update({
        destination_url: cleanDestination,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("card_code", normalizedCode)
      .select("card_code, destination_url, is_active, updated_at")
      .single();

    if (updateError) {
      console.error("Card update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to update card destination." },
        { status: 500 }
      );
    }

    const qrUrl = getQrUrl(updated.card_code);

    return NextResponse.json({
      success: true,
      message: "Card activated successfully",
      card: {
        card_code: updated.card_code,
        destination_url: updated.destination_url,
        is_active: updated.is_active,
        qr_url: qrUrl,
        updated_at: updated.updated_at,
      },
    });
  } catch (err) {
    console.error("Unexpected error in POST dynamic-qr/activate:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while activating the card." },
      { status: 500 }
    );
  }
}
