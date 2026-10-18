import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabase } from "@/lib/supabaseClient";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Normalizes phone numbers to digits only.
 * Validates that there are between 7 and 20 usable numeric digits.
 */
function normalizeAndValidatePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== "string") return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 20) return null;
  return digits;
}

/**
 * Validates email format with standard regex.
 */
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Computes an anonymized SHA-256 hash of client IP for rate abuse analysis without storing raw PII.
 */
function hashIp(ip) {
  return crypto.createHash("sha256").update(ip || "127.0.0.1").digest("hex").slice(0, 32);
}

/**
 * POST /api/enquiry
 * Public enquiry submission endpoint.
 *
 * Visitor provides ONLY:
 * - profile_slug (required)
 * - name (required, 1-120 chars)
 * - phone (required, 7-20 digits)
 * - email (optional, valid email format)
 * - message (required, 3-2000 chars)
 * - website_hp (honeypot, must be empty)
 *
 * Security architecture:
 * - All customer lookup and enquiry insertion is performed by the SECURITY DEFINER
 *   PostgreSQL function submit_customer_enquiry() which runs with elevated database
 *   privileges. The anon Supabase client has no direct SELECT on public.customers
 *   and no direct INSERT on public.customer_enquiries (correctly blocked by RLS).
 * - The profile_slug is the only customer-identity value trusted from the visitor.
 * - customer_id, auth_user_id, WhatsApp number, and delivery settings are NEVER
 *   read from the request; they come exclusively from the trusted RPC response.
 */
export async function POST(request) {
  try {
    const clientIp = getClientIp(request);

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
    }

    // 1. Honeypot Check: If website_hp is filled, silently drop and return generic success
    if (body.website_hp && String(body.website_hp).trim().length > 0) {
      console.warn(`[enquiry-honeypot] Bot submission trapped from IP ${clientIp}`);
      return NextResponse.json({
        success: true,
        message: "Enquiry submitted successfully.",
        whatsapp_url: null,
      });
    }

    // 2. Validate Profile Slug
    const rawSlug = body.profile_slug;
    if (!rawSlug || typeof rawSlug !== "string" || !rawSlug.trim()) {
      return NextResponse.json({ error: "Profile slug is required." }, { status: 400 });
    }
    const cleanSlug = rawSlug.trim().toLowerCase();

    // 3. Rate Limiting: 5 submissions per 10 minutes per IP/slug combination
    const rateLimitKey = `${clientIp}:${cleanSlug}`;
    const rateCheck = await checkRateLimit(rateLimitKey, {
      limit: 5,
      windowMs: 10 * 60 * 1000, // 10 minutes
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many enquiries submitted. Please wait a few minutes before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateCheck.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 4. Validate Visitor Name (1-120 chars)
    const rawName = body.name;
    if (!rawName || typeof rawName !== "string" || !rawName.trim()) {
      return NextResponse.json({ error: "Your name is required." }, { status: 400 });
    }
    const cleanName = rawName.trim();
    if (cleanName.length > 120) {
      return NextResponse.json({ error: "Name must be 120 characters or less." }, { status: 400 });
    }

    // 5. Validate Visitor Phone (7-20 digits)
    const rawPhone = body.phone;
    if (!rawPhone || typeof rawPhone !== "string" || !rawPhone.trim()) {
      return NextResponse.json({ error: "Mobile number is required." }, { status: 400 });
    }
    const phoneDigits = normalizeAndValidatePhone(rawPhone);
    if (!phoneDigits) {
      return NextResponse.json({ error: "Please enter a valid phone number with 7 to 20 digits." }, { status: 400 });
    }
    const cleanPhone = rawPhone.trim().slice(0, 30);

    // 6. Validate Visitor Email (Optional, valid email format if present)
    let cleanEmail = null;
    if (body.email !== undefined && body.email !== null && String(body.email).trim() !== "") {
      const rawEmail = String(body.email).trim();
      if (!isValidEmail(rawEmail)) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      }
      if (rawEmail.length > 120) {
        return NextResponse.json({ error: "Email must be 120 characters or less." }, { status: 400 });
      }
      cleanEmail = rawEmail;
    }

    // 7. Validate Message (3-2000 chars)
    const rawMessage = body.message;
    if (!rawMessage || typeof rawMessage !== "string" || !rawMessage.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    const cleanMessage = rawMessage.trim();
    if (cleanMessage.length < 3) {
      return NextResponse.json({ error: "Message must be at least 3 characters long." }, { status: 400 });
    }
    if (cleanMessage.length > 2000) {
      return NextResponse.json({ error: "Message must be 2000 characters or less." }, { status: 400 });
    }

    // 8. Compute server-side values before calling the RPC.
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;
    const ipHash = hashIp(clientIp);

    // 9. Atomically validate the customer, snapshot delivery settings, and insert the
    //    enquiry record via the SECURITY DEFINER RPC submit_customer_enquiry.
    //
    //    This single RPC call replaces the previous broken approach of querying
    //    public.customers and inserting into public.customer_enquiries directly
    //    with the anon client (which is correctly blocked by RLS with code 42501).
    //
    //    The RPC:
    //    - Verifies is_active = TRUE AND enquiry_enabled = TRUE.
    //    - Snapshots delivery settings at the moment of submission.
    //    - Inserts the record atomically.
    //    - Returns ONLY: status, enquiry_id, customer_name, wa_number (if WhatsApp
    //      delivery is enabled), delivery_whatsapp.
    //    - Never returns customer_id, auth_user_id, customer email, address,
    //      social URLs, photo_url, or any other private customer data.
    const { data: rpcRows, error: rpcErr } = await supabase.rpc("submit_customer_enquiry", {
      slug_input:       cleanSlug,
      visitor_name:     cleanName,
      visitor_phone:    cleanPhone,
      visitor_email:    cleanEmail,
      message:          cleanMessage,
      ip_hash_input:    ipHash,
      user_agent_input: userAgent,
    });

    if (rpcErr) {
      // Log the technical detail server-side; never expose raw database errors to visitors.
      console.error("[enquiry] RPC submit_customer_enquiry error:", rpcErr.message, rpcErr.code);
      return NextResponse.json(
        { error: "Failed to submit enquiry. Please try again later." },
        { status: 500 }
      );
    }

    // The RPC returns a single row (SETOF TABLE with LIMIT 1 semantics via RETURN).
    const result = Array.isArray(rpcRows) && rpcRows.length > 0 ? rpcRows[0] : null;

    if (!result || result.status === "DISABLED") {
      // Customer not found, inactive, or enquiry disabled — use same controlled message.
      return NextResponse.json(
        { error: "Enquiries are currently disabled for this profile." },
        { status: 400 }
      );
    }

    if (result.status !== "OK") {
      // Unexpected RPC status — treat as server error.
      console.error("[enquiry] Unexpected RPC status:", result.status);
      return NextResponse.json(
        { error: "Failed to submit enquiry. Please try again later." },
        { status: 500 }
      );
    }

    // 10. WhatsApp Follow-Up URL Generation.
    //     The WhatsApp recipient number comes exclusively from the trusted RPC response
    //     (result.wa_number). It is never read from the visitor's request.
    let whatsappUrl = null;
    if (result.delivery_whatsapp && result.wa_number) {
      const waDigits = String(result.wa_number).replace(/\D/g, "");
      if (waDigits && waDigits.length >= 7) {
        const emailLine = cleanEmail ? `\nEmail: ${cleanEmail}` : "";
        const customerName = result.customer_name || "there";
        const prefilledText = `Hi ${customerName},\n\nI just submitted an enquiry through your NFCISTA digital card.\n\nName: ${cleanName}\nPhone: ${cleanPhone}${emailLine}\nMessage: ${cleanMessage}`;
        whatsappUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(prefilledText)}`;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully.",
      whatsapp_url: whatsappUrl,
    });
  } catch (err) {
    console.error("[enquiry] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
