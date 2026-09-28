import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";
import { generateCardCode, getQrUrl } from "@/lib/dynamicQr";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/dynamic-qr/generate
 *
 * Generates a batch of unique, unused Dynamic QR cards.
 *
 * Rules:
 * - Admin authorization required (HttpOnly cookie or Bearer token + public.is_admin()).
 * - Quantity: integer between 1 and 50.
 * - Format: NF[A-Z0-9]{4}.
 * - Guaranteed unique (verified against database before insert).
 * - Initial state:
 *     destination_url = 'https://nfcista.vercel.app/'
 *     is_active = false
 * - Output: Returns list of generated cards with stable physical QR URLs.
 */
export async function POST(request) {
  // 1. Authenticate and authorize admin
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  // 2. Parse and validate body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const { quantity } = body || {};

  // Reject non-numbers, non-integers, 0, negative numbers, and numbers > 50
  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 50
  ) {
    return NextResponse.json(
      { error: "Quantity must be an integer between 1 and 50." },
      { status: 400 }
    );
  }

  try {
    // 3. Generate candidate batch in memory
    const candidateSet = new Set();
    const maxAttempts = quantity * 20;
    let attempts = 0;

    while (candidateSet.size < quantity && attempts < maxAttempts) {
      candidateSet.add(generateCardCode());
      attempts++;
    }

    // 4. Verify candidate codes against database for uniqueness
    const candidateArray = Array.from(candidateSet);
    const { data: existingRows, error: checkError } = await authClient
      .from("dynamic_qr_cards")
      .select("card_code")
      .in("card_code", candidateArray);

    if (checkError) {
      console.error("Collision check error:", checkError.message);
      return NextResponse.json(
        { error: "Database query failed during uniqueness verification." },
        { status: 500 }
      );
    }

    // Handle any collision by removing collided codes and generating replacements
    if (existingRows && existingRows.length > 0) {
      for (const row of existingRows) {
        candidateSet.delete(row.card_code);
      }

      while (candidateSet.size < quantity) {
        const replacement = generateCardCode();
        const { data: singleCheck } = await authClient
          .from("dynamic_qr_cards")
          .select("card_code")
          .eq("card_code", replacement)
          .maybeSingle();

        if (!singleCheck) {
          candidateSet.add(replacement);
        }
      }
    }

    // 5. Insert rows into public.dynamic_qr_cards
    const rowsToInsert = Array.from(candidateSet).map((code) => ({
      card_code: code,
      destination_url: "https://nfcista.vercel.app/",
      is_active: false,
    }));

    const { data: inserted, error: insertError } = await authClient
      .from("dynamic_qr_cards")
      .insert(rowsToInsert)
      .select("card_code, destination_url, is_active, created_at");

    if (insertError) {
      console.error("Batch card insertion error:", insertError.message);
      return NextResponse.json(
        { error: "Failed to create card codes in database." },
        { status: 500 }
      );
    }

    // 6. Return response with stable QR URLs
    return NextResponse.json({
      success: true,
      message: `Successfully generated ${inserted.length} card code(s).`,
      cards: inserted.map((card) => ({
        card_code: card.card_code,
        destination_url: card.destination_url,
        is_active: card.is_active,
        qr_url: getQrUrl(card.card_code),
        created_at: card.created_at,
      })),
    });
  } catch (err) {
    console.error("Unexpected error in dynamic-qr/generate:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while generating card codes." },
      { status: 500 }
    );
  }
}
