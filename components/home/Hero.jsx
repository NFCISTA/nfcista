import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/5 via-surface-container-low/40 to-transparent pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-label-sm font-bold text-primary tracking-wide uppercase">
                Next-Gen Business Cards
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.15]">
              Turn Every Tap Into a{" "}
              <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
                Connection.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-on-surface-variant font-normal leading-relaxed max-w-xl">
              Smart NFC cards for Google Reviews, Instagram, WhatsApp and digital business profiles.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-2">
              {/* Primary CTA → /products catalog */}
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-on-primary font-semibold text-label-lg hover:bg-primary-container shadow-btn-primary transition-all active:scale-[0.98]"
              >
                <span>Explore NFC Cards</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>

              <a
                href="https://wa.me/919000000000?text=Hi%20NFCISTA%2C%20I%20would%20like%20to%20order%20an%20NFC%20card."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-semibold text-label-lg hover:bg-[#20ba59] shadow-sm transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Quick factual benefit badges */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-body-sm text-on-surface-variant border-t border-outline-variant/20 w-full">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                <span>Tap to Connect</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                <span>No App Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                <span>NFC + QR Backup</span>
              </div>
            </div>
          </div>

          {/* Right Column: Physical NFC Card Product Image */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            {/* Outer aura glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary-container/15 to-secondary/10 rounded-3xl blur-2xl -z-10" />

            <div className="relative w-full max-w-[380px] sm:max-w-[400px]">
              {/* Real Physical NFC Card Product Image */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/30 bg-surface-container-lowest">
                <Image
                  src="/images/products/digital-business-card-black.png"
                  alt="NFCISTA Matte Black NFC Digital Business Card"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating Interaction Pills */}
              <div className="absolute -bottom-4 -left-3 sm:-left-6 bg-white border border-outline-variant/30 rounded-xl px-3.5 py-2 shadow-float flex items-center gap-2 z-10">
                <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-on-surface">One-Tap Connect</div>
                  <div className="text-[10px] text-on-surface-variant">Instant WhatsApp & Call</div>
                </div>
              </div>

              <div className="absolute -top-4 -right-3 sm:-right-6 bg-white border border-outline-variant/30 rounded-xl px-3.5 py-2 shadow-float flex items-center gap-2 z-10">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">contact_page</span>
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-on-surface">Save Contact</div>
                  <div className="text-[10px] text-on-surface-variant">Direct to phonebook</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
