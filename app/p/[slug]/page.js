import Link from "next/link";
import { getCustomerBySlug, getSafeExternalUrl } from "@/lib/customers";
import SaveContactButton from "@/components/SaveContactButton";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileShareModal from "@/components/profile/ProfileShareModal";
import ProfileQuickActions from "@/components/profile/ProfileQuickActions";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Metadata & SEO
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const customer = await getCustomerBySlug(slug);

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

  const ogImages = customer.photo_url?.trim()
    ? [{ url: customer.photo_url.trim(), alt: customer.full_name }]
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
// Page Component — V2 Premium Design
// ---------------------------------------------------------------------------
export default async function CustomerPublicProfilePage({ params }) {
  const { slug } = await params;
  const customer = await getCustomerBySlug(slug);

  // ── Profile Unavailable ─────────────────────────────────────────────────
  if (!customer) {
    return (
      <main className="min-h-screen bg-[#f0f4ff] flex items-center justify-center p-4">
        <div className="w-full max-w-[390px] bg-white rounded-3xl p-8 text-center shadow-xl">
          <div className="mb-5 flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                nfc
              </span>
            </div>
            <span className="text-[14px] font-bold tracking-wide text-gray-900">
              NFCISTA
            </span>
          </div>
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-gray-400">
              person_off
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-gray-900">Profile Unavailable</h1>
          <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
            This digital business card is currently inactive or does not exist.
          </p>
          <div className="mt-6 pt-5 border-t border-gray-100">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[13px] font-semibold hover:bg-[#003ea8] transition-colors active:scale-[0.97]"
            >
              <span>Visit NFCISTA</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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

  const hasPhone      = Boolean(customer.phone?.trim());
  const hasWhatsApp   = Boolean(customer.whatsapp?.trim());
  const hasEmail      = Boolean(customer.email?.trim());
  const hasAddress    = Boolean(customer.address?.trim());
  const hasDescription = Boolean(customer.description?.trim());

  // External URL security validation (only http/https pass)
  const safeWebsite     = getSafeExternalUrl(customer.website);
  const safeGoogleReview = getSafeExternalUrl(customer.google_review_url);
  const hasWebsite      = Boolean(safeWebsite);
  const hasGoogleReview = Boolean(safeGoogleReview);

  // Normalize Instagram handle — strip leading @ characters
  const rawInstagram   = customer.instagram?.trim() || "";
  const cleanInstagram = rawInstagram.replace(/^@+/, "");
  const hasInstagram   = Boolean(cleanInstagram);

  const profileUrl = `https://nfcista.vercel.app/p/${slug}`;

  // ── Top Action Row items (WhatsApp, Call, Email) ─────────────────────
  // "Share" is always appended client-side by ProfileQuickActions
  const topActions = [];
  if (hasWhatsApp) {
    topActions.push({
      id: "whatsapp",
      label: "WhatsApp",
      icon: "chat",
      href: `https://wa.me/${customer.whatsapp.trim().replace(/\D/g, "")}`,
      bg: "bg-[#25D366]",
      isExternal: true,
    });
  }
  if (hasPhone) {
    topActions.push({
      id: "call",
      label: "Call",
      icon: "call",
      href: `tel:${customer.phone.trim().replace(/\s/g, "")}`,
      bg: "bg-primary",
      isExternal: false,
    });
  }
  if (hasEmail) {
    topActions.push({
      id: "email",
      label: "Email",
      icon: "mail",
      href: `mailto:${customer.email.trim()}`,
      bg: "bg-indigo-600",
      isExternal: false,
    });
  }

  // ── Quick Connect 2×2 Grid (social / web presence) ──────────────────
  const quickConnectItems = [];
  if (hasInstagram) {
    quickConnectItems.push({
      id: "qc-ig",
      label: "Instagram",
      icon: "photo_camera",
      href: `https://instagram.com/${cleanInstagram}`,
      iconBg: "bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743]",
      iconColor: "text-white",
    });
  }
  if (hasWebsite) {
    quickConnectItems.push({
      id: "qc-web",
      label: "Website",
      icon: "language",
      href: safeWebsite,
      iconBg: "bg-blue-500",
      iconColor: "text-white",
    });
  }
  if (hasGoogleReview) {
    quickConnectItems.push({
      id: "qc-gr",
      label: "Google Review",
      icon: "star",
      href: safeGoogleReview,
      iconBg: "bg-amber-50 border border-amber-100",
      iconColor: "text-amber-500",
    });
  }
  if (hasWhatsApp) {
    quickConnectItems.push({
      id: "qc-wa",
      label: "WhatsApp",
      icon: "chat",
      href: `https://wa.me/${customer.whatsapp.trim().replace(/\D/g, "")}`,
      iconBg: "bg-[#25D366]",
      iconColor: "text-white",
    });
  }
  const hasQuickConnect = quickConnectItems.length > 0;

  // ── Links & Presence list ───────────────────────────────────────────
  const presenceLinks = [];
  if (hasInstagram) {
    presenceLinks.push({
      id: "pl-ig",
      label: "Instagram",
      secondary: `@${cleanInstagram}`,
      href: `https://instagram.com/${cleanInstagram}`,
      icon: "photo_camera",
      iconBg: "bg-pink-50",
      iconColor: "text-[#e1306c]",
    });
  }
  if (hasWebsite) {
    presenceLinks.push({
      id: "pl-web",
      label: "Website",
      secondary: safeWebsite.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
      href: safeWebsite,
      icon: "language",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    });
  }
  if (hasGoogleReview) {
    presenceLinks.push({
      id: "pl-gr",
      label: "Google Review",
      secondary: "Leave a review",
      href: safeGoogleReview,
      icon: "star",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    });
  }
  const hasPresenceLinks = presenceLinks.length > 0;

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#eef2ff] antialiased overflow-x-hidden">

      {/*
        Profile card:
        - Mobile: single column, max-w-430, full-height white card
        - Desktop (lg): two-column grid inside a rounded card
      */}
      <div
        className="w-full max-w-[430px] mx-auto bg-white shadow-xl min-h-screen
                   lg:max-w-[1080px] lg:min-h-0 lg:my-10 lg:rounded-3xl
                   lg:overflow-hidden lg:shadow-2xl lg:grid lg:grid-cols-[390px_1fr]"
      >

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN — Hero + Identity + Save Contact                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col bg-white lg:border-r lg:border-gray-100">

          {/* ── Premium Hero Banner ─────────────────────────────────── */}
          <div
            className="relative overflow-hidden h-44 sm:h-48 lg:h-56
                       bg-gradient-to-b from-[#071426] via-[#0b2255] to-[#0e54b8]"
          >
            {/* Photographic atmosphere layers */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_180%_130%_at_85%_-5%,rgba(255,190,80,0.09),transparent_52%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,70,200,0.5),transparent_60%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#071426]/75 to-transparent" />

            {/* Top bar: NFCISTA brand + desktop tagline & Tap to Connect indicator */}
            <div className="relative z-10 flex items-center justify-between px-3.5 sm:px-4 pt-3.5 sm:pt-4">
              <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
                <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center flex-shrink-0">
                  <span
                    className="material-symbols-outlined text-white text-[15px] sm:text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    nfc
                  </span>
                </div>
                <span className="text-white text-[12.5px] sm:text-[13px] font-bold tracking-wide drop-shadow-sm">
                  NFCISTA
                </span>
              </Link>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <p className="hidden lg:block text-white/60 text-[11px] italic font-light tracking-wide mr-2">
                  Small Tap · Big Connections
                </p>
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 text-white flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-medium tracking-wide whitespace-nowrap">
                    Tap to Connect
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Avatar + Identity ───────────────────────────────────── */}
          <div className="flex flex-col items-center text-center px-5 pb-5">
            {/* Avatar overlaps the hero via negative margin */}
            <div className="-mt-14 mb-3 relative z-10">
              <ProfileAvatar
                photoUrl={customer.photo_url}
                fullName={customer.full_name}
                initials={initials}
              />
            </div>

            {/* Name */}
            <h1 className="text-[24px] sm:text-[26px] font-bold text-gray-900 tracking-tight leading-tight">
              {customer.full_name}
            </h1>

            {/* Job Title & Company */}
            {(customer.job_title?.trim() || customer.company_name?.trim()) && (
              <div className="mt-1 space-y-0.5">
                {customer.job_title?.trim() && (
                  <p className="text-[13px] font-medium text-gray-600 leading-snug">
                    {customer.job_title.trim()}
                  </p>
                )}
                {customer.company_name?.trim() && (
                  <p className="text-[12.5px] font-semibold text-gray-800 leading-snug">
                    {customer.company_name.trim()}
                  </p>
                )}
              </div>
            )}

            {/* Category + Location badges */}
            {(customer.category?.trim() || hasAddress) && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {customer.category?.trim() && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[12px] text-primary">
                      label
                    </span>
                    <span className="truncate max-w-[110px]">
                      {customer.category.trim()}
                    </span>
                  </span>
                )}
                {hasAddress && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    <span
                      className="material-symbols-outlined text-[12px] text-rose-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      location_on
                    </span>
                    <span className="truncate max-w-[120px]">
                      {customer.address.trim()}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Save Contact CTA ─────────────────────────────────────── */}
          <div className="px-5 pb-6">
            <SaveContactButton
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
          </div>

          {/* Spacer — pushes desktop footer to bottom of left col */}
          <div className="hidden lg:block flex-1" />

          {/* ── Desktop-only footer inside left column ───────────────── */}
          <footer className="hidden lg:flex flex-col items-center py-5 px-5 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-white text-[13px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  nfc
                </span>
              </div>
              <span className="text-[13px] font-bold text-gray-800">NFCISTA</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-[0.2em] uppercase">
              Tap · Connect · Grow
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] text-gray-400 flex-wrap">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Notice
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/privacy/data-request" className="hover:text-primary transition-colors">
                Data Rights
              </Link>
            </div>
            <p className="mt-2 text-[9.5px] text-gray-300">
              © 2025 NFCISTA. All rights reserved.
            </p>
          </footer>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN (mobile: continuation / desktop: sidebar)         */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="divide-y divide-gray-100">

          {/* ── Top Action Row: WhatsApp · Call · Email · Share ──────── */}
          <section className="px-3.5 sm:px-5 py-4 sm:py-5" aria-label="Quick contact actions">
            <ProfileQuickActions
              actions={topActions}
              profileUrl={profileUrl}
              profileName={customer.full_name}
            />
          </section>

          {/* ── Quick Connect 2×2 Grid ───────────────────────────────── */}
          {hasQuickConnect && (
            <section className="px-3.5 sm:px-5 py-4 sm:py-5" aria-label="Quick Connect">
              <div className="mb-3">
                <h2 className="text-[15px] font-bold text-gray-900">Quick Connect</h2>
                <p className="text-[11.5px] text-gray-400 mt-0.5">
                  Tap to connect instantly
                </p>
              </div>
              <div
                className={`grid gap-2.5 sm:gap-3 ${
                  quickConnectItems.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {quickConnectItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex flex-col items-center justify-center py-4 sm:py-6 px-2 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.97] gap-2 min-w-0"
                  >
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}
                    >
                      <span
                        className={`material-symbols-outlined text-[22px] sm:text-[24px] ${item.iconColor}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                    </div>
                    <span className="text-[11.5px] sm:text-[12px] font-semibold text-gray-800 truncate max-w-full text-center">
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── Links & Presence list ───────────────────────────────── */}
          {hasPresenceLinks && (
            <section className="px-3.5 sm:px-5 py-4 sm:py-5" aria-label="Links and Presence">
              <h2 className="text-[15px] font-bold text-gray-900 mb-2">
                Links &amp; Presence
              </h2>
              <div className="space-y-0.5">
                {presenceLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${link.iconBg} flex items-center justify-center flex-shrink-0`}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${link.iconColor}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        aria-hidden="true"
                      >
                        {link.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                        {link.label}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {link.secondary}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-gray-300 group-hover:text-primary transition-colors flex-shrink-0">
                      chevron_right
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── About ────────────────────────────────────────────────── */}
          {hasDescription && (
            <section className="px-3.5 sm:px-5 py-4 sm:py-5" aria-label="About">
              <h2 className="text-[15px] font-bold text-gray-900 mb-2">About</h2>
              <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-line">
                {customer.description.trim()}
              </p>
              {/* Inline location + category meta below description */}
              {(hasAddress || customer.category?.trim()) && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {hasAddress && (
                    <span className="inline-flex items-center gap-1 text-[11.5px] text-gray-400">
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        aria-hidden="true"
                      >
                        location_on
                      </span>
                      {customer.address.trim()}
                    </span>
                  )}
                  {customer.category?.trim() && (
                    <span className="inline-flex items-center gap-1 text-[11.5px] text-gray-400">
                      <span
                        className="material-symbols-outlined text-[14px]"
                        aria-hidden="true"
                      >
                        label
                      </span>
                      {customer.category.trim()}
                    </span>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Share My Card ────────────────────────────────────────── */}
          <section className="px-3.5 sm:px-5 py-4 sm:py-5" aria-label="Share profile">
            <ProfileShareModal
              name={customer.full_name}
              slug={customer.profile_slug}
            />
          </section>

          {/* ── Mobile-only Footer ───────────────────────────────────── */}
          <footer className="lg:hidden px-5 py-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-white text-[13px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  nfc
                </span>
              </div>
              <span className="text-[13px] font-bold text-gray-800">NFCISTA</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-[0.2em] uppercase mt-0.5">
              Tap · Connect · Grow
            </p>
            <div className="mt-3 flex items-center justify-center gap-2.5 text-[10.5px] text-gray-400 flex-wrap">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacy Notice
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                Terms
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href="/privacy/data-request"
                className="hover:text-primary transition-colors"
              >
                Data Rights
              </Link>
            </div>
            <p className="mt-2 text-[10px] text-gray-300">
              © 2025 NFCISTA. All rights reserved.
            </p>
          </footer>

        </div>
      </div>
    </main>
  );
}
