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
    image: "/images/products/google-review-nfc-card.png",
    standImage: "/images/products/google-review-nfc-card-stand.png",
    variants: [
      { id: "card", label: "Card", image: "/images/products/google-review-nfc-card.png" },
      { id: "stand", label: "Card + Stand", image: "/images/products/google-review-nfc-card-stand.png" },
    ],
    status: "Coming Soon",
    price: "Coming Soon",
    whatsappMessage:
      "Hi NFCISTA, I'm interested in the Google Review NFC Card. Please share the details and pricing.",
    theme: {
      cardBg: "linear-gradient(to bottom right, #1A2639, #121B2A, #0A101A)",
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
        title: "Tap the Card",
        detail:
          "Hold any NFC-enabled phone near the card. If NFC is supported and enabled on the device, it responds in under a second — no app needed.",
      },
      {
        icon: "open_in_new",
        title: "Open Google Reviews",
        detail:
          "The phone opens your Google review page directly. No typing, no searching — the customer lands straight on your review form.",
      },
      {
        icon: "star",
        title: "Leave a Review",
        detail:
          "The customer rates your business and writes feedback in seconds. More reviews mean better local search visibility.",
      },
    ],
    benefits: [
      {
        icon: "bolt",
        title: "Zero Friction",
        detail:
          "Tap → review form. No URL to type, no Google search, no extra steps. Customers who want to leave a review actually do.",
      },
      {
        icon: "smartphone",
        title: "Works on Modern Phones",
        detail:
          "NFC is built into most Android phones and iPhones (iPhone 7 and later). Customers don't need to install anything.",
      },
      {
        icon: "qr_code",
        title: "QR Backup Included",
        detail:
          "Every card also has a printed QR code — so customers on devices without NFC can still reach your review page easily.",
      },
      {
        icon: "visibility",
        title: "Improves Local Search Visibility",
        detail:
          "Regular, genuine reviews directly strengthen your Google Business Profile and help nearby customers find you.",
      },
      {
        icon: "design_services",
        title: "Custom-Designed Card",
        detail:
          "Each card is printed with your brand. Premium materials, sharp finish, and a professional look that matches your business.",
      },
      {
        icon: "update",
        title: "Review Link Is Updatable",
        detail:
          "If your Google review link changes, your digital profile can be updated without reprinting the physical card.",
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
    image: "/images/products/instagram-nfc-card.png",
    status: "Coming Soon",
    price: "Coming Soon",
    whatsappMessage:
      "Hi NFCISTA, I'm interested in the Instagram NFC Card. Please share the details and pricing.",
    theme: {
      cardBg: "linear-gradient(to bottom right, #2A1224, #1F0D1A, #120710)",
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
        title: "Tap the Card",
        detail:
          "Hold any NFC-enabled phone near the card. If NFC is supported and enabled on the device, it picks it up in under a second — no app installation needed.",
      },
      {
        icon: "open_in_new",
        title: "Open Instagram",
        detail:
          "The phone opens your Instagram profile page directly. They see your content, bio, and posts immediately.",
      },
      {
        icon: "person_add",
        title: "Follow the Business",
        detail:
          "The contact follows your profile with a tap. Every real in-person interaction becomes a potential follower in seconds.",
      },
    ],
    benefits: [
      {
        icon: "bolt",
        title: "Instant Profile Access",
        detail:
          "No handle to spell out or search for. One tap and your Instagram profile is open in front of them.",
      },
      {
        icon: "smartphone",
        title: "Works on Modern Phones",
        detail:
          "NFC is built into most Android phones and iPhones (iPhone 7 and later). The tap redirects to Instagram — even without the app open.",
      },
      {
        icon: "qr_code",
        title: "QR Backup Included",
        detail:
          "Every card includes a QR code for contacts whose phones don't support NFC — so no one misses your profile.",
      },
      {
        icon: "trending_up",
        title: "Grow Your Audience in Person",
        detail:
          "In-person followers are warm leads. They met you, liked you, and chose to follow — the most genuine kind of growth.",
      },
      {
        icon: "design_services",
        title: "Custom-Branded Card",
        detail:
          "Your card is professionally designed with your brand identity — a strong first impression before they even tap.",
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
    image: "/images/products/whatsapp-nfc-card.png",
    status: "Coming Soon",
    price: "Coming Soon",
    whatsappMessage:
      "Hi NFCISTA, I'm interested in the WhatsApp NFC Card. Please share the details and pricing.",
    theme: {
      cardBg: "linear-gradient(to bottom right, #0D281E, #091D15, #05110C)",
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
        title: "Tap the Card",
        detail:
          "Hold any NFC-enabled phone near the card. If NFC is supported and enabled on the device, it responds in under a second — no app install needed.",
      },
      {
        icon: "open_in_new",
        title: "Open WhatsApp",
        detail:
          "WhatsApp opens with your business number pre-loaded and an optional greeting pre-filled. No number-saving required.",
      },
      {
        icon: "send",
        title: "Start a Chat",
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
        title: "Works on NFC-Enabled Phones",
        detail:
          "NFC is built into most Android phones and iPhones (iPhone 7 and later). No app installation required on the customer's side.",
      },
      {
        icon: "qr_code",
        title: "QR Backup Included",
        detail:
          "A QR code is printed alongside the NFC chip — customers without NFC can scan it and still reach your WhatsApp instantly.",
      },
      {
        icon: "support_agent",
        title: "Faster Customer Conversations",
        detail:
          "When customers can message you in one tap, conversations start sooner and enquiries are less likely to drop off.",
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
          "If your WhatsApp number or pre-filled greeting changes, your digital profile can be updated without replacing the physical card.",
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
    image: "/images/products/digital-business-card-black.png",
    variantWhiteImage: "/images/products/digital-business-card-white.png",
    variants: [
      { id: "black", label: "Black", image: "/images/products/digital-business-card-black.png" },
      { id: "white", label: "White", image: "/images/products/digital-business-card-white.png" },
    ],
    status: "Coming Soon",
    price: "Coming Soon",
    whatsappMessage:
      "Hi NFCISTA, I'm interested in the Digital Business Card. Please share the details and pricing.",
    theme: {
      cardBg: "linear-gradient(to bottom right, #0F1E36, #16294A, #0A162B)",
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
        title: "Tap the Card",
        detail:
          "Hold any NFC-enabled phone near your Digital Business Card. If NFC is supported and enabled on the device, it reads it in under a second — no app required.",
      },
      {
        icon: "open_in_new",
        title: "Open Profile",
        detail:
          "A clean, mobile-optimised digital profile loads directly in their web browser showing your name, role, contact details, and links.",
      },
      {
        icon: "person_add",
        title: "Save Contact",
        detail:
          "The contact saves your details directly to their phonebook or connects with you on social channels in a single tap.",
      },
    ],
    benefits: [
      {
        icon: "bolt",
        title: "Quick Sharing",
        detail:
          "Name, phone, email, website, and social links — all on a single page, opened instantly with a single tap.",
      },
      {
        icon: "smartphone",
        title: "No App Required",
        detail:
          "Recipients don't need any special app. The profile opens directly in their smartphone's standard web browser.",
      },
      {
        icon: "qr_code",
        title: "NFC + QR Backup",
        detail:
          "Every card includes a printed QR code so contacts whose devices don't have NFC can still scan and access your profile.",
      },
      {
        icon: "update",
        title: "Always Up to Date",
        detail:
          "Changed your number, email, or role? Update your digital profile anytime — your physical card always directs to the latest info.",
      },
      {
        icon: "design_services",
        title: "Professional Custom Design",
        detail:
          "High-quality card finish custom-designed with your branding to leave a lasting, professional impression at meetings.",
      },
      {
        icon: "eco",
        title: "Designed for Business Use",
        detail:
          "A reusable, professional alternative to paper cards that never runs out and eliminates paper waste.",
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
