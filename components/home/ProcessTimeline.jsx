export default function ProcessTimeline() {
  const steps = [
    {
      num: "01",
      title: "Brief",
      description: "Send your logo, destination links, and customer goal.",
    },
    {
      num: "02",
      title: "Design",
      description: "We craft your custom layout and visual proof for approval.",
    },
    {
      num: "03",
      title: "Program & Test",
      description: "NFC chips are encoded, locked, and tap-tested on real phones.",
    },
    {
      num: "04",
      title: "Ship",
      description: "Your finished hardware arrives ready to place on your counter.",
    },
  ];

  return (
    <section id="process" className="py-24 md:py-32 bg-ink-alt border-b border-line">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <div className="font-mono text-xs uppercase tracking-wider text-brand-text mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            <span>How We Deliver</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-fg tracking-[-0.035em]">
            From brief to counter in four steps.
          </h2>
          <p className="font-sans text-sm sm:text-base text-muted mt-3">
            A turnkey physical-to-digital process with zero guesswork for your team.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Horizontal Line on Desktop */}
          <div
            className="hidden md:block absolute top-[23px] left-[32px] right-[32px] h-[1px] bg-line z-0"
            aria-hidden="true"
          />

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative z-10">
            {steps.map((step) => (
              <div key={step.num} className="flex md:flex-col items-start gap-5 md:gap-6">
                {/* Number / Dot Circle */}
                <div className="w-12 h-12 rounded-full bg-ink border border-line flex items-center justify-center font-mono text-xs font-bold text-brand-text shrink-0 shadow-sm">
                  {step.num}
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-display font-bold text-lg text-fg mb-1.5">
                    {step.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
