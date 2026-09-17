"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// vCard helpers
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
  // Compare digit-stripped values to avoid duplicating the same number.
  const phoneDigits = phone ? phone.replace(/\D/g, "") : "";
  const waDigits    = whatsapp ? whatsapp.replace(/\D/g, "") : "";

  if (phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(phone)}`);
    // Add WhatsApp only if it is a genuinely different number
    if (whatsapp && waDigits !== phoneDigits) {
      lines.push(`TEL;TYPE=CELL;X-WHATSAPP:${escapeVCard(whatsapp)}`);
    }
  } else if (whatsapp) {
    // No phone on file — WhatsApp number becomes the primary contact
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SaveContactButton({ contact }) {
  const [error, setError] = useState(null);

  const {
    fullName,
    jobTitle,
    companyName,
    phone,
    whatsapp,
    email,
    website,
    address,
  } = contact || {};

  // Only render the button when there is at least one piece of contact info
  const hasContactInfo = phone || whatsapp || email || website || address;
  if (!hasContactInfo) return null;

  function handleSaveContact() {
    try {
      setError(null);
      const vCardString = buildVCard({ fullName, jobTitle, companyName, phone, whatsapp, email, website, address });
      const blob = new Blob([vCardString], { type: "text/vcard;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = safeFilename(fullName);
      // Required for Firefox
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the object URL after a short delay to let the download start
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setError("Could not generate contact. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleSaveContact}
        aria-label={`Save ${fullName || "contact"} to your phone contacts`}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-primary text-on-primary rounded-2xl font-semibold text-label-lg shadow-btn-primary hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
      >
        <span
          className="material-symbols-outlined text-[20px]"
          aria-hidden="true"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          contact_page
        </span>
        Save Contact
      </button>
      {error && (
        <p className="text-center text-body-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
