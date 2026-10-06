"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerProfileEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    job_title: "",
    company_name: "",
    category: "",
    description: "",
    phone: "",
    whatsapp: "",
    email: "",
    instagram: "",
    website: "",
    address: "",
    google_review_url: "",
    photo_url: "",
  });

  useEffect(() => {
    async function loadProfile() {
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
          setErrorMsg(data.error || "Unable to load customer profile.");
        } else if (data.customer) {
          setCustomer(data.customer);
          setFormData({
            full_name: data.customer.full_name || "",
            job_title: data.customer.job_title || "",
            company_name: data.customer.company_name || "",
            category: data.customer.category || "",
            description: data.customer.description || "",
            phone: data.customer.phone || "",
            whatsapp: data.customer.whatsapp || "",
            email: data.customer.email || "",
            instagram: data.customer.instagram || "",
            website: data.customer.website || "",
            address: data.customer.address || "",
            google_review_url: data.customer.google_review_url || "",
            photo_url: data.customer.photo_url || "",
          });
        }
      } catch {
        setErrorMsg("Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Your session has expired. Please re-login.");
      }

      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setCustomer(data.customer);
      setSuccessMsg("Your digital business card has been updated successfully!");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center space-y-3 shadow-card">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-body-sm text-on-surface-variant font-medium">Loading profile editor...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-card max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface">No Profile Found</h2>
        <p className="text-body-sm text-on-surface-variant leading-relaxed">
          {errorMsg || "Unable to locate a digital business card linked to your account."}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold"
        >
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Back to Overview</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Edit Digital Profile
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Changes to your contact details and links update your live NFC card immediately.
          </p>
        </div>

        {customer?.profile_slug && (
          <a
            href={`/p/${customer.profile_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low text-primary text-xs font-semibold transition-all shadow-xs self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>View Live Card</span>
          </a>
        )}
      </div>

      {/* ── Toast Notifications ───────────────────────────── */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-body-sm flex items-center gap-3 animate-fadeIn shadow-xs">
          <span className="material-symbols-outlined text-[22px] text-emerald-600 shrink-0">
            check_circle
          </span>
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-error-container/20 border border-error/30 text-error text-body-sm flex items-center gap-3 animate-fadeIn shadow-xs">
          <span className="material-symbols-outlined text-[22px] shrink-0">error</span>
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* ── Profile Edit Form ─────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Identity */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-7 shadow-card space-y-5">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
            <h2 className="text-base font-bold text-on-surface">Card Identity &amp; Role</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Full Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Job Title / Position
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="e.g. Managing Director"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Company / Business Name
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g. Acme Studio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Industry / Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Architecture, Real Estate, Legal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Profile Photo URL
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                placeholder="https://... or /images/..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {formData.photo_url && (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-outline-variant/40 shrink-0 bg-surface-container-low">
                  <Image
                    src={formData.photo_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              About Me / Bio
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief introduction to your background, services, or firm..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Direct Contact Channels */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-7 shadow-card space-y-5">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">contacts</span>
            <h2 className="text-base font-bold text-on-surface">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Direct Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                WhatsApp Number <span className="text-[10px] text-on-surface-variant font-normal">(digits with country code)</span>
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="919876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Physical Office Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Suite 401, Tech Park, City"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Social & Web Links */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-7 shadow-card space-y-5">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">share</span>
            <h2 className="text-base font-bold text-on-surface">Web &amp; Social Links</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Instagram Handle
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 rounded-l-xl border border-r-0 border-outline-variant/50 bg-surface-container-low text-xs font-bold text-on-surface-variant">
                  @
                </span>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="yourhandle"
                  className="flex-1 px-3.5 py-2.5 rounded-r-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourbrand.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-on-surface mb-1">
                Google Review URL <span className="text-[10px] text-on-surface-variant font-normal">(maps or search review direct link)</span>
              </label>
              <input
                type="url"
                value={formData.google_review_url}
                onChange={(e) => setFormData({ ...formData, google_review_url: e.target.value })}
                placeholder="https://g.page/r/... or https://maps.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Read-Only System Properties */}
        <div className="bg-surface-container-low/40 border border-outline-variant/20 rounded-3xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              System &amp; NFC Properties (Managed by NFCISTA)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
              <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Profile Slug (NFC URL)</span>
              <span className="font-mono font-semibold text-primary block mt-0.5">/p/{customer.profile_slug}</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
              <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Card Visibility</span>
              <span className="font-semibold text-emerald-700 block mt-0.5">
                {customer.is_active ? "Active & Publicly Visible" : "Suspended"}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant/80 italic">
            To change your vanity slug or account status, please reach out to NFCISTA concierge support.
          </p>
        </div>

        {/* Submit Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low text-xs font-semibold text-on-surface transition-all"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
