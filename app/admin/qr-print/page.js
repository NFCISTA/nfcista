"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getQrUrl } from "@/lib/dynamicQr";
import {
  CARD_WIDTH_MM,
  CARD_HEIGHT_MM,
  CARD_GAP_MM,
  PAGE_MARGIN_MM,
  PDF_PAGE_FORMAT,
  PDF_ORIENTATION,
  QR_SIZE_MM,
  CARD_CORNER_RADIUS_MM,
} from "@/lib/printConfig";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get session auth header for fetch calls */
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
    // Fall back to HttpOnly cookie (sent automatically)
  }
  return {};
}

/**
 * Generate a QR code PNG data-URL using the `qrcode` npm package.
 * Dynamically imported — never runs on server.
 */
async function makeQrDataUrl(text, pixels = 512) {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(text, {
    width: pixels,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: "#000000", light: "#ffffff" },
  });
}

/**
 * Generate the print PDF using jsPDF.
 * Draws each card at exact CR80 mm dimensions.
 *
 * @param {string[]} codes  Card codes to include in the PDF
 */
async function generatePdf(codes) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: PDF_ORIENTATION,
    unit: "mm",
    format: PDF_PAGE_FORMAT,
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const usableW = pageW - PAGE_MARGIN_MM * 2;
  const usableH = pageH - PAGE_MARGIN_MM * 2;

  const cardsPerRow = Math.max(
    1,
    Math.floor((usableW + CARD_GAP_MM) / (CARD_WIDTH_MM + CARD_GAP_MM))
  );
  const cardsPerCol = Math.max(
    1,
    Math.floor((usableH + CARD_GAP_MM) / (CARD_HEIGHT_MM + CARD_GAP_MM))
  );
  const cardsPerPage = cardsPerRow * cardsPerCol;

  let col = 0;
  let row = 0;
  let pageCards = 0;

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const qrUrl = getQrUrl(code);

    if (pageCards > 0 && pageCards % cardsPerPage === 0) {
      doc.addPage(PDF_PAGE_FORMAT, PDF_ORIENTATION);
      col = 0;
      row = 0;
    }

    const cardX = PAGE_MARGIN_MM + col * (CARD_WIDTH_MM + CARD_GAP_MM);
    const cardY = PAGE_MARGIN_MM + row * (CARD_HEIGHT_MM + CARD_GAP_MM);

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 210, 230);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, cardY, CARD_WIDTH_MM, CARD_HEIGHT_MM, CARD_CORNER_RADIUS_MM, CARD_CORNER_RADIUS_MM, "FD");

    // Top accent bar (rounded top + square bottom)
    doc.setFillColor(0, 74, 198);
    doc.roundedRect(cardX, cardY, CARD_WIDTH_MM, 9, CARD_CORNER_RADIUS_MM, CARD_CORNER_RADIUS_MM, "F");
    doc.rect(cardX, cardY + 5, CARD_WIDTH_MM, 4, "F");

    // Brand name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("NFCISTA", cardX + 4, cardY + 6.2);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(180, 200, 240);
    doc.text("SMART NFC BUSINESS CARD", cardX + 4, cardY + 8.5);

    // QR code
    const qrX = cardX + CARD_WIDTH_MM - QR_SIZE_MM - 5;
    const qrY = cardY + 12;
    const qrDataUrl = await makeQrDataUrl(qrUrl, 512);
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, QR_SIZE_MM, QR_SIZE_MM);

    // "SCAN TO CONNECT" label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.setTextColor(100, 120, 150);
    const scanLabel = "SCAN TO CONNECT";
    const scanLabelW = doc.getTextWidth(scanLabel);
    doc.text(scanLabel, qrX + QR_SIZE_MM / 2 - scanLabelW / 2, qrY - 2.5);

    // Card code below QR
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 40, 60);
    const codeW = doc.getTextWidth(code);
    doc.text(code, qrX + QR_SIZE_MM / 2 - codeW / 2, qrY + QR_SIZE_MM + 4.5);

    // Left-side content
    const textX = cardX + 4;
    let textY = cardY + 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 74, 198);
    doc.text("(((•)))", textX, textY);
    textY += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(20, 30, 60);
    doc.text("Dynamic NFC Card", textX, textY);
    textY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 115, 140);
    doc.text("Tap or Scan to connect.", textX, textY);
    textY += 3.5;
    doc.text("Destination can be updated", textX, textY);
    textY += 3.5;
    doc.text("without reprinting.", textX, textY);
    textY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(150, 160, 175);
    doc.text("nfcista.vercel.app", textX, textY);

    // Bottom separator
    doc.setDrawColor(220, 228, 240);
    doc.setLineWidth(0.2);
    doc.line(cardX + 3, cardY + CARD_HEIGHT_MM - 5.5, cardX + CARD_WIDTH_MM - 3, cardY + CARD_HEIGHT_MM - 5.5);

    // Bottom card ID label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5);
    doc.setTextColor(160, 170, 185);
    doc.text("Card ID:", cardX + 4, cardY + CARD_HEIGHT_MM - 2.8);
    doc.setFont("courier", "bold");
    doc.setFontSize(5);
    doc.setTextColor(0, 74, 198);
    doc.text(code, cardX + 16, cardY + CARD_HEIGHT_MM - 2.8);

    col++;
    if (col >= cardsPerRow) {
      col = 0;
      row++;
    }
    pageCards++;
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`nfcista-cards-${timestamp}-batch${codes.length}.pdf`);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QrPrintPage() {
  // Cards loaded from DB (inactive existing cards)
  const [cards, setCards] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Selection state: Set of selected card_codes
  const [selected, setSelected] = useState(new Set());

  // PDF generation
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState("");

  // Load existing inactive cards on mount
  useEffect(() => {
    async function fetchCards() {
      setIsLoading(true);
      setLoadError("");
      try {
        const authHeader = await getAuthHeader();
        const res = await fetch("/api/admin/dynamic-qr/printable", {
          headers: { ...authHeader },
        });
        const data = await res.json();
        if (!res.ok) {
          setLoadError(data.error || "Failed to load cards.");
        } else {
          setCards(data.cards || []);
        }
      } catch {
        setLoadError("Network error while loading cards.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCards();
  }, []);

  function toggleCard(code) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === cards.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(cards.map((c) => c.card_code)));
    }
  }

  async function handleGeneratePdf() {
    const selectedCodes = Array.from(selected);
    if (selectedCodes.length === 0) return;
    setIsPdfGenerating(true);
    setPdfError("");
    try {
      await generatePdf(selectedCodes);
    } catch (err) {
      console.error("PDF generation error:", err);
      setPdfError(
        "Failed to generate PDF. " + (err?.message || "Check browser console.")
      );
    } finally {
      setIsPdfGenerating(false);
    }
  }

  const allSelected = cards.length > 0 && selected.size === cards.length;
  const someSelected = selected.size > 0 && selected.size < cards.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
          Print NFC Cards
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">
          Select existing inactive cards to include in a print-ready PDF.{" "}
          <Link
            href="/admin/qr-codes"
            className="text-primary hover:underline font-semibold"
          >
            Generate new codes first
          </Link>{" "}
          if you need more cards. This page does not create new records.
        </p>
      </div>

      {/* Specs */}
      <div className="bg-surface-container-low/60 border border-outline-variant/30 rounded-2xl px-6 py-4 flex flex-wrap gap-6">
        {[
          ["Card size", `${CARD_WIDTH_MM} × ${CARD_HEIGHT_MM} mm (CR80)`],
          ["Paper", "A4, portrait"],
          ["QR encoding", "/r/[CARD_CODE] only"],
          ["DB writes", "None"],
        ].map(([label, val]) => (
          <div key={label}>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {label}
            </p>
            <p className="text-body-sm font-semibold text-on-surface mt-0.5">
              {val}
            </p>
          </div>
        ))}
      </div>

      {/* Card list */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
        {/* List header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Available Cards</h2>
          {!isLoading && !loadError && cards.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-label-sm font-semibold text-primary hover:underline cursor-pointer"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-body-sm text-on-surface-variant font-medium">
              Loading cards…
            </span>
          </div>
        )}

        {/* Load error */}
        {!isLoading && loadError && (
          <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-sm flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
            <span className="font-medium">{loadError}</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !loadError && cards.length === 0 && (
          <div className="py-10 flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
              qr_code
            </span>
            <p className="text-on-surface-variant font-medium">
              No inactive cards available for printing.
            </p>
            <Link
              href="/admin/qr-codes"
              className="inline-flex items-center gap-1.5 text-label-md font-semibold text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Generate new card codes
            </Link>
          </div>
        )}

        {/* Card list */}
        {!isLoading && !loadError && cards.length > 0 && (
          <>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {cards.map((card) => {
                const isSelected = selected.has(card.card_code);
                return (
                  <div
                    key={card.id}
                    className={`flex items-center gap-3 sm:gap-4 px-4 py-3 rounded-xl border transition-colors ${
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-outline-variant/30 bg-surface-container-low/30 hover:bg-surface-container-low/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`card-${card.id}`}
                      checked={isSelected}
                      onChange={() => toggleCard(card.card_code)}
                      className="w-4 h-4 accent-primary shrink-0 cursor-pointer"
                    />
                    <label
                      htmlFor={`card-${card.id}`}
                      className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="font-mono text-base font-bold text-on-surface tracking-wider">
                        {card.card_code}
                      </span>
                      <span className="font-mono text-xs text-primary/80 truncate flex-1">
                        {getQrUrl(card.card_code)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-800 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Inactive
                      </span>
                    </label>
                    <Link
                      href={`/admin/qr-activate?code=${encodeURIComponent(card.card_code)}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
                      title={`Activate ${card.card_code}`}
                    >
                      <span>Activate</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Selection summary + PDF button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-outline-variant/20">
              <div>
                <p className="text-label-md font-semibold text-on-surface">
                  {selected.size === 0
                    ? "No cards selected"
                    : `${selected.size} card${selected.size !== 1 ? "s" : ""} selected`}
                </p>
                {selected.size > 0 && (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    PDF will contain exactly {selected.size} card
                    {selected.size !== 1 ? "s" : ""} at {CARD_WIDTH_MM}×
                    {CARD_HEIGHT_MM}mm
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <button
                  onClick={handleGeneratePdf}
                  disabled={selected.size === 0 || isPdfGenerating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-label-md shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPdfGenerating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Generating PDF…</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">
                        picture_as_pdf
                      </span>
                      <span>
                        {selected.size === 0
                          ? "Select cards to print"
                          : `Download PDF (${selected.size})`}
                      </span>
                    </>
                  )}
                </button>
                {pdfError && (
                  <p className="text-xs text-error font-medium max-w-xs text-right">
                    {pdfError}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
