import Link from "next/link";

export const metadata = {
  title: "Privacy Notice | NFCISTA",
  description:
    "Privacy Notice for NFCISTA digital business cards, outlining personal data processing practices under India's Digital Personal Data Protection Act, 2023 (DPDP Act).",
};

export default function PrivacyPage() {
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
              href="/terms"
              className="text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              Terms
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
                This Privacy Notice has been drafted as an engineering compliance baseline reflecting
                NFCISTA&apos;s current technical architecture and data processing flows under the principles of
                India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act). It does not constitute formal
                legal advice and must be reviewed, adapted, and approved by a qualified Indian privacy lawyer before
                official adoption.
              </p>
            </div>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-2 mb-8">
          <span className="text-label-sm font-bold uppercase tracking-wider text-primary">
            Transparency &amp; Data Protection
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
            NFCISTA Privacy Notice
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
              1. Introduction &amp; Scope
            </h2>
            <p>
              NFCISTA (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) provides near-field communication (NFC)
              physical smart cards linked to dynamic digital business profile pages hosted at{" "}
              <code className="text-[13px] bg-surface-container-low px-1.5 py-0.5 rounded font-mono text-on-surface">
                nfcista.vercel.app/p/[slug]
              </code>
              .
            </p>
            <p>
              This Privacy Notice explains how we collect, store, display, share, and protect digital personal data
              belonging to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong className="text-on-surface">Customers / Profile Subjects (Data Principals):</strong> Professionals
                or business representatives whose digital business cards are created and hosted by NFCISTA.
              </li>
              <li>
                <strong className="text-on-surface">Card Recipients &amp; Public Visitors:</strong> Individuals who tap an
                NFCISTA card, scan a profile QR code, or view a public profile link.
              </li>
              <li>
                <strong className="text-on-surface">Administrative Users:</strong> Authorized operators accessing the NFCISTA
                management portal.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              2. What Personal Data We Process
            </h2>
            <p>
              We adhere to data minimisation principles. We collect only the information provided to us for creating
              and publishing your digital business profile:
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface font-semibold text-[12px] uppercase">
                    <th className="py-2.5 pr-4">Category</th>
                    <th className="py-2.5 pr-4">Fields</th>
                    <th className="py-2.5">Nature &amp; Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-on-surface">Identity &amp; Professional</td>
                    <td className="py-2.5 pr-4">Full Name, Job Title, Company Name, Category, Description / Bio</td>
                    <td className="py-2.5">Publicly visible on digital profile</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-on-surface">Direct Contact</td>
                    <td className="py-2.5 pr-4">Phone Number, WhatsApp Number, Email Address, Physical Business Address</td>
                    <td className="py-2.5">Publicly visible; exported into vCard (.vcf) when visitor downloads contact</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-on-surface">Digital &amp; Social Links</td>
                    <td className="py-2.5 pr-4">Website URL, Instagram Handle, Google Review Link</td>
                    <td className="py-2.5">Publicly visible outbound links</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-on-surface">Visual Imagery</td>
                    <td className="py-2.5 pr-4">Profile Photo (optional upload: JPG, PNG, WebP)</td>
                    <td className="py-2.5">Publicly accessible via Supabase Storage bucket</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-on-surface">Identifiers &amp; System State</td>
                    <td className="py-2.5 pr-4">Profile Slug (URL key), Active/Inactive flag</td>
                    <td className="py-2.5">Public URL path; control flag determines card accessibility</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-on-surface">Administrative Credentials</td>
                    <td className="py-2.5 pr-4">Admin Email Address, Authentication Token / Session</td>
                    <td className="py-2.5 text-amber-700 font-medium">Private; strictly restricted to authorized administrators</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-body-sm text-on-surface-variant italic mt-2">
              Note: We do not intentionally collect biometric data, government identification numbers (e.g. Aadhaar, PAN),
              financial card details, or sensitive personal data.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              3. Purpose of Processing &amp; Public Nature of Digital Profiles
            </h2>
            <p>
              We process personal data solely for the following specified purposes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Fulfilling your Digital Business Card service:</strong> Publishing your chosen contact and professional
                details on a dedicated URL (e.g. <code className="text-xs bg-surface-container-low px-1 py-0.5 rounded font-mono">/p/[slug]</code>)
                programmed to your physical NFC card and QR code.
              </li>
              <li>
                <strong>Facilitating networking interactions:</strong> Allowing individuals who tap your card to view your profile,
                initiate a call, send a WhatsApp message, launch email, open Google Maps directions, or download your contact
                details via a standard RFC 2426 vCard file.
              </li>
              <li>
                <strong>Service Administration:</strong> Authenticating administrators, responding to customer update requests,
                and maintaining system security.
              </li>
            </ul>
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 text-body-sm space-y-1">
              <strong className="block font-semibold">Important Notice Regarding Public Visibility:</strong>
              <p>
                The fundamental utility of a digital business card is public dissemination of contact details. By ordering an
                NFCISTA card or submitting contact details for publication, you understand that information included in your
                profile is intentionally made accessible on the public Internet to anyone who taps your NFC card, scans your QR code,
                or visits your profile URL. Do not include private home addresses, private mobile numbers, or confidential data
                that you do not wish to share publicly.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              4. Storage, Infrastructure &amp; Third-Party Service Providers
            </h2>
            <p>
              NFCISTA does not sell, rent, or trade your personal data. We utilize trusted cloud infrastructure providers
              (Data Processors) under standard data protection terms:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong className="text-on-surface">Supabase Inc. (Database, Auth, Storage):</strong> Customer records,
                administrative authentication, and profile photos are securely stored in a hosted PostgreSQL instance and
                storage bucket protected by Row Level Security (RLS) policies.
              </li>
              <li>
                <strong className="text-on-surface">Vercel Inc. (Web Hosting &amp; Serverless Infrastructure):</strong> The
                front-end application and serverless execution layer run on Vercel&apos;s edge network with TLS/HTTPS encryption
                in transit.
              </li>
              <li>
                <strong className="text-on-surface">Google Fonts / Material Symbols:</strong> Fonts and iconography are loaded
                from Google CDN. No personal profiling data is provided by NFCISTA to Google.
              </li>
              <li>
                <strong className="text-on-surface">QR Generation:</strong> Profile QR codes are generated directly in the
                visitor&apos;s web browser using client-side JavaScript (<code className="text-xs bg-surface-container-low px-1 rounded font-mono">qrcode.react</code>).
                No customer information is transmitted to external QR web services.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              5. Security Safeguards
            </h2>
            <p>
              We implement reasonable security safeguards to protect digital personal data against loss, unauthorized access,
              modification, or disclosure:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>PostgreSQL Row Level Security (RLS):</strong> Direct anonymous database table queries are strictly denied.
                Public visitors cannot list, dump, or query the customers table.
              </li>
              <li>
                <strong>Controlled Public RPC:</strong> Profile rendering occurs exclusively through a controlled database
                function (<code className="text-xs bg-surface-container-low px-1 py-0.5 rounded font-mono">get_customer_by_slug</code>)
                with a locked schema search path that exposes only active profiles and excludes internal database identifiers.
              </li>
              <li>
                <strong>Storage Bucket Permissions:</strong> Profile photos bucket restricts write and delete operations strictly
                to verified administrators.
              </li>
              <li>
                <strong>Encryption in Transit:</strong> All communication between browsers, Vercel edge servers, and Supabase
                backends is encrypted using standard Transport Layer Security (TLS/HTTPS).
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              6. Data Retention &amp; Deletion
            </h2>
            <p>
              We retain customer profile information for the duration of your active subscription or NFC card usage.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Deactivation:</strong> Upon your request, an administrator can instantly toggle your profile to
                <strong className="text-on-surface"> Inactive</strong>. An inactive profile renders an immediate &ldquo;Profile Unavailable&rdquo;
                notice and ceases displaying contact buttons, photos, or personal data.
              </li>
              <li>
                <strong>Permanent Erasure:</strong> Upon a verified erasure request, your customer database record is permanently
                deleted and any associated uploaded profile photo is removed from cloud storage.
              </li>
              <li>
                <strong>Business Records:</strong> Transactional receipts or tax invoices relating to hardware purchases are
                retained only as required under applicable Indian commercial and tax laws.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              7. Rights of Data Principals (Under DPDP Act, 2023)
            </h2>
            <p>
              As a Data Principal under India&apos;s Digital Personal Data Protection Act, 2023, you have rights regarding your
              personal data processed by NFCISTA:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong className="text-on-surface">Right to Access:</strong> You may request a summary of the personal data
                we hold and process concerning your profile.
              </li>
              <li>
                <strong className="text-on-surface">Right to Correction &amp; Updating:</strong> You may request correction of
                inaccurate, incomplete, or outdated personal data on your digital card.
              </li>
              <li>
                <strong className="text-on-surface">Right to Erasure:</strong> You may request the deletion of your personal data
                and de-indexing of your digital business card profile.
              </li>
              <li>
                <strong className="text-on-surface">Right to Withdraw Consent:</strong> Where processing is based on consent, you
                have the right to withdraw that consent at any time. Withdrawal will result in deactivation or removal of your
                public profile.
              </li>
              <li>
                <strong className="text-on-surface">Right of Grievance Redressal:</strong> You have the right to readily available
                means of grievance redressal provided by NFCISTA.
              </li>
            </ul>
            <div className="pt-3">
              <Link
                href="/privacy/data-request"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-label-md hover:bg-primary-container shadow-btn-primary transition-all"
              >
                <span>Submit a Data Rights Request</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </section>

          {/* Section 8 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              8. Grievance Officer &amp; Contact Mechanism
            </h2>
            <p>
              In accordance with the Digital Personal Data Protection Act, 2023, if you have any questions, concerns, or
              grievances regarding the processing of your personal data or wish to exercise your data principal rights,
              please reach out to our designated contact point:
            </p>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1 text-body-sm">
              <p className="font-bold text-on-surface">NFCISTA Privacy &amp; Grievance Contact</p>
              <p>Email: <a href="mailto:hellonfcista@gmail.com" className="text-primary font-medium hover:underline">hellonfcista@gmail.com</a></p>
              <p>Location: Mumbra, Thane, Maharashtra, India</p>
              <p className="text-[12px] text-on-surface-variant pt-1">
                * Note for legal review: Official designation of Data Protection Officer / Grievance Redressal Officer
                and response timelines subject to formal rules notified under the DPDP Act.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-headline-sm font-bold text-on-surface">
              9. Updates to This Privacy Notice
            </h2>
            <p>
              We may revise this Privacy Notice periodically to reflect changes in our technological safeguards, business
              operations, or legal requirements under the DPDP Act and accompanying rules. The updated notice will be posted
              at this URL with an updated effective date.
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
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy/data-request" className="hover:text-primary transition-colors">Data Rights Request</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
