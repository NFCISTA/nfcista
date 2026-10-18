"use client";

import { useState, useEffect } from "react";
import ProfileIcon from "./ProfileIcon";

/**
 * ProfileEnquiryModal — Public visitor enquiry submission modal.
 * Follows established modal patterns (fixed overlay, body scroll lock, ESC to close).
 *
 * @param {{
 *   name: string,
 *   slug: string,
 *   isOpen: boolean,
 *   onClose: () => void
 * }} props
 */
export default function ProfileEnquiryModal({ name, slug, isOpen, onClose }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleClose() {
    if (loading) return;
    setErrorMsg("");
    setSuccessData(null);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    if (!cleanName) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!cleanPhone) {
      setErrorMsg("Please enter your mobile number.");
      return;
    }
    if (cleanPhone.replace(/\D/g, "").length < 7) {
      setErrorMsg("Please enter a valid phone number with at least 7 digits.");
      return;
    }
    if (!cleanMessage || cleanMessage.length < 3) {
      setErrorMsg("Please write a message with at least 3 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile_slug: slug,
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail || undefined,
          message: cleanMessage,
          website_hp: honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Unable to submit enquiry. Please try again.");
      } else {
        setSuccessData(data);
        // Clear fields on successful submission
        setFullName("");
        setPhone("");
        setEmail("");
        setMessage("");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 id="enquiry-modal-title" className="text-lg font-bold text-gray-900 leading-tight">
              {successData ? "Enquiry Sent" : `Send an Enquiry to ${name}`}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {successData ? "Your message has been processed." : "Fill in your details below to get in touch."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
            aria-label="Close enquiry modal"
          >
            <ProfileIcon name="close" className="text-[18px]" aria-hidden={true} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {successData ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <ProfileIcon name="check" className="text-[32px]" aria-hidden={true} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Enquiry Submitted Successfully!
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed max-w-xs mx-auto">
                  {successData.whatsapp_url
                    ? "Your enquiry has been received. Tap below to also open WhatsApp directly with your message pre-loaded."
                    : `Thank you! Your enquiry has been delivered to ${name}.`}
                </p>
              </div>

              {/* WhatsApp Action Button if enabled */}
              {successData.whatsapp_url && (
                <div className="pt-2">
                  <a
                    href={successData.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold rounded-2xl shadow-sm transition-all active:scale-[0.98]"
                  >
                    <ProfileIcon name="chat" className="text-[20px]" aria-hidden={true} />
                    Continue to WhatsApp
                  </a>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 px-4 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-2xl text-xs font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Hidden Honeypot */}
              <div style={{ display: "none" }} aria-hidden="true">
                <label htmlFor="website_hp">Website</label>
                <input
                  id="website_hp"
                  type="text"
                  name="website_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-900 bg-gray-50/50"
                  disabled={loading}
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={25}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-900 bg-gray-50/50"
                  disabled={loading}
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  maxLength={120}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-900 bg-gray-50/50"
                  disabled={loading}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what you are looking for..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-900 bg-gray-50/50 resize-none"
                  disabled={loading}
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#071426] hover:bg-[#0c2240] text-white font-semibold rounded-2xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ProfileIcon name="mail" className="text-[18px]" aria-hidden={true} />
                      <span>Send Enquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
