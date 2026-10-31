/**
 * NfcistaLogo — reusable NFCISTA card-tap brand mark.
 *
 * A solid card body with two arcs representing the tap/handshake moment.
 * Renders in currentColor so it inherits whatever text color its container
 * sets. Drop-in replacement for <Icon name="nfc" … />.
 *
 * Props:
 *   size        — rendered width in px (height is auto-proportional); default 16
 *   className   — additional Tailwind / CSS classes
 */
export default function NfcistaLogo({ size = 16, className = "", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`.trim()}
      {...props}
    >
      {/* Card body — solid fill */}
      <rect x="2" y="5" width="11" height="10" rx="2" fill="currentColor" stroke="none" />
      {/* Near tap arc */}
      <path d="M15.5 8.5a3 3 0 0 1 0 3" />
      {/* Far tap arc */}
      <path d="M17.5 6.5a6 6 0 0 1 0 7" />
    </svg>
  );
}
