"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import NfcistaLogo from "@/components/ui/NfcistaLogo";
import { generateReview } from "@/lib/reviewGenerator";
import { getCategoryChips } from "@/lib/reviewChips";
import {
  getClosingSuggestions,
  applyClosingLine,
  removeClosingLine,
} from "@/lib/reviewClosingLines";

/**
 * Languages supported by the natural language review engine.
 */
const LANGUAGES = [
  { id: "en", label: "English", nativeLabel: "English" },
  { id: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { id: "hinglish", label: "Hinglish", nativeLabel: "Hinglish" },
  { id: "mr", label: "Marathi", nativeLabel: "मराठी" },
];

/**
 * Natural writing styles supported by the review engine.
 */
const WRITING_STYLES = [
  { id: "balanced", label: "Balanced", hint: "Natural complete review" },
  { id: "concise", label: "Concise", hint: "1–2 short sentences" },
  { id: "enthusiastic", label: "Warm", hint: "High energy & appreciation" },
  { id: "professional", label: "Formal", hint: "Measured & professional" },
];

/**
 * Rating descriptive labels (1-5 stars)
 */
const RATING_LABELS = {
  5: "5 of 5 Stars — Excellent!",
  4: "4 of 5 Stars — Very Good",
  3: "3 of 5 Stars — Average / Fair",
  2: "2 of 5 Stars — Needs Improvement",
  1: "1 of 5 Stars — Disappointing",
};

/**
 * StandaloneReviewClient (Phase 2 Upgrade)
 *
 * Dedicated mobile-first review assistant for Google Review Card customers
 * who do not have a digital business profile.
 *
 * Compliance & Trust:
 * - Anti-Gating: Customers can proceed directly to Google at all times regardless of rating.
 * - Negative feedback is never converted into positive reviews.
 * - 100% in-browser generation (< 1ms). Zero external AI cost / latency.
 * - Editable draft before copying. Never auto-publishes.
 * - 48x48px touch targets for mobile thumbs.
 * - 3 separate actions: Copy & Open Google, Copy Draft Only, Open Google Without Text.
 */
/**
 * Display names for business categories.
 */
const CATEGORY_DISPLAY_NAMES = {
  perfume: "Perfume Shop",
  bags_footwear: "Bags & Footwear",
  optical: "Optical Store",
  clothing: "Clothing Store",
  retail: "Retail & Shopping",
  restaurant: "Restaurant & Cafe",
  clinic: "Healthcare & Clinic",
  salon: "Salon & Beauty",
  fitness: "Gym & Fitness",
  automotive: "Automotive & Repair",
  services: "Professional Services",
  hotel: "Hospitality & Hotel",
  generic: "Local Business",
};

function getCategoryLabel(ind, cat) {
  const key = (ind || cat || "").toLowerCase().trim();
  return CATEGORY_DISPLAY_NAMES[key] || (ind || cat || "").replace(/_/g, " ");
}

export default function StandaloneReviewClient({ cardConfig }) {
  const {
    business_name: businessName,
    category,
    google_review_url: googleUrl,
    review_assistant_enabled: assistantEnabled,
    card_code: cardCode,
  } = cardConfig;

  // Industry chips based on business category (filtered to positive experience chips for simplified customer UX)
  const { industry, chips: categoryChips } = useMemo(() => {
    const res = getCategoryChips(category);
    return {
      industry: res.industry,
      chips: (res.chips || []).filter((c) => c.sentiment !== "negative"),
    };
  }, [category]);

  // ── State ───────────────────────────────────────────────────────────────
  const [rating, setRating] = useState(null); // Must start unselected (null)
  const [lang, setLang] = useState("en"); // "en" | "hi" | "hinglish" | "mr"
  const [style, setStyle] = useState("balanced"); // "concise" | "balanced" | "enthusiastic" | "professional"
  const [selectedChipIds, setSelectedChipIds] = useState([]);
  const [product, setProduct] = useState("");
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState("");
  const [seed, setSeed] = useState(() => Date.now());
  const [copyStatus, setCopyStatus] = useState(""); // "" | "copied" | "copied-fallback" | "failed"
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [showAllChips, setShowAllChips] = useState(false);
  const [selectedClosingId, setSelectedClosingId] = useState("none");
  const [appliedClosingText, setAppliedClosingText] = useState("");

  const textareaRef = useRef(null);

  // Closing suggestions based on rating, language, and seed
  const closingSuggestions = useMemo(() => {
    return getClosingSuggestions({ rating, lang, seed });
  }, [rating, lang, seed]);

  // Handle closing line selection
  const handleSelectClosing = useCallback(
    (closingId, closingText = "") => {
      if (closingId === "none" || !closingText) {
        if (appliedClosingText) {
          setDraft((prev) => removeClosingLine(prev, appliedClosingText));
        }
        setSelectedClosingId("none");
        setAppliedClosingText("");
        return;
      }

      setDraft((prev) => applyClosingLine(prev, closingText, appliedClosingText));
      setSelectedClosingId(closingId);
      setAppliedClosingText(closingText);
    },
    [appliedClosingText]
  );

  function handleFocusDraftEnd() {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }

  // ── Chip Toggle ─────────────────────────────────────────────────────────
  function toggleChip(chipId) {
    setSelectedChipIds((prev) =>
      prev.includes(chipId) ? prev.filter((id) => id !== chipId) : [...prev, chipId]
    );
  }

  // ── Keyboard Navigation for Star Rating Radiogroup ──────────────────────
  function handleStarKeyDown(e, currentStar) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(5, (currentStar || rating || 0) + 1);
      setRating(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(1, (currentStar || rating || 2) - 1);
      setRating(prev);
    }
  }

  // ── Generate Review (100% Local Browser Execution) ──────────────────────
  const handleGenerate = useCallback(
    (customSeed = null, customLang = null, customStyle = null) => {
      setCopyStatus("");
      setPopupBlocked(false);

      const activeSeed = customSeed !== null ? customSeed : seed;
      const activeLang = customLang !== null ? customLang : lang;
      const activeStyle = customStyle !== null ? customStyle : style;

      // Safeguard: Only suggest positive recommendation if customer selected positive chips AND rating >= 4
      const canRecommend = rating && rating >= 4 && selectedChipIds.length > 0;
      const isNegativeRating = rating && rating <= 2;

      const generated = generateReview({
        rating,
        chipIds: selectedChipIds,
        product: product.trim(),
        note: note.trim(),
        recommend: canRecommend ? "yes" : isNegativeRating ? "no" : null,
        lang: activeLang,
        style: activeStyle,
        seed: activeSeed,
      });

      if (generated) {
        setDraft(generated);
        setSelectedClosingId("none");
        setAppliedClosingText("");
        if (customSeed !== null) {
          setSeed(activeSeed);
        }
      }
    },
    [rating, selectedChipIds, product, note, lang, style, seed]
  );

  // Re-generate draft automatically when language or style changes (if draft already present)
  function handleLangChange(newLang) {
    setLang(newLang);
    if (draft) {
      handleGenerate(seed, newLang, style);
    }
  }

  function handleStyleChange(newStyle) {
    setStyle(newStyle);
    if (draft) {
      handleGenerate(seed, lang, newStyle);
    }
  }

  // ── Regenerate with new seed ────────────────────────────────────────────
  function handleRegenerate() {
    const newSeed = Date.now() + Math.floor(Math.random() * 10000);
    handleGenerate(newSeed);
  }

  // ── Clipboard Copy Flow ─────────────────────────────────────────────────
  async function handleCopy() {
    if (!draft || !draft.trim()) return false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(draft.trim());
        setCopyStatus("copied");
        return true;
      }
      throw new Error("Clipboard API unavailable");
    } catch {
      // Graceful fallback for non-secure contexts, older mobile browsers, or permission blocks
      if (textareaRef.current) {
        try {
          textareaRef.current.focus();
          textareaRef.current.select();
          const success = document.execCommand("copy");
          if (success) {
            setCopyStatus("copied-fallback");
            return true;
          }
        } catch {}
      }
      setCopyStatus("failed");
      return false;
    }
  }

  // ── Action 1: Copy & Open Google (Primary CTA) ──────────────────────────
  async function handleCopyAndLaunch() {
    setPopupBlocked(false);
    await handleCopy();

    if (googleUrl) {
      const win = window.open(googleUrl, "_blank", "noopener,noreferrer");
      if (!win || win.closed || typeof win.closed === "undefined") {
        setPopupBlocked(true);
      }
    }
  }

  // ── Action 2: Copy Draft Only ───────────────────────────────────────────
  async function handleCopyOnly() {
    await handleCopy();
  }

  // ── Action 3: Open Google Without Text (Direct Bypass) ───────────────────
  function handleDirectLaunch() {
    setPopupBlocked(false);
    if (googleUrl) {
      const win = window.open(googleUrl, "_blank", "noopener,noreferrer");
      if (!win || win.closed || typeof win.closed === "undefined") {
        setPopupBlocked(true);
      }
    }
  }

  // If Review Assistant is deactivated by admin for this card, display clean Direct Review Card
  if (!assistantEnabled) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6">
          {/* Header Brand */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden shadow-xs">
              <NfcistaLogo size={20} priority />
            </div>
            <span className="text-xs font-black tracking-widest text-[#0F172A] uppercase">
              NFCISTA Verified
            </span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mx-auto text-2xl shadow-xs">
            ★
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
              {businessName}
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {getCategoryLabel(industry, category)}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed pt-2">
              Thank you for visiting! Tap below to share your genuine experience directly on Google.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleDirectLaunch}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-[0.98] text-white font-bold text-sm shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              aria-label="Write review directly on Google"
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

  const isGenerateDisabled =
    !rating && selectedChipIds.length === 0 && !note.trim() && !product.trim();

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16 antialiased text-slate-800">
      {/* ── Sticky Navigation Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-xl mx-auto px-4 h-15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
              <NfcistaLogo size={20} priority />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-widest text-[#0F172A] uppercase leading-tight">
                NFCISTA
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wide">
                Smart Review Assistant
              </span>
            </div>
          </div>

          {/* Direct Google Review Bypass Link (Anti-gating requirement: always visible) */}
          <button
            type="button"
            onClick={handleDirectLaunch}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-[#1D4ED8] active:scale-95 font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            aria-label="Skip assistant and write review directly on Google"
          >
            <span>Direct to Google</span>
            <Icon name="ExternalLink" size={13} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      {/* ── Main Content Container ────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-4 pt-5 space-y-5">
        {/* Hero Business Card */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1D4ED8] text-[11px] font-bold tracking-wider uppercase">
            <span>Verified Google Review Card</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
              {businessName}
            </h1>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
              {getCategoryLabel(industry, category)}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
            Need help putting your experience into words? Select your rating and tags to generate an editable draft in your preferred language and style.
          </p>
        </section>

        {/* ── STEP 1: Rate Your Experience (Stars) ─────────────────────────── */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-[11px] font-black">
                1
              </span>
              Rate Your Experience
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {rating ? RATING_LABELS[rating] : "Select stars"}
            </span>
          </div>

          {/* 5 Large Star Tiles (Min 48x48px mobile touch target with keyboard arrow navigation) */}
          <div
            className="flex items-center justify-center gap-2.5 sm:gap-3.5 py-1"
            role="radiogroup"
            aria-label="Rate your experience from 1 to 5 stars"
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isSelected = rating !== null && star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onKeyDown={(e) => handleStarKeyDown(e, star)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center text-2xl sm:text-3xl transition-all cursor-pointer active:scale-90 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                    isSelected
                      ? "bg-amber-400 border-amber-500 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-300 hover:border-slate-300 hover:text-slate-400"
                  }`}
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={RATING_LABELS[star]}
                >
                  ★
                </button>
              );
            })}
          </div>

          {/* Direct Google Review Reminder (Anti-Gating Notice) */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleDirectLaunch}
              className="text-xs font-semibold text-slate-600 hover:text-blue-700 underline underline-offset-2 transition-colors inline-flex items-center gap-1 cursor-pointer py-1.5 px-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span>Want to skip directly to Google Reviews? Tap here</span>
              <Icon name="ExternalLink" size={12} />
            </button>
          </div>
        </section>

        {/* ── STEP 2: Language & Writing Style Selectors ───────────────────── */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          {/* Language Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-[11px] font-black">
                  2
                </span>
                Choose Language
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {LANGUAGES.find((l) => l.id === lang)?.nativeLabel || "English"}
              </span>
            </div>

            {/* Horizontal Scrollable Language Pills (Min 48px touch target) */}
            <div
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
              role="radiogroup"
              aria-label="Choose review language"
            >
              {LANGUAGES.map((l) => {
                const isActive = lang === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleLangChange(l.id)}
                    className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-xs shrink-0 transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                    role="radio"
                    aria-checked={isActive}
                    aria-label={`${l.nativeLabel} (${l.label})`}
                  >
                    <span>{l.nativeLabel}</span>
                    {l.id !== "en" && l.id !== "hinglish" && (
                      <span className="text-[10px] opacity-75">({l.label})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Writing Style Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Writing Style / Tone
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {WRITING_STYLES.find((s) => s.id === style)?.hint || "Natural"}
              </span>
            </div>

            {/* Horizontal Scrollable Style Pills (Min 48px touch target) */}
            <div
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
              role="radiogroup"
              aria-label="Choose review writing style"
            >
              {WRITING_STYLES.map((s) => {
                const isActive = style === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStyleChange(s.id)}
                    className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-xs shrink-0 transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                    role="radio"
                    aria-checked={isActive}
                    aria-label={`${s.label} tone - ${s.hint}`}
                  >
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── STEP 3: Experience Chips & Details ────────────────────────────── */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-[11px] font-black">
                3
              </span>
              What Stood Out?
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {selectedChipIds.length} selected
            </span>
          </div>

          {/* Chips Grid: Display positive experience chips with initial 8 + expand option */}
          <div className="flex flex-wrap gap-2.5 pt-1" role="group" aria-label="Experience tags">
            {(showAllChips
              ? categoryChips.filter((c) => c.sentiment !== "negative")
              : categoryChips
                  .filter((c) => c.sentiment !== "negative")
                  .filter((c, idx) => idx < 8 || selectedChipIds.includes(c.id))
            ).map((chip) => {
              const isSelected = selectedChipIds.includes(chip.id);

              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => toggleChip(chip.id)}
                  className={`min-h-[48px] px-4 py-2.5 rounded-full text-xs font-semibold border transition-all cursor-pointer active:scale-95 select-none inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    isSelected
                      ? "bg-[#1D4ED8] border-[#1D4ED8] text-white shadow-xs"
                      : "bg-slate-50 border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${chip.label}${isSelected ? ", selected" : ""}`}
                >
                  {isSelected ? (
                    <Icon name="Check" size={14} strokeWidth={2.8} />
                  ) : (
                    <span className="text-blue-600 font-bold text-sm leading-none" aria-hidden="true">+</span>
                  )}
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Expand/Collapse more chips toggle */}
          {categoryChips.filter((c) => c.sentiment !== "negative").length > 8 && (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setShowAllChips((prev) => !prev)}
                className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] py-1.5 px-3 rounded-full bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 transition-colors inline-flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-expanded={showAllChips}
              >
                <span>
                  {showAllChips
                    ? "Show fewer experiences"
                    : `+ Show more experiences (${categoryChips.filter((c) => c.sentiment !== "negative").length - 8} more)`}
                </span>
                <Icon name={showAllChips ? "ChevronUp" : "ChevronDown"} size={13} />
              </button>
            </div>
          )}

          {/* Optional Product / Specific Service Input */}
          <div className="space-y-1.5 pt-2">
            <label
              htmlFor="product-service-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Product or Service Used (Optional)
            </label>
            <input
              id="product-service-input"
              type="text"
              placeholder="e.g. Root canal, Haircut, Espresso, Oil change"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="min-h-[48px] w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all"
            />
          </div>

          {/* Optional Freeform Note */}
          <div className="space-y-1.5">
            <label
              htmlFor="personal-note-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Any personal thoughts or notes (Optional)
            </label>
            <input
              id="personal-note-input"
              type="text"
              placeholder="Anything specific you would like to mention about your experience?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[48px] w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all"
            />
          </div>

          {/* Primary Generate Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerateDisabled}
              className="w-full min-h-[50px] py-3.5 px-5 rounded-2xl bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              {draft ? (
                <>
                  <Icon name="RotateCw" size={15} />
                  <span>Regenerate Suggestion</span>
                </>
              ) : (
                <>
                  <span>Create Review Suggestion ✨</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ── STEP 4: Editable Review Draft & 3 Separate Actions ───────────── */}
        {draft && (
          <section className="bg-white border-2 border-blue-500/50 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 animate-fadeUp">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-[11px] font-black">
                  4
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1">
                  <Icon name="Pencil" size={12} className="text-blue-600" />
                  Your Review Draft (Editable)
                </span>
              </div>

              {/* Regenerate Button */}
              <button
                type="button"
                onClick={handleRegenerate}
                className="text-xs font-bold text-[#1D4ED8] hover:text-[#1E40AF] active:scale-95 inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                title="Generate another variation"
                aria-label="Generate another variation with different wording"
              >
                <span>Try another</span>
                <Icon name="RotateCw" size={12} />
              </button>
            </div>

            {/* Customer transparency & review ownership notice */}
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 leading-relaxed">
              <strong className="text-slate-800 font-semibold">Your experience, your words.</strong> Please review and edit this draft so it accurately reflects your visit before posting.
            </p>

            {/* Editable Textarea with Accessible Label */}
            <div className="space-y-1.5">
              <label htmlFor="review-draft-textarea" className="sr-only">
                Editable review draft
              </label>
              <textarea
                id="review-draft-textarea"
                ref={textareaRef}
                rows={4}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full p-4 text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50/70 rounded-2xl border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-inner font-normal"
                placeholder="Your review draft will appear here..."
              />

              {/* Character & Word Counter */}
              <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-medium">
                <span>100% editable — tap to edit any word</span>
                <span aria-label={`${draft.length} characters, ${draft.trim().split(/\s+/).filter(Boolean).length} words`}>
                  {draft.length} chars · {draft.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>

            {/* ─── Optional Closing Line Section ─── */}
            <div className="pt-2.5 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 tracking-tight">
                  How would you like to end your review?
                </label>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>

              {/* Closing suggestions & 'No closing line' */}
              <div
                className="flex flex-wrap gap-2 pt-0.5"
                role="group"
                aria-label="How would you like to end your review?"
              >
                {/* No closing line button */}
                <button
                  type="button"
                  onClick={() => handleSelectClosing("none")}
                  className={`min-h-[44px] sm:min-h-[40px] text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    selectedClosingId === "none"
                      ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-800"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                  aria-pressed={selectedClosingId === "none"}
                >
                  No closing line
                </button>

                {/* Suggestions */}
                {closingSuggestions.map((sug) => {
                  const isSelected = selectedClosingId === sug.id;
                  return (
                    <button
                      key={sug.id}
                      type="button"
                      onClick={() => handleSelectClosing(sug.id, sug.text)}
                      className={`min-h-[44px] sm:min-h-[40px] text-xs font-medium px-3.5 py-2 rounded-xl transition-all text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isSelected
                          ? "bg-blue-50 text-[#1D4ED8] font-semibold border-2 border-blue-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                      }`}
                      aria-pressed={isSelected}
                    >
                      {sug.text}
                    </button>
                  );
                })}
              </div>

              {/* Active Selection Info & Edit/Remove Controls */}
              {selectedClosingId !== "none" && appliedClosingText && (
                <div className="flex items-center justify-between text-xs bg-blue-50/70 border border-blue-200/70 rounded-xl px-3 py-2 text-slate-700">
                  <span className="truncate pr-2 text-slate-800">
                    <strong className="font-semibold text-blue-900">Ending added:</strong> &ldquo;{appliedClosingText}&rdquo;
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleFocusDraftEnd}
                      className="text-[#1D4ED8] font-semibold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                      title="Edit closing line in text"
                    >
                      Edit in text
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectClosing("none")}
                      className="text-slate-500 hover:text-red-600 font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
                      title="Remove closing line"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Feedback with aria-live and role */}
            {copyStatus === "copied" && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2"
              >
                <Icon name="CheckCircle2" size={16} className="text-emerald-700 shrink-0" />
                <span>Copied to clipboard! Ready to paste into Google Reviews.</span>
              </div>
            )}

            {copyStatus === "copied-fallback" && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-semibold flex items-center gap-2"
              >
                <Icon name="Check" size={16} className="text-blue-700 shrink-0" />
                <span>Text selected & copied!</span>
              </div>
            )}

            {copyStatus === "failed" && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs font-medium flex items-center gap-2"
              >
                <Icon name="AlertTriangle" size={16} className="text-amber-700 shrink-0" />
                <span>Could not copy automatically. Please select the text above to copy.</span>
              </div>
            )}

            {/* Popup Blocked Fallback */}
            {popupBlocked && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs space-y-1"
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Icon name="AlertTriangle" size={15} className="text-amber-700" />
                  <span>Browser blocked Google Reviews popup</span>
                </div>
                <p className="text-[11px] text-amber-900">
                  Your review draft is copied!{" "}
                  <button
                    type="button"
                    onClick={handleDirectLaunch}
                    className="underline font-bold text-amber-950 hover:text-black cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded"
                  >
                    Tap here to open Google Reviews directly
                  </button>
                  .
                </p>
              </div>
            )}

            {/* ── 3 Separate Actions (Requirement 6) ────────────────────────── */}
            <div className="space-y-2.5 pt-1">
              {/* Action 1: Copy & Open Google (Primary CTA, high contrast emerald) */}
              <button
                type="button"
                onClick={handleCopyAndLaunch}
                className="w-full min-h-[50px] py-3.5 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <Icon name="Copy" size={16} />
                <span>
                  {copyStatus === "copied"
                    ? "Copied! Opening Google..."
                    : "Copy Review & Open Google"}
                </span>
              </button>

              {/* Action 2 & 3: Copy Draft Only & Open Google Without Text */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                {/* Action 2: Copy Draft Only */}
                <button
                  type="button"
                  onClick={handleCopyOnly}
                  className="flex-1 min-h-[48px] py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <Icon name="Copy" size={14} />
                  <span>{copyStatus === "copied" ? "✓ Copied to Clipboard" : "Copy Draft Only"}</span>
                </button>

                {/* Action 3: Open Google Without Text */}
                <button
                  type="button"
                  onClick={handleDirectLaunch}
                  className="flex-1 min-h-[48px] py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <span>Open Google Without Text</span>
                  <Icon name="ExternalLink" size={14} />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-normal pt-1">
              Reviews are posted under your own Google account. NFCISTA does not store, modify, or auto-submit your review.
            </p>
          </section>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="text-center pt-6 text-[11px] text-slate-500 space-y-1">
          <div>Card Ref: {cardCode} · Verified Contactless Card</div>
          <div>Powered by NFCISTA Physical Contactless Smart Cards</div>
        </footer>
      </div>
    </main>
  );
}
