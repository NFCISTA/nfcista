import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/dynamic-qr/inventory
 *
 * Returns inventory counters and a full card list for the admin QR Codes page.
 *
 * Rules:
 * - Admin authorization required (HttpOnly cookie or Bearer token + is_admin() RPC).
 * - Returns total count, available count (is_active=false), active count (is_active=true).
 * - Returns card list with card_code, is_active, created_at only — no destination URLs,
 *   no customer data.
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
      .select("card_code, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("inventory query error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch inventory." },
        { status: 500 }
      );
    }

    const cards = rows || [];
    const total = cards.length;
    const available = cards.filter((c) => !c.is_active).length;
    const active = cards.filter((c) => c.is_active).length;

    return NextResponse.json({ total, available, active, cards });
  } catch (err) {
    console.error("Unexpected error in GET /inventory:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
