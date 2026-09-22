"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// vCard helpers  (unchanged from original)
// ---------------------------------------------------------------------------

/**
 * Escape vCard 3.0 special characters.
 * Per RFC 2426: backslash, comma, semicolon, and newline must be escaped.
 */
function escapeVCard(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/\\/g, "\\\\")   // backslash first
    .replace(/;/g, "\\;")     // semicolon
    .replace(/,/g, "\\,")     // comma
    .replace(/\r?\n/g, "\\n") // newline
    .replace(/\r/g, "");      // stray CR
}

/**
 * Generate a safe download filename from the customer name.
 * Only lowercase alphanumeric + hyphens; max 60 chars.
 */
function safeFilename(fullName) {
  if (!fullName) return "contact.vcf";
  const slug = fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return (slug || "contact") + ".vcf";
}

/**
 * Build a vCard 3.0 string from the provided contact fields.
 * Only includes fields that are present; never includes internal DB fields.
 */
function buildVCard({ fullName, jobTitle, companyName, phone, whatsapp, email, website, address }) {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  // FN — formatted name (required)
  lines.push(`FN:${escapeVCard(fullName || "")}`);

  // N — structured name: Last;First;Middle;Prefix;Suffix
  const parts = (fullName || "").trim().split(/\s+/);
  const last  = parts.length > 1 ? escapeVCard(parts[parts.length - 1]) : "";
  const first = parts.length > 1 ? escapeVCard(parts.slice(0, -1).join(" ")) : escapeVCard(parts[0] || "");
  lines.push(`N:${last};${first};;;`);

  // ORG
  if (companyName) lines.push(`ORG:${escapeVCard(companyName)}`);

  // TITLE
  if (jobTitle) lines.push(`TITLE:${escapeVCard(jobTitle)}`);

  // TEL — phone / WhatsApp
  const phoneDigits = phone ? phone.replace(/\D/g, "") : "";
  const waDigits    = whatsapp ? whatsapp.replace(/\D/g, "") : "";

  if (phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(phone)}`);
    if (whatsapp && waDigits !== phoneDigits) {
      lines.push(`TEL;TYPE=CELL;X-WHATSAPP:${escapeVCard(whatsapp)}`);
    }
  } else if (whatsapp) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(whatsapp)}`);
  }

  // EMAIL
  if (email) lines.push(`EMAIL:${escapeVCard(email)}`);

  // URL
  if (website) lines.push(`URL:${escapeVCard(website)}`);

  // ADR — free-form address in the street component
  if (address) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(address)};;;;`);
  }

  lines.push("END:VCARD");

  // vCard line endings must be CRLF per RFC 2426
  return lines.join("\r\n");
}

/**
 * Trigger the .vcf download — reliable cross-browser fallback.
 */
function downloadVcf(contact) {
  const vCardString = buildVCard(contact);
  const blob = new Blob([vCardString], { type: "text/vcard;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = safeFilename(contact.fullName);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

// ---------------------------------------------------------------------------
// Save Contact Modal
// ---------------------------------------------------------------------------

function SaveContactModal({ contact, onClose }) {
  const { jobTitle, companyName, phone, whatsapp, email, website, address } = contact;

  const [contactName, setContactName] = useState(contact.fullName || "");
  const [status, setStatus] = useState("idle"); // "idle" | "saving" | "done" | "error"
  const [errorMsg, setErrorMsg] = useState(null);

  const inputRef = useRef(null);
  const firstFocusRef = useRef(null);
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Focus input on open
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), prefersReducedMotion ? 0 : 80);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  // Trap focus & ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Lock scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  async function handleSave() {
    if (!contactName.trim()) {
      inputRef.current?.focus();
      return;
    }
    setStatus("saving");
    setErrorMsg(null);

    const saveContact = { ...contact, fullName: contactName.trim() };

    // Attempt Contact Picker API (Chrome for Android 80+, limited support)
    if (typeof window !== "undefined" && "contacts" in navigator && "ContactsManager" in window) {
      try {
        // Contact Picker API is read-only (pick contacts, not add them) —
        // so we still fall through to the .vcf download path.
        // This branch is intentionally not used to silently add contacts.
      } catch {
        // swallow
      }
    }

    // Best supported path: .vcf download
    try {
      downloadVcf(saveContact);
      setStatus("done");
    } catch {
      setErrorMsg("Could not generate the contact file. Please try again.");
      setStatus("error");
    }
  }

  const nameIsEmpty = !contactName.trim();

  // Determine the display number (prefer phone, fallback to WhatsApp)
  const displayPhone = phone || whatsapp || null;
  // Avoid showing WhatsApp as a second number if it matches phone
  const showWhatsApp =
    whatsapp && phone && whatsapp.replace(/\D/g, "") !== phone.replace(/\D/g, "");

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Save Contact"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Sheet / Modal panel */}
      <div
        className={[
          "relative z-10 w-full sm:max-w-sm mx-auto",
          "bg-[#0d1e38] border border-white/10",
          "rounded-t-3xl sm:rounded-3xl shadow-2xl",
          "px-5 pt-5 pb-8 sm:p-7",
          prefersReducedMotion ? "" : "animate-slide-up sm:animate-scale-in",
        ].join(" ")}
        style={{ maxHeight: "90dvh", overflowY: "auto" }}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center mb-4" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-primary text-[20px]"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                person_add
              </span>
            </div>
            <div>
              <h2 className="text-white font-bold text-[15px] leading-tight">Save Contact</h2>
              <p className="text-white/50 text-[11px] leading-tight mt-0.5">Customize before saving</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-white/70 text-[18px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {status !== "done" ? (
          <>
            {/* Name input */}
            <div className="mb-4">
              <label
                htmlFor="save-contact-name"
                className="block text-white/70 text-[11px] font-semibold uppercase tracking-widest mb-1.5"
              >
                Contact Name
              </label>
              <input
                ref={inputRef}
                id="save-contact-name"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                placeholder="Full name"
                maxLength={80}
                autoComplete="off"
                className="w-full bg-white/5 border border-white/15 focus:border-primary/60 focus:bg-white/8 rounded-xl px-3.5 py-2.5 text-white text-[14px] font-medium placeholder-white/30 outline-none transition-colors"
              />
              <p className="text-white/35 text-[10.5px] mt-1.5">
                Only the saved contact name changes — the profile stays the same.
              </p>
            </div>

            {/* Contact preview card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 mb-5 space-y-2">
              <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-2">
                Will be saved as
              </p>

              {/* Name preview */}
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-white/40 text-[16px] flex-shrink-0"
                  aria-hidden="true"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  badge
                </span>
                <span className="text-white font-semibold text-[13.5px] truncate">
                  {contactName.trim() || <span className="text-white/30 italic">Enter a name above</span>}
                </span>
              </div>

              {/* Job / Company */}
              {(jobTitle || companyName) && (
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-white/40 text-[16px] flex-shrink-0"
                    aria-hidden="true"
                  >
                    business_center
                  </span>
                  <span className="text-white/70 text-[12.5px] truncate">
                    {[jobTitle, companyName].filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}

              {/* Phone */}
              {displayPhone && (
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-white/40 text-[16px] flex-shrink-0"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    phone
                  </span>
                  <span className="text-white/70 text-[12.5px]">{displayPhone}</span>
                </div>
              )}

              {/* WhatsApp if different from phone */}
              {showWhatsApp && (
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-white/40 text-[16px] flex-shrink-0"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    chat
                  </span>
                  <span className="text-white/70 text-[12.5px]">{whatsapp} <span className="text-white/35">(WhatsApp)</span></span>
                </div>
              )}

              {/* Email */}
              {email && (
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-white/40 text-[16px] flex-shrink-0"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    mail
                  </span>
                  <span className="text-white/70 text-[12.5px] truncate">{email}</span>
                </div>
              )}

              {/* Website */}
              {website && (
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-white/40 text-[16px] flex-shrink-0"
                    aria-hidden="true"
                  >
                    language
                  </span>
                  <span className="text-white/70 text-[12.5px] truncate">{website}</span>
                </div>
              )}

              {/* Address */}
              {address && (
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-white/40 text-[16px] flex-shrink-0"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    location_on
                  </span>
                  <span className="text-white/70 text-[12.5px] line-clamp-2">{address}</span>
                </div>
              )}
            </div>

            {/* Error */}
            {errorMsg && (
              <p className="text-rose-400 text-[12px] text-center mb-3" role="alert">
                {errorMsg}
              </p>
            )}

            {/* Save CTA */}
            <button
              type="button"
              onClick={handleSave}
              disabled={nameIsEmpty || status === "saving"}
              aria-disabled={nameIsEmpty || status === "saving"}
              className="w-full min-h-[52px] flex items-center justify-center gap-2.5 py-3.5 px-6 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-btn-primary hover:bg-[#003ea8] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none"
            >
              {status === "saving" ? (
                <>
                  <span
                    className="material-symbols-outlined text-[20px] animate-spin"
                    aria-hidden="true"
                  >
                    progress_activity
                  </span>
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined text-[20px]"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    download
                  </span>
                  <span>Save Contact</span>
                </>
              )}
            </button>

            {/* Hint */}
            <p className="text-white/30 text-[10.5px] text-center mt-3 leading-relaxed">
              A .vcf contact file will download. Open it to add the contact to your phone or app.
            </p>
          </>
        ) : (
          /* ── Success state ── */
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-emerald-400 text-[36px]"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <div>
              <p className="text-white font-bold text-[15px]">Contact file downloaded!</p>
              <p className="text-white/50 text-[12.5px] mt-1 leading-relaxed max-w-[260px]">
                Open the .vcf file from your downloads to add&nbsp;
                <strong className="text-white/80">{contactName.trim()}</strong> to your contacts.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-1 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[13px] font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.93) translateY(8px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);   opacity: 1; }
        }
        .animate-slide-up  { animation: slide-up  0.28s cubic-bezier(0.32,0.72,0,1) both; }
        .animate-scale-in  { animation: scale-in  0.22s cubic-bezier(0.32,0.72,0,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up, .animate-scale-in { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

export default function SaveContactButton({ contact }) {
  const [modalOpen, setModalOpen] = useState(false);

  const {
    fullName,
    phone,
    whatsapp,
    email,
    website,
    address,
  } = contact || {};

  // Only render the button when there is at least one piece of contact info
  const hasContactInfo = phone || whatsapp || email || website || address;
  if (!hasContactInfo) return null;

  const openModal = useCallback(() => setModalOpen(true),  []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        aria-label={`Save ${fullName || "contact"} to your phone contacts`}
        className="w-full min-h-[52px] flex items-center justify-center gap-2.5 py-4 px-6 bg-primary text-white rounded-2xl font-bold text-label-lg shadow-btn-primary hover:bg-[#003ea8] active:scale-[0.98] transition-all cursor-pointer select-none"
      >
        <span
          className="material-symbols-outlined text-[22px]"
          aria-hidden="true"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          person_add
        </span>
        <span>Save Contact</span>
      </button>

      {modalOpen && (
        <SaveContactModal contact={contact} onClose={closeModal} />
      )}
    </>
  );
}
