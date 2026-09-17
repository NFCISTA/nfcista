export default function CardShowcase() {
  const cards = [
    {
      name: "Classic",
      tag: "Everyday Networking",
      description: "Clean matte navy finish with minimalist NFCISTA branding. Timeless and versatile for all professionals.",
      cardBg: "from-[#0F1E36] via-[#16294A] to-[#0A162B]",
      accent: "text-blue-400",
      chipBorder: "border-blue-400/40",
    },
    {
      name: "Premium",
      tag: "Executive Elegance",
      description: "Deep obsidian matte finish with metallic gold accents. Crafted for consultants, executives, and luxury specialists.",
      cardBg: "from-[#111111] via-[#1A1A1A] to-[#0D0D0D]",
      accent: "text-amber-400",
      chipBorder: "border-amber-400/50",
    },
    {
      name: "Custom",
      tag: "Brand Identity",
      description: "Tailored to your business with custom corporate logos, color palettes, and typography guidelines.",
      cardBg: "from-[#002B66] via-[#003B8D] to-[#001D47]",
      accent: "text-sky-300",
      chipBorder: "border-sky-300/40",
    },
  ];

  return (
    <section id="cards" className="py-20 bg-white border-y border-outline-variant/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            Card Concepts
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            Choose Your NFC Card
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            Three distinctive design concepts crafted for durability and everyday networking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cards.map((c) => (
            <div
              key={c.name}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-float transition-all flex flex-col justify-between"
            >
              <div>
                {/* CSS Card Mockup */}
                <div className={`aspect-[1.586] w-full rounded-2xl p-5 bg-gradient-to-br ${c.cardBg} text-white shadow-lg border border-white/10 relative overflow-hidden flex flex-col justify-between select-none mb-6`}>
                  {/* Subtle lighting */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-bold tracking-widest text-white uppercase">
                      NFCISTA
                    </span>
                    <span className={`material-symbols-outlined text-[20px] ${c.accent}`}>
                      contactless
                    </span>
                  </div>

                  <div className="relative z-10 flex items-center gap-2">
                    <div className={`w-8 h-7 rounded bg-amber-200/30 border ${c.chipBorder} grid grid-cols-2 grid-rows-2 p-1 gap-0.5`}>
                      <div className="border-r border-b border-black/20" />
                      <div className="border-b border-black/20" />
                      <div className="border-r border-black/20" />
                      <div />
                    </div>
                  </div>

                  <div className="relative z-10 flex items-end justify-between">
                    <div>
                      <div className="text-sm font-bold text-white tracking-wide">
                        {c.name} Card
                      </div>
                      <div className="text-[10px] text-white/60">
                        {c.tag}
                      </div>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-white/40">
                      NFC 2026
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-on-surface">
                    {c.name}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container-low text-primary">
                    {c.tag}
                  </span>
                </div>

                <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">
                  {c.description}
                </p>
              </div>

              {/* Price & CTA */}
              <div className="pt-5 border-t border-outline-variant/20 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Pricing
                  </div>
                  <div className="text-label-lg font-bold text-on-surface">
                    Contact for Pricing
                  </div>
                </div>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-primary-container shadow-btn-primary transition-all active:scale-[0.98]"
                >
                  <span>Order Your Card</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
