import Link from "next/link";

export const metadata = {
  title: "Terms of Service | NFCISTA",
  description:
    "Terms of Service for NFCISTA digital business cards and physical NFC cards, including data protection, customer responsibility, and public profile guidelines.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-on-surface">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-btn-primary">
              <span className="material-symbols-outlined text-[18px]">contactless</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface">
              NFCISTA
            </span>
          </Link>

          <div className="flex items-center gap-4 text-body-sm">
            <Link
              href="/privacy"
              className="text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              Privacy Notice
            </Link>
            <Link
              href="/privacy/data-request"
              className="text-primary font-semibold hover:underline"
            >
              Data Rights Request
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Lawyer Review Required Notice Banner */}
        <div
          role="alert"
          className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[24px] text-amber-700 shrink-0 mt-0.5">
              gavel
            </span>
            <div className="space-y-1 text-body-sm">
              <p className="font-bold text-amber-950 uppercase tracking-wide text-xs">
                Engineering Notice — Legal Review Required Before Production Use
              </p>
              <p className="leading-relaxed">
                These draft Terms of Service reflect NFCISTA&apos;s product operations and data responsibilities as of
                September 2026. This text does not constitute legal advice and must be customized and approved by a
                qualified legal practitioner before being presented as a binding contract.
              </p>
            </div>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-2 mb-8">
          <span className="text-label-sm font-bold uppercase tracking-wider text-primary">
            Terms &amp; User Responsibilities
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
            NFCISTA Terms of Service
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Last Updated: September 19, 2026 &bull; Version 1.0 (Draft Baseline)
          </p>
        </div>

        {/* Document Content */}
        <div className="space-y-8 text-body-md text-on-surface-variant leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              1. Acceptance of Terms
            </h2>
            <p>
              By ordering an NFC smart card from NFCISTA, submitting customer details for profile creation, or using our
              hosted digital business card platform (<code className="text-[13px] bg-surface-container-low px-1.5 py-0.5 rounded font-mono text-on-surface">nfcista.vercel.app</code>),
              you agree to be bound by these Terms of Service and our accompanying{" "}
              <Link href="/privacy" className="text-primary font-medium hover:underline">
                Privacy Notice
              </Link>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              2. Nature of the Digital Business Card Service
            </h2>
            <p>
              NFCISTA provides physical NFC-enabled cards and associated web landing profiles designed to share professional
              identity and contact details. When an NFC card is tapped against a smartphone or the profile QR code is scanned,
              the browser opens the customer&apos;s public profile page at{" "}
              <code className="text-xs bg-surface-container-low px-1 py-0.5 rounded font-mono">/p/[slug]</code>.
            </p>
          </section>

          {/* Section 3 - Critical Data Protection & Privacy Section */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
              <h2 className="text-headline-sm font-bold text-on-surface">
                3. Data Protection &amp; Personal Data Handling
              </h2>
            </div>
            <p>
              Under India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act) and applicable standards, NFCISTA is
              committed to responsible and transparent data processing:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/25">
                <h3 className="font-bold text-on-surface text-label-lg mb-1">
                  A. Public Nature of Digital Profile Information
                </h3>
                <p className="text-body-sm">
                  You acknowledge and agree that your digital business card is intentionally designed as a publicly accessible
                  online representation of your professional profile. Any contact information you choose to include—including
                  your full name, job title, company, phone number, WhatsApp number, email address, physical address, social
                  links, and profile photograph—will be visible on the public Internet and downloadable as a vCard file by anyone
                  who accesses your profile URL.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/25">
                <h3 className="font-bold text-on-surface text-label-lg mb-1">
                  B. Customer Responsibility for Submitted Data
                </h3>
                <p className="text-body-sm">
                  You represent and warrant that all personal data, logos, trademarks, and imagery provided to NFCISTA for
                  inclusion on your card or profile belong to you or that you have obtained all necessary consents and legal
                  authority to publish them. You agree not to submit fraudulent, deceptive, defamatory, or unlawful information,
                  or personal data belonging to third parties without their express authorization.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/25">
                <h3 className="font-bold text-on-surface text-label-lg mb-1">
                  C. Security Safeguards &amp; Inherent Internet Limitations
                </h3>
                <p className="text-body-sm">
                  NFCISTA implements industry-standard technological security measures (including TLS encryption in transit,
                  PostgreSQL Row Level Security, and restricted storage policies) to prevent unauthorized alteration or database
                  dumping. However, no digital transmission over the Internet or physical NFC media can be guaranteed to be 100%
                  impervious. You acknowledge that anyone in physical proximity who taps your card or possesses your public URL can
                  view your profile.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/25">
                <h3 className="font-bold text-on-surface text-label-lg mb-1">
                  D. Privacy Notice Reference &amp; Data Rights
                </h3>
                <p className="text-body-sm">
                  Your rights under the DPDP Act—including rights of access, correction, erasure, and consent withdrawal—are
                  governed by our{" "}
                  <Link href="/privacy" className="text-primary font-semibold hover:underline">
                    Privacy Notice
                  </Link>.
                  You may submit a formal request at any time through our{" "}
                  <Link href="/privacy/data-request" className="text-primary font-semibold hover:underline">
                    Data Rights Request Form
                  </Link>{" "}
                  or by emailing{" "}
                  <a href="mailto:hellonfcista@gmail.com" className="text-primary font-medium hover:underline">
                    hellonfcista@gmail.com
                  </a>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              4. Profile Deactivation &amp; Service Termination
            </h2>
            <p>
              You may request deactivation or permanent deletion of your digital business card at any time. When a card is marked
              inactive, the public profile will display a notice that the card is unavailable and all contact buttons will be
              disabled. Physical NFC cards programmed with a deactivated slug will point to that inactive screen until re-encoded
              or retired.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              5. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable Indian law, NFCISTA shall not be liable for any indirect, incidental,
              or consequential damages resulting from lost cards, unauthorized scanning of physical cards, network outages on
              third-party hosting providers (e.g. Vercel, Supabase), or misuse of contact details publicly displayed with your
              express consent.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              6. Governing Law &amp; Dispute Resolution
            </h2>
            <p>
              These Terms shall be construed in accordance with the laws of India. Any disputes arising out of or related to these
              Terms or the services provided by NFCISTA shall be subject to the exclusive jurisdiction of the competent courts in
              Thane / Mumbai, Maharashtra.
            </p>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-body-sm text-on-surface-variant">
          <Link href="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to NFCISTA Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Notice</Link>
            <Link href="/privacy/data-request" className="hover:text-primary transition-colors">Data Rights Request</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
