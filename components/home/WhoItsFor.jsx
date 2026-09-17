export default function WhoItsFor() {
  const personas = [
    { title: "Business Owners", icon: "store" },
    { title: "Freelancers", icon: "laptop_mac" },
    { title: "Sales Professionals", icon: "trending_up" },
    { title: "Real Estate Professionals", icon: "home_work" },
    { title: "Creators", icon: "palette" },
    { title: "Consultants", icon: "psychology" },
    { title: "Service Businesses", icon: "handshake" },
    { title: "Entrepreneurs", icon: "rocket_launch" },
  ];

  return (
    <section className="py-20 bg-white border-y border-outline-variant/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            Who It&apos;s For
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            Built for Modern Professionals
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            Engineered for anyone who connects with clients and partners in person.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {personas.map((p) => (
            <div
              key={p.title}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 text-center shadow-card hover:border-primary/40 hover:shadow-float transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">{p.icon}</span>
              </div>
              <span className="text-label-md font-semibold text-on-surface">
                {p.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
