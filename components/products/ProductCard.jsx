import Link from "next/link";
import Image from "next/image";

/**
 * ProductCard
 *
 * Reusable card component for storefront product listings.
 * Displays real product photography, badge, short description,
 * variant indicator (if variants exist), and a "View Product" button.
 */
export default function ProductCard({ product }) {
  if (!product) return null;

  const {
    slug,
    name,
    badge,
    shortDescription,
    purpose,
    image,
    variants,
    status,
  } = product;

  const descriptionText = shortDescription || purpose || "";
  const variantCount = variants && variants.length > 1 ? variants.length : 0;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-float transition-all flex flex-col justify-between group">
      <div>
        {/* Product Image Area */}
        <Link
          href={`/products/${slug}`}
          className="block relative aspect-square w-full rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/20 mb-6 group/img"
          aria-label={`View ${name}`}
        >
          <Image
            src={image || "/images/product-showcase.png"}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain group-hover/img:scale-105 transition-transform duration-300"
          />

          {/* Optional neutral variant indicator */}
          {variantCount > 0 && (
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-on-surface-variant border border-outline-variant/30 shadow-xs">
              {variantCount} options
            </span>
          )}
        </Link>

        {/* Product Info */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <Link
            href={`/products/${slug}`}
            className="hover:text-primary transition-colors"
          >
            <h3 className="text-xl font-bold text-on-surface">
              {name}
            </h3>
          </Link>
          {badge && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-container-low text-primary flex-shrink-0">
              {badge}
            </span>
          )}
        </div>

        <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">
          {descriptionText}
        </p>
      </div>

      {/* Action / Footer Area */}
      <div className="pt-5 border-t border-outline-variant/20 flex items-center justify-between mt-auto">
        <span className="inline-flex items-center gap-1.5 text-label-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>{status || "Coming Soon"}</span>
        </span>

        <Link
          href={`/products/${slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-low text-primary border border-primary/20 font-semibold text-label-md hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
          aria-label={`View ${name}`}
        >
          <span>View Product</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
