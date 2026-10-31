import Link from "next/link";
import Image from "next/image";
import {
  getCustomerBySlug,
  getSafeExternalUrl,
  getSafeExternalHttpsUrl,
  getSafeTwitterUrl,
  getSafeGoogleDriveUrl,
} from "@/lib/customers";
import { getCustomerGallery } from "@/lib/gallery";
import SaveContactButtonLazy from "@/components/SaveContactButtonLazy";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileLinksArea from "@/components/profile/ProfileLinksArea";
import ProfileGallery from "@/components/profile/ProfileGallery";
import ProfileEnquiryButton from "@/components/profile/ProfileEnquiryButton";
import ProfileIntro from "@/components/profile/ProfileIntro";
import Icon from "@/components/ui/Icon";
import NfcistaLogo from "@/components/ui/NfcistaLogo";

import { unstable_cache } from "next/cache";

export const revalidate = 60;

// Required by Next.js to enable ISR (fallback ISR) for this dynamic route.
// Returning an empty array means no paths are prerendered at build time,
// but every slug visited at runtime is cached and revalidated per `revalidate`.
export async function generateStaticParams() {
  return [];
}

const getCachedCustomerBySlug = (slug) => {
  const cleanSlug = (slug || "").toLowerCase().trim();
  return unstable_cache(
    async () => getCustomerBySlug(cleanSlug),
    ["customer-profile", cleanSlug],
    {
      tags: [`customer-profile:${cleanSlug}`],
      revalidate: 60,
    }
  )();
};

const getCachedCustomerGallery = (slug) => {
  const cleanSlug = (slug || "").toLowerCase().trim();
  return unstable_cache(
    async () => getCustomerGallery(cleanSlug),
    ["customer-gallery", cleanSlug],
    {
      tags: [`customer-profile:${cleanSlug}`],
      revalidate: 60,
    }
  )();
};

// ---------------------------------------------------------------------------
// Metadata & SEO
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const customer = await getCachedCustomerBySlug(slug);

  if (!customer) {
    return {
      title: "Profile Not Found | NFCISTA",
      description: "The requested digital business card is not available.",
    };
  }

  const title = `${customer.full_name} | ${customer.company_name || "NFCISTA"}`;
  const description =
    customer.description ||
    `${customer.full_name} — ${customer.job_title || "Digital Business Card"}`;
  const profileUrl = `https://nfcista.vercel.app/p/${slug}`;

  const safePhotoUrl = getSafeExternalUrl(customer.photo_url);
  const ogImages = safePhotoUrl
    ? [{ url: safePhotoUrl, alt: customer.full_name }]
    : [{ url: "/icon.svg", width: 512, height: 512, alt: "NFCISTA" }];

  return {
    title,
    description,
    alternates: { canonical: profileUrl },
    openGraph: {
      title,
      description,
      url: profileUrl,
      type: "profile",
      siteName: "NFCISTA",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
  };
}

// ---------------------------------------------------------------------------
// Page Component — Executive Digital Business Card
// ---------------------------------------------------------------------------
export default async function CustomerPublicProfilePage({ params }) {
  const { slug } = await params;
  const [customer, galleryItems] = await Promise.all([
    getCachedCustomerBySlug(slug),
    getCachedCustomerGallery(slug),
  ]);

  // ── Profile Unavailable ─────────────────────────────────────────────────
  if (!customer) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center p-4 antialiased">
        <div className="w-full max-w-[390px] bg-surface-base rounded-2xl p-8 text-center border border-border-hairline shadow-card">
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-border-hairline flex items-center justify-center overflow-hidden shadow-2xs">
              <NfcistaLogo size={18} />
            </div>
            <span className="text-sm font-bold tracking-wider text-text-primary">
              NFCISTA
            </span>
          </div>
          <div className="w-14 h-14 rounded-xl bg-surface-subtle border border-border-hairline flex items-center justify-center mx-auto mb-4 text-text-muted">
            <Icon name="person" size={26} strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-bold text-text-primary">Profile Unavailable</h1>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
            This digital business card is currently inactive or does not exist.
          </p>
          <div className="mt-6 pt-5 border-t border-border-hairline">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold shadow-btn-primary transition-colors"
            >
              <span>Visit NFCISTA</span>
              <Icon name="arrow_forward" size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Data Processing ─────────────────────────────────────────────────────
  const initials = customer.full_name
    ? customer.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NC";

  const hasPhone       = Boolean(customer.phone?.trim());
  const hasWhatsApp    = Boolean(customer.whatsapp?.trim());
  const hasEmail       = Boolean(customer.email?.trim());
  const hasAddress     = Boolean(customer.address?.trim());
  const hasDescription = Boolean(customer.description?.trim());

  // External URL security validation (only http/https pass)
  const safeWebsite      = getSafeExternalUrl(customer.website);
  const safeGoogleReview = getSafeExternalUrl(customer.google_review_url);
  const safePhotoUrl     = getSafeExternalUrl(customer.photo_url);
  const safeBannerUrl    = getSafeExternalUrl(customer.banner_url) || "/images/hero-mountains.jpg";
  const hasWebsite       = Boolean(safeWebsite);
  const hasGoogleReview  = Boolean(safeGoogleReview);

  // Social Links: Facebook & LinkedIn (strictly HTTPS only)
  const safeFacebook     = getSafeExternalHttpsUrl(customer.facebook_url || customer.facebook);
  const safeLinkedin     = getSafeExternalHttpsUrl(customer.linkedin_url || customer.linkedin);
  const hasFacebook      = Boolean(safeFacebook);
  const hasLinkedin      = Boolean(safeLinkedin);

  // Social & Document Links: X / Twitter & Google Drive
  const safeTwitter      = getSafeTwitterUrl(customer.twitter_url || customer.x_url);
  const safeDrive        = getSafeGoogleDriveUrl(customer.drive_url || customer.google_drive_url);
  const hasTwitter       = Boolean(safeTwitter);
  const hasDrive         = Boolean(safeDrive);

  // Normalize Instagram handle — strip leading @ characters
  const rawInstagram   = customer.instagram?.trim() || "";
  const cleanInstagram = rawInstagram.replace(/^@+/, "");
  const hasInstagram   = Boolean(cleanInstagram);

  const profileUrl = `https://nfcista.vercel.app/p/${slug}`;

  // ── Contact Links (WhatsApp, Call, Email, Address) ───────────────────
  const contactLinks = [];
  if (hasWhatsApp) {
    contactLinks.push({
      id: "whatsapp",
      label: "WhatsApp",
      value: customer.whatsapp.trim(),
      iconName: "whatsapp",
      brandColor: "#25D366",
      href: `https://wa.me/${customer.whatsapp.trim().replace(/\D/g, "")}`,
      isExternal: true,
    });
  }
  if (hasPhone) {
    contactLinks.push({
      id: "call",
      label: "Phone",
      value: customer.phone.trim(),
      iconName: "phone",
      brandColor: "#2563EB",
      href: `tel:${customer.phone.trim().replace(/\s/g, "")}`,
      isExternal: false,
      copyValue: customer.phone.trim(),
      copyLabel: "Phone number",
    });
  }
  if (hasEmail) {
    contactLinks.push({
      id: "email",
      label: "Email",
      value: customer.email.trim(),
      iconName: "email",
      brandColor: "#6366F1",
      href: `mailto:${customer.email.trim()}`,
      isExternal: false,
      copyValue: customer.email.trim(),
      copyLabel: "Email address",
    });
  }
  if (hasAddress) {
    contactLinks.push({
      id: "address",
      label: "Location / Directions",
      value: customer.address.trim(),
      iconName: "location",
      brandColor: "#EA4335",
      href: `https://maps.google.com/?q=${encodeURIComponent(customer.address.trim())}`,
      isExternal: true,
      copyValue: customer.address.trim(),
      copyLabel: "Address",
    });
  }

  // ── Social Links (Instagram, LinkedIn, X, Facebook) ──────────────────
  const socialLinks = [];
  if (hasInstagram) {
    socialLinks.push({
      id: "instagram",
      label: "Instagram",
      value: `@${cleanInstagram}`,
      iconName: "instagram",
      brandColor: "#E1306C",
      href: `https://instagram.com/${cleanInstagram}`,
    });
  }
  if (hasLinkedin) {
    socialLinks.push({
      id: "linkedin",
      label: "LinkedIn",
      value: "Professional Profile",
      iconName: "linkedin",
      brandColor: "#0A66C2",
      href: safeLinkedin,
    });
  }
  if (hasTwitter) {
    const xHandle = safeTwitter.replace(/^https?:\/\/(x\.com|twitter\.com)\//i, "@").replace(/\/$/, "");
    socialLinks.push({
      id: "x",
      label: "X (Twitter)",
      value: xHandle,
      iconName: "x",
      brandColor: "#94A3B8",
      href: safeTwitter,
    });
  }
  if (hasFacebook) {
    socialLinks.push({
      id: "facebook",
      label: "Facebook",
      value: "Facebook Page",
      iconName: "facebook",
      brandColor: "#1877F2",
      href: safeFacebook,
    });
  }

  // ── Business Links (Website, Google Review, Catalog & Utilities) ──────
  const businessLinks = [];
  if (hasWebsite) {
    const cleanWeb = safeWebsite.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    businessLinks.push({
      id: "website",
      label: "Official Website",
      value: cleanWeb,
      iconName: "website",
      brandColor: "#2563EB",
      href: safeWebsite,
      isExternal: true,
    });
  }
  if (hasGoogleReview) {
    businessLinks.push({
      id: "google_review",
      label: "Google Review",
      value: "Rate & review on Google Maps",
      iconName: "googlereview",
      brandColor: "#FBBC05",
      href: safeGoogleReview,
      isExternal: true,
    });
  }
  if (hasDrive) {
    businessLinks.push({
      id: "catalog_drive",
      label: "Product Catalog & Documents",
      value: "Google Drive folder",
      iconName: "googledrive",
      brandColor: "#34A853",
      href: safeDrive,
      isExternal: true,
    });
  }
  // Digital Profile QR & Share utilities
  businessLinks.push({
    id: "digital_qr",
    label: "Digital Profile QR",
    value: "Scan or display profile QR code",
    iconName: "qr",
    brandColor: "#6F93FF",
    isQrTrigger: true,
  });
  businessLinks.push({
    id: "share_profile",
    label: "Share Profile",
    value: "Share via apps or copy link",
    iconName: "share",
    brandColor: "#6F93FF",
    isShareTrigger: true,
  });

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#eef2ff] antialiased overflow-x-hidden">
      <ProfileIntro name={customer.full_name} />

      {/*
        Profile card:
        - Mobile: max-w-[430px], clean white surface, seamless edge-to-edge
        - Desktop (lg): max-w-[1040px], centered 2-column card with hairline border
      */}
      <div
        className="w-full max-w-[430px] mx-auto bg-surface-base min-h-screen
                   lg:max-w-[1040px] lg:min-h-0 lg:my-8 lg:rounded-3xl
                   lg:overflow-hidden lg:border lg:border-blue-100/60 lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]
                   lg:grid lg:grid-cols-[380px_1fr]"
      >

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN — Identity + Core CTA                               */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col bg-surface-base lg:border-r lg:border-border-hairline">

          {/* ── Premium Hero Banner ─────────────────────────────────── */}
          <div className="relative overflow-hidden h-44 sm:h-48 lg:h-56 bg-[#071426]">
            {/* Background banner (custom uploaded or NFCISTA default) */}
            <Image
              src={safeBannerUrl}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="(max-width: 430px) 100vw, (max-width: 1024px) 430px, 390px"
              className="object-cover object-[center_35%] select-none pointer-events-none"
            />

            {/* Gradient overlays: balanced for crisp mountain visibility and high text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#051329]/80 via-[#071426]/20 to-[#071426]/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_70%_20%,rgba(255,190,100,0.15),transparent_60%)] pointer-events-none" />

            {/* Top bar: NFCISTA brand + desktop tagline & Tap to Connect indicator */}
            <div className="relative z-10 flex items-center justify-between px-3.5 sm:px-4 pt-3.5 sm:pt-4">
              <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
                <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-white/30 transition-colors overflow-hidden">
                  <NfcistaLogo size={18} priority />
                </div>
                <span className="text-white text-[12.5px] sm:text-[13px] font-bold tracking-wide drop-shadow-md">
                  NFCISTA
                </span>
              </Link>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <p className="hidden lg:block text-white/70 text-[11px] italic font-light tracking-wide mr-2 drop-shadow-sm">
                  Small Tap · Big Connections
                </p>
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white flex-shrink-0 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-wide whitespace-nowrap drop-shadow-sm">
                    Tap to Connect
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Avatar + Identity ───────────────────────────────────── */}
          <div className="flex flex-col items-center text-center px-5 pb-4">
            {/* Avatar overlaps the banner frame */}
            <div className="-mt-14 mb-3 relative z-10">
              <ProfileAvatar
                photoUrl={safePhotoUrl}
                fullName={customer.full_name}
                initials={initials}
              />
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-[25px] font-bold text-text-primary tracking-tight leading-tight">
              {customer.full_name}
            </h1>

            {/* Job Title & Company */}
            {(customer.job_title?.trim() || customer.company_name?.trim()) && (
              <div className="mt-1 space-y-0.5">
                {customer.job_title?.trim() && (
                  <p className="text-xs font-medium text-text-secondary">
                    {customer.job_title.trim()}
                  </p>
                )}
                {customer.company_name?.trim() && (
                  <p className="text-xs font-semibold text-text-primary">
                    {customer.company_name.trim()}
                  </p>
                )}
              </div>
            )}

            {/* Category + Location tags */}
            {(customer.category?.trim() || hasAddress) && (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {customer.category?.trim() && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary bg-surface-subtle border border-border-hairline px-2.5 py-0.5 rounded-md">
                    <Icon name="tag" size={11} strokeWidth={2} className="text-accent-primary" />
                    <span className="truncate max-w-[140px]">
                      {customer.category.trim()}
                    </span>
                  </span>
                )}
                {hasAddress && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary bg-surface-subtle border border-border-hairline px-2.5 py-0.5 rounded-md">
                    <Icon name="location_on" size={11} strokeWidth={2} className="text-rose-600" />
                    <span className="truncate max-w-[140px]">
                      {customer.address.trim()}
                    </span>
                  </span>
                )}
              </div>
            )}

            {/* Optional opening-hours/status line */}
            {customer.opening_hours?.trim() && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-800 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{customer.opening_hours.trim()}</span>
              </div>
            )}
          </div>

          {/* ── Primary Action: Save Contact ─────────────────────────── */}
          <div className="px-5 pb-5">
            <SaveContactButtonLazy
              contact={{
                fullName:    customer.full_name,
                jobTitle:    customer.job_title?.trim(),
                companyName: customer.company_name?.trim(),
                phone:       customer.phone?.trim(),
                whatsapp:    customer.whatsapp?.trim(),
                email:       customer.email?.trim(),
                website:     safeWebsite || undefined,
                address:     customer.address?.trim(),
              }}
            />

            {/* Direct Enquiry Button (if enabled) */}
            {customer.enquiry_enabled && (
              <ProfileEnquiryButton
                name={customer.full_name}
                slug={customer.profile_slug}
              />
            )}
          </div>

          {/* Spacer for desktop layout */}
          <div className="hidden lg:block flex-1" />

          {/* Desktop Footer in Left Column */}
          <footer className="hidden lg:flex flex-col items-center py-5 px-5 border-t border-border-hairline">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5.5 h-5.5 rounded-md bg-surface-subtle border border-border-hairline flex items-center justify-center overflow-hidden">
                <NfcistaLogo size={14} />
              </div>
              <span className="text-xs font-bold text-text-primary">NFCISTA</span>
            </div>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
              Contactless Physical Identity
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] text-text-muted">
              <Link href="/privacy" className="hover:text-text-primary transition-colors">
                Privacy
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/terms" className="hover:text-text-primary transition-colors">
                Terms
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/privacy/data-request" className="hover:text-text-primary transition-colors">
                Data Rights
              </Link>
            </div>
            <p className="mt-1.5 text-[9.5px] text-text-muted">
              © 2025 NFCISTA. All rights reserved.
            </p>
          </footer>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN — Details, Actions & Content                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="divide-y divide-border-hairline bg-surface-base">

          {/* ── Precision Profile Links (Contact · Social · Business) ─ */}
          <section className="px-4 sm:px-5 py-5" aria-label="Connect and Actions">
            <ProfileLinksArea
              contactLinks={contactLinks}
              socialLinks={socialLinks}
              businessLinks={businessLinks}
              profileUrl={profileUrl}
              profileName={customer.full_name}
            />
          </section>

          {/* ── About Section ────────────────────────────────────────── */}
          {hasDescription && (
            <section className="px-4 sm:px-5 py-4" aria-label="About">
              <h2 className="text-sm font-bold text-text-primary mb-2">About</h2>
              <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                {customer.description.trim()}
              </p>
            </section>
          )}

          {/* ── Portfolio & Products ─────────────────────────────────── */}
          {galleryItems.length > 0 && (
            <ProfileGallery items={galleryItems} customer={customer} />
          )}

          {/* ── Mobile-Only Footer ───────────────────────────────────── */}
          <footer className="lg:hidden px-5 py-6 text-center border-t border-border-hairline">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="w-5.5 h-5.5 rounded-md bg-surface-subtle border border-border-hairline flex items-center justify-center overflow-hidden">
                <NfcistaLogo size={14} />
              </div>
              <span className="text-xs font-bold text-text-primary">NFCISTA</span>
            </div>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
              Contactless Physical Identity
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-2 text-[10.5px] text-text-muted flex-wrap">
              <Link href="/privacy" className="hover:text-text-primary transition-colors">
                Privacy Notice
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/terms" className="hover:text-text-primary transition-colors">
                Terms
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/privacy/data-request" className="hover:text-text-primary transition-colors">
                Data Rights
              </Link>
            </div>
            <p className="mt-2 text-[10px] text-text-muted">
              © 2025 NFCISTA. All rights reserved.
            </p>
          </footer>

        </div>
      </div>
    </main>
  );
}