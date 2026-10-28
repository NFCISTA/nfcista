export default function FactsStrip() {
  const facts = [
    {
      metric: "0",
      label: "Apps for customers to install",
      sub: "Native NFC detection on modern phones",
    },
    {
      metric: "1",
      label: "Tap from phone to your page",
      sub: "Instant browser redirection",
    },
    {
      metric: "~4 cm",
      label: "Typical NFC read range",
      sub: "Accidental tap protection with QR backup",
    },
  ];

  return (
    <section className="bg-ink-alt border-b border-line py-12 md:py-16">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-line">
          {facts.map((fact, idx) => (
            <div
              key={fact.label}
              className={`flex flex-col items-start ${idx > 0 ? "pt-6 md:pt-0 md:pl-10" : ""}`}
            >
              <div className="font-display font-bold text-4xl sm:text-5xl text-fg tracking-tight mb-2">
                {fact.metric}
              </div>
              <div className="font-sans font-semibold text-sm sm:text-base text-fg">
                {fact.label}
              </div>
              <div className="font-sans text-xs text-dim mt-1">
                {fact.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
