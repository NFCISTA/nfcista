import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";
import { isValidCardCode } from "@/lib/dynamicQr";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/dynamic-qr/printable
 *
 * Returns existing inactive Dynamic QR cards eligible for printing.
 *
 * Rules:
 * - Admin authorization required (HttpOnly cookie or Bearer token + is_admin() RPC).
 * - Returns only cards where is_active = false.
 * - Returns only id and card_code — no destination URLs, no customer data.
 * - Ordered by created_at descending (newest first).
 * - Does NOT create, modify, or delete any rows.
 */
export async function GET(request) {
  // 1. Authenticate and authorize admin
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { data: rows, error } = await authClient
      .from("dynamic_qr_cards")
      .select("id, card_code")
      .eq("is_active", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("printable cards query error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch printable cards." },
        { status: 500 }
      );
    }

    // Filter to only valid card codes (defensive — DB should always have valid codes)
    const cards = (rows || []).filter((r) => isValidCardCode(r.card_code));

    return NextResponse.json({ cards });
  } catch (err) {
    console.error("Unexpected error in GET /printable:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
