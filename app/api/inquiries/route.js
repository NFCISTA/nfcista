import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Normalizes phone numbers to digits only.
 * Validates between 7 and 20 usable numeric digits.
 */
function normalizeAndValidatePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== "string") return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 20) return null;
  return digits;
}

/**
 * Computes an anonymized SHA-256 hash of client IP without storing raw PII.
 */
function hashIp(ip) {
  return crypto.createHash("sha256").update(ip || "127.0.0.1").digest("hex").slice(0, 32);
}

/**
 * POST /api/inquiries
 * Public homepage B2B quote request endpoint.
 *
 * Payload:
 * - name: string (required, 2-100 chars)
 * - shop_name: string (optional, max 100 chars)
 * - phone: string (required, 7-20 digits)
 * - product: string (optional, max 100 chars)
 * - message: string (optional, max 1000 chars)
 * - company_hp: string (honeypot field, must be empty)
 */
export async function POST(request) {
  try {
    const clientIp = getClientIp(request);

    // 1. Rate Limiting: 5 submissions per 10 minutes per IP
    const rateLimitKey = `company_inquiry:${clientIp}`;
    const rateCheck = await checkRateLimit(rateLimitKey, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many quote requests submitted. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    // 2. Body parsing with strict payload size limit (< 10KB)
    let body;
    try {
      const rawText = await request.text();
      if (rawText.length > 10 * 1024) {
        return NextResponse.json({ error: "Payload too large." }, { status: 413 });
      }
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
    }

    // 3. Honeypot check: silently drop bots with generic message, but do not insert
    if (body.company_hp && String(body.company_hp).trim().length > 0) {
      console.warn(`[inquiry-honeypot] Bot submission trapped from IP ${clientIp}`);
      return NextResponse.json({
        success: true,
        message: "Thank you for your interest. We will contact you shortly.",
      });
    }

    // 4. Validate Name
    const rawName = typeof body.name === "string" ? body.name.trim() : "";
    if (!rawName || rawName.length < 2 || rawName.length > 100) {
      return NextResponse.json(
        { error: "Please enter your name (between 2 and 100 characters)." },
        { status: 400 }
      );
    }

    // 5. Validate Phone
    const normalizedPhone = normalizeAndValidatePhone(body.phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Please provide a valid contact number (7 to 20 digits)." },
        { status: 400 }
      );
    }

    // 6. Validate Shop Name (optional)
    const rawShopName = typeof body.shop_name === "string" ? body.shop_name.trim().slice(0, 100) : null;

    // 7. Validate Product Selection (optional)
    const rawProduct = typeof body.product === "string" ? body.product.trim().slice(0, 100) : null;

    // 8. Validate Message (optional)
    const rawMessage = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : null;

    // 9. Database Persistence Check
    if (!isSupabaseConfigured || !supabase) {
      console.error("[inquiry] Supabase client is not configured on the server.");
      return NextResponse.json(
        {
          error: "Inquiry system is temporarily unavailable. Please email us directly at hellonfcista@gmail.com.",
        },
        { status: 503 }
      );
    }

    // Insert into public.company_inquiries
    const insertPayload = {
      name: rawName,
      shop_name: rawShopName,
      phone: normalizedPhone,
      product_interest: rawProduct,
      message: rawMessage,
      source: "homepage_quote",
      status: "new",
      ip_hash: hashIp(clientIp),
    };

    const { data, error } = await supabase
      .from("company_inquiries")
      .insert([insertPayload])
      .select("id")
      .single();

    if (error) {
      console.error("[inquiry-insert-error]", error.message);
      // If table doesn't exist yet or permission error, return clear error with direct email fallback
      return NextResponse.json(
        {
          error: "Inquiry storage is currently being initialized. Please email your inquiry to hellonfcista@gmail.com.",
        },
        { status: 503 }
      );
    }

    // Only return success after verified database insert
    return NextResponse.json(
      {
        success: true,
        message: "Thank you. Your quote request has been received. Our team will contact you shortly.",
        inquiry_id: data?.id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[inquiry-unhandled-error]", err);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while submitting your inquiry. Please contact hellonfcista@gmail.com.",
      },
      { status: 500 }
    );
  }
}
