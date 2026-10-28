import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

/**
 * ProductCard
 *
 * Reusable card component for storefront product listings.
 * Displays real product photography, badge, short description,
 * variant indicator (if variants exist), and a "View Details" button.
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
    <div className="bg-surface-elevated border border-border-hairline rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between group">
      <div>
        {/* Product Image Area - marked tabIndex="-1" aria-hidden="true" to avoid redundant tab stops */}
        <Link
          href={`/products/${slug}`}
          tabIndex="-1"
          aria-hidden="true"
          className="block relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-surface-subtle border border-border-hairline mb-5 group/img"
        >
          <Image
            src={image || "/images/product-showcase.png"}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-2 group-hover/img:scale-[1.02] transition-transform duration-300"
          />

          {variantCount > 0 && (
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-surface-elevated/95 backdrop-blur-sm text-[10px] font-semibold text-text-secondary border border-border-hairline shadow-2xs">
              {variantCount} Options
            </span>
          )}
        </Link>

        {/* Product Info */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            href={`/products/${slug}`}
            className="hover:text-accent-primary transition-colors"
          >
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {name}
            </h3>
          </Link>
          {badge && (
            <Badge variant="neutral" dot={false} className="text-[10px] font-semibold shrink-0">
              {badge}
            </Badge>
          )}
        </div>

        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-5">
          {descriptionText}
        </p>
      </div>

      {/* Action / Footer Row */}
      <div className="pt-4 border-t border-border-hairline flex items-center justify-between mt-auto">
        <span className="text-[11px] font-semibold text-text-secondary bg-surface-subtle border border-border-hairline px-2.5 py-1 rounded-md">
          {status || "Coming Soon"}
        </span>

        <Link
          href={`/products/${slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle text-text-primary border border-border-hairline font-semibold text-xs hover:bg-accent-primary hover:text-white hover:border-accent-primary transition-all active:scale-[0.98]"
          aria-label={`View details for ${name}`}
        >
          <span>View Details</span>
          <Icon name="ArrowRight" className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
