import Link from "next/link";
import Icon from "@/components/ui/Icon";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import DemoQuickActions from "@/components/demo/DemoQuickActions";

// ---------------------------------------------------------------------------
// Static metadata — no database call
// ---------------------------------------------------------------------------
export const metadata = {
  title: "Demo Profile | NFCISTA",
  description:
    "NFCISTA demo profile — see how a digital business card looks and works. Sample data only.",
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// Fictional demo data — no real person, no real contact details
// ---------------------------------------------------------------------------
const DEMO = {
  full_name: "Alex Morgan",
  job_title: "Creative Professional",
  company_name: "Demo Studio",
  category: "Creative & Design",
  address: "Mumbai, Maharashtra",
  description:
    "This is a sample NFCISTA digital business card profile. All contact details, links, and information on this page are fictional and for demonstration purposes only.\n\nWith an NFCISTA card, your customers can tap their phone to instantly view your profile, call you, WhatsApp you, check your Google reviews, and save your contact — all without installing any app.",
  initials: "AM",
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function DemoPage() {
  const profileUrl = "https://nfcista.vercel.app/demo";

  return (
    <main className="min-h-screen bg-canvas text-text-primary antialiased overflow-x-hidden">
      {/* Demo Banner — always visible at top */}
      <div className="sticky top-0 z-50 w-full bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium text-amber-800">
        <Icon name="Info" size={14} className="w-3.5 h-3.5 shrink-0 text-amber-600" />
        <span>
          <strong>NFCISTA DEMO PROFILE</strong> — Sample data only. No real contact
          information.
        </span>
        <Link
          href="/"
          className="ml-2 shrink-0 underline underline-offset-2 hover:text-amber-900 transition-colors"
        >
          Back to NFCISTA
        </Link>
      </div>

      {/*
        Mirrors the /p/[slug] two-column layout exactly.
        Mobile: max-w-[430px], full-height surface
        Desktop (lg): max-w-[1040px], 2-column card
      */}
      <div
        className="w-full max-w-[430px] mx-auto bg-surface-base min-h-screen
                   lg:max-w-[1040px] lg:min-h-0 lg:my-10 lg:rounded-2xl
                   lg:overflow-hidden lg:border lg:border-border-hairline lg:shadow-card
                   lg:grid lg:grid-cols-[380px_1fr]"
      >

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN — Identity                                          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col bg-surface-base lg:border-r lg:border-border-hairline">

          {/* Hardware-Inspired Header Banner */}
          <div className="relative h-36 sm:h-40 bg-slate-950 overflow-hidden flex flex-col justify-between p-4">
            <div className="absolute inset-0 bg-slate-900 border-b border-slate-800" />

            {/* Top brand & status */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                <div className="w-6 h-6 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                  <Icon name="nfc" size={13} strokeWidth={2} />
                </div>
                <span className="text-white text-xs font-bold tracking-wider">
                  NFCISTA
                </span>
              </Link>

              {/* Demo indicator instead of "NFC Active" */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-400/20 border border-amber-400/30 rounded-md text-amber-300 text-[10px] font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Demo Mode</span>
              </div>
            </div>
          </div>

          {/* Avatar + Identity */}
          <div className="flex flex-col items-center text-center px-5 pb-4">
            {/* Avatar overlaps the banner */}
            <div className="-mt-14 mb-3 relative z-10">
              <ProfileAvatar
                photoUrl={null}
                fullName={DEMO.full_name}
                initials={DEMO.initials}
              />
            </div>

            <h1 className="text-2xl sm:text-[25px] font-bold text-text-primary tracking-tight leading-tight">
              {DEMO.full_name}
            </h1>

            <div className="mt-1 space-y-0.5">
              <p className="text-xs font-medium text-text-secondary">
                {DEMO.job_title}
              </p>
              <p className="text-xs font-semibold text-text-primary">
                {DEMO.company_name}
              </p>
            </div>

            {/* Category + Location tags */}
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary bg-surface-subtle border border-border-hairline px-2.5 py-0.5 rounded-md">
                <Icon name="tag" size={11} strokeWidth={2} className="text-accent-primary" />
                <span className="truncate max-w-[140px]">{DEMO.category}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary bg-surface-subtle border border-border-hairline px-2.5 py-0.5 rounded-md">
                <Icon name="location_on" size={11} strokeWidth={2} className="text-rose-600" />
                <span className="truncate max-w-[140px]">{DEMO.address}</span>
              </span>
            </div>
          </div>

          {/* Primary Action: "Save Contact" — demo notice instead of real vCard */}
          <div className="px-5 pb-5">
            <DemoSaveContactButton />
          </div>

          {/* Spacer for desktop layout */}
          <div className="hidden lg:block flex-1" />

          {/* Desktop Footer in Left Column */}
          <footer className="hidden lg:flex flex-col items-center py-5 px-5 border-t border-border-hairline">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-md bg-accent-primary flex items-center justify-center text-white">
                <Icon name="nfc" size={11} strokeWidth={2} />
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
              © 2026 NFCISTA. All rights reserved.
            </p>
          </footer>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN — Actions & Content                                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="divide-y divide-border-hairline bg-surface-base">

          {/* Top Action Row: demo-safe buttons */}
          <section className="px-4 sm:px-5 py-4" aria-label="Direct contact actions">
            <DemoQuickActions profileUrl={profileUrl} profileName={DEMO.full_name} />
          </section>

          {/* Connect & Presence — demo grid */}
          <section className="px-4 sm:px-5 py-4" aria-label="Connect and Social Presence">
            <div className="mb-3">
              <h2 className="text-sm font-bold text-text-primary">
                Connect &amp; Presence
              </h2>
              <p className="text-[11px] text-text-muted mt-0.5">
                Sample web and communication channels
              </p>
            </div>

            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
              {DEMO_CONNECT_ITEMS.map((item) => (
                <DemoConnectItem key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* About */}
          <section className="px-4 sm:px-5 py-4" aria-label="About">
            <h2 className="text-sm font-bold text-text-primary mb-2">About</h2>
            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
              {DEMO.description}
            </p>
          </section>

          {/* Get your own card CTA */}
          <section className="px-4 sm:px-5 py-6" aria-label="Get started">
            <div className="rounded-xl bg-surface-subtle border border-border-hairline p-4 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white">
                  <Icon name="Radio" size={16} className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-text-primary">
                  Get Your NFCISTA Card
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                This is what your customers see when they tap your NFC card.
                Order yours and go live in minutes.
              </p>
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary text-white font-semibold text-xs hover:bg-accent-hover shadow-2xs transition-colors active:scale-[0.98]"
              >
                <span>Enquire Now</span>
                <Icon name="ArrowRight" size={14} className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>
          </section>

          {/* Mobile-Only Footer */}
          <footer className="lg:hidden px-5 py-6 text-center border-t border-border-hairline">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-md bg-accent-primary flex items-center justify-center text-white">
                <Icon name="nfc" size={12} strokeWidth={2} />
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
              © 2026 NFCISTA. All rights reserved.
            </p>
          </footer>

        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Demo-safe sub-components (Server Components — no interactivity needed)
// ---------------------------------------------------------------------------

/** Replaces SaveContactButtonLazy: shows a demo notice instead of generating a vCard */
function DemoSaveContactButton() {
  return (
    <div className="w-full rounded-xl border border-border-hairline bg-surface-subtle px-4 py-3 text-center">
      <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
        <Icon name="Info" size={14} className="w-3.5 h-3.5 shrink-0 text-amber-500" />
        <span>
          <strong className="text-text-primary">Save Contact</strong> — available on real
          profiles. This is sample data only.
        </span>
      </div>
    </div>
  );
}

/** Demo connect grid items — all link to a demo notice anchor, not real destinations */
const DEMO_CONNECT_ITEMS = [
  {
    id: "ig",
    label: "Instagram",
    handle: "@demo.studio",
    icon: "camera",
    color: "text-pink-600",
    bg: "bg-pink-50 border-pink-100",
  },
  {
    id: "web",
    label: "Website",
    handle: "demostudio.example",
    icon: "language",
    color: "text-accent-primary",
    bg: "bg-blue-50 border-blue-100",
  },
  {
    id: "gr",
    label: "Google Review",
    handle: "Leave a review",
    icon: "star",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
  },
  {
    id: "li",
    label: "LinkedIn",
    handle: "Professional profile",
    icon: "work",
    color: "text-sky-700",
    bg: "bg-sky-50 border-sky-100",
  },
];

/** Single connect item — uses a demo notice button instead of a real external link */
function DemoConnectItem({ item }) {
  return (
    <div
      className="flex items-center gap-3 p-3 bg-surface-base border border-border-hairline rounded-xl shadow-2xs opacity-75 select-none"
      title="Demo — not a real link"
      aria-label={`${item.label} (demo only)`}
    >
      <div
        className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon name={item.icon} size={17} strokeWidth={2} className={item.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-primary leading-tight">
          {item.label}
        </p>
        <p className="text-[11px] text-text-secondary truncate mt-0.5">
          {item.handle}
        </p>
      </div>
      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md shrink-0">
        Demo
      </span>
    </div>
  );
}
