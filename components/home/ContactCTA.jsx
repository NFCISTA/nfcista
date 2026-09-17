export default function ContactCTA() {
  return (
    <section id="contact" className="py-20 bg-white border-y border-outline-variant/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 sm:p-12 shadow-float text-center">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            Start Networking Smarter
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            Ready to Go Digital?
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3 max-w-xl mx-auto leading-relaxed">
            Get your NFC business card and make sharing your details easier. Reach out directly on WhatsApp to inquire about designs, pricing, and custom cards.
          </p>

          {/* Primary WhatsApp Action */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/919000000000?text=Hi%20NFCISTA%2C%20I%20would%20like%20to%20order%20an%20NFC%20business%20card."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-on-primary font-bold text-label-lg hover:bg-primary-container shadow-btn-primary transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span>Order Your NFC Card</span>
            </a>
          </div>

          <p className="text-xs text-on-surface-variant mt-3">
            Demo contact line: +91 90000 00000 (WhatsApp inquiry)
          </p>

          {/* Contact Details Grid */}
          <div className="mt-10 pt-8 border-t border-outline-variant/20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </div>
              <div className="text-label-md font-bold text-on-surface">Instagram</div>
              <a
                href="https://instagram.com/nfcista"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-primary hover:underline mt-0.5 inline-block"
              >
                @nfcista
              </a>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <div className="text-label-md font-bold text-on-surface">Email</div>
              <a
                href="mailto:hellonfcista@gmail.com"
                className="text-body-sm text-primary hover:underline mt-0.5 inline-block"
              >
                hellonfcista@gmail.com
              </a>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </div>
              <div className="text-label-md font-bold text-on-surface">Location</div>
              <span className="text-body-sm text-on-surface-variant mt-0.5 inline-block">
                Mumbra, Thane, Maharashtra
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
