"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePortal } from "./layout";

export default function ClientPortalOverviewPage() {
  const { customer, loading, error } = usePortal();
  const [copied, setCopied] = useState(false);
  const [copiedReviewUrl, setCopiedReviewUrl] = useState(false);

  function handleCopyLink() {
    if (!customer?.profile_slug) return;
    const url = `${window.location.origin}/p/${customer.profile_slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleCopyReviewUrl() {
    if (!customer?.google_review_url) return;
    navigator.clipboard.writeText(customer.google_review_url).then(() => {
      setCopiedReviewUrl(true);
      setTimeout(() => setCopiedReviewUrl(false), 2500);
    });
  }

  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center space-y-3 shadow-card">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-body-sm text-on-surface-variant font-medium">Loading your Client Portal...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-card max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <span className="material-symbols-outlined text-[32px]">person_off</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-on-surface">No Profile Linked Yet</h2>
          <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
            {error || "Your account has been authenticated, but your business profile has not been assigned by NFCISTA concierge yet."}
          </p>
        </div>
        <div className="pt-2 text-xs text-on-surface-variant">
          Need assistance? Please contact your NFCISTA account manager.
        </div>
      </div>
    );
  }

  const hasDigitalCard = customer.digital_card_enabled !== false;
  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${customer.profile_slug}`;

  return (
    <div className="space-y-6">
      {/* ── Business Profile Hero Banner ──────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-outline-variant/30 overflow-hidden bg-surface-container-low shrink-0 shadow-xs">
            {customer.photo_url ? (
              <Image
                src={customer.photo_url}
                alt={customer.full_name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl sm:text-3xl bg-surface-container-low">
                {customer.full_name?.charAt(0) || "B"}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {customer.is_active
                  ? hasDigitalCard
                    ? "Profile Active"
                    : "Review Assistant Active"
                  : "Account Inactive"}
              </span>
              {customer.category && (
                <span className="text-[11px] font-semibold text-on-surface-variant px-2.5 py-0.5 rounded-full bg-surface-container-low border border-outline-variant/20 capitalize">
                  {customer.category.replace(/_/g, " ")}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-on-surface truncate">
              {customer.company_name || customer.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant truncate mt-0.5">
              {[customer.job_title, customer.company_name].filter(Boolean).join(" • ") || "NFCISTA Business Client"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
          {hasDigitalCard ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              <span>Preview Digital Card</span>
            </a>
          ) : (
            <Link
              href="/portal/cards"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">contactless</span>
              <span>View Review Cards</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Public Share / Destination Bar ─────────────────── */}
      {hasDigitalCard ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
              Your Public Digital Card URL
            </span>
            <span className="font-mono text-xs sm:text-sm font-semibold text-primary truncate block">
              {publicUrl}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-all border border-outline-variant/30 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">
              {copied ? "check" : "content_copy"}
            </span>
            <span>{copied ? "Copied!" : "Copy Public Link"}</span>
          </button>
        </div>
      ) : customer.google_review_url ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
              Verified Google Review Destination
            </span>
            <span className="font-mono text-xs sm:text-sm font-semibold text-primary truncate block">
              {customer.google_review_url}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyReviewUrl}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-all border border-outline-variant/30 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">
              {copiedReviewUrl ? "check" : "content_copy"}
            </span>
            <span>{copiedReviewUrl ? "Copied!" : "Copy Review Link"}</span>
          </button>
        </div>
      ) : null}

      {/* ── Review Assistant Services Summary ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/portal/cards"
          className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card hover:border-primary/40 transition-all flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">contactless</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-on-surface">Assigned Review Cards</span>
              <span className="material-symbols-outlined text-[16px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                arrow_forward
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Smart contactless touchpoints programmed for direct customer reviews.
            </p>
          </div>
        </Link>

        {customer.analytics_enabled ? (
          <Link
            href="/portal/analytics"
            className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card hover:border-primary/40 transition-all flex items-start gap-4 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-on-surface">Performance Analytics</span>
                <span className="material-symbols-outlined text-[16px] text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Live metrics for card taps, review submissions, and conversion rate.
              </p>
            </div>
          </Link>
        ) : (
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
              <span className="material-symbols-outlined text-[20px]">rate_review</span>
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm text-on-surface">Smart Review Assistant</span>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Streamlined customer feedback and 5-star Google review collection.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Business Details Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Channels Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">contacts</span>
            <h2 className="text-base font-bold text-on-surface">Contact Channels</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 mt-0.5">
                phone
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Phone Number</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.phone || <span className="text-on-surface-variant/50 italic">Not specified</span>}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0 mt-0.5">
                chat
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">WhatsApp</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.whatsapp || <span className="text-on-surface-variant/50 italic">Not specified</span>}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 mt-0.5">
                mail
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Business Email</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.email || <span className="text-on-surface-variant/50 italic">Not specified</span>}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 mt-0.5">
                location_on
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Business Address</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.address || <span className="text-on-surface-variant/50 italic">Not specified</span>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Digital & Social Presence Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">share</span>
            <h2 className="text-base font-bold text-on-surface">Digital &amp; Social Presence</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-pink-600 shrink-0 mt-0.5">
                photo_camera
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Instagram</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.instagram ? `@${customer.instagram}` : <span className="text-on-surface-variant/50 italic">Not linked</span>}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 mt-0.5">
                language
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Official Website</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.website ? (
                    <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {customer.website}
                    </a>
                  ) : (
                    <span className="text-on-surface-variant/50 italic">Not linked</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
                star
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Google Review URL</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.google_review_url ? (
                    <a href={customer.google_review_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Verified Review Destination
                    </a>
                  ) : (
                    <span className="text-on-surface-variant/50 italic">Not configured</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0 mt-0.5">
                verified
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Service Status</span>
                <span className="font-medium text-on-surface truncate block">
                  {!hasDigitalCard ? (
                    <span className="text-emerald-700 font-semibold">Review Assistant Active</span>
                  ) : customer.review_assistant_enabled ? (
                    <span className="text-emerald-700 font-semibold">All Services Active</span>
                  ) : (
                    <span className="text-on-surface-variant/70">Digital Card Only</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Business Description & About Section ───────────── */}
      {customer.description && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-6 shadow-card space-y-2">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <h2 className="text-base font-bold text-on-surface">About Business</h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed pt-1">
            {customer.description}
          </p>
        </div>
      )}
    </div>
  );
}
