/**
 * NFCISTA Product Catalog Data
 *
 * Centralized, single source of truth for all NFCISTA products.
 * Used by storefront previews, individual product pages, and WhatsApp ordering.
 */

export const products = [
  {
    id: "google-review",
    slug: "google-review",
    name: "Google Review NFC Card",
    badge: "Customer Feedback",
    shortDescription: "Make it easy for customers to find your Google review page.",
    purpose: "Make it easy for customers to find your Google review page.",
    tagline:
      "Let your customers leave a Google review with a single tap — no searching, no links to type, no friction.",
    description:
      "The NFCISTA Google Review NFC Card is a smart, professional card that takes your customers directly to your Google review page. When a customer taps the card with their phone, they're instantly taken to your review form. No app required, no URL to type, no confusion. More reviews means better local search visibility and stronger social proof for your business.",
    image: "/images/product-showcase.png",
    status: "Coming Soon",
    price: "Coming Soon",
    whatsappMessage:
      "Hi NFCISTA, I'm interested in the Google Review NFC Card. Please share the details and pricing.",
    theme: {
      cardBg: "from-[#1A2639] via-[#121B2A] to-[#0A101A]",
      accentIcon: "star",
      accentColor: "text-amber-400",
      accentText: "text-amber-600",
      accentIconColor: "text-amber-400",
      chipStyle: "bg-gradient-to-tr from-[#E6B762] via-[#F8E19B] to-[#D49E3C]",
      highlightBadge: "Google Reviews",
      heroBg: "bg-gradient-to-b from-amber-50/60 via-surface-container-low/30 to-transparent",
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
  },
  {
    id: "instagram",
    slug: "instagram",
    name: "Instagram NFC Card",
    badge: "Social Presence",
    shortDescription: "Let customers open your Instagram profile with a tap.",
    purpose: "Let customers open your Instagram profile with a tap.",
    tagline:
      "Turn every in-person interaction into a new Instagram follower — with a single tap of your card.",
    description:
      "The NFCISTA Instagram NFC Card opens your Instagram profile the instant a customer or contact taps the card with their phone. No handle to type, no search needed. Perfect for businesses, creators, and entrepreneurs who want to grow their Instagram following from real, in-person conversations — whether at events, shops, markets, or meetings.",
    image: "/images/product-showcase.png",
    status: "Coming Soon",
    price: "Coming Soon",
    whatsappMessage:
      "Hi NFCISTA, I'm interested in the Instagram NFC Card. Please share the details and pricing.",
    theme: {
      cardBg: "from-[#2A1224] via-[#1F0D1A] to-[#120710]",
      accentIcon: "photo_camera",
      accentColor: "text-pink-400",
      accentText: "text-pink-600",
      accentIconColor: "text-pink-400",
      chipStyle: "bg-gradient-to-tr from-[#E6B762] via-[#F8E19B] to-[#D49E3C]",
      highlightBadge: "Instagram Profile",
      heroBg: "bg-gradient-to-b from-pink-50/60 via-surface-container-low/30 to-transparent",
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
  },
  {
    id: "whatsapp",
    slug: "whatsapp",
    name: "WhatsApp NFC Card",
    badge: "Direct Messaging",
    shortDescription: "Make it simple for customers to start a WhatsApp conversation.",
    purpose: "Make it simple for customers to start a WhatsApp conversation.",
    tagline:
      "Let customers start a WhatsApp conversation with your business in a single tap — no number-saving, no typing.",
    description:
      "The NFCISTA WhatsApp NFC Card opens a pre-filled WhatsApp chat with your business the moment someone taps it. No need to save your number, copy a link, or search for you. Customers are one tap away from asking a question, placing an order, or booking an appointment — directly over WhatsApp. Ideal for any business that uses WhatsApp as a primary customer communication channel.",
    image: "/images/product-showcase.png",
    status: "Coming Soon",
    price: "Coming Soon",
    whatsappMessage:
      "Hi NFCISTA, I'm interested in the WhatsApp NFC Card. Please share the details and pricing.",
    theme: {
      cardBg: "from-[#0D281E] via-[#091D15] to-[#05110C]",
      accentIcon: "chat",
      accentColor: "text-emerald-400",
      accentText: "text-emerald-700",
      accentIconColor: "text-emerald-400",
      chipStyle: "bg-gradient-to-tr from-[#E6B762] via-[#F8E19B] to-[#D49E3C]",
      highlightBadge: "WhatsApp Chat",
      heroBg: "bg-gradient-to-b from-emerald-50/60 via-surface-container-low/30 to-transparent",
      auraGlow: "bg-emerald-300/10",
      glowSpot: "bg-emerald-400/20",
    },
    howItWorks: [
      {
        icon: "contactless",
        title: "Tap the NFC Card",
        detail:
          "The customer holds their phone near your WhatsApp NFC card. The phone detects it in less than a second — no app install needed.",
      },
      {
        icon: "open_in_new",
        title: "WhatsApp Chat Opens",
        detail:
          "WhatsApp opens immediately with your business number pre-loaded and an optional greeting pre-filled. No number saving required.",
      },
      {
        icon: "send",
        title: "Customer Sends a Message",
        detail:
          "The customer sends their enquiry, order, or question in one tap. You receive it directly in your WhatsApp Business account.",
      },
    ],
    benefits: [
      {
        icon: "bolt",
        title: "Zero Friction Contact",
        detail:
          "Customers don't need to save your number, type a link, or open Google. Tap and they're already in a chat with you.",
      },
      {
        icon: "smartphone",
        title: "Works on Any Modern Phone",
        detail:
          "NFC is supported on virtually all modern Android and iPhone models. No app installation required on the customer's side.",
      },
      {
        icon: "qr_code",
        title: "QR Backup Included",
        detail:
          "A QR code is printed alongside the NFC chip. Customers without NFC can scan it and still reach your WhatsApp instantly.",
      },
      {
        icon: "support_agent",
        title: "Faster Customer Service",
        detail:
          "When customers can message you in one tap, response times improve, satisfaction goes up, and conversions follow.",
      },
      {
        icon: "design_services",
        title: "Custom-Branded Card",
        detail:
          "Every NFCISTA card is professionally designed with your brand — great for reception desks, storefronts, and in-person handouts.",
      },
      {
        icon: "update",
        title: "Number or Message Is Updatable",
        detail:
          "If your WhatsApp number or pre-filled message changes, your digital profile can be updated without replacing the physical card.",
      },
    ],
    useCases: [
      "Shops and retailers using WhatsApp for orders",
      "Service businesses handling bookings via WhatsApp",
      "Real estate agents sharing property enquiry links",
      "Healthcare clinics and dental practices for appointment queries",
      "Caterers, event planners, and freelancers",
      "Any business where WhatsApp is the primary contact channel",
    ],
  },
  {
    id: "digital-business-card",
    slug: "digital-business-card",
    name: "Digital Business Card",
    badge: "Complete Identity",
    shortDescription: "Share your digital business profile and contact details instantly.",
    purpose: "Share your digital business profile and contact details instantly.",
    tagline:
      "Share your full business profile — contact details, social links, and more — with a single tap.",
    description:
      "The NFCISTA Digital Business Card opens a complete, professionally designed digital profile when tapped. Visitors see your name, title, business, phone number, email, social media links, and any other details you choose to include. Unlike a paper business card, your digital profile can be updated instantly whenever your information changes — no reprinting required. One card, your entire professional identity.",
    image: "/images/product-showcase.png",
    status: "Coming Soon",
    price: "Coming Soon",
    whatsappMessage:
      "Hi NFCISTA, I'm interested in the Digital Business Card. Please share the details and pricing.",
    theme: {
      cardBg: "from-[#0F1E36] via-[#16294A] to-[#0A162B]",
      accentIcon: "badge",
      accentColor: "text-blue-400",
      accentText: "text-blue-700",
      accentIconColor: "text-blue-400",
      chipStyle: "bg-gradient-to-tr from-[#E6B762] via-[#F8E19B] to-[#D49E3C]",
      highlightBadge: "Full Profile & vCard",
      heroBg: "bg-gradient-to-b from-blue-50/60 via-surface-container-low/30 to-transparent",
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
  },
];

/**
 * Find a product by its slug or id. Returns null if not found.
 */
export function getProductBySlug(slug) {
  if (!slug) return null;
  return products.find((p) => p.slug === slug || p.id === slug) || null;
}

/**
 * Returns all products in the catalog.
 */
export function getAllProducts() {
  return products;
}

export default products;
