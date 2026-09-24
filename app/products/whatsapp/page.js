import ProductPageTemplate from "@/components/products/ProductPageTemplate";

const product = {
  name: "WhatsApp NFC Card",
  badge: "Direct Messaging",
  tagline:
    "Let customers start a WhatsApp conversation with your business in a single tap — no number-saving, no typing.",
  description:
    "The NFCISTA WhatsApp NFC Card opens a pre-filled WhatsApp chat with your business the moment someone taps it. No need to save your number, copy a link, or search for you. Customers are one tap away from asking a question, placing an order, or booking an appointment — directly over WhatsApp. Ideal for any business that uses WhatsApp as a primary customer communication channel.",
  theme: {
    heroBg: "bg-gradient-to-b from-emerald-50/60 via-surface-container-low/30 to-transparent",
    cardBg: "from-[#0D281E] via-[#091D15] to-[#05110C]",
    accentIcon: "chat",
    accentText: "text-emerald-700",
    accentIconColor: "text-emerald-400",
    highlightBadge: "WhatsApp Chat",
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
};

export const metadata = {
  title: "WhatsApp NFC Card — NFCISTA",
  description:
    "Let customers tap and open a WhatsApp chat with your business instantly. No number-saving required. NFCISTA WhatsApp NFC Card — coming soon.",
};

export default function WhatsAppPage() {
  return <ProductPageTemplate product={product} />;
}
