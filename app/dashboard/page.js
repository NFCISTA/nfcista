"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboardPage() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCustomer() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch("/api/customer/profile", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Unable to load customer profile.");
        } else {
          setCustomer(data.customer);
        }
      } catch (err) {
        setError("Network error while loading your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, []);

  function handleCopyLink() {
    if (!customer?.profile_slug) return;
    const url = `${window.location.origin}/p/${customer.profile_slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center space-y-3 shadow-card">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-body-sm text-on-surface-variant font-medium">Loading your profile...</p>
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
            {error || "Your account has been authenticated, but your digital business card profile has not been assigned by NFCISTA concierge yet."}
          </p>
        </div>
        <div className="pt-2 text-xs text-on-surface-variant">
          Need help? Contact support on WhatsApp:{" "}
          <a
            href="https://wa.me/919000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold hover:underline"
          >
            +91 90000 00000
          </a>
        </div>
      </div>
    );
  }

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${customer.profile_slug}`;

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-8 shadow-card">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
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
                {customer.full_name?.charAt(0) || "U"}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {customer.is_active ? "Card Active" : "Card Inactive"}
              </span>
              {customer.category && (
                <span className="text-[11px] font-semibold text-on-surface-variant px-2 py-0.5 rounded bg-surface-container-low">
                  {customer.category}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-on-surface truncate">
              {customer.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant truncate">
              {[customer.job_title, customer.company_name].filter(Boolean).join(" • ") || "Digital Business Card"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>Edit Profile</span>
          </Link>

          <a
            href={`/p/${customer.profile_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low text-on-surface text-xs font-semibold transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>Preview Card</span>
          </a>
        </div>
      </div>

      {/* ── Public Card Link Share Bar ────────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
            Your Public NFCISTA Card Link
          </span>
          <span className="font-mono text-xs sm:text-sm font-semibold text-primary truncate block">
            {publicUrl}
          </span>
        </div>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-all border border-outline-variant/30 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">
            {copied ? "check" : "content_copy"}
          </span>
          <span>{copied ? "Copied!" : "Copy Share Link"}</span>
        </button>
      </div>

      {/* ── Dashboard Grid: Profile Details & Social Links ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Details Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">contacts</span>
              <h2 className="text-base font-bold text-on-surface">Contact Channels</h2>
            </div>
            <Link
              href="/dashboard/profile"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
            >
              <span>Edit</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 mt-0.5">
                phone
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Phone Number</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.phone || <span className="text-on-surface-variant/50 italic">Not set</span>}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0 mt-0.5">
                chat
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">WhatsApp</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.whatsapp || <span className="text-on-surface-variant/50 italic">Not set</span>}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 mt-0.5">
                mail
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Email Address</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.email || <span className="text-on-surface-variant/50 italic">Not set</span>}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 mt-0.5">
                location_on
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Physical Address</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.address || <span className="text-on-surface-variant/50 italic">Not set</span>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social & Web Links Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">share</span>
              <h2 className="text-base font-bold text-on-surface">Social &amp; Web Links</h2>
            </div>
            <Link
              href="/dashboard/profile"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
            >
              <span>Edit</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-pink-600 shrink-0 mt-0.5">
                photo_camera
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Instagram</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.instagram ? `@${customer.instagram}` : <span className="text-on-surface-variant/50 italic">Not set</span>}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 mt-0.5">
                language
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Website</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.website || <span className="text-on-surface-variant/50 italic">Not set</span>}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
                star
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Google Review Link</span>
                <span className="font-medium text-on-surface truncate block">
                  {customer.google_review_url || <span className="text-on-surface-variant/50 italic">Not set</span>}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-container-low/40">
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">
                tag
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Slug (NFC URL)</span>
                <span className="font-mono text-xs font-semibold text-primary truncate block">
                  /p/{customer.profile_slug}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio / Description Card */}
      {customer.description && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-6 shadow-card space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            About / Bio
          </h2>
          <p className="text-body-sm text-on-surface leading-relaxed whitespace-pre-line">
            {customer.description}
          </p>
        </div>
      )}
    </div>
  );
}
