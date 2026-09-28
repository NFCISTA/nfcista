"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import DynamicQrCode from "@/components/qr/DynamicQrCode";
import { getQrUrl } from "@/lib/dynamicQr";

// ─── helpers ────────────────────────────────────────────────────────────────

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

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Inventory counter card ──────────────────────────────────────────────────

function StatCard({ label, value, accent }) {
  const accentMap = {
    default: "text-on-surface border-outline-variant/30",
    amber: "text-amber-700 border-amber-200",
    green: "text-emerald-700 border-emerald-200",
  };
  return (
    <div
      className={`flex-1 min-w-0 bg-surface-container-lowest border rounded-2xl px-5 py-4 shadow-xs flex flex-col gap-1 ${accentMap[accent] ?? accentMap.default}`}
    >
      <span className="text-3xl font-bold font-mono tabular-nums">
        {value ?? "—"}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
        {label}
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CardCodeGeneratorPage() {
  // generation state
  const [quantity, setQuantity] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedCards, setGeneratedCards] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // inventory state
  const [inventory, setInventory] = useState(null); // { total, available, active, cards[] }
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState("");

  // copy QR link state — keyed by card_code
  const [copiedQr, setCopiedQr] = useState(null); // card_code that was just copied
  const [clipboardError, setClipboardError] = useState(""); // brief user-facing error

  // ── fetch inventory ────────────────────────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    setInventoryLoading(true);
    setInventoryError("");
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch("/api/admin/dynamic-qr/inventory", {
        headers: { ...authHeader },
        cache: "no-store",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setInventoryError(d.error || "Failed to load inventory.");
      } else {
        const d = await res.json();
        setInventory(d);
      }
    } catch {
      setInventoryError("A network error occurred while loading inventory.");
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // ── generate cards ────────────────────────────────────────────────────────
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
        // Refresh inventory counters after successful generation
        fetchInventory();
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

  // ── copy QR link ───────────────────────────────────────────────────────────
  async function handleCopyQrLink(cardCode) {
    const url = getQrUrl(cardCode);
    if (!url) return;
    setClipboardError("");
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for environments without clipboard API
        throw new Error("Clipboard not available");
      }
      setCopiedQr(cardCode);
      setTimeout(() => setCopiedQr(null), 2000);
    } catch {
      setClipboardError(`Could not copy link for ${cardCode}. Please copy manually: ${url}`);
      setTimeout(() => setClipboardError(""), 5000);
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────
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

      {/* ── QR Card Inventory ─────────────────────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-on-surface tracking-tight">
            QR Card Inventory
          </h2>
          <button
            onClick={fetchInventory}
            disabled={inventoryLoading}
            title="Refresh inventory"
            className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40 cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${inventoryLoading ? "animate-spin" : ""}`}
            >
              refresh
            </span>
            <span>{inventoryLoading ? "Loading…" : "Refresh"}</span>
          </button>
        </div>

        {/* Clipboard error toast */}
        {clipboardError && (
          <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[16px] shrink-0">content_paste_off</span>
            <span className="font-medium break-all">{clipboardError}</span>
          </div>
        )}

        {inventoryError ? (
          <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-sm flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
            <span className="font-medium">{inventoryError}</span>
          </div>
        ) : (
          <>
            {/* Counters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <StatCard
                label="Total Created"
                value={inventoryLoading ? "…" : inventory?.total}
                accent="default"
              />
              <StatCard
                label="Available"
                value={inventoryLoading ? "…" : inventory?.available}
                accent="amber"
              />
              <StatCard
                label="Active / Assigned"
                value={inventoryLoading ? "…" : inventory?.active}
                accent="green"
              />
            </div>

            {/* Card list */}
            {!inventoryLoading && inventory?.cards?.length > 0 && (
              <div className="mt-2 space-y-2">
                <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  All Cards
                </h3>
                <div className="divide-y divide-outline-variant/20 rounded-2xl border border-outline-variant/30 overflow-hidden">
                  {inventory.cards.map((card) => {
                    const isActive = card.is_active;
                    return (
                      <div
                        key={card.card_code}
                        className="flex flex-col gap-2 px-4 py-3 bg-surface-container-lowest hover:bg-surface-container-low/40 transition-colors"
                      >
                        {/* Row 1: Code + status + date + activate */}
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-sm font-bold text-on-surface tracking-wider">
                              {card.card_code}
                            </span>
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-800 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Available
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-on-surface-variant shrink-0">
                            <span title="Created date">
                              {formatDate(card.created_at)}
                            </span>
                            {!isActive && (
                              <Link
                                href={`/admin/qr-activate?code=${encodeURIComponent(card.card_code)}`}
                                className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline"
                              >
                                <span>Activate</span>
                                <span className="material-symbols-outlined text-[14px]">
                                  arrow_forward
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Row 2: QR URL + Copy button */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-xs text-primary break-all">
                            {getQrUrl(card.card_code)}
                          </span>
                          <button
                            onClick={() => handleCopyQrLink(card.card_code)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all shrink-0 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {copiedQr === card.card_code ? "done" : "content_copy"}
                            </span>
                            <span>
                              {copiedQr === card.card_code ? "Copied!" : "Copy QR Link"}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!inventoryLoading && inventory?.total === 0 && (
              <p className="text-body-sm text-on-surface-variant italic">
                No QR cards have been generated yet. Use the form below to create your first batch.
              </p>
            )}
          </>
        )}
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
                Saved in database as <span className="font-semibold text-amber-800">Available</span>. Ready for physical printing.
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
                      Available
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
                      href={`/admin/qr-activate?code=${encodeURIComponent(card.card_code)}`}
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
