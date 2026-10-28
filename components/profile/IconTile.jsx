import React from "react";
import ProfileBrandIcon, { BRAND_SVGS } from "./ProfileBrandIcons";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  Download,
  Copy,
  ExternalLink,
  QrCode,
  Star,
  FileText,
  MessageCircle,
} from "lucide-react";

/**
 * Generic Lucide icon map matching generic profile actions.
 * Rendered with consistent 1.5px stroke weight.
 */
const LUCIDE_GENERIC_MAP = {
  phone: Phone,
  call: Phone,
  tel: Phone,
  mail: Mail,
  email: Mail,
  map: MapPin,
  location: MapPin,
  address: MapPin,
  mappin: MapPin,
  globe: Globe,
  website: Globe,
  share: Share2,
  download: Download,
  copy: Copy,
  externallink: ExternalLink,
  qr: QrCode,
  qrcode: QrCode,
  star: Star,
  review: Star,
  file: FileText,
  document: FileText,
  chat: MessageCircle,
  message: MessageCircle,
};

/**
 * IconTile — Monoline Glass Tile Component
 *
 * Requirements:
 * - 48 × 48 px, 14 px radius
 * - #0B0D11 background, 1px solid #1D222B border
 * - Inset top highlight rgba(255,255,255,0.06)
 * - 22 × 22 px inline SVG glyph in monochrome #F2F4F8
 * - Consistent 1.5px stroke for Lucide icons
 * - Verified Simple Icons brand glyphs for brands
 * - Interactive hover lift (-2px), subtle brand glow, active press scale (0.97)
 * - Reduced-motion compliance
 *
 * @param {{
 *   iconName: string,
 *   brandColor?: string,
 *   className?: string,
 *   isHovered?: boolean,
 * }} props
 */
export default function IconTile({
  iconName = "",
  brandColor = "#6F93FF",
  className = "",
  isHovered = false,
}) {
  const normalized = (iconName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const isBrand = Boolean(BRAND_SVGS[normalized]);
  const LucideComponent = LUCIDE_GENERIC_MAP[normalized] || Globe;

  return (
    <div
      className={`relative w-12 h-12 min-w-[48px] min-h-[48px] rounded-[14px] flex items-center justify-center
                  bg-[#0B0D11] border border-[#1D222B]
                  transition-all duration-200 ease-out select-none
                  motion-reduce:transition-none motion-reduce:transform-none
                  group-hover:-translate-y-0.5 group-active:scale-[0.97]
                  ${className}`.trim()}
      style={{
        boxShadow: isHovered
          ? `inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 6px 18px -4px ${brandColor}40`
          : "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 2px 4px rgba(0, 0, 0, 0.25)",
        borderColor: isHovered ? `${brandColor}60` : "#1D222B",
      }}
      aria-hidden="true"
    >
      {isBrand ? (
        <ProfileBrandIcon
          name={normalized}
          size={22}
          color="#F2F4F8"
          className="transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"
        />
      ) : (
        <LucideComponent
          size={22}
          strokeWidth={1.5}
          color="#F2F4F8"
          className="transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none shrink-0"
        />
      )}
    </div>
  );
}
