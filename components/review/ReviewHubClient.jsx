"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ProfileIcon from "@/components/profile/ProfileIcon";

export default function ReviewHubClient({ customer }) {
  const businessName = customer.company_name?.trim() || customer.full_name?.trim() || "Business";
  const hasGoogleUrl = Boolean(customer.google_review_url?.trim());
  const aiEnabled = Boolean(customer.review_assistant_enabled);

  // State
  const [rating, setRating] = useState(null); // No default 5-stars
  const [mode, setMode] = useState("quick"); // "quick" | "assistant" | "custom"

  // Quick mode fields
  const [sentiment, setSentiment] = useState("");
  const [quickNotes, setQuickNotes] = useState("");

  // Assistant mode fields
  const [experience, setExperience] = useState("");
  const [highlight, setHighlight] = useState("");
  const [serviceUsed, setServiceUsed] = useState("");
  const [staff, setStaff] = useState("");
  const [recommend, setRecommend] = useState("");
  const [freeform, setFreeform] = useState("");

  // Custom / Draft editor
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState("");
  const [copyStatus, setCopyStatus] = useState(""); // "" | "copied" | "fallback"
  const [googleOpened, setGoogleOpened] = useState(false);

  const textareaRef = useRef(null);

  // Handle AI generation call
  async function handleGenerate(e) {
    if (e) e.preventDefault();
    setApiError("");
    setCopyStatus("");
    setGoogleOpened(false);

    if (!rating) {
      setApiError("Please select a star rating between 1 and 5.");
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        profile_slug: customer.profile_slug,
        rating,
        mode,
        sentiment,
        quick_notes: quickNotes,
        experience,
        highlight,
        service_used: serviceUsed,
        staff,
        recommend,
        freeform,
      };

      const res = await fetch("/api/review-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Failed to generate draft. Please try again.");
      } else if (data.draft) {
        setDraft(data.draft);
      }
    } catch {
      setApiError("A network error occurred. Please try again or write your review directly.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Handle Clipboard Copy
  async function handleCopy() {
    if (!draft.trim()) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(draft.trim());
        setCopyStatus("copied");
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch {
      // Fallback: select text in textarea for manual copy
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
      setCopyStatus("fallback");
    }
  }

  // Handle Open Google Review
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

          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            Thank you for visiting! We value your genuine feedback on Google Reviews.
          </p>

          {/* Missing Google Review URL Notice */}
          {!hasGoogleUrl && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-left space-y-1">
              <span className="font-bold block">Google Review link is not configured yet</span>
              <p className="text-amber-700">
                Please contact the business owner to update their Google Review link in their NFCISTA dashboard.
              </p>
            </div>
          )}

          {/* Direct Write a Google Review Button (Always accessible if URL present) */}
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

        {/* AI REVIEW ASSISTANT SECTION (Only rendered when review_assistant_enabled is TRUE) */}
        {aiEnabled && hasGoogleUrl && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            {/* AI Disclaimer & Transparency Banner */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                <span className="material-symbols-outlined text-[16px] text-indigo-600">auto_awesome</span>
                <span>AI Review Assistant</span>
              </div>
              <p className="text-indigo-800/90 leading-relaxed text-[11px]">
                Your review should reflect your real experience. AI only helps turn your own thoughts into a clear review.
              </p>
            </div>

            {/* Independent Star Rating Selector (No default rating) */}
            <div className="space-y-1.5 text-center">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                How would you rate your experience? <span className="text-rose-500">*</span>
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
                {rating ? `${rating} star${rating > 1 ? "s" : ""} selected` : "Select 1 to 5 stars"}
              </p>
            </div>

            {/* Review Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode("quick")}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer ${
                  mode === "quick" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Quick Review
              </button>
              <button
                type="button"
                onClick={() => setMode("assistant")}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer ${
                  mode === "assistant" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                AI Assistant
              </button>
              <button
                type="button"
                onClick={() => setMode("custom")}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer ${
                  mode === "custom" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Write My Own
              </button>
            </div>

            {/* MODE 1: QUICK REVIEW */}
            {mode === "quick" && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Overall feeling:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["Great", "Good", "Average", "Needs Improvement"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSentiment(opt)}
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
                    placeholder="e.g. fast turnaround, friendly staff, clean ambiance..."
                    maxLength={300}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* MODE 2: AI REVIEW ASSISTANT */}
            {mode === "assistant" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label htmlFor="experience" className="font-semibold text-slate-700 block mb-1">
                    How was your overall experience?
                  </label>
                  <input
                    id="experience"
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. very smooth and pleasant..."
                    maxLength={300}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="highlight" className="font-semibold text-slate-700 block mb-1">
                    What did you like or what stood out?
                  </label>
                  <input
                    id="highlight"
                    type="text"
                    value={highlight}
                    onChange={(e) => setHighlight(e.target.value)}
                    placeholder="e.g. attention to detail, quality of work..."
                    maxLength={300}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="serviceUsed" className="font-semibold text-slate-700 block mb-1">
                      Product or service used:
                    </label>
                    <input
                      id="serviceUsed"
                      type="text"
                      value={serviceUsed}
                      onChange={(e) => setServiceUsed(e.target.value)}
                      placeholder="e.g. consulting, haircut..."
                      maxLength={150}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="staff" className="font-semibold text-slate-700 block mb-1">
                      Staff / customer service:
                    </label>
                    <input
                      id="staff"
                      type="text"
                      value={staff}
                      onChange={(e) => setStaff(e.target.value)}
                      placeholder="e.g. polite and helpful..."
                      maxLength={150}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="freeform" className="font-semibold text-slate-700 block mb-1">
                    Anything else in your own words? (optional)
                  </label>
                  <textarea
                    id="freeform"
                    rows={2}
                    value={freeform}
                    onChange={(e) => setFreeform(e.target.value)}
                    placeholder="Add any additional genuine feedback..."
                    maxLength={500}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            )}

            {/* MODE 3: WRITE MY OWN */}
            {mode === "custom" && (
              <div className="space-y-2 text-xs">
                <label htmlFor="customText" className="font-semibold text-slate-700 block">
                  Write your review directly (no AI required):
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

            {/* Error Display */}
            {apiError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {apiError}
              </div>
            )}

            {/* Generate Action Button (Modes 1 and 2) */}
            {mode !== "custom" && (
              <div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3 px-4 bg-primary hover:bg-[#003ea8] text-white font-semibold rounded-2xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Drafting your review...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      <span>Help Me Write My Review</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* REVIEW EDITOR & COPY SECTION (Visible when draft is populated) */}
            {draft && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label htmlFor="draftTextarea" className="text-xs font-bold text-slate-800">
                    Your Review Draft (editable):
                  </label>
                  {mode !== "custom" && (
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
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
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                    Review copied! Now open Google Reviews and paste it.
                  </div>
                )}
                {copyStatus === "fallback" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                    📋 Text selected! Long-press or press Ctrl+C to copy, then open Google Reviews.
                  </div>
                )}
                {googleOpened && (
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                    ℹ️ Google Review Opened in a new tab. Paste your copied review and submit on Google.
                  </div>
                )}

                {/* Copy & Open Google Action Buttons */}
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
                    className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer"
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
