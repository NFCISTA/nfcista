import SpecBar from "@/components/home/SpecBar";
import StickyNav from "@/components/home/StickyNav";
import Hero from "@/components/home/Hero";
import FactsStrip from "@/components/home/FactsStrip";
import ExperienceDemo from "@/components/home/ExperienceDemo";
import ComparisonTable from "@/components/home/ComparisonTable";
import ProductList from "@/components/home/ProductList";
import ProcessTimeline from "@/components/home/ProcessTimeline";
import FaqSection from "@/components/home/FaqSection";
import InquirySection from "@/components/home/InquirySection";
import Footer from "@/components/home/Footer";

export const metadata = {
  title: "NFCISTA — Smart NFC Tap Systems Built for Shops",
  description:
    "Custom-branded, pre-programmed, and tap-tested NFC hardware for shops and counters. Turn one tap into a review, an order, or a follower.",
  alternates: {
    canonical: "https://nfcista.vercel.app/",
  },
  openGraph: {
    title: "NFCISTA — Smart NFC Tap Systems Built for Shops",
    description:
      "Custom-branded, pre-programmed, and tap-tested NFC hardware. Turn one tap into a review, an order, or a follower.",
    url: "https://nfcista.vercel.app/",
    siteName: "NFCISTA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NFCISTA — Smart NFC Tap Systems Built for Shops",
    description:
      "Custom-branded, pre-programmed, and tap-tested NFC hardware for shops and counters.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-ink text-fg selection:bg-brand selection:text-white font-sans antialiased">
      {/* 1. Hardware Spec Bar */}
      <SpecBar />

      {/* 2. Sticky Blurred Navigation */}
      <StickyNav />

      <main className="flex-1">
        {/* 3. Hero Section (with inline SVG stand) */}
        <Hero />

        {/* 4. Facts Strip */}
        <FactsStrip />

        {/* 5. Experience Interactive Demo */}
        <ExperienceDemo />

        {/* 6. Comparison Table (Differentiators) */}
        <ComparisonTable />

        {/* 7. Product List (Editorial Rows from Catalog) */}
        <ProductList />

        {/* 8. Process Timeline (4-Step Flow) */}
        <ProcessTimeline />

        {/* 9. Native Details FAQ */}
        <FaqSection />

        {/* 10. Inquiry Section (Dark Blue-Tinted Panel & Underline Form) */}
        <InquirySection />
      </main>

      {/* 11. Minimal Obsidian Footer */}
      <Footer />
    </div>
  );
}
