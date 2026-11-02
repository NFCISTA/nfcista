"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import NfcistaLogo from "@/components/ui/NfcistaLogo";
import { generateReview } from "@/lib/reviewGenerator";
import { getCategoryChips } from "@/lib/reviewChips";

/**
 * StandaloneReviewClient
 *
 * Dedicated mobile-first review assistant for Google Review Card customers
 * who do not have a digital business profile.
 *
 * Compliance & Trust:
 * - Anti-Gating: Customers can proceed directly to Google at all times regardless of rating.
 * - Negative feedback is never converted into positive reviews.
 * - 100% in-browser generation (< 1ms). Zero external AI cost / latency.
 * - Editable draft before copying. Never auto-publishes.
 */
export default function StandaloneReviewClient({ cardConfig }) {
  const {
    business_name: businessName,
    category,
    google_review_url: googleUrl,
    review_assistant_enabled: assistantEnabled,
    card_code: cardCode,
  } = cardConfig;

  // Industry chips based on business category
  const { industry, chips: categoryChips } = useMemo(
    () => getCategoryChips(category),
    [category]
  );

  // ── State ───────────────────────────────────────────────────────────────
  const [rating, setRating] = useState(null); // Must start unselected (null)
  const [lang, setLang] = useState("en"); // "en" | "hi"
  const [selectedChipIds, setSelectedChipIds] = useState([]);
  const [product, setProduct] = useState("");
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState("");
  const [copyStatus, setCopyStatus] = useState(""); // "" | "copied" | "fallback"
  const [googleOpened, setGoogleOpened] = useState(false);

  const textareaRef = useRef(null);

  // ── Chip Toggle ─────────────────────────────────────────────────────────
  function toggleChip(chipId) {
    setSelectedChipIds((prev) =>
      prev.includes(chipId) ? prev.filter((id) => id !== chipId) : [...prev, chipId]
    );
  }

  // ── Generate Review (100% Local Browser Execution) ──────────────────────
  function handleGenerate(customSeed = null) {
    setCopyStatus("");
    setGoogleOpened(false);

    const seed = customSeed !== null ? customSeed : Date.now();

    const generated = generateReview({
      rating,
      chipIds: selectedChipIds,
      product: product.trim(),
      note: note.trim(),
      recommend: rating && rating >= 4 ? "yes" : rating && rating <= 2 ? "no" : null,
      lang,
      seed,
    });

    if (generated) {
      setDraft(generated);
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        textareaRef.current?.focus();
      }, 50);
    }
  }

  // ── Copy to Clipboard ───────────────────────────────────────────────────
  async function handleCopy() {
    if (!draft) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(draft);
        setCopyStatus("copied");
      } else {
        // Fallback
        if (textareaRef.current) {
          textareaRef.current.select();
          document.execCommand("copy");
          setCopyStatus("copied");
        }
      }
    } catch {
      setCopyStatus("fallback");
    }
  }

  // ── Copy & Continue to Google ───────────────────────────────────────────
  async function handleCopyAndLaunch() {
    await handleCopy();
    setGoogleOpened(true);
    if (googleUrl) {
      window.open(googleUrl, "_blank", "noopener,noreferrer");
    }
  }

  // ── Direct Launch to Google (Bypass) ────────────────────────────────────
  function handleDirectLaunch() {
    if (googleUrl) {
      window.open(googleUrl, "_blank", "noopener,noreferrer");
    }
  }

  // If Review Assistant is deactivated by admin for this card, display clean Direct Review Card
  if (!assistantEnabled) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6">
          {/* Header Brand */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
              <NfcistaLogo size={18} priority />
            </div>
            <span className="text-xs font-bold tracking-wider text-slate-800 uppercase">
              NFCISTA Verified Card
            </span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
            ★
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {businessName}
            </h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {industry || category}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed pt-2">
              Thank you for visiting! Tap below to share your genuine experience directly on Google.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleDirectLaunch}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all"
            >
              <Icon name="ExternalLink" size={16} />
              <span>Write Review on Google</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Powered by NFCISTA Contactless Smart Card
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-12 antialiased">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              <NfcistaLogo size={18} priority />
            </div>
            <span className="text-xs font-bold tracking-wider text-slate-900">
              NFCISTA
            </span>
          </div>

          {/* Direct Google Review Bypass (Anti-gating requirement) */}
          <button
            type="button"
            onClick={handleDirectLaunch}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 active:underline py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <span>Direct to Google</span>
            <Icon name="ExternalLink" size={13} />
          </button>
        </div>
      </header>

      {/* Hero Business Card */}
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold tracking-wide uppercase">
            <span>Google Review Assistant</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {businessName}
            </h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              {industry || category}
            </p>
          </div>

          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Need help putting your experience into words? Select your rating and tags below to generate an editable draft in seconds.
          </p>
        </section>

        {/* Step 1: Star Rating (Unselected by default) */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Rate Your Experience
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {rating ? `${rating} of 5 Stars` : "Select stars"}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center text-2xl sm:text-3xl transition-all active:scale-95 ${
                  rating !== null && rating >= star
                    ? "bg-amber-400 border-amber-500 text-white shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-300 hover:border-slate-300"
                }`}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Choose Tags / Keywords */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              2. What Stood Out?
            </span>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  lang === "en" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  lang === "hi" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Hinglish
              </button>
            </div>
          </div>

          {/* Chips Grid */}
          <div className="flex flex-wrap gap-2 pt-1">
            {categoryChips.map((chip) => {
              const isSelected = selectedChipIds.includes(chip.id);
              const isNegative = chip.sentiment === "negative";
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => toggleChip(chip.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${
                    isSelected
                      ? isNegative
                        ? "bg-rose-50 border-rose-300 text-rose-800"
                        : "bg-blue-50 border-blue-400 text-blue-900 font-semibold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Optional Product / Specific Service Input */}
          <div className="space-y-1 pt-2">
            <label htmlFor="service-input" className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Product or Service Used (Optional)
            </label>
            <input
              id="service-input"
              type="text"
              placeholder="e.g. Root canal, Cappuccino, Haircut"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Optional Note */}
          <div className="space-y-1">
            <label htmlFor="note-input" className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Any personal notes or thoughts (Optional)
            </label>
            <input
              id="note-input"
              type="text"
              placeholder="e.g. Dr. Sharma was very gentle and explained everything clearly"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={!rating && selectedChipIds.length === 0 && !note.trim() && !product.trim()}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.98] text-white font-semibold text-xs transition-all shadow-xs"
          >
            {draft ? "Regenerate Suggestion ↻" : "Create Review Suggestion ✨"}
          </button>
        </section>

        {/* Step 3: Editable Review Draft & Actions */}
        {draft && (
          <section className="bg-white border-2 border-blue-500/40 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeUp">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Your Review Draft (Editable)
              </span>
              <button
                type="button"
                onClick={() => handleGenerate(Date.now() + Math.random())}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Try different wording ↻
              </button>
            </div>

            <textarea
              ref={textareaRef}
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full p-3.5 text-xs text-slate-800 leading-relaxed bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors"
              placeholder="Your review draft will appear here..."
            />

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCopyAndLaunch}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Icon name="Copy" size={15} />
                <span>{copyStatus === "copied" ? "Copied! Opening Google..." : "Copy Review & Open Google"}</span>
              </button>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors"
                >
                  {copyStatus === "copied" ? "✓ Copied to Clipboard" : "Copy Text Only"}
                </button>

                <button
                  type="button"
                  onClick={handleDirectLaunch}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open Google</span>
                  <Icon name="ExternalLink" size={12} />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-normal">
              Reviews are posted directly under your Google account. NFCISTA does not store or automatically post your review.
            </p>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-4 text-[11px] text-slate-400 space-y-1">
          <div>Card Ref: {cardCode} · Verified Contactless Card</div>
          <div>Powered by NFCISTA Smart Cards</div>
        </footer>
      </div>
    </main>
  );
}
