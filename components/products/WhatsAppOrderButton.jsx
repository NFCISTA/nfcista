/**
 * WhatsAppOrderButton
 *
 * Renders a WhatsApp CTA anchor that opens a pre-filled chat with the
 * NFCISTA business number. The product name is injected into the message
 * so each product page produces its own unique, correctly-encoded URL.
 *
 * Props:
 *   productName  {string}  — e.g. "Google Review NFC Card"
 *   size         {"sm"|"md"|"lg"}  — controls padding/text size (default "md")
 *   label        {string}  — button label (optional, has a sensible default)
 *   showIcon     {boolean} — show WhatsApp chat icon (default true)
 *   className    {string}  — additional Tailwind classes to merge
 */

const WHATSAPP_NUMBER = "919000000000";

function buildWhatsAppUrl(productName) {
  const message = `Hi NFCISTA, I'm interested in the ${productName}. Please share the details.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const sizeMap = {
  sm: "px-4 py-2 text-label-sm gap-1.5",
  md: "px-5 py-2.5 text-label-md gap-2",
  lg: "px-7 py-4 text-label-lg gap-2.5",
};

export default function WhatsAppOrderButton({
  productName,
  size = "md",
  label = "Order on WhatsApp",
  showIcon = true,
  className = "",
}) {
  const url = buildWhatsAppUrl(productName);
  const sizeClasses = sizeMap[size] ?? sizeMap.md;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#20ba59] shadow-sm transition-all active:scale-[0.98] ${sizeClasses} ${className}`}
    >
      {showIcon && (
        <span className="material-symbols-outlined text-[1.1em]">chat</span>
      )}
      <span>{label}</span>
    </a>
  );
}
