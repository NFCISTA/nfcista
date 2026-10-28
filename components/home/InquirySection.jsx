import InquiryForm from "./InquiryForm";

export default function InquirySection() {
  return (
    <section id="inquire" className="py-24 md:py-32 bg-ink border-b border-line">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Dark Panel with Blue-Tinted Border */}
        <div className="rounded-[28px] bg-ink-alt border border-brand/30 shadow-2xl p-6 sm:p-10 lg:p-14 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Direct Copy & Official Channel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink border border-line">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                <span className="font-mono text-xs uppercase tracking-wider text-brand-text">
                  Direct Inquiries &amp; Orders
                </span>
              </div>

              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-fg tracking-[-0.035em] leading-[1.1]">
                Make your shop tap-ready.
              </h2>

              <p className="font-sans text-sm sm:text-base text-muted leading-relaxed">
                Tell us what you need. You get a quote and a custom design preview configured around your brand logo and customer goals.
              </p>

              {/* Verified Contact Card */}
              <div className="pt-6 border-t border-line space-y-3">
                <div className="font-mono text-xs uppercase tracking-wider text-dim">
                  Direct Channel
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ink border border-line flex items-center justify-center text-brand-text">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-dim">Official Inquiry Email</div>
                    <a
                      href="mailto:hellonfcista@gmail.com"
                      className="font-medium text-sm text-fg hover:text-brand-text transition-colors"
                    >
                      hellonfcista@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Underline-Only Form */}
            <div className="lg:col-span-7 bg-ink/70 border border-line rounded-2xl p-6 sm:p-8">
              <InquiryForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
