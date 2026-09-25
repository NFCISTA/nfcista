import Link from "next/link";
import { products } from "@/data/products";

export default function ProductsPreview() {

  return (
    <section id="products" className="py-20 bg-white border-y border-outline-variant/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            NFC Hardware Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            Choose Your NFC Card
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            Smart contactless cards purpose-built for growing your business connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-float transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Product Mockup Graphic Area */}
                <div
                  className={`aspect-[1.65] w-full rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${product.theme.cardBg} text-white shadow-md border border-white/10 relative overflow-hidden flex flex-col justify-between select-none mb-6 group-hover:scale-[1.01] transition-transform duration-200`}
                >
                  {/* Subtle surface shine */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />

                  {/* Card Header: Brand + Chip */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center border border-white/15">
                        <span className="material-symbols-outlined text-[14px] text-white">
                          contactless
                        </span>
                      </div>
                      <span className="text-[11px] font-bold tracking-widest text-white uppercase">
                        NFCISTA
                      </span>
                    </div>

                    <span className="material-symbols-outlined text-[22px] text-white/60">
                      contactless
                    </span>
                  </div>

                  {/* Card Center: Smart Chip + Card Graphic Element */}
                  <div className="relative z-10 flex items-center justify-between my-auto py-2">
                    <div className={`w-9 h-7 rounded ${product.theme.chipStyle} p-0.5 shadow-sm`}>
                      <div className="w-full h-full rounded-[2px] border border-black/20 grid grid-cols-2 grid-rows-2 gap-[1px] p-0.5 bg-[#D49E3C]/20">
                        <div className="border-r border-b border-black/20" />
                        <div className="border-b border-black/20" />
                        <div className="border-r border-black/20" />
                        <div />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
                      <span
                        className={`material-symbols-outlined text-[16px] ${product.theme.accentColor}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {product.theme.accentIcon}
                      </span>
                      <span className="text-[11px] font-semibold text-white/90">
                        {product.theme.highlightBadge}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Product Title Preview */}
                  <div className="relative z-10 flex items-end justify-between">
                    <div>
                      <div className="text-sm sm:text-base font-bold text-white tracking-wide">
                        {product.name}
                      </div>
                      <div className="text-[10px] text-white/50 tracking-wider uppercase mt-0.5">
                        Tap &amp; QR Enabled
                      </div>
                    </div>

                    <span className="text-[9px] uppercase font-semibold text-white/40 tracking-widest">
                      NFCISTA CARD
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-on-surface">
                    {product.name}
                  </h3>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-container-low text-primary flex-shrink-0">
                    {product.badge}
                  </span>
                </div>

                <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">
                  {product.purpose}
                </p>
              </div>

              {/* Price & Action Button */}
              <div className="pt-5 border-t border-outline-variant/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                    Price
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-label-md font-bold text-primary mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{product.price}</span>
                  </span>
                </div>

                <Link
                  href={`/products/${product.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-low text-primary border border-primary/20 font-semibold text-label-md hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
                >
                  <span>View Product</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
