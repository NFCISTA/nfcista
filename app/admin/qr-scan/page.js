"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { extractCardCodeFromQr, isValidCardCode } from "@/lib/dynamicQr";

export default function QrScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [scannedCard, setScannedCard] = useState(null);

  const scannerRef = useRef(null);

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
      // Fall back to cookie
    }
    return {};
  }

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Stop camera scanning
  async function stopScanner() {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  }

  // Look up card details by code from the secure admin API
  async function lookupCardCode(code) {
    const cleanCode = code.trim().toUpperCase();
    setLookupLoading(true);
    setErrorMsg("");

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
      if (res.status === 404) {
        setScannedCard({
          card_code: cleanCode,
          exists: false,
        });
      } else if (!res.ok) {
        setErrorMsg(data.error || "Failed to look up card.");
      } else {
        setScannedCard({
          ...data,
          exists: true,
        });
      }
    } catch {
      setErrorMsg("A network error occurred while looking up the card.");
    } finally {
      setLookupLoading(false);
    }
  }

  // Process decoded QR text from camera
  async function handleQrSuccess(decodedText) {
    // 1. Immediately pause/stop the scanner
    await stopScanner();

    // 2. Validate URL and extract card code
    const extraction = extractCardCodeFromQr(decodedText);
    if (!extraction.valid) {
      setErrorMsg(extraction.error || "Invalid QR code scanned.");
      return;
    }

    // 3. Look up the extracted card code
    await lookupCardCode(extraction.cardCode);
  }

  // Start camera scanning
  async function startScanner() {
    setCameraError("");
    setErrorMsg("");
    setScannedCard(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      setIsScanning(true);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleQrSuccess(decodedText);
        },
        () => {
          // Frame read callback, silently ignore parse misses
        }
      );
    } catch (err) {
      console.error("Camera start failure:", err);
      setIsScanning(false);
      if (
        err?.name === "NotAllowedError" ||
        err?.message?.toLowerCase().includes("permission")
      ) {
        setCameraError(
          "Camera permission was denied. Please allow camera access in your browser settings, or use the manual code input below."
        );
      } else if (
        err?.name === "NotFoundError" ||
        err?.message?.toLowerCase().includes("not found")
      ) {
        setCameraError(
          "No camera detected on this device. Please use the manual code input below."
        );
      } else {
        setCameraError(
          "Unable to access camera. Please check your browser permissions or use the manual input below."
        );
      }
    }
  }

  // Handle manual input fallback
  async function handleManualSubmit(e) {
    e.preventDefault();
    const input = manualInput.trim();
    if (!input) return;

    setErrorMsg("");

    // If user pasted a full URL, extract via extractCardCodeFromQr
    if (input.startsWith("http://") || input.startsWith("https://")) {
      const extraction = extractCardCodeFromQr(input);
      if (!extraction.valid) {
        setErrorMsg(extraction.error || "Invalid NFCISTA QR URL.");
        return;
      }
      await lookupCardCode(extraction.cardCode);
    } else {
      // If user typed a direct card code, validate format
      const clean = input.toUpperCase();
      if (!isValidCardCode(clean)) {
        setErrorMsg("Invalid card code format (e.g. NF8K29).");
        return;
      }
      await lookupCardCode(clean);
    }
  }

  // Reset to scan another card
  function handleScanAnother() {
    setScannedCard(null);
    setErrorMsg("");
    setCameraError("");
    setManualInput("");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header & Breadcrumbs */}
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
            Dynamic QR Scanner
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          Physical Card QR Scanner
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">
          Point your camera at any printed NFCISTA card to instantly identify its card code, active status, and current destination.
        </p>
      </div>

      {/* Result Card: Displayed when a card has been scanned/identified */}
      {scannedCard ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-card space-y-6 animate-fadeIn">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Identified Card Code:
              </span>
              <span className="font-mono text-3xl font-bold text-on-surface tracking-wider">
                {scannedCard.card_code}
              </span>
            </div>

            {scannedCard.exists ? (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                  scannedCard.is_active
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-amber-50 border border-amber-200 text-amber-800"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    scannedCard.is_active ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {scannedCard.is_active ? "Active" : "Inactive / Reserved"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 border border-red-200 text-red-700 shrink-0">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Not Registered
              </span>
            )}
          </div>

          <div className="border-t border-outline-variant/20 pt-4 space-y-3">
            {scannedCard.exists ? (
              <>
                <div>
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                    Current Destination:
                  </span>
                  <a
                    href={scannedCard.destination_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline break-all text-sm inline-flex items-center gap-1 mt-0.5"
                  >
                    <span>{scannedCard.destination_url}</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>

                <div>
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                    Physical QR URL:
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant break-all block mt-0.5">
                    {scannedCard.qr_url}
                  </span>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-sm">
                This card code ({scannedCard.card_code}) is not found in the database.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleScanAnother}
              className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container-high text-on-surface font-semibold text-label-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              <span>Scan Another Card</span>
            </button>

            {scannedCard.exists && (
              <Link
                href={`/admin/qr-activate?code=${encodeURIComponent(scannedCard.card_code)}`}
                className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-label-md shadow-btn-primary transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">published_with_changes</span>
                <span>Open Activation</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Camera Scanner & Manual Input Shell */
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-card space-y-6">
          {/* Scanner Viewport */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-black/95 min-h-[260px] sm:min-h-[300px] flex items-center justify-center">
              {/* HTML5 QR reader div */}
              <div
                id="qr-reader"
                className={`w-full ${isScanning ? "block" : "hidden"}`}
              />

              {!isScanning && (
                <div className="p-4 sm:p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto border border-white/20">
                    <span className="material-symbols-outlined text-[36px]">
                      qr_code_scanner
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-lg">
                      Ready to Scan
                    </h3>
                    <p className="text-white/70 text-xs max-w-[280px] mx-auto leading-relaxed">
                      Click below to activate your device camera and scan any physical NFCISTA card.
                    </p>
                  </div>
                  <button
                    onClick={startScanner}
                    className="w-full sm:w-auto py-3 px-6 rounded-xl bg-primary text-on-primary font-bold text-label-md hover:bg-primary-hover active:scale-[0.98] transition-all shadow-btn-primary inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">videocam</span>
                    <span>Start Camera Scanner</span>
                  </button>
                </div>
              )}

              {/* Scanning active control */}
              {isScanning && (
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={stopScanner}
                    className="py-1.5 px-3 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20 text-xs font-semibold hover:bg-black/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">stop</span>
                    <span>Stop Camera</span>
                  </button>
                </div>
              )}
            </div>

            {/* Camera Permission / Access Error */}
            {cameraError && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-body-sm flex items-start gap-2.5 animate-fadeIn">
                <span className="material-symbols-outlined text-[20px] text-amber-700 shrink-0">
                  warning
                </span>
                <span className="font-medium text-xs leading-relaxed">{cameraError}</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-sm flex items-start gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Divider */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="w-full border-t border-outline-variant/30" />
            <span className="absolute px-3 bg-surface-container-lowest text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
              Or Manual Fallback
            </span>
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="manualInput"
                className="text-label-md font-bold text-on-surface block mb-1"
              >
                Enter QR URL or Card Code
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  id="manualInput"
                  type="text"
                  value={manualInput}
                  onChange={(e) => {
                    setManualInput(e.target.value);
                    setErrorMsg("");
                  }}
                  placeholder="https://nfcista.vercel.app/r/NF8K29 or NF8K29"
                  className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 text-on-surface text-sm font-medium placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                />
                <button
                  type="submit"
                  disabled={lookupLoading || !manualInput.trim()}
                  className="py-3 px-5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto"
                >
                  {lookupLoading ? (
                    <span className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">search</span>
                  )}
                  <span>Look Up Card</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant">
              Accepts full NFCISTA QR URLs or direct alphanumeric card codes (e.g. <code className="font-mono font-semibold">NF8K29</code>).
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
