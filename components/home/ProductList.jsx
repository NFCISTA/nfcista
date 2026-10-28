import { getPublicProducts, formatPrice } from "@/lib/products";
import { products as fallbackProducts } from "@/data/products";

export default async function ProductList() {
  // 1. Fetch products from Supabase if available
  let catalog = [];
  try {
    const dbItems = await getPublicProducts();
    if (dbItems && dbItems.length > 0) {
      catalog = dbItems.map((item, idx) => ({
        id: item.id,
        tag: `P-0${idx + 1}`,
        name: item.name,
        description: item.short_description || item.description || "Smart contactless NFC hardware for business.",
        price: formatPrice(item.price) || "Price on Request",
        slug: item.slug,
      }));
    }
  } catch {
    // Graceful fallback to static data
  }

  // 2. Fallback to existing 4 products from data/products.js
  if (catalog.length === 0) {
    catalog = fallbackProducts.map((item, idx) => ({
      id: item.id,
      tag: `P-0${idx + 1}`,
      name: item.name,
      description: item.shortDescription || item.purpose || "Custom branded contactless NFC card.",
      price: item.price === "Coming Soon" || !item.price ? "Price on Request" : item.price,
      slug: item.slug,
    }));
  }

  return (
    <section id="products" className="py-24 md:py-32 bg-ink border-b border-line">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="font-mono text-xs uppercase tracking-wider text-brand-text mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            <span>Product Catalog</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-fg tracking-[-0.035em]">
            Hardware tailored to your customer flow.
          </h2>
          <p className="font-sans text-sm sm:text-base text-muted mt-3">
            Every piece is custom designed with your branding, encoded to your destination, and tap-tested.
          </p>
        </div>

        {/* Editorial List Layout */}
        <div className="divide-y divide-line border-y border-line">
          {catalog.map((product) => (
            <a
              key={product.id}
              href="#inquire"
              className="group py-8 sm:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-ink-alt/50 px-3 sm:px-6 -mx-3 sm:-mx-6 rounded-2xl transition-colors"
            >
              {/* Left Column: Index & Name */}
              <div className="flex items-start md:items-center gap-6 md:w-5/12">
                <span className="font-mono text-xs text-dim uppercase tracking-wider shrink-0 mt-1 md:mt-0">
                  {product.tag}
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-fg group-hover:text-brand-text transition-colors">
                  {product.name}
                </h3>
              </div>

              {/* Middle Column: 1-Line Description */}
              <div className="font-sans text-sm text-muted md:w-4/12 leading-relaxed">
                {product.description}
              </div>

              {/* Right Column: Price & Interactive Arrow */}
              <div className="flex items-center justify-between md:justify-end gap-6 md:w-3/12 pt-2 md:pt-0 border-t md:border-t-0 border-line/40">
                <span className="font-mono text-xs uppercase tracking-wider text-dim bg-ink-alt border border-line px-3 py-1.5 rounded-full">
                  {product.price}
                </span>

                <div className="w-9 h-9 rounded-full border border-line group-hover:border-brand/40 group-hover:bg-brand/10 flex items-center justify-center text-dim group-hover:text-brand-text transition-all shrink-0">
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
