import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "The Physical Card",
      badge: "Hardware",
      description:
        "Custom-crafted card embedded with an NFC contactless microchip and a high-contrast backup QR code. Durable, battery-free, and always ready.",
      icon: "Radio",
    },
    {
      number: "02",
      title: "The Contactless Tap",
      badge: "Zero Friction",
      description:
        "Hold the card near any compatible iPhone or Android. The phone's native NFC sensor reads the chip directly without requiring an app.",
      icon: "Phone",
    },
    {
      number: "03",
      title: "The Business Result",
      badge: "Instant Outcome",
      description:
        "The customer lands directly on your digital business card to save contact details, access your Google review prompt, or initiate a direct chat.",
      icon: "CheckCircle2",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-surface-subtle border-b border-border-hairline">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <Badge variant="neutral" dot={false} className="uppercase tracking-wider text-[11px] font-semibold mb-2">
            The Contactless Flow
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-2.5 leading-relaxed">
            From physical touch to digital interaction without extra friction.
          </p>
        </div>

        {/* 3-Step Hardware Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-surface-elevated border border-border-hairline rounded-2xl p-6 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-black tracking-tight text-slate-400">
                    {step.number}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-surface-subtle border border-border-hairline text-accent-primary flex items-center justify-center">
                    <Icon name={step.icon} className="w-4 h-4 text-accent-primary" />
                  </div>
                </div>

                <div className="mb-2">
                  <Badge variant="neutral" dot={false} className="text-[10px] font-semibold">
                    {step.badge}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
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
