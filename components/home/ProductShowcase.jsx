import Image from "next/image";

/**
 * ProductShowcase Component
 *
 * Displays a high-resolution visual showcase of NFCISTA physical NFC cards
 * and QR backup technology. Responsive layout for both mobile and desktop.
 */
export default function ProductShowcase() {
  return (
    <section id="product-showcase" className="py-20 bg-white border-y border-outline-variant/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            Premium Hardware
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            Designed to Make an Impression
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3 leading-relaxed">
            Every NFCISTA card combines contactless NFC technology with an instant
            QR backup — crafted in sleek, durable finishes for your business.
          </p>
        </div>

        {/* Showcase Image Frame */}
        <div className="relative mx-auto max-w-5xl rounded-3xl bg-surface-container-lowest border border-outline-variant/30 p-3 sm:p-5 shadow-float overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Main Visual */}
          <div className="relative rounded-2xl overflow-hidden bg-surface-container-low flex items-center justify-center w-full aspect-[1536/1024]">
            <Image
              src="/images/product-showcase.png"
              alt="NFCISTA NFC and QR business card product showcase"
              width={1536}
              height={1024}
              className="w-full h-auto object-cover rounded-2xl"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1152px"
              priority
              unoptimized
            />
          </div>

          {/* Highlights Row */}
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-3 border-t border-outline-variant/20">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container-low/60">
              <span className="material-symbols-outlined text-primary text-[20px]">
                contactless
              </span>
              <div>
                <div className="text-xs font-bold text-on-surface">NFC Tap</div>
                <div className="text-[10px] text-on-surface-variant">Instant 1-sec sync</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container-low/60">
              <span className="material-symbols-outlined text-primary text-[20px]">
                qr_code_2
              </span>
              <div>
                <div className="text-xs font-bold text-on-surface">QR Backup</div>
                <div className="text-[10px] text-on-surface-variant">Universal fallback</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container-low/60">
              <span className="material-symbols-outlined text-primary text-[20px]">
                verified
              </span>
              <div>
                <div className="text-xs font-bold text-on-surface">Custom Finish</div>
                <div className="text-[10px] text-on-surface-variant">Matte &amp; gloss branding</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container-low/60">
              <span className="material-symbols-outlined text-primary text-[20px]">
                no_accounts
              </span>
              <div>
                <div className="text-xs font-bold text-on-surface">No App Needed</div>
                <div className="text-[10px] text-on-surface-variant">Works right away</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
