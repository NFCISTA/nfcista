import React from "react";
import ProfileBrandIcon, { BRAND_COMPONENTS } from "./ProfileBrandIcons";
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
  reviews: Star,
  googlereview: Star,
  googlereviews: Star,
  file: FileText,
  document: FileText,
  chat: MessageCircle,
  message: MessageCircle,
};

/**
 * IconTile — Frameless Premium Icon Presentation
 *
 * Requirements:
 * - NO heavy black square tile backgrounds, borders, or inset shadows
 * - Sits naturally and framelessly on the profile link row
 * - Uniform optical center and visual weight
 * - Authentic brand logos in official signature identities
 * - Generic action icons in refined, crisp Lucide stroke
 * - Subtle hover lift and gentle brand halo filter
 * - Full reduced-motion and accessibility support
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
  brandColor = "#2563EB",
  className = "",
  isHovered = false,
}) {
  const normalized = (iconName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const isBrand = Boolean(BRAND_COMPONENTS[normalized]);
  const isReview = ["star", "review", "reviews", "googlereview", "googlereviews"].includes(normalized);
  const LucideComponent = LUCIDE_GENERIC_MAP[normalized] || Globe;

  return (
    <div
      className={`relative w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0
                  transition-transform duration-200 ease-out select-none
                  motion-reduce:transition-none motion-reduce:transform-none
                  group-hover:scale-105 group-active:scale-95
                  ${className}`.trim()}
      style={{
        filter: isHovered && brandColor
          ? `drop-shadow(0 3px 8px ${brandColor}33)`
          : "none",
      }}
      aria-hidden="true"
    >
      {isBrand ? (
        <ProfileBrandIcon
          name={normalized}
          size={30}
          className="shrink-0 transition-transform duration-200 motion-reduce:transform-none"
        />
      ) : isReview ? (
        <Star
          size={23}
          strokeWidth={1.75}
          color="#F59E0B"
          fill="#F59E0B"
          className="shrink-0 transition-transform duration-200 motion-reduce:transform-none"
        />
      ) : (
        <LucideComponent
          size={23}
          strokeWidth={1.9}
          color={brandColor || "#2563EB"}
          className="shrink-0 transition-transform duration-200 motion-reduce:transform-none"
        />
      )}
    </div>
  );
}
