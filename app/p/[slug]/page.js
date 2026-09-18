import Link from "next/link";
import { getCustomerBySlug } from "@/lib/customers";
import SaveContactButton from "@/components/SaveContactButton";

export const dynamic = "force-dynamic";

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

  // Check if any action channel is present
  const hasActionChannels = Boolean(
    customer.phone?.trim() ||
    customer.whatsapp?.trim() ||
    customer.email?.trim() ||
    customer.address?.trim() ||
    customer.instagram?.trim() ||
    customer.website?.trim() ||
    customer.google_review_url?.trim()
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-start justify-center py-6 px-4">
      <div className="w-full max-w-[420px] flex flex-col gap-4">
        {/* Main Identity Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card relative overflow-hidden flex flex-col items-center text-center">
          {/* Subtle Decorative Accents */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-surface-container-low rounded-full pointer-events-none opacity-60" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-surface-container-low rounded-full pointer-events-none opacity-40" />

          {/* Company Branding Pill (Rendered only when company name is provided) */}
          {customer.company_name?.trim() && (
            <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface-container-low rounded-full border border-outline-variant/20">
              <span className="material-symbols-outlined text-[14px] text-primary">
                auto_awesome
              </span>
              <span className="text-[11px] font-bold text-on-surface tracking-wider uppercase">
                {customer.company_name.trim()}
              </span>
            </div>
          )}

          {/* Avatar with Ring & Verified Badge */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-b from-primary/20 to-surface-container shadow-card">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center overflow-hidden">
                {customer.photo_url?.trim() ? (
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

          {/* Category Chip */}
          {customer.category?.trim() && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border border-outline-variant/25 rounded-full text-on-surface">
              <span className="material-symbols-outlined text-[15px] text-primary">
                label
              </span>
              <span className="text-[11px] font-semibold">{customer.category.trim()}</span>
            </div>
          )}

          {/* Bio / Description */}
          {customer.description?.trim() && (
            <p className="mt-4 text-body-md text-on-surface-variant leading-relaxed">
              {customer.description.trim()}
            </p>
          )}
        </div>

        {/* Save Contact — primary CTA */}
        <SaveContactButton
          contact={{
            fullName:    customer.full_name,
            jobTitle:    customer.job_title?.trim(),
            companyName: customer.company_name?.trim(),
            phone:       customer.phone?.trim(),
            whatsapp:    customer.whatsapp?.trim(),
            email:       customer.email?.trim(),
            website:     customer.website?.trim(),
            address:     customer.address?.trim(),
          }}
        />

        {/* Action Channels (Rendered only if at least one channel is present) */}
        {hasActionChannels && (
          <div className="flex flex-col gap-3">
            {/* Call Card */}
            {customer.phone?.trim() && (
              <a
                href={`tel:${customer.phone.trim().replace(/\s/g, "")}`}
                className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">
                      call
                    </span>
                  </div>
                  <div>
                    <span className="block text-label-md font-semibold text-on-surface">
                      Call
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      {customer.phone.trim()}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                  arrow_outward
                </span>
              </a>
            )}

            {/* WhatsApp Card */}
            {customer.whatsapp?.trim() && (
              <a
                href={`https://wa.me/${customer.whatsapp.trim().replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">
                      chat
                    </span>
                  </div>
                  <div>
                    <span className="block text-label-md font-semibold text-on-surface">
                      WhatsApp
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      Chat on WhatsApp
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-transform">
                  arrow_outward
                </span>
              </a>
            )}

            {/* Email Card */}
            {customer.email?.trim() && (
              <a
                href={`mailto:${customer.email.trim()}`}
                className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">
                      mail
                    </span>
                  </div>
                  <div>
                    <span className="block text-label-md font-semibold text-on-surface">
                      Email
                    </span>
                    <span className="text-body-sm text-on-surface-variant truncate max-w-[200px]">
                      {customer.email.trim()}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                  arrow_outward
                </span>
              </a>
            )}

            {/* Address / Maps Card */}
            {customer.address?.trim() && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(customer.address.trim())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      location_on
                    </span>
                  </div>
                  <div>
                    <span className="block text-label-md font-semibold text-on-surface">
                      Address
                    </span>
                    <span className="text-body-sm text-on-surface-variant line-clamp-1 max-w-[200px]">
                      {customer.address.trim()}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-red-500 group-hover:translate-x-0.5 transition-transform">
                  arrow_outward
                </span>
              </a>
            )}

            {/* Instagram Card */}
            {customer.instagram?.trim() && (
              <a
                href={`https://instagram.com/${customer.instagram.trim()}`}
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
                      @{customer.instagram.trim()}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                  arrow_outward
                </span>
              </a>
            )}

            {/* Website Card */}
            {customer.website?.trim() && (
              <a
                href={customer.website.trim()}
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
                      {customer.website.trim().replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                  open_in_new
                </span>
              </a>
            )}

            {/* Google Review Card */}
            {customer.google_review_url?.trim() && (
              <a
                href={customer.google_review_url.trim()}
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
        )}

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
