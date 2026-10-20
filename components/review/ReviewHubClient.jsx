"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import ProfileIcon from "@/components/profile/ProfileIcon";
import { generateReview } from "@/lib/reviewGenerator";
import { getCategoryChips } from "@/lib/reviewChips";
import { canUseReviewAssistant } from "@/lib/reviewAssistant";

export default function ReviewHubClient({ customer }) {
  const businessName = customer.company_name?.trim() || customer.full_name?.trim() || "Business";
  const hasGoogleUrl = Boolean(customer.google_review_url?.trim());
  const assistantEnabled = canUseReviewAssistant(customer);

  // Industry chips based on business category
  const { industry, chips: categoryChips } = useMemo(
    () => getCategoryChips(customer.category),
    [customer.category]
  );

  // ── State ───────────────────────────────────────────────────────────────
  const [rating, setRating] = useState(null); // Must start unselected (null)
  const [mode, setMode] = useState("assistant"); // "quick" | "assistant" | "custom"
  const [lang, setLang] = useState("en"); // "en" | "hi"

  // Quick Review state
  const [sentiment, setSentiment] = useState("");
  const [quickNotes, setQuickNotes] = useState("");

  // Assistant state
  const [selectedChipIds, setSelectedChipIds] = useState([]);
  const [product, setProduct] = useState("");
  const [note, setNote] = useState("");
  const [recommend, setRecommend] = useState("");

  // Draft & feedback state
  const [draft, setDraft] = useState("");
  const [validationError, setValidationError] = useState("");
  const [copyStatus, setCopyStatus] = useState(""); // "" | "copied" | "fallback"
  const [googleOpened, setGoogleOpened] = useState(false);

  const textareaRef = useRef(null);

  // ── Word Count ──────────────────────────────────────────────────────────
  const wordCount = useMemo(() => {
    if (!draft || !draft.trim()) return 0;
    return draft.trim().split(/\s+/).filter(Boolean).length;
  }, [draft]);

  // ── Chip Toggle ─────────────────────────────────────────────────────────
  function toggleChip(chipId) {
    setSelectedChipIds((prev) =>
      prev.includes(chipId) ? prev.filter((id) => id !== chipId) : [...prev, chipId]
    );
    setValidationError("");
  }

  // ── Generate Review (100% Local Browser Execution) ──────────────────────
  function handleGenerate(customSeed = null) {
    setValidationError("");
    setCopyStatus("");
    setGoogleOpened(false);

    const seed = customSeed !== null ? customSeed : Date.now();

    let generated = null;

    if (mode === "quick") {
      // Map quick review inputs
      const combinedNotes = [
        sentiment ? `Overall feeling: ${sentiment}` : "",
        quickNotes.trim(),
      ]
        .filter(Boolean)
        .join(". ");

      generated = generateReview({
        rating,
        chipIds: [],
        product: "",
        note: combinedNotes,
        recommend: "",
        lang,
        seed,
      });
    } else if (mode === "assistant") {
      generated = generateReview({
        rating,
        chipIds: selectedChipIds,
        product: product.trim(),
        note: note.trim(),
        recommend,
        lang,
        seed,
      });
    }

    if (!generated) {
      setValidationError("Add at least one detail about your experience.");
      return;
    }

    setDraft(generated);
  }

  // ── Regenerate ──────────────────────────────────────────────────────────
  function handleRegenerate() {
    handleGenerate(Date.now());
  }

  // ── Clipboard Copy Flow ─────────────────────────────────────────────────
  async function handleCopy() {
    if (!draft || !draft.trim()) return;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(draft.trim());
        setCopyStatus("copied");
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      // Fallback: focus and select textarea for manual long-press/Ctrl+C
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
      setCopyStatus("fallback");
    }
  }

  // ── Open Google Review ──────────────────────────────────────────────────
  function handleOpenGoogle() {
    if (!customer.google_review_url) return;
    window.open(customer.google_review_url, "_blank", "noopener,noreferrer");
    setGoogleOpened(true);
  }

  const initials = businessName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 flex flex-col justify-between antialiased">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={`/p/${customer.profile_slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs transition-colors"
          >
            <ProfileIcon name="arrow_forward" className="text-[14px] rotate-180" aria-hidden={true} />
            <span>Digital Card</span>
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            NFCISTA Reviews
          </span>
        </div>

        {/* Business Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center space-y-3">
          <div className="flex justify-center">
            {customer.photo_url ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 shadow-2xs relative">
                <Image
                  src={customer.photo_url}
                  alt={businessName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20">
                {initials}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {businessName}
            </h1>
            {customer.category && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">{customer.category}</p>
            )}
          </div>

          <p className="text-xs font-medium text-slate-700">
            Share your experience with {businessName}
          </p>

          {customer.description && (
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {customer.description}
            </p>
          )}

          {/* Missing Google Review URL Notice */}
          {!hasGoogleUrl && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-left space-y-1">
              <span className="font-bold block">
                Google Review link hasn&apos;t been configured for this business yet.
              </span>
              <p className="text-amber-700">
                Please contact the business owner to add their Google Review link in their NFCISTA dashboard.
              </p>
            </div>
          )}

          {/* Direct Google Review Button (Always accessible for all rating levels) */}
          {hasGoogleUrl && (
            <div className="pt-2">
              <a
                href={customer.google_review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 text-sm"
              >
                <ProfileIcon name="star" className="text-[18px]" aria-hidden={true} />
                <span>Write a Google Review Directly</span>
              </a>
            </div>
          )}
        </div>

        {/* REVIEW ASSISTANT SECTION (Only rendered when assistant is enabled and Google URL is present) */}
        {assistantEnabled && hasGoogleUrl && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            {/* Mandatory Transparency Disclaimer */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                <span className="material-symbols-outlined text-[16px] text-indigo-600">auto_awesome</span>
                <span>Review Assistant</span>
              </div>
              <p className="text-indigo-800/90 leading-relaxed text-[11px]">
                Your review should reflect your real experience. This tool only helps you turn your own thoughts into a clear review.
              </p>
            </div>

            {/* Independent Star Rating Selector (No default 5 stars) */}
            <div className="space-y-1.5 text-center">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                How would you rate your experience?
              </label>
              <div className="flex items-center justify-center gap-2 pt-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isSelected = rating !== null && starValue <= rating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                        isSelected ? "text-amber-500 scale-110" : "text-slate-300 hover:text-slate-400"
                      }`}
                      aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                    >
                      <ProfileIcon name="star" className="text-[28px]" aria-hidden={true} />
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500">
                {rating ? `${rating} star${rating > 1 ? "s" : ""} selected` : "Select 1 to 5 stars (optional)"}
              </p>
            </div>

            {/* Optional Direct Contact Assistance for 1–2 Star Experiences (Additive only, Google Review remains fully available) */}
            {rating && rating <= 2 && (customer.whatsapp || customer.phone) && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">contact_support</span>
                  <span>Need immediate help or want to speak with us directly?</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  We appreciate your honest feedback. You can reach out directly to help us resolve any issue immediately, or continue below to write and post your review on Google.
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {customer.whatsapp && (
                    <a
                      href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <ProfileIcon name="whatsapp" className="text-[14px]" aria-hidden={true} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone.replace(/[^0-9+]/g, "")}`}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <ProfileIcon name="phone" className="text-[14px]" aria-hidden={true} />
                      <span>Call Directly</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Review Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode("quick");
                  setValidationError("");
                }}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer ${
                  mode === "quick" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Quick Review
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("assistant");
                  setValidationError("");
                }}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer ${
                  mode === "assistant" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Assistant
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("custom");
                  setValidationError("");
                }}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer ${
                  mode === "custom" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Write My Own
              </button>
            </div>

            {/* Language Toggle for Assistant & Quick Modes */}
            {mode !== "custom" && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-700">Language:</span>
                <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setLang("en")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      lang === "en" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("hi")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      lang === "hi" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Hinglish
                  </button>
                </div>
              </div>
            )}

            {/* ── MODE 1: QUICK REVIEW ───────────────────────────────── */}
            {mode === "quick" && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Overall feeling:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["Great", "Good", "Average", "Needs improvement"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSentiment(opt === sentiment ? "" : opt)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        sentiment === opt
                          ? "border-primary bg-primary/5 text-primary font-bold shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div>
                  <label htmlFor="quickNotes" className="text-xs font-medium text-slate-600 block mb-1">
                    Any specific details you want to add? (optional)
                  </label>
                  <input
                    id="quickNotes"
                    type="text"
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    placeholder="e.g. fast turnaround, polite staff, clean ambiance..."
                    maxLength={300}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* ── MODE 2: ASSISTANT WITH CHIPS ────────────────────────── */}
            {mode === "assistant" && (
              <div className="space-y-4 text-xs">
                {/* Category Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 block">
                      Choose details that describe your visit:
                    </label>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {industry !== "generic" ? `${industry} chips` : "popular chips"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {categoryChips.map((chip) => {
                      const isSelected = selectedChipIds.includes(chip.id);
                      const isNegative = chip.sentiment === "negative";

                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => toggleChip(chip.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                            isSelected
                              ? isNegative
                                ? "bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-2xs"
                                : "bg-primary/10 border-primary text-primary font-bold shadow-2xs"
                              : isNegative
                              ? "bg-white border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          {isSelected ? "✓ " : ""}
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Product / Service */}
                <div>
                  <label htmlFor="product" className="font-semibold text-slate-700 block mb-1">
                    Product or service used (optional):
                  </label>
                  <input
                    id="product"
                    type="text"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g. Haircut, Dinner, Dental cleaning, Sneakers..."
                    maxLength={150}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Optional Short Note */}
                <div>
                  <label htmlFor="note" className="font-semibold text-slate-700 block mb-1">
                    Short note in your own words (optional):
                  </label>
                  <textarea
                    id="note"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Loved the attention to detail and ambiance..."
                    maxLength={400}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                {/* Optional Recommendation Choice */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Would you recommend this business? (optional)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "yes", label: "Yes, definitely" },
                      { key: "maybe", label: "Not sure" },
                      { key: "no", label: "No" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setRecommend(recommend === opt.key ? "" : opt.key)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                          recommend === opt.key
                            ? "border-primary bg-primary/5 text-primary font-bold shadow-2xs"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── MODE 3: WRITE MY OWN ───────────────────────────────── */}
            {mode === "custom" && (
              <div className="space-y-2 text-xs">
                <label htmlFor="customText" className="font-semibold text-slate-700 block">
                  Write your review directly:
                </label>
                <textarea
                  id="customText"
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your authentic review here. You can copy it directly to Google Reviews below."
                  maxLength={1500}
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>
            )}

            {/* Validation / Error Message */}
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {validationError}
              </div>
            )}

            {/* Action Button: Create My Review (for Quick and Assistant modes) */}
            {mode !== "custom" && (
              <div>
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  className="w-full py-3 px-4 bg-primary hover:bg-[#003ea8] text-white font-semibold rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Create My Review</span>
                </button>
              </div>
            )}

            {/* ── REVIEW DRAFT EDITOR & COPY SECTION ─────────────────── */}
            {draft && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label htmlFor="draftTextarea" className="text-xs font-bold text-slate-800">
                      Your Review Draft (editable):
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {wordCount} {wordCount === 1 ? "word" : "words"}
                    </span>
                  </div>

                  {mode !== "custom" && (
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">refresh</span>
                      <span>Regenerate</span>
                    </button>
                  )}
                </div>

                <textarea
                  id="draftTextarea"
                  ref={textareaRef}
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={1500}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                />

                {/* Copy Status Feedback */}
                {copyStatus === "copied" && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium animate-fadeIn">
                    Review copied! Now open Google Reviews and paste it.
                  </div>
                )}
                {copyStatus === "fallback" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium animate-fadeIn">
                    Press and hold to copy manually.
                  </div>
                )}
                {googleOpened && (
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                    ℹ️ Google Review Opened in a new tab. Paste your copied review and submit on Google.
                  </div>
                )}

                {/* Copy Review & Open Google Review Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    <span>Copy Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenGoogle}
                    className={`py-3 px-4 rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer font-semibold ${
                      copyStatus === "copied"
                        ? "bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-400 ring-offset-2"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }`}
                  >
                    <ProfileIcon name="star" className="text-[16px]" aria-hidden={true} />
                    <span>Open Google Review</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2 pb-6">
          <p className="text-[11px] text-slate-400">
            Powered by{" "}
            <Link href="/" className="font-semibold text-slate-600 hover:underline">
              NFCISTA
            </Link>{" "}
            • Smart Contactless Review Cards
          </p>
        </div>
      </div>
    </main>
  );
}
