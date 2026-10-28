"use client";

import { useState } from "react";

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    shop_name: "",
    phone: "",
    product: "google-review",
    company_hp: "",
  });

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setErrorMessage(
          data.error || "Unable to send your inquiry. Please reach out to hellonfcista@gmail.com."
        );
        return;
      }

      setStatus("success");
      setFormData({
        name: "",
        shop_name: "",
        phone: "",
        product: "google-review",
        company_hp: "",
      });
    } catch {
      setStatus("error");
      setErrorMessage(
        "Network connection failed. Please contact us directly at hellonfcista@gmail.com."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="p-8 rounded-2xl bg-ink border border-brand/30 text-center space-y-4 animate-fadeUp">
        <div className="w-12 h-12 rounded-full bg-brand/20 text-brand-text border border-brand/40 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-xl text-fg">
          Quote Request Received
        </h3>
        <p className="font-sans text-sm text-muted leading-relaxed max-w-sm mx-auto">
          Thank you. Our team will review your shop details and reach out with your custom design preview and pricing.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="inline-flex items-center text-xs text-brand-text font-semibold hover:underline pt-2"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Honeypot field (hidden from screen, trapped if filled by bots) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company_hp">Do not fill</label>
        <input
          id="company_hp"
          type="text"
          name="company_hp"
          tabIndex="-1"
          autoComplete="off"
          value={formData.company_hp}
          onChange={handleChange}
        />
      </div>

      {/* Underline-Only Input 1: Your Name */}
      <div className="space-y-1">
        <label htmlFor="inquiry-name" className="block font-mono text-[11px] uppercase tracking-wider text-dim">
          Your Name <span className="text-brand-text">*</span>
        </label>
        <input
          id="inquiry-name"
          type="text"
          name="name"
          required
          autoComplete="name"
          placeholder="e.g. Alex Morgan"
          value={formData.name}
          onChange={handleChange}
          className="w-full bg-transparent border-0 border-b border-line focus:border-brand-text px-0 py-2.5 font-sans text-sm text-fg placeholder:text-dim/50 focus:outline-none focus:ring-0 transition-colors"
        />
      </div>

      {/* Underline-Only Input 2: Shop / Business Name */}
      <div className="space-y-1">
        <label htmlFor="inquiry-shop" className="block font-mono text-[11px] uppercase tracking-wider text-dim">
          Shop or Business Name
        </label>
        <input
          id="inquiry-shop"
          type="text"
          name="shop_name"
          autoComplete="organization"
          placeholder="e.g. Blue Bottle Coffee"
          value={formData.shop_name}
          onChange={handleChange}
          className="w-full bg-transparent border-0 border-b border-line focus:border-brand-text px-0 py-2.5 font-sans text-sm text-fg placeholder:text-dim/50 focus:outline-none focus:ring-0 transition-colors"
        />
      </div>

      {/* Underline-Only Input 3: Phone / WhatsApp */}
      <div className="space-y-1">
        <label htmlFor="inquiry-phone" className="block font-mono text-[11px] uppercase tracking-wider text-dim">
          Phone / WhatsApp Number <span className="text-brand-text">*</span>
        </label>
        <input
          id="inquiry-phone"
          type="tel"
          name="phone"
          required
          autoComplete="tel"
          placeholder="e.g. +91 98765 43210"
          value={formData.phone}
          onChange={handleChange}
          className="w-full bg-transparent border-0 border-b border-line focus:border-brand-text px-0 py-2.5 font-sans text-sm text-fg placeholder:text-dim/50 focus:outline-none focus:ring-0 transition-colors"
        />
      </div>

      {/* Underline-Only Input 4: Product Select */}
      <div className="space-y-1">
        <label htmlFor="inquiry-product" className="block font-mono text-[11px] uppercase tracking-wider text-dim">
          Product Interest
        </label>
        <select
          id="inquiry-product"
          name="product"
          value={formData.product}
          onChange={handleChange}
          className="w-full bg-transparent border-0 border-b border-line focus:border-brand-text px-0 py-2.5 font-sans text-sm text-fg focus:outline-none focus:ring-0 transition-colors cursor-pointer"
        >
          <option value="google-review" className="bg-ink text-fg">Google Review NFC Card / Stand</option>
          <option value="digital-business-card" className="bg-ink text-fg">Digital Business Card</option>
          <option value="instagram" className="bg-ink text-fg">Instagram Profile Growth Card</option>
          <option value="whatsapp" className="bg-ink text-fg">WhatsApp Direct Chat Card</option>
          <option value="custom" className="bg-ink text-fg">Custom Enterprise Rollout</option>
        </select>
      </div>

      {/* Error Notice */}
      {status === "error" && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs leading-relaxed animate-fadeUp">
          {errorMessage}
        </div>
      )}

      {/* Pill Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-brand hover:bg-brand-hover disabled:bg-brand/50 text-white font-semibold text-sm tracking-wide transition-all active:scale-[0.98] shadow-sm select-none"
        >
          {status === "loading" ? "Submitting request..." : "Request my quote"}
        </button>
      </div>
    </form>
  );
}
