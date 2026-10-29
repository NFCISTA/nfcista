import React from "react";

/**
 * ProfileBrandIcons — Authentic, recognizable brand assets.
 * Respects official brand identity guidelines:
 * - WhatsApp: Signature green bubble (#25D366) with crisp white receiver (Simple Icons geometry)
 * - Instagram: Iconic camera with multi-stop sunset gradient (Official Meta spec)
 * - Facebook: Official Meta Facebook blue (#1877F2) with white mark
 * - LinkedIn: Official LinkedIn blue (#0A66C2) with white 'in' mark
 * - YouTube: Official YouTube red (#FF0000) with white play triangle (Simple Icons geometry)
 * - X: Verified standalone geometric X mark (#000000) with zero background box (Simple Icons geometry)
 * - Google Drive: Official 3-color loop triangle (#FFBA00, #2684FC, #00AC47)
 * - Google Review / Google: Official 4-color 'G' mark (#4285F4, #34A853, #FBBC05, #EA4335)
 */

function WhatsAppLogo({ size = 28, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ overflow: "visible" }}
    >
      <path
        fill="#25D366"
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"
      />
      <path
        fill="#FFFFFF"
        d="M17.47 14.39c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.9 1.13-.17.19-.34.21-.63.07-.29-.15-1.23-.45-2.35-1.44-.87-.77-1.45-1.73-1.62-2.02-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.08-.15-.64-1.54-.87-2.11-.23-.56-.47-.48-.65-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43s1.03 2.82 1.17 3.01c.15.19 2.02 3.08 4.89 4.32.68.3 1.22.47 1.63.6.69.22 1.32.19 1.82.11.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34z"
      />
    </svg>
  );
}

function InstagramLogo({ size = 28, className = "" }) {
  const gradId = "nfcista-ig-sunset";
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFDC80" />
          <stop offset="25%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#F56040" />
          <stop offset="75%" stopColor="#FD1D1D" />
          <stop offset="85%" stopColor="#C13584" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <rect width="22" height="22" x="1" y="1" rx="6" fill={`url(#${gradId})`} />
      <rect width="12" height="12" x="6" y="6" rx="3.5" stroke="#FFFFFF" strokeWidth="1.75" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth="1.75" fill="none" />
      <circle cx="16.2" cy="7.8" r="0.9" fill="#FFFFFF" />
    </svg>
  );
}

function FacebookLogo({ size = 28, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ overflow: "visible" }}
    >
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        fill="#FFFFFF"
        d="M14.5 12.3h-2.1v7.6h-3.1v-7.6H7.8v-2.7h1.5V7.8c0-1.2.6-3.1 3.1-3.1h2.3v2.6h-1.7c-.3 0-.6.1-.6.7v1.6h2.4l-.3 2.7z"
      />
    </svg>
  );
}

function LinkedInLogo({ size = 28, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ overflow: "visible" }}
    >
      <rect width="22" height="22" x="1" y="1" rx="4.5" fill="#0A66C2" />
      <path
        fill="#FFFFFF"
        d="M6.2 8.6h2.7v9.2H6.2V8.6zm1.4-4.3c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6.7-1.6 1.6-1.6zm3.3 4.3h2.6v1.3h.1c.4-.7 1.3-1.5 2.8-1.5 3 0 3.5 2 3.5 4.5v5H17v-4.4c0-1.1 0-2.4-1.5-2.4s-1.7 1.2-1.7 2.4v4.4h-2.9V8.6z"
      />
    </svg>
  );
}

function YouTubeLogo({ size = 28, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ overflow: "visible" }}
    >
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <polygon points="9.545,15.568 9.545,8.432 15.818,12" fill="#FFFFFF" />
    </svg>
  );
}

function XLogo({ size = 25, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="#000000"
      aria-hidden="true"
      className={className}
      style={{ overflow: "visible" }}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GoogleDriveLogo({ size = 28, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ overflow: "visible" }}
    >
      <path fill="#FFBA00" d="m7.71 3.5-6.56 11.5 3.43 6 6.56-11.5L7.71 3.5Z" />
      <path fill="#2684FC" d="M12.57 3.5 6.01 15h13.14l3.43-6H12.57Z" />
      <path fill="#00AC47" d="M22.85 15l-3.43 6H6.29l3.43-6h13.13Z" />
    </svg>
  );
}

function GoogleReviewLogo({ size = 28, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ overflow: "visible" }}
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.32 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.68 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

const BRAND_COMPONENTS = {
  whatsapp: WhatsAppLogo,
  instagram: InstagramLogo,
  facebook: FacebookLogo,
  linkedin: LinkedInLogo,
  youtube: YouTubeLogo,
  x: XLogo,
  twitter: XLogo,
  googledrive: GoogleDriveLogo,
  drive: GoogleDriveLogo,
  googlereview: GoogleReviewLogo,
  google: GoogleReviewLogo,
};

export default function ProfileBrandIcon({
  name,
  size = 28,
  className = "",
  "aria-hidden": ariaHidden = true,
  ...props
}) {
  const normalizedKey = (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const BrandComponent = BRAND_COMPONENTS[normalizedKey];

  if (!BrandComponent) return null;

  return <BrandComponent size={size} className={className} {...props} />;
}

export {
  BRAND_COMPONENTS,
  WhatsAppLogo,
  InstagramLogo,
  FacebookLogo,
  LinkedInLogo,
  YouTubeLogo,
  XLogo,
  GoogleDriveLogo,
  GoogleReviewLogo,
};
