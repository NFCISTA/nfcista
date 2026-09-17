export default function WhyNfcista() {
  const reasons = [
    {
      title: "No need to carry stacks of paper cards",
      description: "One reusable card replaces thousands of paper cards that inevitably get lost or tossed.",
      icon: "recycling",
    },
    {
      title: "Easy to share",
      description: "A quick physical tap transfers all your business details in under two seconds.",
      icon: "speed",
    },
    {
      title: "Professional digital profile",
      description: "Leave an unforgettable, tech-forward impression at every client meeting or expo.",
      icon: "verified",
    },
    {
      title: "Contact details in one place",
      description: "Phone, WhatsApp, email, address, directions, website, and social media seamlessly organized.",
      icon: "grid_view",
    },
    {
      title: "Easy to update digitally",
      description: "Change your phone number or title anytime without re-ordering or reprinting cards.",
      icon: "update",
    },
    {
      title: "Works with smartphones that support NFC",
      description: "Standard NFC compatibility ensures smooth interaction with modern mobile devices.",
      icon: "phonelink_ring",
    },
    {
      title: "Designed for modern businesses & professionals",
      description: "Built specifically to meet the everyday networking needs of Indian professionals.",
      icon: "storefront",
    },
  ];

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            Practical Benefits
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            Why Choose NFCISTA?
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            Real, practical advantages built for modern professionals on the go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-card hover:border-primary/40 transition-all flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex-shrink-0 flex items-center justify-center mt-1">
                <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
              </div>
              <div>
                <h3 className="text-headline-md font-bold text-on-surface text-base mb-1.5">
                  {r.title}
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  {r.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
