import Link from "next/link";

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
              Smart NFC <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
                Business Cards
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-on-surface-variant font-normal leading-relaxed max-w-xl">
              Share your contact and business details with a simple tap. No paper waste, no app downloads required for your clients.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-2">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-on-primary font-semibold text-label-lg hover:bg-primary-container shadow-btn-primary transition-all active:scale-[0.98]"
              >
                <span>Get Your NFC Card</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-on-surface border border-outline-variant/40 font-semibold text-label-lg hover:bg-surface-container-low hover:border-outline transition-all active:scale-[0.98]"
              >
                <span>See How It Works</span>
                <span className="material-symbols-outlined text-[18px]">touch_app</span>
              </a>
            </div>

            {/* Quick benefit badges */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-body-sm text-on-surface-variant border-t border-outline-variant/20 w-full">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                <span>Works with iPhone & Android</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                <span>No App Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                <span>One-Tap Save Contact</span>
              </div>
            </div>
          </div>

          {/* Right Column: CSS-based NFC Card Mockup */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            {/* Outer aura glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary-container/15 to-secondary/10 rounded-3xl blur-2xl -z-10" />

            <div className="relative w-full max-w-[380px] sm:max-w-[400px]">
              {/* The Physical Card Mockup */}
              <div className="aspect-[1.586] w-full rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-[#0B1528] via-[#10203E] to-[#0A1224] text-white shadow-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between select-none">
                {/* Metallic shine diagonal */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />
                <div className="absolute -top-16 -right-16 w-44 h-44 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

                {/* Card Top Row: Brand & Wireless waves */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                      <span className="material-symbols-outlined text-[16px] text-white">contactless</span>
                    </div>
                    <span className="text-sm font-bold tracking-widest text-white uppercase">
                      NFCISTA
                    </span>
                  </div>
                  {/* NFC Wave Symbol */}
                  <span className="material-symbols-outlined text-[26px] text-primary-fixed-dim">
                    contactless
                  </span>
                </div>

                {/* Card Middle: Metallic Smart Chip */}
                <div className="my-auto py-2 relative z-10 flex items-center gap-3">
                  <div className="w-11 h-9 rounded-md bg-gradient-to-tr from-[#E6B762] via-[#F8E19B] to-[#D49E3C] p-[1.5px] shadow-sm">
                    <div className="w-full h-full rounded-[4px] border border-black/20 grid grid-cols-2 grid-rows-2 gap-[2px] p-1 bg-[#D49E3C]/30">
                      <div className="border-r border-b border-black/20 rounded-tl-sm" />
                      <div className="border-b border-black/20 rounded-tr-sm" />
                      <div className="border-r border-black/20 rounded-bl-sm" />
                      <div className="rounded-br-sm" />
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">
                    Smart NFC Card
                  </span>
                </div>

                {/* Card Bottom Row: Demo Name & Profession */}
                <div className="relative z-10 flex items-end justify-between">
                  <div>
                    <div className="text-lg sm:text-xl font-bold tracking-wide text-white">
                      Your Name
                    </div>
                    <div className="text-xs font-medium text-white/60 tracking-wider">
                      Your Profession / Business
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-semibold text-white/90">
                    <span>Tap to Connect</span>
                  </div>
                </div>
              </div>

              {/* Floating Interaction Pills */}
              <div className="absolute -bottom-4 -left-3 sm:-left-6 bg-white border border-outline-variant/30 rounded-xl px-3.5 py-2 shadow-float flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-on-surface">One-Tap Connect</div>
                  <div className="text-[10px] text-on-surface-variant">Instant WhatsApp & Call</div>
                </div>
              </div>

              <div className="absolute -top-4 -right-3 sm:-right-6 bg-white border border-outline-variant/30 rounded-xl px-3.5 py-2 shadow-float flex items-center gap-2">
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
