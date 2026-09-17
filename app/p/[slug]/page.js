import Link from "next/link";
import { getCustomerBySlug } from "@/lib/customers";

// Generate page metadata dynamically based on customer profile
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

export default async function CustomerPublicProfilePage({ params }) {
  const { slug } = await params;
  const customer = await getCustomerBySlug(slug);

  // Inactive or Not Found State
  if (!customer) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-center shadow-card">
          <div className="w-14 h-14 rounded-full bg-surface-container-low text-tertiary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[28px]">
              person_off
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">
            Profile Unavailable
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2 leading-relaxed">
            This digital business card is currently inactive or does not exist.
          </p>
          <div className="mt-6 pt-5 border-t border-outline-variant/20">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-primary-container shadow-btn-primary transition-all"
            >
              <span>Visit NFCISTA</span>
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Initials for avatar
  const initials = customer.full_name
    ? customer.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NC";

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-start justify-center py-6 px-4">
      <div className="w-full max-w-[420px] flex flex-col gap-4">
        {/* Main Identity Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card relative overflow-hidden flex flex-col items-center text-center">
          {/* Subtle Decorative Accents */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-surface-container-low rounded-full pointer-events-none opacity-60" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-surface-container-low rounded-full pointer-events-none opacity-40" />

          {/* Company Branding Pill */}
          <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface-container-low rounded-full border border-outline-variant/20">
            <span className="material-symbols-outlined text-[14px] text-primary">
              auto_awesome
            </span>
            <span className="text-[11px] font-bold text-on-surface tracking-wider uppercase">
              {customer.company_name || "NFCISTA"}
            </span>
          </div>

          {/* Avatar with Ring & Verified Badge */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-b from-primary/20 to-surface-container shadow-card">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
                <span className="text-on-primary text-3xl font-bold tracking-tight select-none">
                  {initials}
                </span>
              </div>
            </div>
            <div className="absolute bottom-0 right-1 bg-primary text-on-primary w-7 h-7 rounded-full flex items-center justify-center shadow-card ring-2 ring-white">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
          </div>

          {/* Identity Details */}
          <div className="space-y-1">
            <h1 className="text-headline-lg font-bold text-on-surface">
              {customer.full_name}
            </h1>
            {customer.job_title && (
              <p className="text-label-lg font-semibold text-primary">
                {customer.job_title}
              </p>
            )}
            {customer.company_name && (
              <p className="text-body-sm text-on-surface-variant font-medium">
                {customer.company_name}
              </p>
            )}
          </div>

          {/* Category Chip */}
          {customer.category && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border border-outline-variant/25 rounded-full text-on-surface">
              <span className="material-symbols-outlined text-[15px] text-primary">
                label
              </span>
              <span className="text-[11px] font-semibold">{customer.category}</span>
            </div>
          )}

          {/* Bio / Description */}
          {customer.description && (
            <p className="mt-4 text-body-md text-on-surface-variant leading-relaxed">
              {customer.description}
            </p>
          )}
        </div>

        {/* Action Channels (Instagram, Website, Review) */}
        <div className="flex flex-col gap-3">
          {/* Instagram Card */}
          {customer.instagram && (
            <a
              href={`https://instagram.com/${customer.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">
                    photo_camera
                  </span>
                </div>
                <div>
                  <span className="block text-label-md font-semibold text-on-surface">
                    Instagram
                  </span>
                  <span className="text-body-sm text-on-surface-variant">
                    @{customer.instagram}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                arrow_outward
              </span>
            </a>
          )}

          {/* Website Card */}
          {customer.website && (
            <a
              href={customer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">
                    language
                  </span>
                </div>
                <div>
                  <span className="block text-label-md font-semibold text-on-surface">
                    Website
                  </span>
                  <span className="text-body-sm text-on-surface-variant truncate max-w-[200px]">
                    {customer.website.replace(/^https?:\/\//, "")}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                open_in_new
              </span>
            </a>
          )}

          {/* Google Review Card */}
          {customer.google_review_url && (
            <a
              href={customer.google_review_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
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
              <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                arrow_outward
              </span>
            </a>
          )}
        </div>

        {/* Footer */}
        <footer className="w-full pt-4 pb-2 text-center flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          <Link
            href="/"
            className="text-[12px] text-tertiary font-medium hover:text-primary transition-colors"
          >
            Powered by NFCISTA
          </Link>
        </footer>
      </div>
    </main>
  );
}
