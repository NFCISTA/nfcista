import ProductPageTemplate from "@/components/products/ProductPageTemplate";

const product = {
  name: "Google Review NFC Card",
  badge: "Customer Feedback",
  tagline:
    "Let your customers leave a Google review with a single tap — no searching, no links to type, no friction.",
  description:
    "The NFCISTA Google Review NFC Card is a smart, professional card that takes your customers directly to your Google review page. When a customer taps the card with their phone, they're instantly taken to your review form. No app required, no URL to type, no confusion. More reviews means better local search visibility and stronger social proof for your business.",
  theme: {
    heroBg: "bg-gradient-to-b from-amber-50/60 via-surface-container-low/30 to-transparent",
    cardBg: "from-[#1A2639] via-[#121B2A] to-[#0A101A]",
    accentIcon: "star",
    accentText: "text-amber-600",
    accentIconColor: "text-amber-400",
    highlightBadge: "Google Reviews",
    auraGlow: "bg-amber-300/10",
    glowSpot: "bg-amber-400/20",
  },
  howItWorks: [
    {
      icon: "contactless",
      title: "Tap the NFC Card",
      detail:
        "The customer holds their phone near your Google Review NFC card. The phone detects it instantly — no app needed.",
    },
    {
      icon: "open_in_new",
      title: "Google Review Page Opens",
      detail:
        "The phone automatically opens your Google review form. No typing, no searching — they land directly on the review screen.",
    },
    {
      icon: "star",
      title: "Customer Leaves a Review",
      detail:
        "The customer rates your business and leaves feedback in seconds, boosting your local visibility and credibility.",
    },
  ],
  benefits: [
    {
      icon: "bolt",
      title: "Instant Review Prompt",
      detail:
        "Remove the barrier of searching for your business. One tap and the customer is ready to write a review.",
    },
    {
      icon: "smartphone",
      title: "No App Required",
      detail:
        "Works on any modern Android or iPhone with NFC. Customers don't need to install anything.",
    },
    {
      icon: "qr_code",
      title: "QR Backup Included",
      detail:
        "Every NFCISTA card also includes a printed QR code, so customers on devices without NFC can still reach your review page.",
    },
    {
      icon: "visibility",
      title: "Better Local Search Ranking",
      detail:
        "More genuine reviews directly improve your Google Business Profile ranking and help new customers find you.",
    },
    {
      icon: "design_services",
      title: "Professional Custom Design",
      detail:
        "Each card is custom designed with your brand. Premium materials, sharp print, lasting impression.",
    },
    {
      icon: "update",
      title: "Destination Can Be Updated",
      detail:
        "If your Google review link ever changes, your digital profile can be updated without replacing the physical card.",
    },
  ],
  useCases: [
    "Restaurants and cafés placing cards on tables",
    "Retail shops providing cards at checkout counters",
    "Salons and spas handing cards to clients after service",
    "Hotel lobbies and reception desks",
    "Local service providers visiting client premises",
    "Any business wanting more Google reviews effortlessly",
  ],
};

export const metadata = {
  title: "Google Review NFC Card — NFCISTA",
  description:
    "Let customers tap and leave a Google review instantly. No app required. NFCISTA Google Review NFC Card — coming soon.",
};

export default function GoogleReviewPage() {
  return <ProductPageTemplate product={product} />;
}
