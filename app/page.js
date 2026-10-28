import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import ProductsPreview from "@/components/home/ProductsPreview";
import NfcExplanation from "@/components/home/NfcExplanation";
import ContactCTA from "@/components/home/ContactCTA";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary selection:bg-accent-primary selection:text-white">
      {/* 1. HEADER & NAVIGATION */}
      <Navbar />

      <main className="flex-1">
        {/* 2. HARDWARE HERO */}
        <Hero />

        {/* 3. THE CONTACTLESS FLOW (PRODUCT STORY) */}
        <HowItWorks />

        {/* 4. HARDWARE CATALOG */}
        <ProductsPreview />

        {/* 5. DUAL-TECH SPECIFICATIONS (NFC + QR + CLOUD PROFILE) */}
        <NfcExplanation />

        {/* 6. B2B ORDERS & INQUIRIES */}
        <ContactCTA />

        {/* 7. TECHNICAL FAQ */}
        <FAQ />
      </main>

      {/* 8. FOOTER & COMPLIANCE */}
      <Footer />
    </div>
  );
}
