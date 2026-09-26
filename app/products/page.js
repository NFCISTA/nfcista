import Link from "next/link";
import { getAllProducts } from "@/data/products";
import ProductCard from "@/components/products/ProductCard";
import Footer from "@/components/home/Footer";

export const metadata = {
  title: "NFCISTA Products - NFC Business Cards",
  description:
    "Explore NFCISTA smart contactless NFC cards for Google Reviews, Instagram profile growth, WhatsApp messaging, and digital business cards.",
};

export default function ProductsPage() {
  const products = getAllProducts();

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
              Home
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
            <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
              NFC Hardware Solutions
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface mt-2 tracking-tight">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
