import { NextResponse } from "next/server";
import { getCustomerBySlug } from "@/lib/customers";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Normalizes and sanitizes user text inputs.
 */
function cleanText(text, maxLen = 500) {
  if (!text || typeof text !== "string") return "";
  return text.trim().slice(0, maxLen);
}

/**
 * System prompt enforcing strict safety guidelines:
 * - Must NOT invent experiences, employees, claims, awards, etc.
 * - Must reflect the user's authentic sentiment and notes.
 * - Must NOT convert negative feedback into positive feedback.
 * - Acts purely as a writing assistant.
 */
function buildPrompt({ businessName, category, rating, userNotes }) {
  const ratingText = rating ? `${rating} out of 5 stars` : "unrated";
  return `You are an AI writing assistant for customers drafting a Google review for "${businessName}"${category ? ` (${category})` : ""}.

The customer gave a rating of: ${ratingText}.
Customer's genuine thoughts and notes:
${userNotes}

STRICT WRITING RULES:
1. Base the review SOLELY and EXCLUSIVELY on the customer's provided notes and rating.
2. DO NOT invent, hallucinate, or assume any facts, employee names, specific dishes, products, services, awards, prices, or occurrences not mentioned in the customer's notes.
3. If the customer provided negative or critical feedback, PRESERVE IT HONESTLY and constructively. NEVER convert negative feedback into positive feedback.
4. Do NOT manufacture superlatives, fake enthusiasm, or exaggerated praise (e.g., do not add "best in the world", "unmatched", "life-changing" unless the customer explicitly wrote that).
5. Write in a natural, authentic first-person customer voice (I / we).
6. Keep the review concise, clear, and well-punctuated (2 to 4 sentences).
7. Output ONLY the review text draft. Do NOT include quotation marks, greetings, explanations, or meta-commentary.`;
}

/**
 * Single AI Provider: Call OpenAI API using native fetch
 */
async function callOpenAi(apiKey, systemPrompt, userMessage) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[review-assistant] OpenAI API error:", res.status, errText);
      return null;
    }

    const data = await res.json();
    const draft = data.choices?.[0]?.message?.content?.trim();
    return draft || null;
  } catch (fetchErr) {
    console.error("[review-assistant] OpenAI fetch error:", fetchErr.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * POST /api/review-assistant
 *
 * Public endpoint for AI review drafting.
 * Rate limited to 5 requests per 10 minutes per IP/slug.
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
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    // 1. Bot Honeypot Check
    if (body.website_hp) {
      return NextResponse.json({
        success: true,
        draft: "Thank you for visiting! We appreciate your feedback.",
      });
    }

    // 2. Validate Profile Slug
    const slug = cleanText(body.slug, 80);
    if (!slug) {
      return NextResponse.json({ error: "Profile slug is required." }, { status: 400 });
    }

    // 3. Sliding Window Rate Limiting (5 requests per 10 minutes per IP/slug)
    const rateLimitKey = `review_assistant:${slug}:${clientIp}`;
    const rateCheck = await checkRateLimit(rateLimitKey, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many review assistant requests. Please write your review directly on Google or try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.reset),
          },
        }
      );
    }

    // 4. Verify Customer Record & Feature Flag
    const customer = await getCustomerBySlug(slug);
    if (!customer || !customer.is_active) {
      return NextResponse.json({ error: "Customer profile not found or inactive." }, { status: 404 });
    }

    if (!customer.review_assistant_enabled) {
      return NextResponse.json(
        { error: "AI Review Assistant is not enabled for this business." },
        { status: 403 }
      );
    }

    if (!customer.google_review_url?.trim()) {
      return NextResponse.json(
        { error: "Google Review link is not configured for this business." },
        { status: 400 }
      );
    }

    // 5. Validate Star Rating (Integer between 1 and 5)
    const rawRating = Number(body.rating);
    if (!Number.isInteger(rawRating) || rawRating < 1 || rawRating > 5) {
      return NextResponse.json(
        { error: "Please select a star rating between 1 and 5." },
        { status: 400 }
      );
    }

    // 6. Extract and validate notes/inputs based on mode
    const mode = body.mode === "quick" ? "quick" : body.mode === "custom" ? "custom" : "assistant";
    const notesParts = [];

    if (mode === "quick") {
      const sentiment = cleanText(body.sentiment, 100);
      if (sentiment) notesParts.push(`Overall feeling: ${sentiment}`);
      const quickNotes = cleanText(body.quick_notes, 500);
      if (quickNotes) notesParts.push(quickNotes);
    } else if (mode === "assistant") {
      const experience = cleanText(body.experience, 300);
      const highlight = cleanText(body.highlight, 300);
      const serviceUsed = cleanText(body.service_used, 200);
      const staff = cleanText(body.staff, 200);
      const recommend = cleanText(body.recommend, 100);
      const freeform = cleanText(body.freeform, 500);

      if (experience) notesParts.push(`Experience: ${experience}`);
      if (highlight) notesParts.push(`What stood out: ${highlight}`);
      if (serviceUsed) notesParts.push(`Service/product used: ${serviceUsed}`);
      if (staff) notesParts.push(`Staff/service feedback: ${staff}`);
      if (recommend) notesParts.push(`Recommendation: ${recommend}`);
      if (freeform) notesParts.push(`Additional notes: ${freeform}`);
    } else {
      // mode === "custom"
      const customDraft = cleanText(body.custom_text, 1000);
      if (customDraft) notesParts.push(customDraft);
    }

    const combinedNotes = notesParts.join("\n").trim();
    if (!combinedNotes && mode !== "custom") {
      return NextResponse.json(
        { error: "Please provide a few details or words about your experience." },
        { status: 400 }
      );
    }

    // 7. Single Provider: Generate Review Draft using OpenAI
    const openAiKey = process.env.OPENAI_API_KEY?.trim();
    if (!openAiKey) {
      return NextResponse.json(
        { error: "AI Review Assistant is temporarily unavailable. Please write your review directly on Google." },
        { status: 503 }
      );
    }

    const businessName = customer.company_name?.trim() || customer.full_name?.trim() || "this business";
    const category = customer.category?.trim() || "";

    const systemPrompt = buildPrompt({
      businessName,
      category,
      rating: rawRating,
      userNotes: combinedNotes || `Rating: ${rawRating} stars.`,
    });

    const userMessage = combinedNotes || `Rating given: ${rawRating} stars.`;
    const generatedDraft = await callOpenAi(openAiKey, systemPrompt, userMessage);

    if (!generatedDraft) {
      return NextResponse.json(
        { error: "AI Review Assistant could not generate a draft right now. Please write your review directly on Google." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: generatedDraft,
      rating: rawRating,
      business_name: businessName,
      google_review_url: customer.google_review_url,
    });
  } catch (err) {
    console.error("[review-assistant] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while assisting with your review." },
      { status: 500 }
    );
  }
}
