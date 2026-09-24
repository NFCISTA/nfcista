export default function NfcExplanation() {
  return (
    <section id="nfc-qr-backup" className="py-20 bg-white border-y border-outline-variant/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            Dual Connection Technology
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            NFC Tap + QR Backup
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3 leading-relaxed">
            Every NFCISTA card is built to work seamlessly on any smartphone, whether modern or older.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* NFC Tap Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[26px]">contactless</span>
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                Primary Method
              </span>
              <h3 className="text-2xl font-bold text-on-surface mb-3">
                Tap with NFC
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Hold your NFC card close to the back of any compatible iPhone or Android smartphone. The phone automatically senses the chip and opens your review page, social link, or digital card in seconds — without opening any app.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-outline-variant/20 flex items-center gap-2 text-label-sm font-semibold text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>Fastest contactless experience</span>
            </div>
          </div>

          {/* QR Code Backup Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[26px]">qr_code_scanner</span>
              </div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                Always-Available Backup
              </span>
              <h3 className="text-2xl font-bold text-on-surface mb-3">
                Scan with QR Code
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Each card also features a crisp, dedicated QR code printed on the back. If someone is using an older device or has NFC turned off, they can simply point their normal camera app at the code to connect immediately.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-outline-variant/20 flex items-center gap-2 text-label-sm font-semibold text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>100% device compatibility guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
