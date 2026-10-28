import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

export default function ContactCTA() {
  return (
    <section id="contact" className="py-16 md:py-24 bg-canvas border-b border-border-hairline">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-surface-elevated border border-border-hairline rounded-2xl p-6 sm:p-10 shadow-2xs text-center">
          <Badge variant="neutral" dot={false} className="uppercase tracking-wider text-[11px] font-semibold mb-2">
            B2B Orders &amp; Inquiries
          </Badge>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mt-1 tracking-tight">
            Order Your Custom NFC Cards
          </h2>

          <p className="text-xs sm:text-sm text-text-secondary mt-2.5 max-w-xl mx-auto leading-relaxed">
            Equip your sales team, retail counters, or service staff with custom-printed smart cards configured specifically for your business.
          </p>

          {/* Simple 3-step order flow */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-8 text-left">
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-hairline">
              <div className="text-[11px] font-bold text-text-secondary mb-1">STEP 1</div>
              <div className="text-xs font-semibold text-text-primary">Choose Card Type</div>
              <p className="text-[11px] text-text-secondary mt-1">Review, Profile, Instagram, or WhatsApp.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-hairline">
              <div className="text-[11px] font-bold text-text-secondary mb-1">STEP 2</div>
              <div className="text-xs font-semibold text-text-primary">Send Details &amp; Logo</div>
              <p className="text-[11px] text-text-secondary mt-1">Provide your branding, contact info, and links.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-hairline">
              <div className="text-[11px] font-bold text-text-secondary mb-1">STEP 3</div>
              <div className="text-xs font-semibold text-text-primary">Receive Ready Cards</div>
              <p className="text-[11px] text-text-secondary mt-1">Pre-configured cards ready to tap right out of the box.</p>
            </div>
          </div>

          {/* Action Button: Verified Business Email Inquiry */}
          <div className="flex items-center justify-center pt-2">
            <a
              href="mailto:hellonfcista@gmail.com?subject=NFCISTA%20Card%20Order%20Inquiry"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-primary text-white font-semibold text-sm hover:bg-accent-hover shadow-2xs transition-colors active:scale-[0.98]"
            >
              <Icon name="Mail" className="w-4 h-4" />
              <span>Email Inquiries: hellonfcista@gmail.com</span>
            </a>
          </div>

          {/* Verified Contact Details Grid */}
          <div className="mt-8 pt-6 border-t border-border-hairline grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border-hairline text-accent-primary flex items-center justify-center mx-auto mb-2">
                <Icon name="Mail" className="w-4 h-4 text-accent-primary" />
              </div>
              <div className="text-xs font-semibold text-text-primary">Official Email</div>
              <a
                href="mailto:hellonfcista@gmail.com"
                className="text-[11px] text-accent-primary hover:underline mt-0.5 inline-block"
              >
                hellonfcista@gmail.com
              </a>
            </div>

            <div className="p-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border-hairline text-accent-primary flex items-center justify-center mx-auto mb-2">
                <Icon name="Camera" className="w-4 h-4 text-accent-primary" />
              </div>
              <div className="text-xs font-semibold text-text-primary">Instagram</div>
              <a
                href="https://instagram.com/nfcista"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-accent-primary hover:underline mt-0.5 inline-block"
              >
                @nfcista
              </a>
            </div>

            <div className="p-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border-hairline text-accent-primary flex items-center justify-center mx-auto mb-2">
                <Icon name="MapPin" className="w-4 h-4 text-accent-primary" />
              </div>
              <div className="text-xs font-semibold text-text-primary">Headquarters</div>
              <span className="text-[11px] text-text-secondary mt-0.5 inline-block">
                Mumbra, Thane, MH
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
