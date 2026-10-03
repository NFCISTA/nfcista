"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { extractCardCodeFromQr, isValidCardCode } from "@/lib/dynamicQr";

export default function QrScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
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
        } catch {}
        scannerRef.current = null;
      }
    };
  }, []);

  // Stop camera scanning and release hardware stream
  async function stopScanner() {
    setIsStarting(false);
    setIsScanning(false);
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn("Error stopping scanner:", err);
      }
      try {
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
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
    // 1. Immediately pause/stop the scanner and release hardware
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

  // Start camera scanning with graceful mobile and desktop fallback
  async function startScanner() {
    setCameraError("");
    setErrorMsg("");
    setScannedCard(null);

    // 1. Check for secure context (HTTPS or localhost required for camera access)
    if (
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      setCameraError(
        "Camera access requires a secure HTTPS connection. Please ensure you are accessing this portal via HTTPS."
      );
      return;
    }

    // 2. Check for navigator.mediaDevices support in browser
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "Camera access is not supported by this browser. Please use a modern browser (such as Chrome, Safari, or Firefox), or use the manual card code input below."
      );
      return;
    }

    setIsStarting(true);

    try {
      // 3. Pre-flight permission probe — uses a real Error object (not html5-qrcode's
      //    string-wrapped errors), triggered directly inside the user-gesture call stack.
      //    This preserves the iOS Safari user-gesture requirement and gives us a proper
      //    NotAllowedError if permission is denied or was dismissed.
      let probeStream;
      try {
        probeStream = await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (probeErr) {
        // Re-throw as a real Error so the catch block below classifies it correctly
        const e = new Error(probeErr?.message || String(probeErr));
        e.name = probeErr?.name || "NotAllowedError";
        throw e;
      }
      // Immediately release the probe stream — html5-qrcode will open its own
      probeStream.getTracks().forEach((t) => t.stop());

      // 4. Pre-load the html5-qrcode module. Doing this after the probe keeps the
      //    module import outside the user-gesture chain (iOS only requires the
      //    getUserMedia call itself to be in the gesture stack, which the probe above
      //    satisfies). The module is already cached by the browser after first load.
      const { Html5Qrcode } = await import("html5-qrcode");

      // Clean up any stale scanner instance
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }

      const readerElem = document.getElementById("qr-reader");
      if (!readerElem) {
        throw new Error("Scanner container element not found.");
      }
      readerElem.innerHTML = "";

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Responsive qrbox — no aspectRatio constraint (breaks mobile Safari & some
      // Android Chrome versions with OverconstrainedError via applyConstraints)
      const config = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.max(Math.min(Math.floor(minEdge * 0.72), 280), 160);
          return { width: size, height: size };
        },
      };

      const onScanSuccess = (decodedText) => {
        handleQrSuccess(decodedText);
      };

      // Strategy 1: Attempt back/environment camera (best for scanning physical cards on mobile phones)
      let cameraStarted = false;
      try {
        await scanner.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          () => {} // Frame read miss - silent
        );
        cameraStarted = true;
      } catch (envErr) {
        console.warn("Back camera attempt failed, checking fallback:", envErr);
        if (
          envErr?.name === "NotAllowedError" ||
          envErr?.name === "PermissionDeniedError" ||
          envErr?.toString()?.toLowerCase().includes("permission") ||
          envErr?.toString()?.toLowerCase().includes("notallowed")
        ) {
          throw envErr;
        }
      }

      // Strategy 2: Fallback to user-facing camera (for laptops / desktops with front-facing webcams only)
      if (!cameraStarted) {
        try {
          await scanner.start(
            { facingMode: "user" },
            config,
            onScanSuccess,
            () => {}
          );
          cameraStarted = true;
        } catch (userErr) {
          console.warn("User camera attempt failed, checking device enumeration:", userErr);
          if (
            userErr?.name === "NotAllowedError" ||
            userErr?.name === "PermissionDeniedError" ||
            userErr?.toString()?.toLowerCase().includes("permission") ||
            userErr?.toString()?.toLowerCase().includes("notallowed")
          ) {
            throw userErr;
          }
        }
      }

      // Strategy 3: Query device enumeration directly
      if (!cameraStarted) {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          const notFound = new Error("No camera detected on this device.");
          notFound.name = "NotFoundError";
          throw notFound;
        }

        const backCam = cameras.find((c) => /back|rear|environment/i.test(c.label));
        const selectedId = backCam ? backCam.id : cameras[0].id;

        await scanner.start(
          selectedId,
          config,
          onScanSuccess,
          () => {}
        );
        cameraStarted = true;
      }

      setIsScanning(true);
      setIsStarting(false);
    } catch (err) {
      console.error("Camera start failure:", err);
      setIsScanning(false);
      setIsStarting(false);

      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }

      const errStr = (err?.message || err?.name || String(err)).toLowerCase();
      if (
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError" ||
        errStr.includes("permission") ||
        errStr.includes("notallowed")
      ) {
        setCameraError(
          "Camera permission was denied. Please allow camera access in your browser settings (look for the camera icon in your browser address bar), or use the manual code input below."
        );
      } else if (
        err?.name === "NotFoundError" ||
        err?.name === "DevicesNotFoundError" ||
        errStr.includes("not found") ||
        errStr.includes("notfound") ||
        errStr.includes("no camera")
      ) {
        setCameraError(
          "No camera detected on this device. Please connect a camera or use the manual code input below."
        );
      } else if (
        err?.name === "NotReadableError" ||
        err?.name === "TrackStartError" ||
        errStr.includes("in use")
      ) {
        setCameraError(
          "Camera is currently in use by another application or browser tab. Please close any other app using the camera and try again."
        );
      } else if (err?.name === "OverconstrainedError") {
        setCameraError(
          "Your camera does not support the requested video mode. Please use the manual card code input below."
        );
      } else {
        setCameraError(
          "Unable to access camera (" +
            (err?.message || "device error") +
            "). Please check your browser permissions or use the manual code input below."
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
  async function handleScanAnother() {
    await stopScanner();
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
            <div className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-black/95 min-h-[280px] sm:min-h-[320px] flex items-center justify-center">
              {/* HTML5 QR reader div: always mounted in DOM with non-zero dimensions */}
              <div
                id="qr-reader"
                className="w-full [&_video]:rounded-2xl [&_video]:object-cover"
              />

              {/* Ready to scan / Start camera overlay */}
              {!isScanning && (
                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8 text-center space-y-4 z-10">
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
                    disabled={isStarting}
                    className="w-full sm:w-auto py-3 px-6 rounded-xl bg-primary text-on-primary font-bold text-label-md hover:bg-primary-hover active:scale-[0.98] transition-all shadow-btn-primary inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isStarting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Starting Camera...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">videocam</span>
                        <span>Start Camera Scanner</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Scanning active control */}
              {isScanning && (
                <div className="absolute top-3 right-3 z-20">
                  <button
                    onClick={stopScanner}
                    className="py-1.5 px-3 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20 text-xs font-semibold hover:bg-black/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
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
