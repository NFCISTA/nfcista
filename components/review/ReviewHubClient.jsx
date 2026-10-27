"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { generateReview } from "@/lib/reviewGenerator";
import { getCategoryChips } from "@/lib/reviewChips";
import { canUseReviewAssistant } from "@/lib/reviewAssistant";

/**
 * ReviewHubClient — Executive tactile review flow.
 *
 * 3-Step Guided Utility:
 * 1. Rate Experience (1–5 tactile star selection)
 * 2. Select Keywords & Details (chips, sentiment, or freeform note)
 * 3. Generate Draft & Post (1-click copy, direct Google Review launch)
 *
 * 100% client-side review generator execution. No external AI APIs.
 */
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
  const [mode, setMode] = useState("assistant"); // "assistant" | "quick" | "custom"
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
      setValidationError("Please select at least one detail or keyword about your experience.");
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
      // Fallback: focus and select textarea for manual copy
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
    ? businessName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NC";

  return (
    <main className="min-h-screen bg-canvas py-8 px-4 sm:px-6 flex flex-col justify-between antialiased text-text-primary">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={`/p/${customer.profile_slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary bg-surface-base border border-border-hairline px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
          >
            <Icon name="arrow_back" size={13} strokeWidth={2} />
            <span>Digital Card</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-text-muted uppercase">
            <Icon name="nfc" size={12} strokeWidth={2} className="text-accent-primary" />
            <span>NFCISTA Reviews</span>
          </div>
        </div>

        {/* Business Header Card */}
        <div className="bg-surface-base rounded-xl p-5 border border-border-hairline shadow-card text-center space-y-3">
          <div className="flex justify-center">
            {customer.photo_url ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-border-hairline shadow-2xs relative">
                <Image
                  src={customer.photo_url}
                  alt={businessName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl border border-border-hairline shadow-2xs">
                {initials}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              {businessName}
            </h1>
            {customer.category && (
              <p className="text-xs text-text-secondary font-medium mt-0.5">{customer.category}</p>
            )}
          </div>

          <p className="text-xs text-text-secondary">
            Share your feedback for <span className="font-semibold text-text-primary">{businessName}</span>
          </p>

          {customer.description && (
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              {customer.description}
            </p>
          )}

          {/* Missing Google Review URL Notice */}
          {!hasGoogleUrl && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 text-left space-y-1">
              <span className="font-bold block">
                Google Review link not configured yet.
              </span>
              <p className="text-amber-800">
                Please contact the business owner to add their Google Review link in their NFCISTA dashboard.
              </p>
            </div>
          )}

          {/* Direct Google Review Button (Always accessible for all rating levels) */}
          {hasGoogleUrl && (
            <div className="pt-1">
              <a
                href={customer.google_review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-btn-primary transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 text-xs"
              >
                <Icon name="star" size={15} strokeWidth={2} />
                <span>Write a Google Review Directly</span>
              </a>
            </div>
          )}
        </div>

        {/* REVIEW ASSISTANT WORKFLOW (Rendered when assistant enabled and Google URL configured) */}
        {assistantEnabled && hasGoogleUrl && (
          <div className="bg-surface-base rounded-xl p-5 border border-border-hairline shadow-card space-y-5">
            {/* Transparency Disclaimer */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-primary">
                <Icon name="star" size={13} strokeWidth={2} />
                <span>Review Helper</span>
              </div>
              <p className="text-text-secondary leading-relaxed text-[11px]">
                Your review should reflect your authentic experience. This tool helps structure your thoughts clearly before submitting on Google.
              </p>
            </div>

            {/* ── STEP 01: Rating Selection ─────────────────────────────── */}
            <div className="space-y-2 text-center pt-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-subtle border border-border-hairline rounded-md text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Step 01
              </div>
              <label className="text-xs font-bold text-text-primary block">
                How was your experience?
              </label>
              <div className="flex items-center justify-center gap-2 pt-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isSelected = rating !== null && starValue <= rating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      className={`min-w-[44px] min-h-[44px] p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                        isSelected ? "text-amber-500 scale-105" : "text-slate-300 hover:text-slate-400"
                      }`}
                      aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                      aria-pressed={rating === starValue}
                    >
                      <Icon name="star" size={26} strokeWidth={isSelected ? 2 : 1.5} />
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-text-muted">
                {rating ? `${rating} star${rating > 1 ? "s" : ""} selected` : "Select 1 to 5 stars"}
              </p>
            </div>

            {/* Direct Contact for 1–2 Star Experiences */}
            {rating && rating <= 2 && (customer.whatsapp || customer.phone) && (
              <div className="p-3.5 bg-surface-subtle border border-border-hairline rounded-lg text-xs space-y-2 text-text-secondary">
                <div className="flex items-center gap-1.5 font-bold text-text-primary">
                  <Icon name="info" size={14} strokeWidth={2} className="text-amber-600" />
                  <span>Can we help resolve anything directly?</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  We appreciate your honest feedback. You can reach out directly to resolve any issue, or continue below to write and post your review on Google.
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {customer.whatsapp && (
                    <a
                      href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Icon name="chat" size={12} strokeWidth={2} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone.replace(/[^0-9+]/g, "")}`}
                      className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Icon name="call" size={12} strokeWidth={2} />
                      <span>Call Directly</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 02: Details & Keywords ───────────────────────────── */}
            <div className="space-y-3 pt-3 border-t border-border-hairline">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-subtle border border-border-hairline rounded-md text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Step 02
                </div>
                {/* Language Toggle */}
                {mode !== "custom" && (
                  <div className="inline-flex rounded-lg bg-surface-subtle p-0.5 text-xs font-semibold border border-border-hairline">
                    <button
                      type="button"
                      onClick={() => setLang("en")}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        lang === "en" ? "bg-surface-base text-text-primary font-bold shadow-2xs" : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang("hi")}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        lang === "hi" ? "bg-surface-base text-text-primary font-bold shadow-2xs" : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      Hinglish
                    </button>
                  </div>
                )}
              </div>

              {/* Mode Segmented Controls */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-surface-subtle rounded-lg border border-border-hairline text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode("assistant");
                    setValidationError("");
                  }}
                  className={`py-1.5 px-2 rounded-md transition-all cursor-pointer ${
                    mode === "assistant" ? "bg-surface-base text-text-primary shadow-2xs" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Assistant
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("quick");
                    setValidationError("");
                  }}
                  className={`py-1.5 px-2 rounded-md transition-all cursor-pointer ${
                    mode === "quick" ? "bg-surface-base text-text-primary shadow-2xs" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Quick
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("custom");
                    setValidationError("");
                  }}
                  className={`py-1.5 px-2 rounded-md transition-all cursor-pointer ${
                    mode === "custom" ? "bg-surface-base text-text-primary shadow-2xs" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Write My Own
                </button>
              </div>

              {/* MODE: ASSISTANT WITH CHIPS */}
              {mode === "assistant" && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-text-primary block">
                        What stood out about your visit?
                      </label>
                      <span className="text-[10px] text-text-muted">
                        {industry !== "generic" ? `${industry} details` : "tap to select"}
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                              isSelected
                                ? isNegative
                                  ? "bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-2xs"
                                  : "bg-blue-50 border-accent-primary text-accent-primary font-bold shadow-2xs"
                                : isNegative
                                ? "bg-surface-base border-border-hairline text-text-secondary hover:border-rose-300 hover:text-rose-600"
                                : "bg-surface-base border-border-hairline text-text-secondary hover:bg-surface-subtle hover:border-border-strong"
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
                    <label htmlFor="product" className="font-semibold text-text-primary block mb-1">
                      Product or service used (optional):
                    </label>
                    <input
                      id="product"
                      type="text"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      placeholder="e.g. Haircut, Consultation, Sneakers, Dinner..."
                      maxLength={150}
                      className="w-full px-3 py-2 rounded-lg border border-border-hairline bg-surface-base text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
                    />
                  </div>

                  {/* Optional Short Note */}
                  <div>
                    <label htmlFor="note" className="font-semibold text-text-primary block mb-1">
                      Specific comment in your words (optional):
                    </label>
                    <textarea
                      id="note"
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Loved the friendly team and fast service..."
                      maxLength={400}
                      className="w-full px-3 py-2 rounded-lg border border-border-hairline bg-surface-base text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary resize-none"
                    />
                  </div>

                  {/* Optional Recommendation Choice */}
                  <div>
                    <label className="font-semibold text-text-primary block mb-1.5">
                      Would you recommend this business?
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
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-xs ${
                            recommend === opt.key
                              ? "border-accent-primary bg-blue-50 text-accent-primary font-bold shadow-2xs"
                              : "border-border-hairline bg-surface-base text-text-secondary hover:bg-surface-subtle"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE: QUICK REVIEW */}
              {mode === "quick" && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-text-primary block">
                    Overall feeling:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {["Great", "Good", "Average", "Needs improvement"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSentiment(opt === sentiment ? "" : opt)}
                        className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                          sentiment === opt
                            ? "border-accent-primary bg-blue-50 text-accent-primary font-bold shadow-2xs"
                            : "border-border-hairline bg-surface-base text-text-secondary hover:bg-surface-subtle"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label htmlFor="quickNotes" className="text-xs font-medium text-text-secondary block mb-1">
                      Any specific comment? (optional)
                    </label>
                    <input
                      id="quickNotes"
                      type="text"
                      value={quickNotes}
                      onChange={(e) => setQuickNotes(e.target.value)}
                      placeholder="e.g. quick delivery, very polite staff..."
                      maxLength={300}
                      className="w-full px-3 py-2 rounded-lg border border-border-hairline bg-surface-base text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                </div>
              )}

              {/* MODE: WRITE MY OWN */}
              {mode === "custom" && (
                <div className="space-y-2 text-xs">
                  <label htmlFor="customText" className="font-semibold text-text-primary block">
                    Write your review directly:
                  </label>
                  <textarea
                    id="customText"
                    rows={4}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your authentic review here. You can copy it directly to Google Reviews below."
                    maxLength={1500}
                    className="w-full p-3 rounded-lg border border-border-hairline bg-surface-base text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary leading-relaxed"
                  />
                </div>
              )}

              {/* Validation / Error Message */}
              {validationError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {validationError}
                </div>
              )}

              {/* Action Button: Generate Review */}
              {mode !== "custom" && (
                <div>
                  <button
                    type="button"
                    onClick={() => handleGenerate()}
                    className="w-full min-h-[44px] py-2.5 px-4 bg-accent-primary hover:bg-accent-hover text-white font-semibold rounded-lg shadow-btn-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer select-none"
                  >
                    <Icon name="star" size={14} strokeWidth={2} />
                    <span>Generate Review Draft</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── STEP 03: Review Draft Editor & Post ─────────────────── */}
            {draft && (
              <div className="space-y-3 pt-3 border-t border-border-hairline">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-subtle border border-border-hairline rounded-md text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Step 03
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-text-muted bg-surface-subtle px-2 py-0.5 rounded-md border border-border-hairline">
                      {wordCount} {wordCount === 1 ? "word" : "words"}
                    </span>
                    {mode !== "custom" && (
                      <button
                        type="button"
                        onClick={handleRegenerate}
                        className="text-[11px] font-semibold text-accent-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <Icon name="refresh" size={11} strokeWidth={2} />
                        <span>Regenerate</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="draftTextarea"
                  ref={textareaRef}
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={1500}
                  className="w-full p-3 rounded-lg border border-border-hairline bg-surface-base text-xs text-text-primary focus:outline-none focus:border-accent-primary leading-relaxed"
                />

                {/* Copy Status Feedback */}
                {copyStatus === "copied" && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                    Review text copied! Now open Google Reviews and paste it into the review box.
                  </div>
                )}
                {copyStatus === "fallback" && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
                    Press and hold inside the text box to copy manually.
                  </div>
                )}
                {googleOpened && (
                  <div className="p-2.5 bg-surface-subtle border border-border-hairline rounded-lg text-[11px] text-text-secondary">
                    Google Review opened in a new tab. Paste your copied review and tap submit on Google.
                  </div>
                )}

                {/* Copy Review & Open Google Review Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="min-h-[44px] py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer select-none"
                  >
                    <Icon name="copy" size={14} strokeWidth={2} />
                    <span>Copy Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenGoogle}
                    className={`min-h-[44px] py-2.5 px-4 rounded-lg shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer font-semibold select-none ${
                      copyStatus === "copied"
                        ? "bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-400 ring-offset-2"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }`}
                  >
                    <Icon name="star" size={14} strokeWidth={2} />
                    <span>Open Google Review</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Minimal Footer */}
        <div className="text-center pt-2 pb-6">
          <p className="text-[11px] text-text-muted">
            Powered by{" "}
            <Link href="/" className="font-semibold text-text-secondary hover:text-text-primary transition-colors">
              NFCISTA
            </Link>{" "}
            • Contactless Review Technology
          </p>
        </div>
      </div>
    </main>
  );
}