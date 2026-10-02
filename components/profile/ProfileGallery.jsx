"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a WhatsApp deep-link for a product inquiry.
 * Strips all non-digit characters from the number per wa.me requirements.
 */
function buildWhatsAppUrl(rawNumber, productTitle) {
  const digits = (rawNumber || "").replace(/\D/g, "");
  if (!digits) return null;
  const text = encodeURIComponent(`Hi, I am interested in ${productTitle}.`);
  return `https://wa.me/${digits}?text=${text}`;
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

function Lightbox({ images, initialIndex, title, onClose }) {
  const [current, setCurrent] = useState(initialIndex ?? 0);
  const overlayRef = useRef(null);

  const goNext = useCallback(() =>
    setCurrent((i) => (i + 1) % images.length), [images.length]);
  const goPrev = useCallback(() =>
    setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, goNext, goPrev]);

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  const img = images[current];

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — image ${current + 1} of ${images.length}`}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={handleOverlayClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors z-10"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>

      {/* Image */}
      <div className="relative w-full max-w-2xl max-h-[80vh] flex items-center justify-center">
        <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
          <Image
            src={img.image_url}
            alt={`${title} — image ${current + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      </div>

      {/* Prev / Next arrows — only when multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous image"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">chevron_left</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next image"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">chevron_right</span>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === current ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery Card
// ---------------------------------------------------------------------------

function GalleryCard({ item, whatsapp }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const hasImages = item.images.length > 0;
  const firstImage = hasImages ? item.images[0] : null;
  const isPortfolio = item.type === "portfolio";
  const isProduct = item.type === "product";

  const whatsAppUrl =
    isProduct && item.whatsapp_enabled && whatsapp
      ? buildWhatsAppUrl(whatsapp, item.title)
      : null;

  function openLightbox(index = 0) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
        {/* Image thumbnail */}
        {hasImages ? (
          <button
            type="button"
            className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden flex-shrink-0 group"
            onClick={() => openLightbox(0)}
            aria-label={`View images for ${item.title}`}
          >
            <Image
              src={firstImage.image_url}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 280px"
            />
            {/* Multi-image badge */}
            {item.images.length > 1 && (
              <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]" aria-hidden="true">photo_library</span>
                {item.images.length}
              </span>
            )}
            {/* Type badge */}
            <span
              className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                isPortfolio
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {item.type}
            </span>
          </button>
        ) : (
          /* Placeholder when no images */
          <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[40px] text-gray-300" aria-hidden="true">
              {isPortfolio ? "collections" : "inventory_2"}
            </span>
            <span
              className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                isPortfolio
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {item.type}
            </span>
          </div>
        )}

        {/* Card body */}
        <div className="flex flex-col flex-1 p-3">
          {/* Category — only shown when it adds information beyond the title */}
          {item.category && item.category.trim().toLowerCase() !== item.title.trim().toLowerCase() && (
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5 truncate">
              {item.category}
            </p>
          )}

          {/* Title */}
          <h3 className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2">
            {item.title}
          </h3>


          {/* Price — products only */}
          {isProduct && item.price && (
            <p className="text-[12px] font-semibold text-primary mt-1">
              {item.price}
            </p>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-[11.5px] text-gray-500 leading-relaxed mt-1.5 line-clamp-2 flex-1">
              {item.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-2.5 flex flex-col gap-1.5">
            {/* WhatsApp CTA — products */}
            {whatsAppUrl && (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[11.5px] font-semibold rounded-xl transition-colors active:scale-[0.97]"
              >
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">chat</span>
                Order on WhatsApp
              </a>
            )}

            {/* External link */}
            {item.external_url && (
              <a
                href={item.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 py-2 px-3 border border-gray-200 text-gray-700 hover:bg-gray-50 text-[11.5px] font-medium rounded-xl transition-colors active:scale-[0.97]"
              >
                {item.cta_text || "View Details"}
                <span className="material-symbols-outlined text-[13px]" aria-hidden="true">open_in_new</span>
              </a>
            )}
          </div>
        </div>
      </article>

      {/* Lightbox */}
      {lightboxOpen && hasImages && (
        <Lightbox
          images={item.images}
          initialIndex={lightboxIndex}
          title={item.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Section Component
// ---------------------------------------------------------------------------

const INITIAL_VISIBLE = 6;

/**
 * ProfileGallery
 *
 * Renders the "Portfolio & Products" section on the public profile.
 * Must be hidden entirely when items is empty — the parent page does this check
 * before rendering this component, but we also guard internally.
 *
 * @param {{ items: object[], customer: object }} props
 */
export default function ProfileGallery({ items, customer }) {
  const [showAll, setShowAll] = useState(false);

  if (!items || items.length === 0) return null;

  const visibleItems = showAll ? items : items.slice(0, INITIAL_VISIBLE);
  const hasMore = items.length > INITIAL_VISIBLE;

  const whatsappRaw = customer?.whatsapp?.trim() || null;

  return (
    <section
      className="px-3.5 sm:px-5 py-4 sm:py-5"
      aria-label="Portfolio and Products"
    >
      {/* Section header */}
      <div className="mb-3">
        <h2 className="text-[15px] font-bold text-gray-900">
          Portfolio &amp; Products
        </h2>
        <p className="text-[11.5px] text-gray-400 mt-0.5">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Responsive grid: 2-col mobile, 3-col md+ */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
        {visibleItems.map((item) => (
          <GalleryCard key={item.id} item={item} whatsapp={whatsappRaw} />
        ))}
      </div>

      {/* View All toggle */}
      {hasMore && !showAll && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 text-[12.5px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.97]"
          >
            View All ({items.length})
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">expand_more</span>
          </button>
        </div>
      )}
    </section>
  );
}
