import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

export default function Hero() {
  // Check if user uploaded a custom hero photo
  const heroPhotoPath = path.join(process.cwd(), "public", "images", "hero-product.png");
  const hasCustomPhoto = fs.existsSync(heroPhotoPath);

  return (
    <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 bg-ink overflow-hidden border-b border-line">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-8 animate-fadeUp">
            {/* Mono Category Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink-alt border border-line">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              <span className="font-mono text-xs uppercase tracking-wider text-brand-text">
                Smart NFC for shops
              </span>
            </div>

            {/* H1 Headline */}
            <h1 className="font-display font-bold text-fg tracking-[-0.035em] text-[40px] sm:text-[54px] lg:text-[76px] leading-[1.05]">
              Not a sticker. A tap system built for your shop.
            </h1>

            {/* Body Copy */}
            <p className="font-sans text-base sm:text-lg text-muted max-w-xl leading-relaxed">
              Most NFC sellers hand you a blank tag. We design, program and test a finished piece that turns one tap into a review, an order or a follower.
            </p>

            {/* Pill Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-2">
              <a
                href="#inquire"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-brand hover:bg-brand-hover text-white font-semibold text-sm tracking-wide transition-all active:scale-[0.98] shadow-sm select-none"
              >
                Request a quote
              </a>
              <a
                href="#demo"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-ink-alt hover:bg-line text-fg border border-line font-semibold text-sm tracking-wide transition-all active:scale-[0.98] select-none"
              >
                See the tap
              </a>
            </div>
          </div>

          {/* Right Column: Hardware Stand Presentation */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            {hasCustomPhoto ? (
              <div className="relative w-full max-w-[380px] aspect-[4/5] rounded-[24px] overflow-hidden border border-line bg-ink-alt">
                <Image
                  src="/images/hero-product.png"
                  alt="NFCISTA Smart Countertop Hardware"
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-contain p-4"
                  priority
                />
              </div>
            ) : (
              /* Tall Dark Rounded Product Stand Mockup with Leader-line Callouts */
              <div className="relative w-full max-w-[360px] flex justify-center">
                {/* 1. Leader-line Callout: Logo (Top-Left) */}
                <div className="hidden min-[760px]:flex absolute -left-20 top-8 items-center gap-2 pointer-events-none z-20">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-dim bg-ink-alt/90 border border-line px-2 py-1 rounded">
                    Your logo, your brand
                  </span>
                  <div className="w-8 h-[1px] bg-dim/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                </div>

                {/* 2. Leader-line Callout: Tap zone (Center-Right) */}
                <div className="hidden min-[760px]:flex absolute -right-20 top-1/2 -translate-y-1/2 items-center gap-2 pointer-events-none z-20">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                  <div className="w-8 h-[1px] bg-dim/50" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-dim bg-ink-alt/90 border border-line px-2 py-1 rounded">
                    Tap zone
                  </span>
                </div>

                {/* 3. Leader-line Callout: Call to action (Bottom-Left) */}
                <div className="hidden min-[760px]:flex absolute -left-24 bottom-12 items-center gap-2 pointer-events-none z-20">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-dim bg-ink-alt/90 border border-line px-2 py-1 rounded">
                    One clear call to action
                  </span>
                  <div className="w-8 h-[1px] bg-dim/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                </div>

                {/* Physical Countertop Stand */}
                <div className="w-[280px] sm:w-[320px] aspect-[1/1.6] rounded-[28px] bg-ink-alt border border-line shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden select-none">
                  {/* Subtle stand bevel / edge hairline */}
                  <div className="absolute inset-0 rounded-[28px] border border-white/[0.04] pointer-events-none" />

                  {/* Top Bar: Brand Logo & NFC Tag */}
                  <div className="flex items-center justify-between text-dim text-xs font-mono">
                    <span className="font-bold tracking-wider text-fg/80 border border-line px-2.5 py-1 rounded-md bg-ink">
                      [YOUR LOGO]
                    </span>
                    <span className="text-[11px] uppercase tracking-widest text-brand-text font-semibold flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-brand" />
                      NFC
                    </span>
                  </div>

                  {/* Center: Concentric Blue Rings with NFC Wave Icon (Pulsing Animation) */}
                  <div className="relative flex items-center justify-center my-auto py-8">
                    {/* Ring 1 - Outer pulse */}
                    <div className="absolute w-36 h-36 rounded-full border border-brand/30 animate-tapPulse pointer-events-none" />
                    {/* Ring 2 - Delayed pulse */}
                    <div
                      className="absolute w-36 h-36 rounded-full border border-brand/20 animate-tapPulse pointer-events-none"
                      style={{ animationDelay: "1.6s" }}
                    />
                    {/* Ring 3 - Static inner boundary */}
                    <div className="w-24 h-24 rounded-full border border-brand/40 bg-brand/5 flex items-center justify-center shadow-inner">
                      {/* Central NFC Wave Icon */}
                      <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white shadow-lg">
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M6 8a9 9 0 0 1 12 0" />
                          <path d="M8.5 11.5a5 5 0 0 1 7 0" />
                          <circle cx="12" cy="15" r="1.5" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Finished Call to Action */}
                  <div className="text-center pt-4 border-t border-line/60">
                    <div className="text-xs uppercase tracking-wider font-mono text-dim mb-1">
                      Customer Directive
                    </div>
                    <div className="font-display text-sm font-semibold text-fg">
                      Tap to review us
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
