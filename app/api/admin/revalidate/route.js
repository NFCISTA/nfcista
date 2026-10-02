import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";
import { revalidateCustomerProfile } from "@/lib/revalidateProfile";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/revalidate
 *
 * Authenticated endpoint for on-demand customer profile cache invalidation.
 * Accepts:
 * {
 *   slugs?: string[],
 *   slug?: string,
 *   oldSlug?: string
 * }
 */
export async function POST(request) {
  const { errorResponse } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json().catch(() => ({}));
    const rawSlugs = Array.isArray(body.slugs)
      ? body.slugs
      : [body.slug, body.oldSlug].filter(Boolean);

    const uniqueSlugs = [
      ...new Set(
        rawSlugs
          .filter((s) => typeof s === "string" && s.trim().length > 0)
          .map((s) => s.trim().toLowerCase())
      ),
    ];

    if (uniqueSlugs.length === 0) {
      return NextResponse.json(
        { error: "No valid profile slugs provided for revalidation." },
        { status: 400 }
      );
    }

    for (const slug of uniqueSlugs) {
      revalidateCustomerProfile(slug);
    }

    return NextResponse.json({
      success: true,
      revalidated: uniqueSlugs,
    });
  } catch (err) {
    console.error("Error in POST /api/admin/revalidate:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during revalidation." },
      { status: 500 }
    );
  }
}
