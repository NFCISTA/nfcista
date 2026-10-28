"use client";

import React, { useState, useEffect } from "react";
import ProfileLinkSection from "./ProfileLinkSection";
import LinkRow from "./LinkRow";
import ProfileToast from "./ProfileToast";
import { QRCodeSVG } from "qrcode.react";
import { X, QrCode } from "lucide-react";

/**
 * ProfileLinksArea — Client coordinator for profile links, QR modal, and toast feedback
 */
export default function ProfileLinksArea({
  contactLinks = [],
  socialLinks = [],
  businessLinks = [],
  profileUrl = "",
  profileName = "",
}) {
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Auto-hide toast
  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  // ESC key to close QR modal
  useEffect(() => {
    if (!isQrOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setIsQrOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isQrOpen]);

  // Body scroll lock when QR modal open
  useEffect(() => {
    if (isQrOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isQrOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleShareProfile = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: profileName
            ? `${profileName} — Digital Business Card`
            : "NFCISTA Digital Business Card",
          text: profileName
            ? `Connect with ${profileName} on NFCISTA`
            : "Connect via NFCISTA digital business card",
          url: profileUrl,
        });
        return;
      } catch {
        // User cancelled or clipboard fallback
      }
    }

    // Clipboard fallback
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl);
        showToast("Profile link copied to clipboard");
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = profileUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showToast("Profile link copied to clipboard");
      }
    } catch {
      showToast("Unable to copy link");
    }
  };

  return (
    <div className="space-y-6">
      <ProfileToast message={toastMessage} visible={toastVisible} />

      {/* ── Contact Section ───────────────────────────────────────── */}
      {contactLinks.length > 0 && (
        <ProfileLinkSection title="Contact">
          {contactLinks.map((item) => (
            <LinkRow
              key={item.id}
              href={item.href}
              label={item.label}
              value={item.value}
              iconName={item.iconName}
              brandColor={item.brandColor}
              isExternal={item.isExternal}
              copyValue={item.copyValue}
              copyLabel={item.copyLabel}
              onCopySuccess={showToast}
            />
          ))}
        </ProfileLinkSection>
      )}

      {/* ── Social Section ────────────────────────────────────────── */}
      {socialLinks.length > 0 && (
        <ProfileLinkSection title="Social">
          {socialLinks.map((item) => (
            <LinkRow
              key={item.id}
              href={item.href}
              label={item.label}
              value={item.value}
              iconName={item.iconName}
              brandColor={item.brandColor}
              isExternal={true}
              onCopySuccess={showToast}
            />
          ))}
        </ProfileLinkSection>
      )}

      {/* ── Business Section ──────────────────────────────────────── */}
      {(businessLinks.length > 0 || profileUrl) && (
        <ProfileLinkSection title="Business">
          {businessLinks.map((item) => {
            if (item.isQrTrigger) {
              return (
                <LinkRow
                  key={item.id}
                  onClick={() => setIsQrOpen(true)}
                  label={item.label}
                  value={item.value}
                  iconName={item.iconName}
                  brandColor={item.brandColor}
                  onCopySuccess={showToast}
                />
              );
            }
            if (item.isShareTrigger) {
              return (
                <LinkRow
                  key={item.id}
                  onClick={handleShareProfile}
                  label={item.label}
                  value={item.value}
                  iconName={item.iconName}
                  brandColor={item.brandColor}
                  onCopySuccess={showToast}
                />
              );
            }
            return (
              <LinkRow
                key={item.id}
                href={item.href}
                label={item.label}
                value={item.value}
                iconName={item.iconName}
                brandColor={item.brandColor}
                isExternal={item.isExternal ?? true}
                onCopySuccess={showToast}
              />
            );
          })}
        </ProfileLinkSection>
      )}

      {/* ── High-Precision QR Modal ───────────────────────────────── */}
      {isQrOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsQrOpen(false)}
        >
          <div
            className="relative w-full max-w-[340px] bg-white rounded-3xl p-6 text-center shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsQrOpen(false)}
              aria-label="Close QR code modal"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} strokeWidth={2} />
            </button>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-3">
              <QrCode size={13} strokeWidth={2} className="text-blue-600" />
              <span className="text-[10.5px] font-bold tracking-wider uppercase text-blue-700">
                Digital Profile QR
              </span>
            </div>

            <h2 id="qr-modal-title" className="text-base font-bold text-slate-900">
              {profileName || "Digital Business Card"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-5">
              Point your camera at this code to view and share this profile
            </p>

            {/* QR Code Container */}
            <div className="flex items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-5 shadow-inner">
              <QRCodeSVG
                value={profileUrl}
                size={200}
                bgColor="#F8FAFC"
                fgColor="#0B0D11"
                level="Q"
                includeMargin={false}
              />
            </div>

            <button
              type="button"
              onClick={handleShareProfile}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Share Profile Link</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
