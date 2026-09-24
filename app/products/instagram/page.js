import ProductPageTemplate from "@/components/products/ProductPageTemplate";

const product = {
  name: "Instagram NFC Card",
  badge: "Social Presence",
  tagline:
    "Turn every in-person interaction into a new Instagram follower — with a single tap of your card.",
  description:
    "The NFCISTA Instagram NFC Card opens your Instagram profile the instant a customer or contact taps the card with their phone. No handle to type, no search needed. Perfect for businesses, creators, and entrepreneurs who want to grow their Instagram following from real, in-person conversations — whether at events, shops, markets, or meetings.",
  theme: {
    heroBg: "bg-gradient-to-b from-pink-50/60 via-surface-container-low/30 to-transparent",
    cardBg: "from-[#2A1224] via-[#1F0D1A] to-[#120710]",
    accentIcon: "photo_camera",
    accentText: "text-pink-600",
    accentIconColor: "text-pink-400",
    highlightBadge: "Instagram Profile",
    auraGlow: "bg-pink-300/10",
    glowSpot: "bg-pink-400/20",
  },
  howItWorks: [
    {
      icon: "contactless",
      title: "Tap the NFC Card",
      detail:
        "The contact holds their phone near your Instagram NFC card. The phone picks it up in under a second — no app installation needed.",
    },
    {
      icon: "open_in_new",
      title: "Your Instagram Profile Opens",
      detail:
        "The phone opens your Instagram profile page directly. They see your content, bio, and posts immediately.",
    },
    {
      icon: "person_add",
      title: "They Follow You",
      detail:
        "The contact follows your profile with a tap. Every real interaction becomes a potential follower in seconds.",
    },
  ],
  benefits: [
    {
      icon: "bolt",
      title: "Instant Profile Access",
      detail:
        "No handles to spell out or search for. One tap and your Instagram profile is open in front of them.",
    },
    {
      icon: "smartphone",
      title: "No App Required for the Tap",
      detail:
        "Any modern smartphone with NFC can tap your card. They'll be redirected to Instagram even without having the app open.",
    },
    {
      icon: "qr_code",
      title: "QR Backup Included",
      detail:
        "Every card includes a QR code for contacts whose phones don't support NFC — ensuring no one misses your profile.",
    },
    {
      icon: "trending_up",
      title: "Grow Your Audience Organically",
      detail:
        "In-person followers are warm leads. They met you, they liked you, they chose to follow — the best kind of growth.",
    },
    {
      icon: "design_services",
      title: "Custom-Branded Card",
      detail:
        "Your card is professionally designed with your brand identity — making a strong first impression before they even tap.",
    },
    {
      icon: "update",
      title: "Profile Link Is Updatable",
      detail:
        "If your Instagram handle ever changes, your digital profile can be updated without reprinting the physical card.",
    },
  ],
  useCases: [
    "Photographers showcasing their portfolio",
    "Restaurants and cafés building a local community",
    "Boutiques and retail stores sharing product drops",
    "Content creators networking at events",
    "Fitness trainers and wellness professionals",
    "Artists, makeup artists, and stylists",
  ],
};

export const metadata = {
  title: "Instagram NFC Card — NFCISTA",
  description:
    "Let customers tap and open your Instagram profile instantly. No typing, no searching. NFCISTA Instagram NFC Card — coming soon.",
};

export default function InstagramPage() {
  return <ProductPageTemplate product={product} />;
}
