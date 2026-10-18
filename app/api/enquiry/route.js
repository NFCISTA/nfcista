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

    // 8. Server-Side Customer Lookup by Slug
    // Only active customers with enquiry_enabled = true are accepted.
    const { data: customer, error: lookupErr } = await supabase
      .from("customers")
      .select("id, full_name, profile_slug, is_active, whatsapp, enquiry_enabled, enquiry_delivery_dashboard, enquiry_delivery_email, enquiry_delivery_whatsapp")
      .ilike("profile_slug", cleanSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (lookupErr || !customer) {
      return NextResponse.json(
        { error: "Enquiries are currently disabled for this profile." },
        { status: 400 }
      );
    }

    if (!customer.enquiry_enabled) {
      return NextResponse.json(
        { error: "Enquiries are currently disabled for this profile." },
        { status: 400 }
      );
    }

    // 9. Snapshot Delivery Settings at Submission Time
    const deliveryDashboard = Boolean(customer.enquiry_delivery_dashboard);
    const deliveryEmail = Boolean(customer.enquiry_delivery_email);
    const deliveryWhatsapp = Boolean(customer.enquiry_delivery_whatsapp);

    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;
    const ipHash = hashIp(clientIp);

    // Determine WhatsApp status
    const canDoWhatsapp = deliveryWhatsapp && Boolean(customer.whatsapp && String(customer.whatsapp).trim());
    const whatsappStatus = canDoWhatsapp ? "ready" : "skipped";

    // 10. Store Enquiry in public.customer_enquiries
    // Always store valid enquiry regardless of whether dashboard checkbox is currently checked.
    const enquiryRecord = {
      customer_id: customer.id,
      visitor_name: cleanName,
      visitor_phone: cleanPhone,
      visitor_email: cleanEmail,
      message: cleanMessage,
      delivery_dashboard: deliveryDashboard,
      delivery_email: deliveryEmail,
      delivery_whatsapp: deliveryWhatsapp,
      is_read: false,
      email_status: "not_configured",
      whatsapp_status: whatsappStatus,
      source_slug: customer.profile_slug,
      ip_hash: ipHash,
      user_agent: userAgent,
    };

    const { error: insertErr } = await supabase
      .from("customer_enquiries")
      .insert([enquiryRecord]);

    if (insertErr) {
      console.error("[enquiry] Failed to insert enquiry:", insertErr.message);
      return NextResponse.json(
        { error: "Failed to submit enquiry. Please try again later." },
        { status: 500 }
      );
    }

    // 11. WhatsApp Follow-Up URL Generation
    let whatsappUrl = null;
    if (canDoWhatsapp) {
      const waDigits = customer.whatsapp.replace(/\D/g, "");
      if (waDigits) {
        const emailLine = cleanEmail ? `\nEmail: ${cleanEmail}` : "";
        const prefilledText = `Hi ${customer.full_name},\n\nI just submitted an enquiry through your NFCISTA digital card.\n\nName: ${cleanName}\nPhone: ${cleanPhone}${emailLine}\nMessage: ${cleanMessage}`;
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
