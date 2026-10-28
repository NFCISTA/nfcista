import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "@/components/products/ProductCard";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

export default function ProductsPreview() {
  return (
    <section id="products" className="py-16 md:py-24 bg-canvas border-b border-border-hairline">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <Badge variant="neutral" dot={false} className="uppercase tracking-wider text-[11px] font-semibold mb-2">
            Hardware Catalog
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
            Choose Your NFC Card
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-2.5 leading-relaxed">
            Purpose-built contactless smart cards designed for in-person customer connection and business growth.
          </p>
        </div>

        {/* 2x2 Hardware Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Catalog Specifications Link */}
        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-hairline font-semibold text-xs hover:bg-surface-subtle transition-colors shadow-2xs active:scale-[0.98]"
          >
            <span>View All Product Specifications</span>
            <Icon name="ArrowRight" className="w-3.5 h-3.5 text-text-secondary" />
          </Link>
        </div>
      </div>
    </section>
  );
}
