export default function WhyNfcista() {
  const benefits = [
    {
      title: "Tap to Connect",
      description: "Touch the card to any compatible smartphone to open your link or profile instantly.",
      icon: "contactless",
    },
    {
      title: "No App Required",
      description: "Customers and clients view your details directly in their mobile browser without downloading anything.",
      icon: "phonelink_setup",
    },
    {
      title: "NFC + QR Backup",
      description: "Every card includes a clean QR code backup, ensuring smooth connections on all phone models.",
      icon: "qr_code_2",
    },
    {
      title: "Professional Custom Design",
      description: "Durable, high-quality physical cards branded with your business identity and clean typography.",
      icon: "verified",
    },
    {
      title: "Easy Digital Sharing",
      description: "Direct customers effortlessly to your Google Reviews, Instagram, WhatsApp, or business profile.",
      icon: "share",
    },
  ];

  return (
    <section id="why-nfcista" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            Built for Modern Networking
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            Why Choose NFCISTA?
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            Simple, reliable smart card technology designed for seamless in-person connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-card hover:border-primary/40 transition-all flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-surface-container-low text-primary flex-shrink-0 flex items-center justify-center mt-0.5">
                <span className="material-symbols-outlined text-[22px]">{b.icon}</span>
              </div>
              <div>
                <h3 className="text-headline-md font-bold text-on-surface text-base mb-1.5">
                  {b.title}
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
