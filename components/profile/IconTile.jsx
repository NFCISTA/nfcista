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
  file: FileText,
  document: FileText,
  chat: MessageCircle,
  message: MessageCircle,
};

/**
 * IconTile — Frameless Premium Icon Presentation
 *
 * Requirements:
 * - Completely frameless: NO black boxes, NO borders, NO heavy tile shadows
 * - Sits naturally and directly against the link-row background
 * - Authentic brand logos for WhatsApp, Instagram, Facebook, LinkedIn, YouTube, X, Google Drive, Google Review
 * - Polished Lucide action icons for Phone, Email, Location, Website, QR, Share, etc.
 * - Perfectly aligned 44×44px touch-safe optical center
 * - Subtle hover lift and gentle brand halo filter
 * - Accessible focus indicators and full reduced-motion compliance
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
  const isGenericReview = ["star", "review", "reviews"].includes(normalized);
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
          ? `drop-shadow(0 2px 6px ${brandColor}25)`
          : "none",
      }}
      aria-hidden="true"
    >
      {isBrand ? (
        <ProfileBrandIcon
          name={normalized}
          size={normalized === "x" ? 25 : 28}
          className="shrink-0 transition-transform duration-200 motion-reduce:transform-none"
        />
      ) : isGenericReview ? (
        <Star
          size={24}
          strokeWidth={1.8}
          color="#F59E0B"
          fill="#F59E0B"
          className="shrink-0 transition-transform duration-200 motion-reduce:transform-none"
        />
      ) : (
        <LucideComponent
          size={24}
          strokeWidth={1.9}
          color={brandColor || "#2563EB"}
          className="shrink-0 transition-transform duration-200 motion-reduce:transform-none"
        />
      )}
    </div>
  );
}
