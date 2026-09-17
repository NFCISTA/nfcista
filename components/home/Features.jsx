export default function Features() {
  const features = [
    {
      title: "One-Tap Sharing",
      description: "Instant contact transfer using built-in NFC technology.",
      icon: "contactless",
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Digital Business Profile",
      description: "A modern web profile highlighting your role, company, and bio.",
      icon: "badge",
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Save Contact",
      description: "One-tap standard vCard (.vcf) download directly into phone contacts.",
      icon: "contact_page",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Call & WhatsApp",
      description: "Direct click-to-call and instant WhatsApp chat buttons.",
      icon: "chat",
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Instagram",
      description: "Direct link to your Instagram handle to showcase your portfolio.",
      icon: "photo_camera",
      color: "text-pink-600 bg-pink-50",
    },
    {
      title: "Email",
      description: "One-tap email composition with your address pre-filled.",
      icon: "mail",
      color: "text-sky-600 bg-sky-50",
    },
    {
      title: "Google Review",
      description: "Direct link for clients to leave verified reviews on your Google profile.",
      icon: "star",
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Google Maps / Address",
      description: "Interactive address link that opens Google Maps for navigation.",
      icon: "location_on",
      color: "text-rose-600 bg-rose-50",
    },
    {
      title: "No App Required",
      description: "Customers can open your digital profile directly from the NFC link without installing a dedicated NFCISTA app.",
      icon: "devices",
      color: "text-violet-600 bg-violet-50",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white border-y border-outline-variant/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            Key Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            Everything You Need to Share Your Business
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            Every feature is designed to make in-person networking friction-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card hover:shadow-float transition-all group flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <span className="material-symbols-outlined text-[24px]">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
