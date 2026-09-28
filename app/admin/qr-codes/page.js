"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import DynamicQrCode from "@/components/qr/DynamicQrCode";

export default function CardCodeGeneratorPage() {
  const [quantity, setQuantity] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedCards, setGeneratedCards] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Helper to extract session token from client
  async function getAuthHeader() {
    if (!supabase) return {};
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch {
      // Fall back to HttpOnly cookie
    }
    return {};
  }

  async function handleGenerate(e) {
    e.preventDefault();
    const qty = parseInt(quantity, 10);

    if (isNaN(qty) || qty < 1 || qty > 50) {
      setErrorMsg("Please enter a valid quantity between 1 and 50.");
      return;
    }

    setErrorMsg("");
    setIsGenerating(true);

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch("/api/admin/dynamic-qr/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ quantity: qty }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to generate card codes.");
      } else {
        setGeneratedCards(data.cards || []);
      }
    } catch {
      setErrorMsg("A network error occurred while generating codes.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy(text, index) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }

  function handleCopyAll() {
    if (navigator?.clipboard && generatedCards.length > 0) {
      const allText = generatedCards
        .map((c) => `${c.card_code}\t${c.qr_url}`)
        .join("\n");
      navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary hover:underline mb-3"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Customers Dashboard</span>
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-container-low text-primary border border-outline-variant/30">
            NFCISTA
          </span>
          <span className="text-body-sm text-on-surface-variant font-medium">
            Dynamic QR System
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          Card Code Generator
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">
          Generate batches of unique, unused Dynamic QR codes for physical card printing. Generated cards are reserved in the database as inactive and can be activated later when sold.
        </p>
      </div>

      {/* Generation Form Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-card">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label
              htmlFor="quantity"
              className="text-label-md font-bold text-on-surface block mb-1.5"
            >
              Number of Cards to Generate (1 to 50)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                id="quantity"
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setErrorMsg("");
                }}
                required
                className="w-full sm:w-48 px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 text-on-surface font-mono text-lg font-bold text-center focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />

              <button
                type="submit"
                disabled={isGenerating}
                className="py-3 px-6 rounded-xl bg-primary text-on-primary font-bold text-label-lg shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Generating Cards...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    <span>Generate Codes</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              Each code format is <code className="font-mono font-semibold">NF[A-Z0-9]&#123;4&#125;</code> (e.g. NF8K29, NF3P71). Uniqueness is guaranteed against the database.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-sm flex items-start gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}
        </form>
      </div>

      {/* Generated Cards Result List */}
      {generatedCards.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low/70 border border-outline-variant/30 rounded-2xl px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-on-surface">
                Generated Codes ({generatedCards.length})
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Saved in database as <span className="font-semibold text-amber-800">Inactive</span>. Ready for physical printing.
              </p>
            </div>

            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-semibold text-xs hover:bg-surface-container-high transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedAll ? "done" : "content_copy"}
              </span>
              <span>{copiedAll ? "Copied All!" : "Copy Code List"}</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedCards.map((card, idx) => (
              <div
                key={card.card_code}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold text-on-surface tracking-wider">
                      {card.card_code}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Inactive
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant block uppercase tracking-wider">
                      Physical QR URL:
                    </span>
                    <span className="font-mono text-xs text-primary break-all block truncate">
                      {card.qr_url}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleCopy(card.qr_url, idx)}
                      className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title="Copy QR URL"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedIndex === idx ? "done" : "content_copy"}
                      </span>
                      <span>{copiedIndex === idx ? "Copied!" : "Copy URL"}</span>
                    </button>
                    <span className="text-outline-variant">•</span>
                    <Link
                      href="/admin/qr-activate"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Activate</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                {/* Live QR Code preview */}
                <div className="p-2 bg-white rounded-xl border border-outline-variant/20 shadow-2xs shrink-0 flex flex-col items-center">
                  <DynamicQrCode cardCode={card.card_code} size={110} />
                  <span className="text-[10px] text-on-surface-variant mt-1 font-mono">
                    {card.card_code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
