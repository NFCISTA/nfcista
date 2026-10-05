import Link from "next/link";
import Image from "next/image";
import { getPublicProducts, STOCK_STATUS_CONFIG, formatPrice } from "@/lib/products";
import { getAllProducts } from "@/data/products";
import Footer from "@/components/home/Footer";

export const metadata = {
  title: "NFCISTA Products — Smart Contactless NFC Cards & Stands",
  description:
    "Explore NFCISTA smart contactless NFC cards for Google Reviews, Instagram profile growth, WhatsApp messaging, and digital business cards.",
};

// Revalidate public products periodically
export const revalidate = 60;

export default async function ProductsPage() {
  // 1. Fetch active products from Supabase
  let dbProducts = [];
  try {
    dbProducts = await getPublicProducts();
  } catch (err) {
    console.warn("Could not load database products:", err);
  }

  // 2. Fallback to static catalog if no DB products exist yet
  const staticFallbackProducts = (dbProducts && dbProducts.length > 0) ? [] : getAllProducts();

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-primary selection:text-white flex flex-col">
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

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Home</span>
            </Link>
            <a
              href="https://wa.me/919000000000?text=Hi%20NFCISTA%2C%20I%20would%20like%20to%20inquire%20about%20your%20NFC%20products."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#25D366] text-white text-label-sm font-semibold hover:bg-[#20ba59] shadow-sm transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero / Introduction ───────────────────────────── */}
        <section className="pt-14 pb-12 bg-white border-b border-outline-variant/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
                NFC Hardware Solutions
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
              NFCISTA Products
            </h1>
            <p className="text-body-lg text-on-surface-variant mt-3 leading-relaxed max-w-2xl mx-auto">
              Smart contactless cards designed to make professional interactions seamless. Choose the right NFC solution for your business.
            </p>
          </div>
        </section>

        {/* ── Product Listing Grid ──────────────────────────── */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {dbProducts && dbProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {dbProducts.map((product) => {
                  const stockConfig =
                    STOCK_STATUS_CONFIG[product.stock_status] || STOCK_STATUS_CONFIG.in_stock;

                  const defaultWaText = encodeURIComponent(
                    `Hi NFCISTA, I would like to order the ${product.name} (${product.product_code || ""}). Please share details.`
                  );
                  const waUrl =
                    product.whatsapp_url || `https://wa.me/919000000000?text=${defaultWaText}`;

                  return (
                    <div
                      key={product.id}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-card hover:shadow-float hover:border-outline-variant/60 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image */}
                        <Link
                          href={`/products/${product.slug}`}
                          className="block relative aspect-square w-full rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/20 mb-5 group/img"
                        >
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 bg-surface-container-low">
                              <span className="material-symbols-outlined text-[48px]">contactless</span>
                              <span className="text-xs font-semibold mt-1">NFCISTA</span>
                            </div>
                          )}

                          {product.is_featured && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-md flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">star</span>
                              Featured
                            </span>
                          )}

                          {product.category && (
                            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-on-surface-variant border border-outline-variant/30 shadow-xs">
                              {product.category}
                            </span>
                          )}
                        </Link>

                        {/* Title & Code */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-surface-container-low text-primary">
                              {product.product_code}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${stockConfig.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${stockConfig.dotClass}`} />
                              <span>{stockConfig.label}</span>
                            </span>
                          </div>

                          <Link
                            href={`/products/${product.slug}`}
                            className="block hover:text-primary transition-colors"
                          >
                            <h2 className="text-xl font-bold text-on-surface tracking-tight leading-snug">
                              {product.name}
                            </h2>
                          </Link>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-bold text-on-surface">
                            {formatPrice(product.price) || "Contact for Price"}
                          </span>
                          {product.original_price && (
                            <span className="text-sm text-on-surface-variant line-through font-medium">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        </div>

                        {/* Short Description */}
                        {product.short_description && (
                          <p className="text-body-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-2">
                            {product.short_description}
                          </p>
                        )}

                        {/* Feature bullets */}
                        {Array.isArray(product.features) && product.features.length > 0 && (
                          <ul className="space-y-1.5 mb-6 text-xs text-on-surface-variant">
                            {product.features.slice(0, 3).map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-primary shrink-0">
                                  check_circle
                                </span>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row gap-2.5">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-label-md font-semibold hover:bg-[#20ba59] shadow-sm transition-all active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                          <span>Order on WhatsApp</span>
                        </a>

                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl bg-surface-container-low text-primary border border-primary/20 font-semibold text-label-md hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
                          title="View Details"
                        >
                          <span>Details</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback static cards if no DB records exist yet */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staticFallbackProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-float transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <Link
                        href={`/products/${product.slug}`}
                        className="block relative aspect-square w-full rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/20 mb-6 group/img"
                      >
                        <Image
                          src={product.image || "/images/product-showcase.png"}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain group-hover/img:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
                          <h2 className="text-xl font-bold text-on-surface">{product.name}</h2>
                        </Link>
                        {product.badge && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-container-low text-primary flex-shrink-0">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">
                        {product.shortDescription || product.purpose || ""}
                      </p>
                    </div>

                    <div className="pt-5 border-t border-outline-variant/20 flex items-center justify-between mt-auto">
                      <span className="inline-flex items-center gap-1.5 text-label-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>{product.status || "Coming Soon"}</span>
                      </span>

                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-low text-primary border border-primary/20 font-semibold text-label-md hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
                      >
                        <span>View Product</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
