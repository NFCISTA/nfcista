"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import WhatsAppOrderButton from "@/components/products/WhatsAppOrderButton";

/**
 * Shared product page template for all NFCISTA product pages.
 * Accepts a `product` object and renders the full page layout.
 */
export default function ProductPageTemplate({ product }) {
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
        <h1 className="text-2xl font-bold text-on-surface">Product Not Found</h1>
        <p className="text-on-surface-variant mt-2">The requested product could not be found.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const {
    name,
    badge,
    tagline,
    description,
    image,
    theme = {},
    benefits = [],
    useCases = [],
    howItWorks = [],
  } = product;

  const defaultVariantId = product?.variants?.[0]?.id || null;
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariantId);

  const activeVariant =
    product?.variants?.find((v) => v.id === selectedVariantId) ||
    product?.variants?.[0] ||
    null;

  const currentVariantId = activeVariant?.id || null;
  const currentImage = activeVariant ? activeVariant.image : (image || "/images/product-showcase.png");
  const currentAlt = activeVariant ? `${name} - ${activeVariant.label}` : name;
  const orderProductName =
    activeVariant && product.variants && product.variants.length > 1
      ? `${name} (${activeVariant.label})`
      : name;

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-primary selection:text-white">
      {/* ── Sticky Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-btn-primary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">contactless</span>
            </div>
            <span className="text-headline-md font-bold tracking-tight text-on-surface">
              NFCISTA
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Products
            </Link>
            <WhatsAppOrderButton
              productName={orderProductName}
              size="sm"
            />
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero Section ─────────────────────────────────── */}
        <section className="relative pt-14 pb-24 md:pt-20 md:pb-28 overflow-hidden">
          {/* Background glow */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 ${theme.heroBg} pointer-events-none -z-10`}
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left: Copy */}
              <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
                {/* Back link — mobile */}
                <Link
                  href="/products"
                  className="sm:hidden inline-flex items-center gap-1.5 text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Back to Products
                </Link>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/30">
                  <span
                    className={`material-symbols-outlined text-[16px] ${theme.accentText}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {theme.accentIcon}
                  </span>
                  <span className={`text-label-sm font-bold tracking-wide uppercase ${theme.accentText}`}>
                    {badge}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-on-surface leading-[1.15]">
                  {name}
                </h1>

                <p className="text-lg text-on-surface-variant leading-relaxed max-w-lg">
                  {tagline}
                </p>

                {/* Coming Soon badge */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-label-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Coming Soon
                  </span>
                </div>

                <WhatsAppOrderButton
                  productName={orderProductName}
                  size="lg"
                  label="Order on WhatsApp"
                />
              </div>

              {/* Right: Real product visual */}
              <div className="lg:col-span-6 flex justify-center items-center relative">
                {/* Aura glow */}
                <div className={`absolute -inset-6 ${theme.auraGlow} rounded-3xl blur-3xl -z-10`} />

                <div className="relative w-full max-w-[420px] flex flex-col items-center">
                  <div className="relative w-full">
                    {/* Real product visual container */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/30 bg-surface-container-lowest">
                      <Image
                        src={currentImage}
                        alt={currentAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 420px"
                        className="object-contain"
                        priority
                      />
                    </div>

                    {/* Floating pill: Coming Soon */}
                    <div className="absolute -bottom-4 -right-2 sm:-right-6 bg-white border border-outline-variant/30 rounded-xl px-3.5 py-2 shadow-float flex items-center gap-2 z-10 pointer-events-none">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-on-surface">Coming Soon</div>
                        <div className="text-[10px] text-on-surface-variant">Order via WhatsApp</div>
                      </div>
                    </div>
                  </div>

                  {/* Variant selector (only for products with variants, e.g. Digital Business Card & Google Review) */}
                  {product.variants && product.variants.length > 1 && (
                    <div
                      className="mt-8 flex items-center gap-1.5 p-1 rounded-full bg-white/90 backdrop-blur-sm border border-outline-variant/30 shadow-xs relative z-20"
                      role="group"
                      aria-label={`${name} variants`}
                    >
                      {product.variants.map((v) => {
                        const isSelected = v.id === currentVariantId;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariantId(v.id)}
                            aria-pressed={isSelected}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              isSelected
                                ? "bg-primary text-white shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                            }`}
                          >
                            {v.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Description ──────────────────────────────────── */}
        <section className="py-16 bg-white border-y border-outline-variant/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
              About This Card
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mt-2 mb-4 tracking-tight">
              What Is the {name}?
            </h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
                Simple Process
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mt-2 tracking-tight">
                How It Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howItWorks.map((step, i) => (
                <div
                  key={step.title}
                  className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-card flex flex-col"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-primary/25 tracking-tight">
                      0{i + 1}
                    </span>
                    <div className="w-11 h-11 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">{step.icon}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-2">{step.title}</h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Key Benefits ─────────────────────────────────── */}
        <section className="py-20 bg-white border-y border-outline-variant/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
                Why It Works
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mt-2 tracking-tight">
                Key Benefits
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="flex items-start gap-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-card hover:border-primary/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex-shrink-0 flex items-center justify-center mt-0.5">
                    <span className="material-symbols-outlined text-[20px]">{b.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-sm mb-1">{b.title}</h3>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">{b.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Use Cases ────────────────────────────────────── */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
                Who It&apos;s For
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mt-2 tracking-tight">
                Ideal Use Cases
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {useCases.map((u) => (
                <div
                  key={u}
                  className="flex items-center gap-3 bg-white border border-outline-variant/30 rounded-xl px-5 py-4 shadow-card"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary flex-shrink-0">
                    check_circle
                  </span>
                  <span className="text-body-md font-medium text-on-surface">{u}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="py-20 bg-white border-t border-outline-variant/20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-10 sm:p-14 shadow-float">
              <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
                Ready to Order?
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mt-2 mb-3 tracking-tight">
                Get Your {name}
              </h2>
              <p className="text-body-lg text-on-surface-variant mb-8 max-w-md mx-auto leading-relaxed">
                This card is coming soon. Reach out on WhatsApp to express interest and be among the first to order.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <WhatsAppOrderButton
                  productName={orderProductName}
                  size="lg"
                  label="Order on WhatsApp"
                />
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-outline-variant/60 bg-white text-on-surface font-semibold text-label-lg hover:border-primary hover:text-primary transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  <span>Back to Products</span>
                </Link>
              </div>

              {/* Task 6 — Business contact trust CTA */}
              <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-center gap-3">
                <span className="text-body-sm text-on-surface-variant">Have a question?</span>
                <a
                  href="https://wa.me/919000000000?text=Hi%20NFCISTA%2C%20I%20have%20a%20question%20about%20your%20NFC%20cards."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-[#25D366] hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Talk to NFCISTA on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Back to all products ──────────────────────────── */}
        <div className="py-8 flex justify-center bg-[#F8FAFC] border-t border-outline-variant/20">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-body-md font-semibold text-primary hover:underline transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            View All NFCISTA Products
          </Link>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-white border-t border-outline-variant/20 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[13px]">contactless</span>
            </div>
            <span className="font-bold text-on-surface">NFCISTA</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>·</span>
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
          <span>© 2026 NFCISTA. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
