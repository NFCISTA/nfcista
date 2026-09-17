export default function NfcExplanation() {
  const steps = [
    {
      step: "1",
      icon: "tap_and_play",
      title: "Tap Card",
      description: "Touch the NFC card to the back of any modern smartphone.",
    },
    {
      step: "2",
      icon: "open_in_browser",
      title: "Open Digital Profile",
      description: "The phone instantly opens your personal profile in its browser.",
    },
    {
      step: "3",
      icon: "share",
      title: "Share Contact",
      description: "They see your phone, WhatsApp, email, social links, and directions.",
    },
    {
      step: "4",
      icon: "person_add",
      title: "Save Contact",
      description: "A single tap downloads your vCard directly into their contacts.",
    },
  ];

  return (
    <section className="py-16 bg-white border-y border-outline-variant/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            Beginner Friendly
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            What is an NFC Business Card?
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3 leading-relaxed">
            NFC is a technology that lets you share information by simply tapping your phone on the card.
            No app to download, no manual typing of phone numbers.
          </p>
        </div>

        {/* 4-Step Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => (
            <div
              key={item.title}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card hover:shadow-float transition-all relative flex flex-col items-start"
            >
              <div className="w-full flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                </div>
                <span className="text-label-sm font-bold text-on-surface-variant/50 bg-surface-container-low px-2.5 py-1 rounded-full">
                  Step {item.step}
                </span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface">
                {item.title}
              </h3>
              <p className="text-body-md text-on-surface-variant mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
