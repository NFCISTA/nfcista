import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import NfcExplanation from "@/components/home/NfcExplanation";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import WhyNfcista from "@/components/home/WhyNfcista";
import CardShowcase from "@/components/home/CardShowcase";
import DemoSection from "@/components/home/DemoSection";
import WhoItsFor from "@/components/home/WhoItsFor";
import FAQ from "@/components/home/FAQ";
import ContactCTA from "@/components/home/ContactCTA";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-primary selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <NfcExplanation />
        <HowItWorks />
        <Features />
        <WhyNfcista />
        <CardShowcase />
        <DemoSection />
        <WhoItsFor />
        <FAQ />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
