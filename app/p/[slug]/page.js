import Link from "next/link";
import { getCustomerBySlug, getSafeExternalUrl } from "@/lib/customers";
import SaveContactButton from "@/components/SaveContactButton";
import ProfileQRCode from "@/components/profile/ProfileQRCode";
import ProfileShareButton from "@/components/profile/ProfileShareButton";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Metadata
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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function CustomerPublicProfilePage({ params }) {
  const { slug } = await params;
  const customer = await getCustomerBySlug(slug);

  // ── Inactive / Not Found ────────────────────────────────────────────────
  if (!customer) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#e8f0fe] flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white border border-outline-variant/30 rounded-3xl p-8 text-center shadow-float">
          {/* NFCISTA mini header */}
          <div className="mb-6 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">
              NFCISTA
            </span>
          </div>
          <div className="w-16 h-16 rounded-full bg-surface-container-low text-tertiary flex items-center justify-center mx-auto mb-5">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-on-primary text-label-md font-semibold hover:opacity-90 shadow-btn-primary transition-all active:scale-[0.97]"
            >
              <span>Visit NFCISTA</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const initials = customer.full_name
    ? customer.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NC";

  const profileUrl = `https://nfcista.vercel.app/p/${customer.profile_slug}`;

  const hasWhatsApp = Boolean(customer.whatsapp?.trim());
  const hasPhone = Boolean(customer.phone?.trim());
  const hasEmail = Boolean(customer.email?.trim());
  const hasAddress = Boolean(customer.address?.trim());
  const hasInstagram = Boolean(customer.instagram?.trim());
  const safeWebsite = getSafeExternalUrl(customer.website);
  const safeGoogleReview = getSafeExternalUrl(customer.google_review_url);
  const hasWebsite = Boolean(safeWebsite);
  const hasGoogleReview = Boolean(safeGoogleReview);
  const hasDescription = Boolean(customer.description?.trim());
  const hasPhoto = Boolean(customer.photo_url?.trim());

  const hasContactInfo =
    hasPhone || hasWhatsApp || hasEmail || hasAddress || hasInstagram || hasWebsite || hasGoogleReview;

  const hasPrimaryActions = hasPhone || hasWhatsApp || hasEmail;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#e8f0fe] flex items-start justify-center py-6 px-4 pb-12">
      <div className="w-full max-w-[440px] flex flex-col gap-4">

        {/* ── NFCISTA Header ─────────────────────────────────────────────── */}
        <header className="flex items-center justify-between py-2 px-1">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-btn-primary group-hover:opacity-90 transition-opacity">
              <span
                className="material-symbols-outlined text-on-primary text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                nfc
              </span>
            </div>
            <div>
              <span className="text-label-lg font-bold text-on-surface tracking-wide">
                NFCISTA
              </span>
              <span className="block text-[9px] font-semibold tracking-[0.15em] uppercase text-tertiary leading-none mt-px">
                Tap · Connect · Grow
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-outline-variant/25 shadow-card">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-tertiary">Tap to Connect</span>
          </div>
        </header>

        {/* ── Hero Card ──────────────────────────────────────────────────── */}
        <div className="relative bg-white border border-outline-variant/20 rounded-3xl shadow-float overflow-hidden">
          {/* Gradient accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-400 to-primary/60" />

          <div className="p-6 flex flex-col items-center text-center">
            {/* Company pill */}
            {customer.company_name?.trim() && (
              <div className="mb-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container-low rounded-full border border-outline-variant/20">
                <span className="material-symbols-outlined text-[13px] text-primary">
                  auto_awesome
                </span>
                <span className="text-[11px] font-bold text-on-surface tracking-widest uppercase">
                  {customer.company_name.trim()}
                </span>
              </div>
            )}

            {/* Avatar */}
            <div className="relative mb-5">
              <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-b from-primary/30 via-primary/10 to-surface-container shadow-float">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center overflow-hidden ring-2 ring-white">
                  {hasPhoto ? (
                    <img
                      src={customer.photo_url.trim()}
                      alt={customer.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-on-primary text-3xl font-bold tracking-tight select-none">
                      {initials}
                    </span>
                  )}
                </div>
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 ring-2 ring-white" />
              {/* Verified badge */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-primary text-on-primary text-[9px] font-bold px-2 py-0.5 rounded-full shadow-btn-primary whitespace-nowrap tracking-wide">
                <span
                  className="material-symbols-outlined text-[11px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                VERIFIED
              </div>
            </div>

            {/* Identity */}
            <div className="mt-2 space-y-1">
              <h1 className="text-headline-lg font-bold text-on-surface leading-tight">
                {customer.full_name}
              </h1>
              {customer.job_title?.trim() && (
                <p className="text-label-lg font-semibold text-primary">
                  {customer.job_title.trim()}
                </p>
              )}
              {customer.company_name?.trim() && (
                <p className="text-body-sm text-on-surface-variant font-medium">
                  {customer.company_name.trim()}
                </p>
              )}
            </div>

            {/* Category + Location row */}
            {(customer.category?.trim() || hasAddress) && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {customer.category?.trim() && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-surface-container-low border border-outline-variant/20 rounded-full">
                    <span className="material-symbols-outlined text-[13px] text-primary">label</span>
                    <span className="text-[11px] font-semibold text-on-surface">
                      {customer.category.trim()}
                    </span>
                  </div>
                )}
                {hasAddress && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-surface-container-low border border-outline-variant/20 rounded-full">
                    <span
                      className="material-symbols-outlined text-[13px] text-red-500"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      location_on
                    </span>
                    <span className="text-[11px] font-semibold text-on-surface line-clamp-1 max-w-[140px]">
                      {customer.address.trim()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {hasDescription && (
              <p className="mt-4 text-body-md text-on-surface-variant leading-relaxed max-w-[340px]">
                {customer.description.trim()}
              </p>
            )}
          </div>
        </div>

        {/* ── Primary Actions ─────────────────────────────────────────────── */}
        {(hasPrimaryActions || customer.profile_slug) && (
          <div className="flex gap-2">
            {/* Save Contact — always shown if any contact info exists */}
            <div className="flex-1">
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

            {/* WhatsApp quick action */}
            {hasWhatsApp && (
              <a
                href={`https://wa.me/${customer.whatsapp.trim().replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366] text-white font-semibold text-label-md shadow-btn-primary hover:opacity-90 transition-all active:scale-[0.97]"
                aria-label="Chat on WhatsApp"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span className="hidden xs:inline">Chat</span>
              </a>
            )}

            {/* Share */}
            <ProfileShareButton name={customer.full_name} slug={customer.profile_slug} />
          </div>
        )}

        {/* ── Contact Information Cards ───────────────────────────────────── */}
        {hasContactInfo && (
          <section>
            <p className="text-label-sm font-bold text-tertiary uppercase tracking-widest mb-2 px-1">
              Contact
            </p>
            <div className="flex flex-col gap-2">
              {/* Call */}
              {hasPhone && (
                <a
                  href={`tel:${customer.phone.trim().replace(/\s/g, "")}`}
                  className="flex items-center justify-between p-4 bg-white border border-outline-variant/20 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">call</span>
                    </div>
                    <div>
                      <span className="block text-label-md font-semibold text-on-surface">Call</span>
                      <span className="text-body-sm text-on-surface-variant">{customer.phone.trim()}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                    arrow_outward
                  </span>
                </a>
              )}

              {/* WhatsApp */}
              {hasWhatsApp && (
                <a
                  href={`https://wa.me/${customer.whatsapp.trim().replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white border border-outline-variant/20 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </div>
                    <div>
                      <span className="block text-label-md font-semibold text-on-surface">WhatsApp</span>
                      <span className="text-body-sm text-on-surface-variant">Chat on WhatsApp</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-transform">
                    arrow_outward
                  </span>
                </a>
              )}

              {/* Email */}
              {hasEmail && (
                <a
                  href={`mailto:${customer.email.trim()}`}
                  className="flex items-center justify-between p-4 bg-white border border-outline-variant/20 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                    </div>
                    <div>
                      <span className="block text-label-md font-semibold text-on-surface">Email</span>
                      <span className="text-body-sm text-on-surface-variant truncate max-w-[220px] block">
                        {customer.email.trim()}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                    arrow_outward
                  </span>
                </a>
              )}

              {/* Address / Maps */}
              {hasAddress && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(customer.address.trim())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white border border-outline-variant/20 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors flex-shrink-0">
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        location_on
                      </span>
                    </div>
                    <div>
                      <span className="block text-label-md font-semibold text-on-surface">Address</span>
                      <span className="text-body-sm text-on-surface-variant line-clamp-1 max-w-[220px]">
                        {customer.address.trim()}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-red-500 group-hover:translate-x-0.5 transition-transform">
                    arrow_outward
                  </span>
                </a>
              )}

              {/* Instagram */}
              {hasInstagram && (
                <a
                  href={`https://instagram.com/${customer.instagram.trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white border border-outline-variant/20 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#f09433] group-hover:via-[#e6683c] group-hover:to-[#dc2743] transition-all flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-[#e1306c] group-hover:text-white transition-colors">
                        photo_camera
                      </span>
                    </div>
                    <div>
                      <span className="block text-label-md font-semibold text-on-surface">Instagram</span>
                      <span className="text-body-sm text-on-surface-variant">
                        @{customer.instagram.trim()}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-[#e1306c] group-hover:translate-x-0.5 transition-transform">
                    arrow_outward
                  </span>
                </a>
              )}

              {/* Website */}
              {hasWebsite && (
                <a
                  href={safeWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white border border-outline-variant/20 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">language</span>
                    </div>
                    <div>
                      <span className="block text-label-md font-semibold text-on-surface">Website</span>
                      <span className="text-body-sm text-on-surface-variant truncate max-w-[220px] block">
                        {safeWebsite.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                    open_in_new
                  </span>
                </a>
              )}

              {/* Google Review */}
              {hasGoogleReview && (
                <a
                  href={safeGoogleReview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white border border-outline-variant/20 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors flex-shrink-0">
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    </div>
                    <div>
                      <span className="block text-label-md font-semibold text-on-surface">
                        Google Review
                      </span>
                      <span className="text-body-sm text-on-surface-variant">
                        Leave a verified review
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform">
                    arrow_outward
                  </span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* ── About Section ──────────────────────────────────────────────── */}
        {hasDescription && (
          <section className="bg-white border border-outline-variant/20 rounded-3xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="material-symbols-outlined text-[18px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                person
              </span>
              <span className="text-label-sm font-bold text-tertiary uppercase tracking-widest">
                About
              </span>
            </div>
            <p className="text-body-md text-on-surface leading-relaxed">
              {customer.description.trim()}
            </p>
          </section>
        )}

        {/* ── QR Code Section ─────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#0b1c30] to-[#004ac6] rounded-3xl p-6 text-center shadow-float">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-300">
              NFC Tap · QR Scan
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          </div>
          <p className="text-white font-bold text-label-lg mb-5">Scan to Connect</p>

          <div className="flex justify-center mb-5">
            <ProfileQRCode url={profileUrl} size={156} />
          </div>

          <p className="text-blue-200 text-body-sm">
            Point your camera to instantly open this profile
          </p>

          <div className="mt-4 pt-4 border-t border-white/10">
            <span className="text-[10px] text-blue-300/70 font-medium tracking-wider break-all">
              {profileUrl}
            </span>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="w-full pt-2 pb-2 text-center flex flex-col items-center justify-center gap-1.5 text-[11px] text-tertiary">
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            <Link
              href="/"
              className="text-[12px] font-medium hover:text-primary transition-colors"
            >
              Powered by NFCISTA
            </Link>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
          </div>
          <div className="flex items-center gap-2 text-[10px] text-tertiary/80">
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
