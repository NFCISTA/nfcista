import Image from "next/image";

/**
 * NfcistaLogo — Official NFCISTA 3D brand emblem.
 *
 * Props:
 *   size        — rendered width & height in px; default 20
 *   className   — additional classes
 *   priority    — whether to preload for above-the-fold headers
 */
export default function NfcistaLogo({ size = 20, className = "", priority = false, ...props }) {
  return (
    <Image
      src="/brand/nfcista-emblem.png"
      alt="NFCISTA"
      width={size}
      height={size}
      priority={priority}
      className={`shrink-0 object-contain ${className}`.trim()}
      {...props}
    />
  );
}
