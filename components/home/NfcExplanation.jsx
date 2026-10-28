import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

export default function NfcExplanation() {
  return (
    <section id="specifications" className="py-16 md:py-24 bg-surface-subtle border-b border-border-hairline">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <Badge variant="neutral" dot={false} className="uppercase tracking-wider text-[11px] font-semibold mb-2">
            Dual-Tech Connectivity
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
            Dual-Technology Smartphone Connectivity
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-2.5 leading-relaxed">
            Every NFCISTA card combines active contactless NFC with a laser-printed dynamic QR backup.
          </p>
        </div>

        {/* Dual Mode Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* NFC Tap Card */}
          <div className="bg-surface-elevated border border-border-hairline rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-border-hairline text-accent-primary flex items-center justify-center mb-5">
                <Icon name="Radio" className="w-5 h-5 text-accent-primary" />
              </div>

              <span className="text-[11px] font-bold text-accent-primary uppercase tracking-wider block mb-1">
                Primary Method
              </span>

              <h3 className="text-xl font-bold text-text-primary mb-2.5">
                Contactless NFC Tap
              </h3>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                Hold the card close to the back of any compatible smartphone. The phone automatically reads the embedded chip and opens your destination link directly in the mobile browser — without launching any external app.
              </p>

              <div className="space-y-2 text-xs text-text-secondary pt-4 border-t border-border-hairline">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                  <span>Direct tap connection on NFC-enabled phones</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                  <span>Zero battery, zero pairing, zero app installation</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border-hairline flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <Icon name="Check" className="w-4 h-4 text-emerald-600" />
              <span>Fast in-person handoff</span>
            </div>
          </div>

          {/* QR Backup Card */}
          <div className="bg-surface-elevated border border-border-hairline rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-border-hairline text-text-primary flex items-center justify-center mb-5">
                <Icon name="QrCode" className="w-5 h-5 text-text-primary" />
              </div>

              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
                Universal Fallback
              </span>

              <h3 className="text-xl font-bold text-text-primary mb-2.5">
                Dynamic QR Backup
              </h3>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                Every card features a crisp, dedicated QR code printed cleanly on the reverse side. If a customer is using an older device or has NFC toggled off, they simply point their camera at the code to connect immediately.
              </p>

              <div className="space-y-2 text-xs text-text-secondary pt-4 border-t border-border-hairline">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                  <span>Works with standard smartphone cameras</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                  <span>Points to the same unified digital destination</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border-hairline flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <Icon name="Check" className="w-4 h-4 text-emerald-600" />
              <span>Broad coverage with QR fallback</span>
            </div>
          </div>
        </div>

        {/* Updatable Profile Highlight Box */}
        <div className="mt-6 bg-surface-elevated border border-border-hairline rounded-2xl p-6 sm:p-7 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-border-hairline text-accent-primary flex items-center justify-center shrink-0">
            <Icon name="RotateCw" className="w-5 h-5 text-accent-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-text-primary mb-1">
              Updatable Digital Profiles
            </h4>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              If your contact numbers, review URL, or business details change, you can update your digital profile from your account dashboard. Your physical cards continue pointing to your latest profile without reprinting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
