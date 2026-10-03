"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import DynamicQrCode from "@/components/qr/DynamicQrCode";

export default function DynamicQrActivatePage() {
  const [cardCode, setCardCode] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [currentInfo, setCurrentInfo] = useState(null);
  const [isLoadingLookup, setIsLoadingLookup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);

  // Helper to get access token from Supabase client session if available
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
      // Fall back to cookie
    }
    return {};
  }

  // Pre-fill card code from URL query parameter (e.g. ?code=NF8K29 from scanner)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get("code") || params.get("cardCode");
      if (codeParam) {
        const clean = codeParam.trim().toUpperCase();
        setCardCode(clean);
        // Automatically perform lookup
        (async () => {
          setIsLoadingLookup(true);
          try {
            const authHeader = await getAuthHeader();
            const res = await fetch(
              `/api/admin/dynamic-qr/activate?cardCode=${encodeURIComponent(clean)}`,
              { headers: { ...authHeader } }
            );
            const data = await res.json();
            if (res.ok) {
              setCurrentInfo(data);
              setDestinationUrl(data.destination_url || "");
            }
          } catch {
            // Non-blocking for prefill
          } finally {
            setIsLoadingLookup(false);
          }
        })();
      }
    }
  }, []);

  // Look up existing card details
  async function handleLookup(e) {
    if (e) e.preventDefault();
    const cleanCode = cardCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg("Please enter a card code to look up.");
      return;
    }

    setErrorMsg("");
    setSuccessData(null);
    setIsLoadingLookup(true);

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(
        `/api/admin/dynamic-qr/activate?cardCode=${encodeURIComponent(cleanCode)}`,
        {
          headers: {
            ...authHeader,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Card code not found.");
        setCurrentInfo(null);
      } else {
        setCurrentInfo(data);
        // Pre-fill destination input if not already modified
        if (!destinationUrl) {
          setDestinationUrl(data.destination_url || "");
        }
      }
    } catch {
      setErrorMsg("Failed to connect to server.");
    } finally {
      setIsLoadingLookup(false);
    }
  }

  // Submit activation / update
  async function handleSubmit(e) {
    e.preventDefault();
    const cleanCode = cardCode.trim().toUpperCase();
    const cleanDestination = destinationUrl.trim();

    if (!cleanCode) {
      setErrorMsg("Card code is required.");
      return;
    }
    if (!cleanDestination) {
      setErrorMsg("Destination URL is required.");
      return;
    }

    setErrorMsg("");
    setSuccessData(null);
    setIsSubmitting(true);

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch("/api/admin/dynamic-qr/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          cardCode: cleanCode,
          destinationUrl: cleanDestination,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to activate card.");
      } else {
        setSuccessData(data.card);
        setCurrentInfo(data.card);
      }
    } catch {
      setErrorMsg("Network error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
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
          Dynamic QR Activation
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">
          Instantly activate or switch the destination URL for any NFCISTA card without changing or reprinting the physical QR.
        </p>
      </div>

      {/* Main Activation Card Form */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-card space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Card Code Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <label
                htmlFor="cardCode"
                className="text-label-md font-bold text-on-surface"
              >
                Card Code <span className="text-error">*</span>
              </label>
              <button
                type="button"
                onClick={handleLookup}
                disabled={isLoadingLookup || !cardCode.trim()}
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                {isLoadingLookup ? "Looking up..." : "Check Current Destination"}
              </button>
            </div>
            <div className="relative">
              <input
                id="cardCode"
                type="text"
                value={cardCode}
                onChange={(e) => {
                  setCardCode(e.target.value.toUpperCase());
                  setErrorMsg("");
                }}
                placeholder="e.g. NF8K29"
                maxLength={32}
                required
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 text-on-surface font-mono text-lg font-bold tracking-wider placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all uppercase"
              />
              <span className="absolute right-3.5 top-3.5 material-symbols-outlined text-[20px] text-on-surface-variant">
                qr_code
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Case-insensitive code printed on the physical NFC/QR card.
            </p>
          </div>

          {/* Current Destination Display (if fetched) */}
          {currentInfo && (
            <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Current Active Destination:
                </span>
                <a
                  href={currentInfo.destination_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline break-all inline-flex items-center gap-1"
                >
                  <span>{currentInfo.destination_url}</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 self-start sm:self-auto shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
          )}

          {/* Destination URL Field */}
          <div>
            <label
              htmlFor="destinationUrl"
              className="text-label-md font-bold text-on-surface block mb-1.5"
            >
              New Destination URL <span className="text-error">*</span>
            </label>
            <input
              id="destinationUrl"
              type="url"
              value={destinationUrl}
              onChange={(e) => {
                setDestinationUrl(e.target.value);
                setErrorMsg("");
              }}
              placeholder="https://customer-business.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 text-on-surface font-medium placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-body-md"
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Must be a valid web address starting with <code className="font-mono">https://</code> or <code className="font-mono">http://</code>.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-sm flex items-start gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !cardCode.trim() || !destinationUrl.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-primary text-on-primary font-bold text-label-lg shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Activating Card...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">published_with_changes</span>
                <span>Activate / Update Destination</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Result Display */}
      {successData && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-card space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </span>
            <span>Card activated successfully</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-emerald-900/70 uppercase tracking-wider block">
                  Card Code:
                </span>
                <span className="font-mono text-xl font-bold text-emerald-950">
                  {successData.card_code}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-emerald-900/70 uppercase tracking-wider block">
                  New Destination URL:
                </span>
                <a
                  href={successData.destination_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-900 hover:underline break-all text-sm inline-flex items-center gap-1"
                >
                  <span>{successData.destination_url}</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>

              <div>
                <span className="text-xs font-semibold text-emerald-900/70 uppercase tracking-wider block">
                  Stable Physical QR URL (Unchanged):
                </span>
                <a
                  href={successData.qr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary hover:underline break-all inline-flex items-center gap-1 font-semibold"
                >
                  <span>{successData.qr_url}</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>

              <div className="pt-2">
                <a
                  href={successData.qr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-semibold text-xs hover:bg-emerald-100/50 transition-all shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                  <span>Test Live Redirect</span>
                </a>
              </div>
            </div>

            {/* QR Preview */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-xs">
              <span className="text-xs font-semibold text-on-surface-variant mb-2">
                Scannable QR Preview
              </span>
              <DynamicQrCode cardCode={successData.card_code} size={150} />
              <span className="text-[11px] text-on-surface-variant mt-2 text-center">
                Scan with phone camera to test
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
