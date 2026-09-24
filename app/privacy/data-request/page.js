"use client";

import { useState } from "react";
import Link from "next/link";

export default function DataRightsRequestPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    contactEmail: "",
    contactPhone: "",
    profileSlug: "",
    requestType: "access", // 'access' | 'correction' | 'erasure' | 'withdrawal' | 'other'
    details: "",
    verificationConsent: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const requestTypeLabels = {
    access: "Access / Summary of Personal Data",
    correction: "Correction or Update of Details",
    erasure: "Permanent Erasure / Deletion of Profile",
    withdrawal: "Withdrawal of Consent for Public Profile",
    other: "Other Privacy / Grievance Inquiry",
  };

  const formattedRequestText =
    `NFCISTA Data Protection & Rights Request\n` +
    `--------------------------------------------------\n` +
    `Request Type: ${requestTypeLabels[formData.requestType]}\n` +
    `Full Name: ${formData.fullName.trim()}\n` +
    `Contact Email: ${formData.contactEmail.trim()}\n` +
    `Contact Phone: ${formData.contactPhone?.trim() || "Not provided"}\n` +
    `Profile Slug: ${formData.profileSlug?.trim() ? `/p/${formData.profileSlug.trim()}` : "Not provided"}\n\n` +
    `Details / Specific Request:\n${formData.details.trim() || "None provided."}\n\n` +
    `Identity Confirmation:\nI confirm I am the Data Principal (or legally authorized representative) associated with this profile.`;

  function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.fullName.trim()) {
      setErrorMsg("Please provide your full name.");
      return;
    }

    if (!formData.contactEmail.trim()) {
      setErrorMsg("Please provide your registered contact email address.");
      return;
    }

    if (!formData.details.trim()) {
      setErrorMsg("Please describe your request or grievance.");
      return;
    }

    if (!formData.verificationConsent) {
      setErrorMsg(
        "Please confirm the identity verification acknowledgment to proceed."
      );
      return;
    }

    setIsSubmitted(true);
  }

  async function handleCopyText() {
    try {
      await navigator.clipboard.writeText(formattedRequestText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is unavailable
    }
  }

  // Clean, minimal mailto without leaking full personal narrative into URL query string
  const cleanMailtoUrl = `mailto:hellonfcista@gmail.com?subject=${encodeURIComponent(
    `[DPDP Data Request] ${requestTypeLabels[formData.requestType]}`
  )}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-on-surface">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-btn-primary">
              <span className="material-symbols-outlined text-[18px]">contactless</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface">
              NFCISTA
            </span>
          </Link>

          <div className="flex items-center gap-4 text-body-sm">
            <Link
              href="/privacy"
              className="text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              Privacy Notice
            </Link>
            <Link
              href="/terms"
              className="text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              Terms
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Security & Verification Advisory */}
        <div className="mb-6 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-body-sm space-y-1 shadow-card">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-primary">
            <span className="material-symbols-outlined text-[18px]">shield</span>
            <span>Security &amp; Identity Verification Safeguard</span>
          </div>
          <p className="leading-relaxed">
            To prevent unauthorized tampering, disclosure, or deletion of someone else&apos;s digital business card,
            all requests undergo verification against the registered email and phone on file before processing.
          </p>
        </div>

        {/* Title */}
        <div className="space-y-1 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            Data Principal Rights Request
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Exercise your rights of access, correction, erasure, or consent withdrawal under the DPDP Act.
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[32px]">task_alt</span>
              </div>
              <h2 className="text-headline-md font-bold text-on-surface">
                Ready to Send Your Request
              </h2>
              <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
                To protect your privacy and ensure no personal details are logged in browser history or URL parameters,
                please copy your formatted request below and email it to our privacy coordinator.
              </p>
            </div>

            {/* Formatted Text Box */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-sm text-on-surface font-mono whitespace-pre-wrap select-all leading-relaxed overflow-x-auto max-h-64">
                {formattedRequestText}
              </pre>
              <button
                type="button"
                onClick={handleCopyText}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-outline-variant/40 text-on-surface text-label-sm font-semibold shadow-sm hover:bg-surface-container-low transition-all"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  {copied ? "check" : "content_copy"}
                </span>
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={cleanMailtoUrl}
                className="w-full sm:flex-1 h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-label-md shadow-btn-primary flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
                <span>Open Email Client</span>
              </a>

              <button
                type="button"
                onClick={handleCopyText}
                className="w-full sm:w-auto h-12 px-5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-semibold text-label-md hover:bg-surface-container-low transition-all"
              >
                {copied ? "Copied to Clipboard!" : "Copy Request Text"}
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-label-sm text-primary font-semibold hover:underline"
              >
                &larr; Edit request details
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-card">
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-error shrink-0">
                  error
                </span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Request Type */}
              <div>
                <label
                  htmlFor="req-type"
                  className="block text-label-sm font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider"
                >
                  Type of Request *
                </label>
                <select
                  id="req-type"
                  value={formData.requestType}
                  onChange={(e) =>
                    setFormData({ ...formData, requestType: e.target.value })
                  }
                  className="w-full h-12 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="access">Access / Summary of My Personal Data</option>
                  <option value="correction">Correction / Update of Card Details</option>
                  <option value="erasure">Erasure / Permanent Deletion of Profile</option>
                  <option value="withdrawal">Withdraw Consent / Deactivate Public Profile</option>
                  <option value="other">Other Privacy / Grievance Inquiry</option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="req-name"
                  className="block text-label-sm font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider"
                >
                  Full Name (as registered on your card) *
                </label>
                <input
                  id="req-name"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="e.g. Rahul Sharma"
                  className="w-full h-12 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="req-email"
                    className="block text-label-sm font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider"
                  >
                    Registered Email *
                  </label>
                  <input
                    id="req-email"
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    placeholder="name@example.com"
                    className="w-full h-12 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="req-phone"
                    className="block text-label-sm font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider"
                  >
                    Phone / WhatsApp <span className="text-[11px] font-normal text-tertiary">(Optional)</span>
                  </label>
                  <input
                    id="req-phone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full h-12 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Profile Slug / URL (Optional) */}
              <div>
                <label
                  htmlFor="req-slug"
                  className="block text-label-sm font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider"
                >
                  Profile Slug / URL <span className="text-[11px] font-normal text-tertiary">(Optional)</span>
                </label>
                <div className="flex items-center rounded-xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                  <span className="px-3.5 py-3 bg-surface-container-low text-tertiary text-body-sm font-mono border-r border-outline-variant/30 select-none">
                    /p/
                  </span>
                  <input
                    id="req-slug"
                    type="text"
                    value={formData.profileSlug}
                    onChange={(e) =>
                      setFormData({ ...formData, profileSlug: e.target.value })
                    }
                    placeholder="sarah-mitchell"
                    className="w-full h-12 px-3 bg-transparent text-on-surface text-body-md font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Details */}
              <div>
                <label
                  htmlFor="req-details"
                  className="block text-label-sm font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider"
                >
                  Specific Details of Your Request *
                </label>
                <textarea
                  id="req-details"
                  rows={4}
                  required
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  placeholder="Please specify which fields require correction, whether you wish to permanently delete your profile, or the details of your inquiry..."
                  className="w-full p-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Verification Consent Checkbox - UNTICKED BY DEFAULT */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.verificationConsent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        verificationConsent: e.target.checked,
                      })
                    }
                    className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="text-body-sm text-on-surface-variant">
                    I confirm that I am the Data Principal (or authorized representative) associated
                    with this profile, and I acknowledge that NFCISTA will verify my identity via my registered
                    email/phone before completing any changes or deletion.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-label-lg shadow-btn-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  <span>Prepare Privacy Request</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contact direct block */}
        <div className="mt-8 text-center text-body-sm text-on-surface-variant">
          <p>
            Privacy Coordinator Contact:{" "}
            <a
              href="mailto:hellonfcista@gmail.com"
              className="text-primary font-semibold hover:underline"
            >
              hellonfcista@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
