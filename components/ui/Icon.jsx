import React from "react";
import {
  Radio,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  X,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  QrCode,
  Star,
  User,
  Shield,
  Lock,
  LogOut,
  RotateCw,
  Camera,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  Info,
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Share2,
  Globe,
  MapPin,
  Tag,
  Briefcase,
  ShoppingBag,
} from "lucide-react";

const ICON_MAP = {
  // Direct PascalCase Lucide component exports
  Radio,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  X,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  QrCode,
  Star,
  User,
  Shield,
  Lock,
  LogOut,
  RotateCw,
  Camera,
  Image: ImageIcon,
  ImageIcon,
  Upload,
  AlertTriangle,
  Info,
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Share2,
  Globe,
  MapPin,
  Tag,
  Briefcase,
  ShoppingBag,

  // Brand & hardware aliases
  contactless: Radio,
  nfc: Radio,
  radio: Radio,
  qr: QrCode,
  qr_code: QrCode,
  qr_code_2: QrCode,
  qr_code_scanner: QrCode,

  // Communication & contact aliases
  call: Phone,
  phone: Phone,
  mail: Mail,
  email: Mail,
  chat: MessageSquare,
  message: MessageSquare,
  share: Share2,

  // Navigation aliases
  arrow_forward: ArrowRight,
  "arrow-right": ArrowRight,
  arrow_right: ArrowRight,
  arrow_back: ArrowLeft,
  "arrow-left": ArrowLeft,
  arrow_left: ArrowLeft,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  chevron_down: ChevronDown,
  expand_more: ChevronDown,
  menu: Menu,
  close: X,
  open_in_new: ExternalLink,
  "external-link": ExternalLink,
  external_link: ExternalLink,

  // Status & Feedback aliases
  check_circle: CheckCircle2,
  check_circle_2: CheckCircle2,
  check: Check,
  star: Star,
  warning: AlertTriangle,
  error: AlertTriangle,
  info: Info,
  refresh: RotateCw,
  rotate_cw: RotateCw,

  // Entities & Security aliases
  person: User,
  user: User,
  person_add: User,
  admin: Shield,
  admin_panel_settings: Shield,
  shield: Shield,
  lock: Lock,
  lock_reset: Lock,
  logout: LogOut,

  // Actions & Content aliases
  copy: Copy,
  content_copy: Copy,
  edit: Pencil,
  delete: Trash2,
  trash: Trash2,
  search: Search,
  upload: Upload,
  camera: Camera,
  photo_camera: Camera,
  image: ImageIcon,
  photo_library: ImageIcon,

  // Details aliases
  language: Globe,
  website: Globe,
  location_on: MapPin,
  location: MapPin,
  map_pin: MapPin,
  "map-pin": MapPin,
  label: Tag,
  tag: Tag,
  work: Briefcase,
  briefcase: Briefcase,
  shopping_bag: ShoppingBag,
};

/**
 * NFCISTA Reusable Design System Icon Component
 *
 * Wraps Lucide React icons with uniform optical sizing and stroke weights:
 * - strokeWidth: 1.75 (restrained technical line weight)
 * - sizes: 14, 16, 18, 20, 24
 */
export default function Icon({
  name,
  size = 18,
  strokeWidth = 1.75,
  className = "",
  "aria-hidden": ariaHidden = true,
  ...props
}) {
  let IconComponent = null;

  if (typeof name === "function" || (typeof name === "object" && name !== null)) {
    IconComponent = name;
  } else if (typeof name === "string") {
    // 1. Direct key match (case-sensitive: e.g. "ArrowRight", "check_circle")
    IconComponent = ICON_MAP[name];

    // 2. Case-insensitive & normalized fallback
    if (!IconComponent) {
      const lower = name.toLowerCase();
      IconComponent =
        ICON_MAP[lower] ||
        ICON_MAP[lower.replace(/-/g, "_")] ||
        ICON_MAP[lower.replace(/_/g, "-")];
    }
  }

  if (!IconComponent) {
    // If unknown icon name, fallback gracefully to material-symbols class with inline fontSize
    return (
      <span
        className={`material-symbols-outlined shrink-0 ${className}`.trim()}
        style={{
          fontSize: typeof size === "number" ? `${size}px` : size,
          ...props.style,
        }}
        aria-hidden={ariaHidden}
        {...props}
      >
        {name}
      </span>
    );
  }

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden={ariaHidden}
      className={`shrink-0 ${className}`.trim()}
      {...props}
    />
  );
}
