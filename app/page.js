import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import WhyNfcista from "@/components/home/WhyNfcista";
import ProductShowcase from "@/components/home/ProductShowcase";
import ProductsPreview from "@/components/home/ProductsPreview";
import HowItWorks from "@/components/home/HowItWorks";
import NfcExplanation from "@/components/home/NfcExplanation";
import ContactCTA from "@/components/home/ContactCTA";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-primary selection:text-white">
      {/* 1. HEADER */}
      <Navbar />

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <Hero />

        {/* 3. WHY NFCISTA */}
        <WhyNfcista />

        {/* 4. PRODUCT SHOWCASE */}
        <ProductShowcase />

        {/* 5. PRODUCTS PREVIEW */}
        <ProductsPreview />

        {/* 5. HOW IT WORKS */}
        <HowItWorks />

        {/* 6. NFC + QR EXPLANATION */}
        <NfcExplanation />

        {/* 7. ORDER CTA */}
        <ContactCTA />

        {/* 8. FAQ */}
        <FAQ />
      </main>

      {/* 9. FOOTER */}
      <Footer />
    </div>
  );
}
