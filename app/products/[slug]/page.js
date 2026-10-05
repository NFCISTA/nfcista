import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublicProductBySlug, STOCK_STATUS_CONFIG, formatPrice } from "@/lib/products";
import { getProductBySlug as getStaticProductBySlug } from "@/data/products";
import ProductPageTemplate from "@/components/products/ProductPageTemplate";
import Footer from "@/components/home/Footer";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (product) {
    return {
      title: `${product.name} — NFCISTA Products`,
      description:
        product.short_description ||
        product.description?.slice(0, 160) ||
        `Order the ${product.name} smart contactless NFC solution from NFCISTA.`,
    };
  }

  // Check static catalog fallback
  const staticProduct = getStaticProductBySlug(slug);
  if (staticProduct) {
    return {
      title: `${staticProduct.name} — NFCISTA`,
      description: staticProduct.description || staticProduct.tagline,
    };
  }

  return {
    title: "Product Details — NFCISTA",
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;

  // 1. Check dynamic database product first
  const product = await getPublicProductBySlug(slug);

  // 2. If not in DB, fallback to static product template if it exists
  if (!product) {
    const staticProduct = getStaticProductBySlug(slug);
    if (staticProduct) {
      return <ProductPageTemplate product={staticProduct} />;
    }
    notFound();
  }

  // 3. Render dynamic database product
  const stockConfig =
    STOCK_STATUS_CONFIG[product.stock_status] || STOCK_STATUS_CONFIG.in_stock;

  const defaultWaText = encodeURIComponent(
    `Hi NFCISTA, I would like to order the ${product.name} (${product.product_code || ""}). Please confirm availability and delivery.`
  );
  const waUrl =
    product.whatsapp_url || `https://wa.me/919000000000?text=${defaultWaText}`;

  // Gallery array: primary image + extra gallery images
  const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean);

  const discountPercent =
    product.original_price && product.price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-primary selection:text-white flex flex-col">
      {/* ── Top Header ────────────────────────────────────── */}
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
              href="/products"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>All Products</span>
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#25D366] text-white text-label-sm font-semibold hover:bg-[#20ba59] shadow-sm transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Product Content ──────────────────────────── */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6 sm:mb-8 flex-wrap">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">
              Products
            </Link>
            <span>/</span>
            <span className="font-semibold text-on-surface">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* ── Left Column: Media / Image Gallery ──────────── */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square w-full rounded-3xl bg-surface-container-low border border-outline-variant/30 overflow-hidden shadow-card">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 bg-surface-container-low">
                    <span className="material-symbols-outlined text-[64px]">contactless</span>
                    <span className="text-sm font-semibold mt-2">NFCISTA Hardware</span>
                  </div>
                )}

                {product.is_featured && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    Featured
                  </span>
                )}
              </div>

              {/* Extra gallery thumbnail previews if multiple images */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-xl border border-outline-variant/40 overflow-hidden bg-white shrink-0 cursor-pointer hover:border-primary transition-colors"
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${i + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right Column: Product Details & Order CTA ──── */}
            <div className="lg:col-span-6 space-y-6">
              {/* Category, Code & Stock */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-surface-container-low text-primary border border-outline-variant/30">
                  {product.product_code}
                </span>

                {product.category && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant">
                    {product.category}
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${stockConfig.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${stockConfig.dotClass}`} />
                  <span>{stockConfig.label}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/20">
                <span className="text-3xl sm:text-4xl font-extrabold text-on-surface">
                  {formatPrice(product.price) || "Inquire for Price"}
                </span>

                {product.original_price && (
                  <span className="text-base sm:text-lg text-on-surface-variant line-through font-medium">
                    {formatPrice(product.original_price)}
                  </span>
                )}

                {discountPercent && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-base text-on-surface-variant leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* WhatsApp CTA */}
              <div className="space-y-3 pt-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#25D366] text-white text-base font-bold hover:bg-[#20ba59] shadow-md transition-all active:scale-[0.98] text-center"
                >
                  <span className="material-symbols-outlined text-[24px]">chat</span>
                  <span>Order Directly on WhatsApp</span>
                </a>
                <p className="text-xs text-center text-on-surface-variant">
                  Instant response • Custom branding available • Free nationwide delivery consultation
                </p>
              </div>

              {/* Features List */}
              {Array.isArray(product.features) && product.features.length > 0 && (
                <div className="pt-4 border-t border-outline-variant/20 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    Key Highlights
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.features.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-xs text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
                          check_circle
                        </span>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Description */}
              {product.description && (
                <div className="pt-4 border-t border-outline-variant/20 space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    About this Product
                  </h3>
                  <div className="text-body-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {product.description}
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="pt-4 border-t border-outline-variant/20 grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[22px] text-primary">contactless</span>
                  <div className="text-[11px] font-bold text-on-surface mt-1">100% Contactless</div>
                  <div className="text-[10px] text-on-surface-variant">Tap to connect</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[22px] text-primary">verified</span>
                  <div className="text-[11px] font-bold text-on-surface mt-1">Durable Finish</div>
                  <div className="text-[10px] text-on-surface-variant">Waterproof & sturdy</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[22px] text-primary">install_mobile</span>
                  <div className="text-[11px] font-bold text-on-surface mt-1">No App Needed</div>
                  <div className="text-[10px] text-on-surface-variant">Works natively</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
