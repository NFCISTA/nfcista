import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "@/components/products/ProductCard";

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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Products CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface-container-low text-primary border border-primary/20 font-semibold text-label-lg hover:bg-primary hover:text-white transition-all shadow-sm active:scale-[0.98]"
          >
            <span>View All Products</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
