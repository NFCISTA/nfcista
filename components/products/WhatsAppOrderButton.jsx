"use client";

import { useState, useEffect, useId } from "react";

/**
 * WhatsAppOrderButton
 *
 * Renders a WhatsApp CTA button. Clicking opens a responsive modal
 * allowing the user to provide their Name, Quantity, Customization,
 * and an optional message. On submission, builds a URL-encoded
 * WhatsApp message and opens wa.me in a new window/tab.
 *
 * No customer information is saved in any database or localStorage.
 */

const WHATSAPP_NUMBER = "919000000000";

const sizeMap = {
  sm: "px-4 py-2 text-label-sm gap-1.5",
  md: "px-5 py-2.5 text-label-md gap-2",
  lg: "px-7 py-4 text-label-lg gap-2.5",
};

export default function WhatsAppOrderButton({
  productName,
  size = "md",
  label = "Order on WhatsApp",
  showIcon = true,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customization, setCustomization] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const uid = useId();
  const nameId = `${uid}-name`;
  const quantityId = `${uid}-qty`;
  const customizationId = `${uid}-cust`;
  const messageId = `${uid}-msg`;

  // Close on Escape & prevent background scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const parsedQty = parseInt(quantity, 10);

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (isNaN(parsedQty) || parsedQty < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    setError("");

    const customizationText = customization.trim() || "Not specified";
    const messageText = message.trim() || "None";

    const rawMessage = `Hi NFCISTA,

I'm interested in the ${productName}.

Name: ${trimmedName}
Quantity: ${parsedQty}
Customization: ${customizationText}
Additional message: ${messageText}

Please share the details and pricing.`;

    const encodedMessage = encodeURIComponent(rawMessage);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const sizeClasses = sizeMap[size] ?? sizeMap.md;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#20ba59] shadow-sm transition-all active:scale-[0.98] ${sizeClasses} ${className}`}
      >
        {showIcon && (
          <span className="material-symbols-outlined text-[1.1em]">chat</span>
        )}
        <span>{label}</span>
      </button>

      {/* Modal / Bottom-sheet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${uid}-title`}
        >
          <div
            className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 sm:p-7 shadow-2xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-outline-variant/20">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                  Order Enquiry
                </span>
                <h3 id={`${uid}-title`} className="text-xl font-bold text-on-surface mt-0.5">
                  {productName}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Share a few details to continue to WhatsApp. Pricing and customization will be discussed directly with our team.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors flex-shrink-0 ml-3"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body: Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body-sm">
                  <span className="material-symbols-outlined text-[18px] flex-shrink-0">
                    error
                  </span>
                  <span>{error}</span>
                </div>
              )}

              {/* Name (Required) */}
              <div>
                <label
                  htmlFor={nameId}
                  className="block text-body-sm font-semibold text-on-surface mb-1.5"
                >
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  id={nameId}
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md transition-all"
                />
              </div>

              {/* Quantity (Required, default 1) */}
              <div>
                <label
                  htmlFor={quantityId}
                  className="block text-body-sm font-semibold text-on-surface mb-1.5"
                >
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  id={quantityId}
                  type="number"
                  min="1"
                  max="10000"
                  required
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md transition-all"
                />
              </div>

              {/* Customization (Optional) */}
              <div>
                <label
                  htmlFor={customizationId}
                  className="block text-body-sm font-semibold text-on-surface mb-1.5"
                >
                  Customization Requirements{" "}
                  <span className="text-xs font-normal text-on-surface-variant">
                    (Optional)
                  </span>
                </label>
                <input
                  id={customizationId}
                  type="text"
                  value={customization}
                  onChange={(e) => setCustomization(e.target.value)}
                  placeholder="e.g. Business logo, custom color, company name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md transition-all"
                />
              </div>

              {/* Additional Message (Optional) */}
              <div>
                <label
                  htmlFor={messageId}
                  className="block text-body-sm font-semibold text-on-surface mb-1.5"
                >
                  Additional Message{" "}
                  <span className="text-xs font-normal text-on-surface-variant">
                    (Optional)
                  </span>
                </label>
                <textarea
                  id={messageId}
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any specific questions or requirements..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md transition-all resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-outline-variant/20 flex flex-col-reverse sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-outline-variant/40 bg-white text-on-surface-variant font-medium hover:bg-surface-container-low transition-colors text-body-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#20ba59] shadow-sm transition-all active:scale-[0.98] text-body-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Continue to WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
