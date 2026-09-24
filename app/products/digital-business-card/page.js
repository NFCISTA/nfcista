import ProductPageTemplate from "@/components/products/ProductPageTemplate";

const product = {
  name: "Digital Business Card",
  badge: "Complete Identity",
  tagline:
    "Share your full business profile — contact details, social links, and more — with a single tap.",
  description:
    "The NFCISTA Digital Business Card opens a complete, professionally designed digital profile when tapped. Visitors see your name, title, business, phone number, email, social media links, and any other details you choose to include. Unlike a paper business card, your digital profile can be updated instantly whenever your information changes — no reprinting required. One card, your entire professional identity.",
  theme: {
    heroBg: "bg-gradient-to-b from-blue-50/60 via-surface-container-low/30 to-transparent",
    cardBg: "from-[#0F1E36] via-[#16294A] to-[#0A162B]",
    accentIcon: "badge",
    accentText: "text-blue-700",
    accentIconColor: "text-blue-400",
    highlightBadge: "Full Profile & vCard",
    auraGlow: "bg-blue-300/10",
    glowSpot: "bg-blue-400/20",
  },
  howItWorks: [
    {
      icon: "contactless",
      title: "Tap the NFC Card",
      detail:
        "The contact holds their phone near your Digital Business Card. The phone reads it instantly — no app installation required.",
    },
    {
      icon: "open_in_new",
      title: "Your Digital Profile Opens",
      detail:
        "A clean, mobile-optimised profile page loads in their browser showing your name, role, contact info, and links.",
    },
    {
      icon: "person_add",
      title: "They Save or Contact You",
      detail:
        "They save your contact details directly to their phone, call you, email you, or visit your social profiles — all from one page.",
    },
  ],
  benefits: [
    {
      icon: "bolt",
      title: "Share Everything in One Tap",
      detail:
        "Name, phone, email, website, Instagram, WhatsApp — all on a single page, opened instantly when they tap your card.",
    },
    {
      icon: "smartphone",
      title: "No App Required",
      detail:
        "Any modern iPhone or Android phone with NFC can tap your card. The profile opens in their regular browser.",
    },
    {
      icon: "qr_code",
      title: "QR Backup Included",
      detail:
        "Every card comes with a printed QR code so contacts on devices without NFC can still reach your profile instantly.",
    },
    {
      icon: "update",
      title: "Always Up to Date",
      detail:
        "Changed your number, email, or social handle? Update your digital profile instantly — the physical card stays the same.",
    },
    {
      icon: "design_services",
      title: "Professional Custom Design",
      detail:
        "Impress at first glance. Your physical card is custom designed with your brand, colours, and identity.",
    },
    {
      icon: "eco",
      title: "No Paper Waste",
      detail:
        "One NFC card replaces hundreds of printed cards. Better for you, better for the environment.",
    },
  ],
  useCases: [
    "Professionals at networking events and conferences",
    "Freelancers and consultants meeting new clients",
    "Sales representatives sharing contact details on the go",
    "Recruiters and HR professionals",
    "Entrepreneurs and startup founders",
    "Anyone who wants a modern, updatable alternative to paper business cards",
  ],
};

export const metadata = {
  title: "Digital Business Card — NFCISTA",
  description:
    "Share your full business profile with a single tap. Name, contact details, social links — all on one page. NFCISTA Digital Business Card — coming soon.",
};

export default function DigitalBusinessCardPage() {
  return <ProductPageTemplate product={product} />;
}
