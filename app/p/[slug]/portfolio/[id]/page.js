import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPortfolioItemById } from "@/lib/gallery";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import Icon from "@/components/ui/Icon";
import NfcistaLogo from "@/components/ui/NfcistaLogo";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  const data = await getPortfolioItemById(slug, id);

  if (!data) {
    return {
      title: "Portfolio Link Not Found — NFCISTA",
      description: "The requested portfolio link is unavailable or has been removed.",
    };
  }

  const { customer, item } = data;
  const title = `${item.title} — ${customer.company_name || customer.full_name} | NFCISTA Portfolio`;
  const description =
    item.description ||
    `View ${item.title} by ${customer.full_name} on their NFCISTA Digital Business Card.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "NFCISTA",
      images: customer.photo_url ? [{ url: customer.photo_url }] : [{ url: "/icon.svg" }],
    },
  };
}

export default async function PortfolioPreviewPage({ params }) {
  const { slug, id } = await params;
  const data = await getPortfolioItemById(slug, id);

  if (!data) {
    notFound();
  }

  const { customer, item } = data;
  const profileUrl = `/p/${encodeURIComponent(customer.profile_slug || slug)}`;

  // Compute initials for avatar fallback
  const initials = (customer.full_name || "N")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-canvas text-on-surface flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* ── Top Bar / Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-surface-base/80 backdrop-blur-md border-b border-border-hairline px-4 sm:px-6 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={profileUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-surface-subtle"
          >
            <Icon name="arrow_back" size={16} strokeWidth={2} />
            <span>Back to Profile</span>
          </Link>

          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md bg-surface-subtle border border-border-hairline flex items-center justify-center overflow-hidden">
              <NfcistaLogo size={14} />
            </div>
            <span className="text-xs font-bold text-text-primary tracking-wide">
              NFCISTA
            </span>
          </Link>
        </div>
      </header>

      {/* ── Main Preview Content ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        <div className="bg-surface-base border border-border-hairline rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Customer Branding Header */}
          <div className="flex items-center gap-3.5 pb-6 border-b border-border-hairline">
            <Link href={profileUrl} className="shrink-0 group">
              <div className="transition-transform group-hover:scale-105">
                <ProfileAvatar
                  photoUrl={customer.photo_url}
                  fullName={customer.full_name}
                  initials={initials}
                />
              </div>
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Link
                  href={profileUrl}
                  className="text-sm sm:text-base font-bold text-text-primary hover:text-brand transition-colors truncate"
                >
                  {customer.full_name}
                </Link>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Verified NFC Profile" />
              </div>

              {(customer.company_name || customer.job_title) && (
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {[customer.job_title, customer.company_name].filter(Boolean).join(" · ")}
                </p>
              )}

              {customer.category && (
                <span className="inline-block mt-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider bg-surface-subtle px-2 py-0.5 rounded-md border border-border-hairline">
                  {customer.category}
                </span>
              )}
            </div>
          </div>

          {/* Portfolio Item Title & Badge */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <Icon name="collections_bookmark" size={12} strokeWidth={2} />
              <span>External Portfolio Link</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-text-primary leading-tight">
              {item.title}
            </h1>

            {item.description && (
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-1">
                {item.description}
              </p>
            )}
          </div>

          {/* External Destination Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-hairline space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                  <Icon name="language" size={16} strokeWidth={2} className="text-primary" />
                  <span className="truncate">Destination Website</span>
                </div>
                <p className="text-sm sm:text-base font-mono font-bold text-primary truncate">
                  {item.domain || "External Website"}
                </p>
              </div>

              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                Safe Link
              </span>
            </div>

            <p className="text-[11px] font-mono text-text-muted truncate bg-surface-base/80 p-2 rounded-lg border border-border-hairline select-all">
              {item.external_url}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {/* Primary Action Button: Open external destination in new tab */}
            <a
              href={item.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] py-3 px-5 rounded-2xl bg-slate-900 hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Visit Original Website</span>
              <Icon name="open_in_new" size={16} strokeWidth={2.2} />
            </a>

            {/* Secondary: Return to digital business card */}
            <Link
              href={profileUrl}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-surface-subtle hover:bg-surface-subtle/80 text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center justify-center gap-1.5 border border-border-hairline transition-colors"
            >
              <Icon name="arrow_back" size={14} strokeWidth={2} />
              <span>Return to {customer.full_name}&apos;s Profile</span>
            </Link>
          </div>

          {/* Security Notice */}
          <div className="pt-2 text-center border-t border-border-hairline/60">
            <p className="text-[11px] text-text-muted leading-relaxed">
              You are being directed to an external website. External content and trademarks belong to their respective owners.
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-6 px-4 text-center border-t border-border-hairline">
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <div className="w-4 h-4 rounded bg-surface-subtle border border-border-hairline flex items-center justify-center overflow-hidden">
            <NfcistaLogo size={10} />
          </div>
          <span className="font-semibold text-text-primary">NFCISTA</span>
          <span>·</span>
          <span>Digital Business Cards</span>
        </div>
      </footer>
    </div>
  );
}
