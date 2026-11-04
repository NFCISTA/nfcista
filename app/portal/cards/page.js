"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePortal } from "../layout";
import { supabase } from "@/lib/supabaseClient";

export default function MyNfcCardsPage() {
  const { customer, loading: portalLoading } = usePortal();
  const [cardsData, setCardsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/customer/cards", { headers });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error || "Failed to load assigned NFC cards.");
        setCardsData(null);
        return;
      }

      setCardsData(json);
    } catch {
      setError("Network error while loading your NFC cards. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!portalLoading) {
      fetchCards();
    }
  }, [portalLoading, fetchCards]);

  function handleCopyCardCode(code) {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 2000);
    });
  }

  if (portalLoading || (loading && !cardsData)) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center space-y-3 shadow-card">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-body-sm text-on-surface-variant font-medium">Loading your assigned NFC cards...</p>
      </div>
    );
  }

  if (error && !cardsData) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-card max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-error flex items-center justify-center mx-auto border border-red-200">
          <span className="material-symbols-outlined text-[32px]">error</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-on-surface">Unable to Load Cards</h2>
          <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
            {error}
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={fetchCards}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const reviewCards = cardsData?.review_cards || [];
  const profileSlug = cardsData?.profile_slug || customer?.profile_slug;
  const publicProfileUrl = typeof window !== "undefined" && profileSlug
    ? `${window.location.origin}/p/${profileSlug}`
    : `/p/${profileSlug || ""}`;

  return (
    <div className="space-y-8">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">
              My NFC Cards
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {reviewCards.length + (profileSlug ? 1 : 0)} Connected
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Physical NFC cards, smart touchpoints, and digital profiles assigned to your business.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCards}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-semibold transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">refresh</span>
          <span>Refresh Cards</span>
        </button>
      </div>

      {/* ── SECTION 1: Review Assistant NFC Cards ─────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20">
              <span className="material-symbols-outlined text-[18px]">rate_review</span>
            </span>
            <div>
              <h2 className="text-base font-bold text-on-surface">
                Review Assistant NFC Cards
              </h2>
              <p className="text-xs text-on-surface-variant">
                Smart tap cards configured with your verified Google Review destination.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-on-surface-variant">
            {reviewCards.length} {reviewCards.length === 1 ? "Card" : "Cards"}
          </span>
        </div>

        {reviewCards.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center space-y-3 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-low text-outline flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[24px]">credit_card_off</span>
            </div>
            <h3 className="text-label-lg font-bold text-on-surface">
              No Review Cards Assigned Yet
            </h3>
            <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
              Your business does not have an active Review Assistant NFC card assigned yet. When your physical cards are programmed and dispatched, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviewCards.map((card) => (
              <div
                key={card.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-6 shadow-card space-y-4 hover:border-outline-variant/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Code & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">contactless</span>
                        <span>{card.card_code}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCardCode(card.card_code)}
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        title="Copy Card Code"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {copiedCode === card.card_code ? "check" : "content_copy"}
                        </span>
                      </button>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                        card.is_active
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          card.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`}
                      />
                      <span>{card.is_active ? "Card Active" : "Inactive"}</span>
                    </span>
                  </div>

                  {/* Business Name & Category */}
                  <div>
                    <h3 className="text-base font-bold text-on-surface truncate">
                      {card.business_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-on-surface-variant px-2 py-0.5 rounded bg-surface-container-low capitalize">
                        {card.category?.replace(/_/g, " ") || "Retail"}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Review Assistant Card
                      </span>
                    </div>
                  </div>

                  {/* Destination Information */}
                  <div className="p-3 rounded-2xl bg-surface-container-low/50 border border-outline-variant/15 space-y-1.5 text-xs">
                    <div className="text-[10px] uppercase font-bold text-on-surface-variant">
                      Google Review Destination
                    </div>
                    {card.google_review_url ? (
                      <a
                        href={card.google_review_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-medium hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{card.google_review_url}</span>
                        <span className="material-symbols-outlined text-[14px] shrink-0">open_in_new</span>
                      </a>
                    ) : (
                      <span className="text-on-surface-variant/60 italic">No destination set</span>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                  <Link
                    href={`/review/c/${card.card_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low text-on-surface text-xs font-semibold transition-all shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-600">visibility</span>
                    <span>Preview Review Flow</span>
                  </Link>

                  <Link
                    href={`/r/${card.card_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">sensors</span>
                    <span>Test Tap URL</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 2: Digital Business Profile Card ──────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center border border-blue-500/20">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </span>
            <div>
              <h2 className="text-base font-bold text-on-surface">
                Digital Business Profile Card
              </h2>
              <p className="text-xs text-on-surface-variant">
                Your primary digital business profile card accessible via NFC and direct link.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-on-surface-variant">
            {profileSlug ? "1 Profile Linked" : "0 Profiles"}
          </span>
        </div>

        {profileSlug ? (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                    /p/{profileSlug}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Digital Profile Active</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-on-surface pt-1">
                  {customer?.full_name || "Digital Card"}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {[customer?.job_title, customer?.company_name].filter(Boolean).join(" • ") || "NFC Digital Profile"}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href={publicProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary/90 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>Open Public Card</span>
                </a>
              </div>
            </div>

            {/* Concierge Programming Note */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
              <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0 mt-0.5">info</span>
              <p className="leading-relaxed text-[11px]">
                <strong>Hardware Pairing Notice:</strong> Physical dynamic NFC business cards are paired by the NFCISTA concierge during hardware encoding. Your public card link above is always active and live.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center space-y-3 shadow-card">
            <p className="text-body-sm text-on-surface-variant">
              No digital business profile slug found for your account. Please contact NFCISTA support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
