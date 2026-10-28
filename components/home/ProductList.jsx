import Image from "next/image";
import { getPublicProducts, formatPrice } from "@/lib/products";
import { products as fallbackProducts } from "@/data/products";

const WHATSAPP_NUMBER = "919000000000"; // TODO: Replace with real WhatsApp number

function buildWhatsAppUrl(productName, whatsappMessage) {
  const text = whatsappMessage || `Hi NFCISTA, I'm interested in the ${productName}. Please share the details and pricing.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

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
        image: item.image_url || null,
        whatsappMessage: null, // DB items don't have pre-filled messages; use generic
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
      image: item.image || null,
      whatsappMessage: item.whatsappMessage || null,
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
            <div
              key={product.id}
              className="group py-8 sm:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-3 sm:px-6 -mx-3 sm:-mx-6 hover:bg-ink-alt/50 rounded-2xl transition-colors"
            >
              {/* Left Column: Image + Index + Name */}
              <div className="flex items-center gap-5 md:w-5/12">
                {/* Product thumbnail */}
                {product.image ? (
                  <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-line bg-ink-alt flex items-center justify-center">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-line bg-ink-alt flex items-center justify-center">
                    <span className="font-mono text-[10px] text-dim uppercase tracking-wider">{product.tag}</span>
                  </div>
                )}
                <div>
                  <span className="font-mono text-[10px] text-dim uppercase tracking-wider">{product.tag}</span>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-fg group-hover:text-brand-text transition-colors mt-0.5">
                    {product.name}
                  </h3>
                </div>
              </div>

              {/* Middle Column: 1-Line Description */}
              <div className="font-sans text-sm text-muted md:w-3/12 leading-relaxed">
                {product.description}
              </div>

              {/* Right Column: Price + Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 md:w-4/12 pt-2 md:pt-0 border-t md:border-t-0 border-line/40 flex-wrap">
                <span className="font-mono text-xs uppercase tracking-wider text-dim bg-ink-alt border border-line px-3 py-1.5 rounded-full shrink-0">
                  {product.price}
                </span>

                {/* WhatsApp Order button */}
                <a
                  href={buildWhatsAppUrl(product.name, product.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-emerald-400 border border-emerald-800/60 hover:border-emerald-500 hover:bg-emerald-900/20 px-3 py-1.5 rounded-full transition-colors shrink-0"
                  aria-label={`Order ${product.name} on WhatsApp`}
                >
                  {/* WhatsApp icon (inline SVG) */}
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Order
                </a>

                {/* View details arrow */}
                <a
                  href={`/products/${product.slug}`}
                  className="w-9 h-9 rounded-full border border-line group-hover:border-brand/40 group-hover:bg-brand/10 flex items-center justify-center text-dim group-hover:text-brand-text transition-all shrink-0"
                  aria-label={`View details for ${product.name}`}
                >
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
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
