"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import CustomerGalleryManager from "@/components/dashboard/CustomerGalleryManager";
import CustomerSecuritySection from "@/components/dashboard/CustomerSecuritySection";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function CustomerProfileEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoSuccess, setPhotoSuccess] = useState("");
  const fileInputRef = useRef(null);

  // Banner upload state
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [bannerSuccess, setBannerSuccess] = useState("");
  const bannerInputRef = useRef(null);

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
    facebook_url: "",
    linkedin_url: "",
    twitter_url: "",
    drive_url: "",
    photo_url: "",
    banner_url: "",
    enquiry_enabled: false,
    enquiry_delivery_dashboard: true,
    enquiry_delivery_email: false,
    enquiry_delivery_whatsapp: false,
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
            facebook_url: data.customer.facebook_url || data.customer.facebook || "",
            linkedin_url: data.customer.linkedin_url || data.customer.linkedin || "",
            twitter_url: data.customer.twitter_url || data.customer.x_url || "",
            drive_url: data.customer.drive_url || data.customer.google_drive_url || "",
            photo_url: data.customer.photo_url || "",
            banner_url: data.customer.banner_url || "",
            enquiry_enabled: Boolean(data.customer.enquiry_enabled),
            enquiry_delivery_dashboard: data.customer.enquiry_delivery_dashboard !== undefined ? Boolean(data.customer.enquiry_delivery_dashboard) : true,
            enquiry_delivery_email: Boolean(data.customer.enquiry_delivery_email),
            enquiry_delivery_whatsapp: Boolean(data.customer.enquiry_delivery_whatsapp),
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

    // Client-side validation for Enquiry Settings
    if (formData.enquiry_enabled) {
      if (!formData.enquiry_delivery_dashboard && !formData.enquiry_delivery_email && !formData.enquiry_delivery_whatsapp) {
        setErrorMsg("Please select at least one delivery destination (e.g. Dashboard or WhatsApp) when Enquiry Form is enabled.");
        setSaving(false);
        return;
      }
      if (formData.enquiry_delivery_whatsapp && !formData.whatsapp?.trim()) {
        setErrorMsg("A WhatsApp number is required in Contact Information to enable WhatsApp Follow-up delivery.");
        setSaving(false);
        return;
      }
    }

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

  // ── Photo Upload ────────────────────────────────────────────────────────
  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!e.target) return;
    // Reset so the same file can be re-selected after error
    e.target.value = "";

    if (!file) return;

    // Client-side validation before upload
    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError("Invalid file type. Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setPhotoError("File is too large. Maximum allowed size is 5 MB.");
      return;
    }

    setPhotoError("");
    setPhotoSuccess("");
    setUploadingPhoto(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session expired. Please log in again.");

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/customer/photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: fd,
      });

      const contentType = res.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        const msg = result?.error || `Upload failed (HTTP ${res.status}).`;
        setPhotoError(msg);
        return;
      }

      // Update local state with the new URL — no full form save needed
      const newUrl = result.photo_url || "";
      setFormData((prev) => ({ ...prev, photo_url: newUrl }));
      setCustomer((prev) => ({ ...prev, photo_url: newUrl }));
      setPhotoSuccess("Profile photo updated successfully!");
      setTimeout(() => setPhotoSuccess(""), 5000);
    } catch (err) {
      setPhotoError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handlePhotoRemove() {
    if (!formData.photo_url) return;
    if (!window.confirm("Remove your profile photo? This cannot be undone.")) return;

    setPhotoError("");
    setPhotoSuccess("");
    setUploadingPhoto(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session expired. Please log in again.");

      const res = await fetch("/api/customer/photo", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const contentType = res.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        setPhotoError(result?.error || "Failed to remove photo.");
        return;
      }

      setFormData((prev) => ({ ...prev, photo_url: "" }));
      setCustomer((prev) => ({ ...prev, photo_url: "" }));
      setPhotoSuccess("Profile photo removed.");
      setTimeout(() => setPhotoSuccess(""), 4000);
    } catch (err) {
      setPhotoError(err.message || "An unexpected error occurred.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  // ── Profile Banner Handlers ──────────────────────────────────────────────
  async function handleBannerUpload(e) {
    const file = e.target.files?.[0];
    if (!e.target) return;
    e.target.value = "";

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setBannerError("Invalid file type. Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setBannerError("File is too large. Maximum allowed size is 5 MB.");
      return;
    }

    setBannerError("");
    setBannerSuccess("");
    setUploadingBanner(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session expired. Please log in again.");

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/customer/banner", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: fd,
      });

      const contentType = res.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        const msg = result?.error || `Upload failed (HTTP ${res.status}).`;
        setBannerError(msg);
        return;
      }

      const newUrl = result.banner_url || "";
      setFormData((prev) => ({ ...prev, banner_url: newUrl }));
      setCustomer((prev) => ({ ...prev, banner_url: newUrl }));
      setBannerSuccess("Custom profile banner updated successfully!");
      setTimeout(() => setBannerSuccess(""), 5000);
    } catch (err) {
      setBannerError(err.message || "An unexpected error occurred during banner upload.");
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleBannerRemove() {
    if (!formData.banner_url) return;
    if (!window.confirm("Revert to the NFCISTA default banner?")) return;

    setBannerError("");
    setBannerSuccess("");
    setUploadingBanner(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session expired. Please log in again.");

      const res = await fetch("/api/customer/banner", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const contentType = res.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        setBannerError(result?.error || "Failed to remove custom banner.");
        return;
      }

      setFormData((prev) => ({ ...prev, banner_url: "" }));
      setCustomer((prev) => ({ ...prev, banner_url: "" }));
      setBannerSuccess("Reverted to NFCISTA default banner.");
      setTimeout(() => setBannerSuccess(""), 4000);
    } catch (err) {
      setBannerError(err.message || "An unexpected error occurred.");
    } finally {
      setUploadingBanner(false);
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

          {/* ── Profile Photo Upload ─────────────────────────────── */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-2">
              Profile Photo
            </label>

            {/* Hidden file input — triggered by buttons below */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
            />

            <div className="flex items-center gap-4">
              {/* Avatar preview */}
              <div className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-outline-variant/40 bg-surface-container-low flex items-center justify-center">
                {formData.photo_url ? (
                  <Image
                    src={formData.photo_url}
                    alt="Profile photo preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40">
                    account_circle
                  </span>
                )}
                {/* Upload spinner overlay */}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                    <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {formData.photo_url ? "photo_camera" : "upload"}
                  </span>
                  <span>{formData.photo_url ? "Change Photo" : "Upload Photo"}</span>
                </button>

                {formData.photo_url && (
                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={handlePhotoRemove}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-error/40 text-error text-xs font-semibold hover:bg-error/5 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>Remove Photo</span>
                  </button>
                )}

                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  JPG, PNG or WebP · Max 5 MB
                </p>
              </div>
            </div>

            {/* Photo-specific feedback banners */}
            {photoError && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                <span>{photoError}</span>
              </div>
            )}
            {photoSuccess && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px] shrink-0 text-emerald-600">check_circle</span>
                <span>{photoSuccess}</span>
              </div>
            )}
          </div>

          {/* ── Profile Banner Upload ─────────────────────────────── */}
          <div className="pt-2 border-t border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-on-surface">
                Profile Banner
              </label>
              <div className="inline-flex items-center gap-3 text-xs">
                <span className={`inline-flex items-center gap-1 font-semibold ${!formData.banner_url ? 'text-primary' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[15px]">
                    {!formData.banner_url ? "radio_button_checked" : "radio_button_unchecked"}
                  </span>
                  NFCISTA Default
                </span>
                <span className={`inline-flex items-center gap-1 font-semibold ${formData.banner_url ? 'text-primary' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[15px]">
                    {formData.banner_url ? "radio_button_checked" : "radio_button_unchecked"}
                  </span>
                  Custom Banner
                </span>
              </div>
            </div>

            {/* Hidden file input for banner */}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleBannerUpload}
              disabled={uploadingBanner}
            />

            {/* Banner preview container: approx 2.4:1 ratio matching public profile */}
            <div className="relative w-full max-w-lg aspect-[2.4/1] rounded-2xl overflow-hidden border-2 border-outline-variant/40 bg-[#071426] shadow-sm mb-3">
              <Image
                src={formData.banner_url || "/images/hero-mountains.jpg"}
                alt="Profile banner preview"
                fill
                className="object-cover object-[center_35%]"
                unoptimized
              />
              {/* Subtle gradient matching public profile */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#051329]/60 via-transparent to-[#071426]/70 pointer-events-none" />

              {/* Banner type badge overlay */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold tracking-wide border border-white/20">
                  {formData.banner_url ? "Custom Banner" : "NFCISTA Default"}
                </span>
              </div>

              {/* Upload spinner overlay */}
              {uploadingBanner && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-20">
                  <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Banner Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={uploadingBanner}
                onClick={() => bannerInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {formData.banner_url ? "photo_library" : "upload"}
                </span>
                <span>{formData.banner_url ? "Change Banner" : "Upload Banner"}</span>
              </button>

              {formData.banner_url && (
                <button
                  type="button"
                  disabled={uploadingBanner}
                  onClick={handleBannerRemove}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low text-on-surface text-xs font-semibold active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                  <span>Revert to Default</span>
                </button>
              )}

              <p className="text-[10px] text-on-surface-variant w-full mt-1">
                Recommended: 1200 × 500 px (approx. 2.4:1 ratio) · JPG, PNG, or WebP · Max 5 MB
              </p>
            </div>

            {/* Banner feedback alerts */}
            {bannerError && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                <span>{bannerError}</span>
              </div>
            )}
            {bannerSuccess && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px] shrink-0 text-emerald-600">check_circle</span>
                <span>{bannerSuccess}</span>
              </div>
            )}
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

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Facebook URL <span className="text-[10px] text-on-surface-variant font-normal">(HTTPS only)</span>
              </label>
              <input
                type="url"
                value={formData.facebook_url || formData.facebook || ""}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                LinkedIn URL <span className="text-[10px] text-on-surface-variant font-normal">(HTTPS only)</span>
              </label>
              <input
                type="url"
                value={formData.linkedin_url || formData.linkedin || ""}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                X / Twitter URL <span className="text-[10px] text-on-surface-variant font-normal">(HTTPS or @handle)</span>
              </label>
              <input
                type="text"
                value={formData.twitter_url || formData.x_url || ""}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="https://x.com/yourhandle or @yourhandle"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Google Drive URL <span className="text-[10px] text-on-surface-variant font-normal">(HTTPS share link)</span>
              </label>
              <input
                type="url"
                value={formData.drive_url || formData.google_drive_url || ""}
                onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="text-[10px] text-on-surface-variant mt-1">
                Direct link for portfolio, brochure, catalog, or menu. Set sharing to &quot;Anyone with the link can view&quot;.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Enquiry Form & Delivery Settings */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">mail</span>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Enquiry Form &amp; Delivery Settings
                </h2>
                <p className="text-[11px] text-on-surface-variant">
                  Allow visitors to send enquiries directly from your public digital card.
                </p>
              </div>
            </div>

            {/* Master Toggle */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={Boolean(formData.enquiry_enabled)}
                onChange={(e) =>
                  setFormData({ ...formData, enquiry_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {!formData.enquiry_enabled ? (
            <div className="p-3 bg-surface-container-low/50 rounded-2xl border border-outline-variant/20 text-xs text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant/70">visibility_off</span>
              <span>Enquiry Form is currently <strong>disabled</strong>. The &ldquo;Send Enquiry&rdquo; button will not appear on your public profile.</span>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div>
                <span className="text-xs font-bold text-on-surface block mb-1">
                  Enquiry Delivery Destinations
                </span>
                <p className="text-[11px] text-on-surface-variant mb-3">
                  Choose where enquiries sent through your card should be delivered. You can select multiple destinations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Dashboard Delivery */}
                <label className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                  formData.enquiry_delivery_dashboard
                    ? "border-primary/40 bg-primary/5"
                    : "border-outline-variant/30 bg-surface-container-low/20"
                }`}>
                  <div className="flex items-start justify-between">
                    <span className="material-symbols-outlined text-[20px] text-primary">inbox</span>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.enquiry_delivery_dashboard)}
                      onChange={(e) =>
                        setFormData({ ...formData, enquiry_delivery_dashboard: e.target.checked })
                      }
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-on-surface block">Dashboard</span>
                    <span className="text-[10px] text-on-surface-variant leading-tight block mt-0.5">
                      View and manage visitor leads securely in your Enquiries tab.
                    </span>
                  </div>
                </label>

                {/* 2. Email Delivery (Coming Soon) */}
                <div className="p-3.5 rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 flex flex-col justify-between gap-3 opacity-80 cursor-not-allowed">
                  <div className="flex items-start justify-between">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">forward_to_inbox</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-md">
                      Coming Soon
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-xs text-on-surface-variant block">Email Notification</span>
                    <span className="text-[10px] text-on-surface-variant/80 leading-tight block mt-0.5">
                      Direct email notifications will be available in Phase 2.
                    </span>
                  </div>
                </div>

                {/* 3. WhatsApp Follow-Up */}
                <label className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                  !formData.whatsapp?.trim()
                    ? "border-outline-variant/20 bg-surface-container-low/20 opacity-60 cursor-not-allowed"
                    : formData.enquiry_delivery_whatsapp
                    ? "border-[#25D366]/40 bg-[#25D366]/5 cursor-pointer"
                    : "border-outline-variant/30 bg-surface-container-low/20 cursor-pointer"
                }`}>
                  <div className="flex items-start justify-between">
                    <span className="material-symbols-outlined text-[20px] text-[#25D366]">chat</span>
                    <input
                      type="checkbox"
                      disabled={!formData.whatsapp?.trim()}
                      checked={Boolean(formData.enquiry_delivery_whatsapp)}
                      onChange={(e) =>
                        setFormData({ ...formData, enquiry_delivery_whatsapp: e.target.checked })
                      }
                      className="rounded text-[#25D366] focus:ring-[#25D366] w-4 h-4 cursor-pointer disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-on-surface block">WhatsApp Follow-up</span>
                    <span className="text-[10px] text-on-surface-variant leading-tight block mt-0.5">
                      {formData.whatsapp?.trim()
                        ? "Visitors receive an instant WhatsApp link with pre-filled message."
                        : "Add a WhatsApp number above in Contact Information to enable."}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Products & Portfolio Gallery Showcase */}
        {customer?.id && (
          <CustomerGalleryManager customer={customer} />
        )}

        {/* Section 5: Read-Only System Properties */}
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

      {/* Section 6: Customer Account & Login Security */}
      <CustomerSecuritySection customer={customer} />
    </div>
  );
}
