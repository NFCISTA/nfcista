export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Choose Your Card",
      description: "Select the NFC card that matches your business goal — Google Reviews, Instagram, WhatsApp, or a Digital Business Card.",
      icon: "credit_card",
    },
    {
      number: "02",
      title: "We Create Your Digital Profile",
      description: "Your details, review link, or social channels are configured and connected to your card.",
      icon: "badge",
    },
    {
      number: "03",
      title: "Tap Your NFC Card",
      description: "Hold your card near any smartphone with NFC enabled, or scan the built-in QR backup.",
      icon: "contactless",
    },
    {
      number: "04",
      title: "Connect Instantly",
      description: "Your customer immediately lands on your review page, chat, social profile, or digital contact card.",
      icon: "hub",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            How It Works
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            Going digital with NFCISTA is seamless from card creation to everyday networking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-card hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black tracking-tight text-primary/30">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">
                  {step.title}
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
