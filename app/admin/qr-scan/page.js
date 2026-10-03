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
  // DIAGNOSTIC — temporary; remove after root cause confirmed
  const [diagLog, setDiagLog] = useState([]);
  const [envLog, setEnvLog] = useState([]);

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

  // DIAGNOSTIC: Passive environment check — does NOT call getUserMedia
  async function runEnvDiag() {
    const logs = [];
    const log = (msg) => { logs.push(msg); setEnvLog([...logs]); console.log("[ENV]", msg); };

    log("── Origin / Context ──────────────────────────────");
    log(`origin: ${window.location.origin}`);
    log(`href: ${window.location.href}`);
    log(`isSecureContext: ${window.isSecureContext}`);
    log(`protocol: ${window.location.protocol}`);
    log(`top === self: ${window.top === window.self}  (false = inside iframe)`);

    log("── User Agent ────────────────────────────────────");
    log(`userAgent: ${navigator.userAgent}`);

    log("── Permissions API ───────────────────────────────");
    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: "camera" });
        log(`permissions.query(camera).state: ${status.state}`);
        // 'granted' | 'prompt' | 'denied'
      } catch (e) {
        log(`permissions.query(camera) threw: ${e?.name}: ${e?.message}`);
      }
    } else {
      log("navigator.permissions: NOT AVAILABLE");
    }

    log("── Permissions Policy ────────────────────────────");
    try {
      const pp = document.permissionsPolicy;
      if (pp) {
        log(`document.permissionsPolicy exists: true`);
        log(`  allowsFeature("camera"): ${pp.allowsFeature("camera")}`);
        try {
          const origins = pp.getAllowlistForFeature("camera");
          log(`  getAllowlistForFeature("camera"): ${JSON.stringify(origins)}`);
        } catch (e2) {
          log(`  getAllowlistForFeature threw: ${e2?.message}`);
        }
      } else {
        log("document.permissionsPolicy: NOT AVAILABLE");
      }
    } catch (e) {
      log(`permissionsPolicy check threw: ${e?.message}`);
    }
    try {
      const fp = document.featurePolicy;
      if (fp) {
        log(`document.featurePolicy exists: true`);
        log(`  allowsFeature("camera"): ${fp.allowsFeature("camera")}`);
      } else {
        log("document.featurePolicy: NOT AVAILABLE");
      }
    } catch (e) {
      log(`featurePolicy check threw: ${e?.message}`);
    }

    log("── Enumerate Devices (no permission needed) ──────");
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === "videoinput");
      log(`total devices: ${devices.length}`);
      log(`videoinput count: ${videoInputs.length}`);
      videoInputs.forEach((d, i) => {
        // label is empty string until permission granted — that's expected
        log(`  [${i}] deviceId=${d.deviceId || "(empty)"} label="${d.label || "(no label — permission not yet granted)"}"`);
      });
      if (videoInputs.length === 0) {
        log("  ⚠ NO video input devices reported by browser");
      }
    } catch (e) {
      log(`enumerateDevices threw: ${e?.name}: ${e?.message}`);
    }

    log("── Done ──────────────────────────────────────────");
  }

  // Start camera scanning with graceful mobile and desktop fallback
  async function startScanner() {
    setCameraError("");
    setErrorMsg("");
    setScannedCard(null);

    // DIAGNOSTIC: collect step-by-step logs shown in the UI
    const logs = [];
    const log = (msg) => {
      logs.push(msg);
      setDiagLog([...logs]);
      console.log("[DIAG]", msg);
    };

    // ── Environment checks ────────────────────────────────────────────────────
    log(`isSecureContext: ${window?.isSecureContext}`);
    log(`protocol: ${window?.location?.protocol}`);
    log(`host: ${window?.location?.host}`);
    log(`navigator.mediaDevices: ${!!navigator?.mediaDevices}`);
    log(`getUserMedia: ${typeof navigator?.mediaDevices?.getUserMedia}`);

    // 1. Check for secure context (HTTPS or localhost required for camera access)
    if (
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      log("FAIL: not a secure context");
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
      log("FAIL: navigator.mediaDevices not available");
      setCameraError(
        "Camera access is not supported by this browser. Please use a modern browser (such as Chrome, Safari, or Firefox), or use the manual card code input below."
      );
      return;
    }

    setIsStarting(true);

    try {
      // ── Pre-flight raw getUserMedia probe ───────────────────────────────────
      // This is the FIRST await — preserves iOS Safari user-gesture chain.
      // It also catches the real Error object before html5-qrcode wraps it in a string.
      log("probe: calling getUserMedia({video:true})...");
      let probeStream = null;
      try {
        probeStream = await navigator.mediaDevices.getUserMedia({ video: true });
        log(`probe: SUCCESS — tracks: ${probeStream.getTracks().length}`);
        probeStream.getTracks().forEach((t) => {
          log(`  track: kind=${t.kind} label="${t.label}" readyState=${t.readyState}`);
          t.stop();
        });
        log("probe: all tracks stopped");
      } catch (probeErr) {
        // Show the REAL raw error — not a generic message
        log(`probe: FAILED`);
        log(`  err.name: ${probeErr?.name}`);
        log(`  err.message: ${probeErr?.message}`);
        log(`  err.constraint: ${probeErr?.constraint}`);
        log(`  typeof err: ${typeof probeErr}`);
        log(`  String(err): ${String(probeErr)}`);
        setCameraError(
          `[DIAG] getUserMedia FAILED\n` +
          `name: ${probeErr?.name}\n` +
          `message: ${probeErr?.message || "(none)"}\n` +
          `constraint: ${probeErr?.constraint || "(none)"}\n` +
          `toString: ${String(probeErr)}`
        );
        setIsStarting(false);
        return; // Stop here — no point trying html5-qrcode if raw gUM fails
      }

      // ── Try Html5Qrcode.getCameras() before starting ────────────────────────
      log("loading html5-qrcode module...");
      const { Html5Qrcode } = await import("html5-qrcode");
      log("html5-qrcode loaded");

      log("calling Html5Qrcode.getCameras()...");
      let cameras = [];
      try {
        cameras = await Html5Qrcode.getCameras();
        log(`getCameras: found ${cameras?.length ?? 0} camera(s)`);
        cameras.forEach((c, i) => log(`  [${i}] id=${c.id} label="${c.label}"`));
      } catch (camErr) {
        log(`getCameras: FAILED — ${camErr?.name}: ${camErr?.message || String(camErr)}`);
      }

      // ── Clean up any stale scanner instance ─────────────────────────────────
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
      log(`#qr-reader clientWidth=${readerElem.clientWidth} clientHeight=${readerElem.clientHeight}`);
      readerElem.innerHTML = "";

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Responsive qrbox — no aspectRatio constraint
      const config = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.max(Math.min(Math.floor(minEdge * 0.72), 280), 160);
          log(`qrbox called: vw=${viewfinderWidth} vh=${viewfinderHeight} → size=${size}`);
          return { width: size, height: size };
        },
      };

      const onScanSuccess = (decodedText) => {
        handleQrSuccess(decodedText);
      };

      // Strategy 1: Attempt back/environment camera
      let cameraStarted = false;
      log("strategy 1: scanner.start({facingMode:environment})...");
      try {
        await scanner.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          () => {}
        );
        cameraStarted = true;
        log("strategy 1: SUCCESS");
      } catch (envErr) {
        log(`strategy 1: FAILED — typeof=${typeof envErr} name=${envErr?.name} msg=${envErr?.message || String(envErr)}`);
        if (
          envErr?.name === "NotAllowedError" ||
          envErr?.name === "PermissionDeniedError" ||
          envErr?.toString()?.toLowerCase().includes("permission") ||
          envErr?.toString()?.toLowerCase().includes("notallowed")
        ) {
          throw envErr;
        }
      }

      // Strategy 2: Fallback to front/user camera
      if (!cameraStarted) {
        log("strategy 2: scanner.start({facingMode:user})...");
        try {
          await scanner.start(
            { facingMode: "user" },
            config,
            onScanSuccess,
            () => {}
          );
          cameraStarted = true;
          log("strategy 2: SUCCESS");
        } catch (userErr) {
          log(`strategy 2: FAILED — typeof=${typeof userErr} name=${userErr?.name} msg=${userErr?.message || String(userErr)}`);
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

      // Strategy 3: Device ID enumeration fallback
      if (!cameraStarted) {
        if (cameras.length === 0) {
          const notFound = new Error("No camera detected on this device.");
          notFound.name = "NotFoundError";
          throw notFound;
        }
        const backCam = cameras.find((c) => /back|rear|environment/i.test(c.label));
        const selectedId = backCam ? backCam.id : cameras[0].id;
        log(`strategy 3: scanner.start(deviceId=${selectedId})...`);
        try {
          await scanner.start(selectedId, config, onScanSuccess, () => {});
          cameraStarted = true;
          log("strategy 3: SUCCESS");
        } catch (devErr) {
          log(`strategy 3: FAILED — ${devErr?.name}: ${devErr?.message || String(devErr)}`);
          throw devErr;
        }
      }

      setIsScanning(true);
      setIsStarting(false);
    } catch (err) {
      console.error("Camera start failure:", err);
      log(`FINAL catch: typeof=${typeof err} name=${err?.name} message=${err?.message || String(err)}`);
      setIsScanning(false);
      setIsStarting(false);

      if (scannerRef.current) {
        try { scannerRef.current.clear(); } catch {}
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
          `[DIAG] Permission denied\nname: ${err?.name}\nmessage: ${err?.message || "(none)"}\nfull: ${String(err)}`
        );
      } else if (
        err?.name === "NotFoundError" ||
        err?.name === "DevicesNotFoundError" ||
        errStr.includes("not found") ||
        errStr.includes("notfound") ||
        errStr.includes("no camera")
      ) {
        setCameraError(
          `[DIAG] No camera found\nname: ${err?.name}\nmessage: ${err?.message || "(none)"}\nfull: ${String(err)}`
        );
      } else if (
        err?.name === "NotReadableError" ||
        err?.name === "TrackStartError" ||
        errStr.includes("in use")
      ) {
        setCameraError(
          `[DIAG] Camera in use\nname: ${err?.name}\nmessage: ${err?.message || "(none)"}\nfull: ${String(err)}`
        );
      } else if (err?.name === "OverconstrainedError") {
        setCameraError(
          `[DIAG] OverconstrainedError\nconstraint: ${err?.constraint}\nmessage: ${err?.message || "(none)"}`
        );
      } else {
        setCameraError(
          `[DIAG] Unknown error\nname: ${err?.name}\nmessage: ${err?.message || "(none)"}\nfull: ${String(err)}\nerrStr: ${errStr}`
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
                <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">{cameraError}</pre>
              </div>
            )}

            {/* DIAGNOSTIC LOG — temporary; remove after root cause confirmed */}
            {diagLog.length > 0 && (
              <div className="p-3 rounded-xl bg-black border border-white/10 text-green-400 font-mono text-[11px] leading-relaxed space-y-0.5 max-h-72 overflow-y-auto">
                <div className="text-white/50 font-bold mb-1 text-[10px] uppercase tracking-wider">
                  📷 Camera Diagnostic Log
                </div>
                {diagLog.map((line, i) => (
                  <div key={i} className={line.startsWith("  ") ? "pl-4 text-yellow-300" : line.includes("FAIL") || line.includes("FAILED") ? "text-red-400 font-bold" : line.includes("SUCCESS") ? "text-green-300 font-bold" : "text-green-400"}>
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ENVIRONMENT DIAGNOSIS — temporary; remove after root cause confirmed */}
          <div className="space-y-2">
            <button
              onClick={runEnvDiag}
              className="w-full py-2 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-blue-100 font-mono font-bold text-xs border border-blue-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              🔬 Run Environment Diagnosis (no camera access)
            </button>
            {envLog.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 border border-blue-800/40 text-blue-200 font-mono text-[11px] leading-relaxed space-y-0.5 max-h-96 overflow-y-auto">
                <div className="text-blue-400/60 font-bold mb-1 text-[10px] uppercase tracking-wider">
                  🔬 Environment Diagnosis
                </div>
                {envLog.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.startsWith("──")
                        ? "text-blue-400 font-bold mt-1"
                        : line.startsWith("  ")
                        ? "pl-4 text-yellow-200"
                        : line.includes("⚠") || line.includes("NOT AVAILABLE") || line.includes("denied") || line.includes("threw")
                        ? "text-red-400 font-bold"
                        : line.includes("granted")
                        ? "text-green-400 font-bold"
                        : line.includes("prompt")
                        ? "text-amber-300 font-bold"
                        : "text-blue-200"
                    }
                  >
                    {line}
                  </div>
                ))}
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
