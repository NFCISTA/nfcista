import Link from "next/link";
import { getCustomerBySlug, getSafeExternalUrl } from "@/lib/customers";
import SaveContactButton from "@/components/SaveContactButton";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileShareModal from "@/components/profile/ProfileShareModal";

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

  // Safe OpenGraph image handling
  const ogImages = customer.photo_url?.trim()
    ? [
        {
          url: customer.photo_url.trim(),
          alt: customer.full_name,
        },
      ]
    : [
        {
          url: "/icon.svg",
          width: 512,
          height: 512,
          alt: "NFCISTA",
        },
      ];

  return {
    title,
    description,
    alternates: {
      canonical: profileUrl,
    },
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
// Page Component
// ---------------------------------------------------------------------------
export default async function CustomerPublicProfilePage({ params }) {
  const { slug } = await params;
  const customer = await getCustomerBySlug(slug);

  // ── Profile Unavailable / Inactive ──────────────────────────────────────
  if (!customer) {
    return (
      <main className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
        <div className="w-full max-w-[390px] bg-white border border-outline-variant/30 rounded-3xl p-8 text-center shadow-card">
          <div className="mb-6 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">
              NFCISTA
            </span>
          </div>
          <div className="w-16 h-16 rounded-full bg-surface-container-low text-tertiary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">person_off</span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">
            Profile Unavailable
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2 leading-relaxed">
            This digital business card is currently inactive or does not exist.
          </p>
          <div className="mt-7 pt-5 border-t border-outline-variant/20">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-label-md font-semibold hover:bg-[#003ea8] shadow-btn-primary transition-all active:scale-[0.97]"
            >
              <span>Visit NFCISTA</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Helpers & Data Sanitization ──────────────────────────────────────────
  const initials = customer.full_name
    ? customer.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NC";

  const hasPhone = Boolean(customer.phone?.trim());
  const hasWhatsApp = Boolean(customer.whatsapp?.trim());
  const hasEmail = Boolean(customer.email?.trim());
  const hasAddress = Boolean(customer.address?.trim());
  const hasDescription = Boolean(customer.description?.trim());

  // URL security validation (only http/https accepted, rejects javascript:/data:)
  const safeWebsite = getSafeExternalUrl(customer.website);
  const safeGoogleReview = getSafeExternalUrl(customer.google_review_url);
  const hasWebsite = Boolean(safeWebsite);
  const hasGoogleReview = Boolean(safeGoogleReview);

  // Normalize Instagram handle: strip leading '@' characters
  const rawInstagram = customer.instagram?.trim() || "";
  const cleanInstagram = rawInstagram.replace(/^@+/, "");
  const hasInstagram = Boolean(cleanInstagram);

  // Quick connect items
  const quickActions = [];
  if (hasPhone) {
    quickActions.push({
      id: "call",
      label: "Call",
      icon: "call",
      href: `tel:${customer.phone.trim().replace(/\s/g, "")}`,
      colorClass: "bg-blue-50 text-primary hover:bg-blue-100",
      iconClass: "text-primary",
      isExternal: false,
    });
  }
  if (hasWhatsApp) {
    quickActions.push({
      id: "whatsapp",
      label: "WhatsApp",
      icon: "chat",
      href: `https://wa.me/${customer.whatsapp.trim().replace(/\D/g, "")}`,
      colorClass: "bg-emerald-50 text-[#128C7E] hover:bg-emerald-100",
      iconClass: "text-[#128C7E]",
      isExternal: true,
    });
  }
  if (hasEmail) {
    quickActions.push({
      id: "email",
      label: "Email",
      icon: "mail",
      href: `mailto:${customer.email.trim()}`,
      colorClass: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
      iconClass: "text-indigo-700",
      isExternal: false,
    });
  }
  if (hasAddress) {
    quickActions.push({
      id: "directions",
      label: "Directions",
      icon: "near_me",
      href: `https://maps.google.com/?q=${encodeURIComponent(customer.address.trim())}`,
      colorClass: "bg-rose-50 text-rose-600 hover:bg-rose-100",
      iconClass: "text-rose-600",
      isExternal: true,
    });
  }

  const hasQuickActions = quickActions.length > 0;
  const hasSocialLinks = hasWebsite || hasInstagram || hasGoogleReview;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="w-full max-w-full min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-start py-4 px-3 sm:py-8 sm:px-4 pb-14 antialiased overflow-x-hidden">
      <div className="w-full max-w-[420px] flex flex-col gap-3.5 mx-auto">

        {/* ── 1. Refined Header ──────────────────────────────────────────── */}
        <header className="w-full flex items-center justify-between py-1.5 px-0.5">
          <Link href="/" className="flex items-center gap-2 group min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-btn-primary group-hover:opacity-95 transition-opacity flex-shrink-0">
              <span
                className="material-symbols-outlined text-white text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                nfc
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[14px] font-bold text-on-surface tracking-wide leading-tight block truncate">
                NFCISTA
              </span>
              <span className="block text-[9px] font-semibold tracking-[0.16em] uppercase text-tertiary leading-none mt-0.5 truncate">
                Smart Business Card
              </span>
            </div>
          </Link>

          {/* Tap status pill */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 bg-white rounded-full border border-outline-variant/30 shadow-card flex-shrink-0 ml-1.5 sm:ml-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold text-on-surface tracking-wide whitespace-nowrap">
              Tap to Connect
            </span>
          </div>
        </header>

        {/* ── 2. Hero / Identity Card ─────────────────────────────────────── */}
        <div className="relative bg-white border border-outline-variant/25 rounded-3xl shadow-card overflow-hidden">
          {/* Executive Cover Banner */}
          <div className="h-24 sm:h-28 w-full bg-gradient-to-r from-[#0b1c30] via-[#003ea8] to-[#004ac6] relative overflow-hidden">
            {/* Subtle aesthetic backdrop accents */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)]" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5 blur-xl" />
          </div>

          <div className="px-5 pb-6 pt-0 flex flex-col items-center text-center">
            {/* Overlapping Avatar */}
            <div className="-mt-14 mb-3">
              <ProfileAvatar
                photoUrl={customer.photo_url}
                fullName={customer.full_name}
                initials={initials}
              />
            </div>

            {/* Customer Name */}
            <h1 className="text-[22px] sm:text-[24px] font-bold text-on-surface leading-tight tracking-tight mt-1">
              {customer.full_name}
            </h1>

            {/* Job Title & Company (Cleanly integrated without badge duplicate) */}
            {(customer.job_title?.trim() || customer.company_name?.trim()) && (
              <div className="mt-1 space-y-0.5">
                {customer.job_title?.trim() && (
                  <p className="text-[14px] font-semibold text-primary">
                    {customer.job_title.trim()}
                  </p>
                )}
                {customer.company_name?.trim() && (
                  <p className="text-[13px] font-medium text-on-surface-variant">
                    {customer.company_name.trim()}
                  </p>
                )}
              </div>
            )}

            {/* Category & Location Badges */}
            {(customer.category?.trim() || hasAddress) && (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-w-full">
                {customer.category?.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low border border-outline-variant/20 rounded-full text-[11px] font-semibold text-on-surface max-w-full">
                    <span className="material-symbols-outlined text-[12px] text-primary flex-shrink-0">
                      label
                    </span>
                    <span className="truncate">{customer.category.trim()}</span>
                  </span>
                )}
                {hasAddress && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low border border-outline-variant/20 rounded-full text-[11px] font-semibold text-on-surface max-w-[200px]">
                    <span
                      className="material-symbols-outlined text-[12px] text-rose-500 flex-shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      location_on
                    </span>
                    <span className="truncate">{customer.address.trim()}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Primary CTA: Save Contact ────────────────────────────────── */}
        <div className="w-full">
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

        {/* ── 4. Quick Connect Hub ────────────────────────────────────────── */}
        {hasQuickActions && (
          <section aria-label="Quick Connect Actions">
            <p className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-2 px-1">
              Quick Connect
            </p>
            <div
              className={`grid gap-1.5 sm:gap-2 ${
                quickActions.length === 1
                  ? "grid-cols-1"
                  : quickActions.length === 2
                  ? "grid-cols-2"
                  : quickActions.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-4"
              }`}
            >
              {quickActions.map((action) => (
                <a
                  key={action.id}
                  href={action.href}
                  target={action.isExternal ? "_blank" : undefined}
                  rel={action.isExternal ? "noopener noreferrer" : undefined}
                  aria-label={action.label}
                  className="flex flex-col items-center justify-center py-2.5 px-1 sm:py-3 sm:px-2 bg-white border border-outline-variant/20 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.97] group min-w-0"
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${action.colorClass} flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 flex-shrink-0`}
                  >
                    <span
                      className={`material-symbols-outlined text-[19px] sm:text-[20px] ${action.iconClass}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {action.icon}
                    </span>
                  </div>
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-on-surface text-center leading-tight truncate max-w-full">
                    {action.label}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. Business & Social Links ──────────────────────────────────── */}
        {hasSocialLinks && (
          <section aria-label="Business and Social Presence">
            <p className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-2 px-1">
              Links & Presence
            </p>
            <div className="flex flex-col gap-2">
              {/* Website */}
              {hasWebsite && (
                <a
                  href={safeWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-white border border-outline-variant/20 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[20px]">language</span>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[13px] font-semibold text-on-surface leading-snug">
                        Website
                      </span>
                      <span className="block text-[12px] text-on-surface-variant truncate">
                        {safeWebsite.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2">
                    open_in_new
                  </span>
                </a>
              )}

              {/* Instagram */}
              {hasInstagram && (
                <a
                  href={`https://instagram.com/${cleanInstagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-white border border-outline-variant/20 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#e1306c] flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-to-tr group-hover:from-[#f09433] group-hover:via-[#e6683c] group-hover:to-[#dc2743] group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[13px] font-semibold text-on-surface leading-snug">
                        Instagram
                      </span>
                      <span className="block text-[12px] text-on-surface-variant truncate">
                        @{cleanInstagram}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-[#e1306c] group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2">
                    arrow_outward
                  </span>
                </a>
              )}

              {/* Google Review */}
              {hasGoogleReview && (
                <a
                  href={safeGoogleReview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-white border border-outline-variant/20 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[13px] font-semibold text-on-surface leading-snug">
                        Google Review
                      </span>
                      <span className="block text-[12px] text-on-surface-variant truncate">
                        Rate & leave a review
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-amber-600 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2">
                    arrow_outward
                  </span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* ── 6. About Section (Displayed ONCE only) ──────────────────────── */}
        {hasDescription && (
          <section aria-label="About">
            <p className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-2 px-1">
              About
            </p>
            <div className="bg-white border border-outline-variant/20 rounded-2xl p-4 shadow-card">
              <p className="text-[13.5px] text-on-surface leading-relaxed whitespace-pre-line">
                {customer.description.trim()}
              </p>
            </div>
          </section>
        )}

        {/* ── 7. Share & QR Actions ───────────────────────────────────────── */}
        <section aria-label="Share and Connect">
          <ProfileShareModal name={customer.full_name} slug={customer.profile_slug} />
        </section>

        {/* ── 8. Refined Footer ───────────────────────────────────────────── */}
        <footer className="w-full pt-4 pb-2 text-center flex flex-col items-center justify-center gap-1 text-[11px] text-tertiary">
          <div className="flex items-center justify-center gap-1.5 font-medium">
            <span>Powered by</span>
            <Link
              href="/"
              className="font-bold text-on-surface hover:text-primary transition-colors"
            >
              NFCISTA
            </Link>
          </div>
          <div className="flex items-center gap-2 text-[10.5px] text-tertiary/75 mt-0.5">
            <Link href="/privacy" className="hover:underline hover:text-primary transition-colors">
              Privacy Notice
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:underline hover:text-primary transition-colors">
              Terms
            </Link>
            <span>&bull;</span>
            <Link href="/privacy/data-request" className="hover:underline hover:text-primary transition-colors">
              Data Rights
            </Link>
          </div>
        </footer>

      </div>
    </main>
  );
}
