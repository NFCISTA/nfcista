import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Builds a service-role Supabase client when credentials are present.
 * Server-side only — never exposed to the browser.
 */
function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

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

    // 9. Database Client Resolution
    const serviceClient = getServiceRoleClient();
    const dbClient = serviceClient || supabase;

    if (!isSupabaseConfigured || !dbClient) {
      console.error("[inquiry] Supabase client is not configured on the server.");
      return NextResponse.json(
        {
          error: "Inquiry system is temporarily unavailable. Please email us directly at hellonfcista@gmail.com.",
        },
        { status: 503 }
      );
    }

    // Insert payload
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

    let inquiryId = null;
    let insertSucceeded = false;
    let lastError = null;

    // Strategy 1: Service-role client insert (elevated privilege, bypasses RLS)
    if (serviceClient) {
      const { data: srData, error: srError } = await serviceClient
        .from("company_inquiries")
        .insert([insertPayload])
        .select("id")
        .single();

      if (!srError) {
        insertSucceeded = true;
        inquiryId = srData?.id || null;
      } else {
        lastError = srError;
        console.warn("[inquiry-service-role] Insert warning:", srError.message);
      }
    }

    // Strategy 2: Atomic SECURITY DEFINER RPC (submit_company_inquiry)
    if (!insertSucceeded) {
      const { data: rpcRows, error: rpcError } = await dbClient.rpc("submit_company_inquiry", {
        name_input: rawName,
        phone_input: normalizedPhone,
        shop_name_input: rawShopName,
        product_input: rawProduct,
        message_input: rawMessage,
        ip_hash_input: hashIp(clientIp),
      });

      if (!rpcError) {
        const result = Array.isArray(rpcRows) && rpcRows.length > 0 ? rpcRows[0] : rpcRows;
        if (result && (result.status === "OK" || result.inquiry_id)) {
          insertSucceeded = true;
          inquiryId = result.inquiry_id || null;
        }
      } else {
        lastError = rpcError;
        const code = String(rpcError.code || "");
        if (code !== "PGRST202" && code !== "42883") {
          console.warn("[inquiry-rpc] RPC call warning:", rpcError.message);
        }
      }
    }

    // Strategy 3: Standard direct table insert without .select("id") to avoid RLS RETURNING/SELECT blockage
    if (!insertSucceeded) {
      const { error: directInsertError } = await dbClient
        .from("company_inquiries")
        .insert([insertPayload]);

      if (!directInsertError) {
        insertSucceeded = true;
      } else {
        lastError = directInsertError;
        console.error("[inquiry-direct-insert] Error:", directInsertError.message, `(code: ${directInsertError.code})`);
      }
    }

    // If all strategies failed, return clear 503 error with email fallback
    if (!insertSucceeded) {
      console.error("[inquiry-failed] All insert strategies failed. Last error:", lastError?.message || "Unknown error");
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
        inquiry_id: inquiryId,
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
