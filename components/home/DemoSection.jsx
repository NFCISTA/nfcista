import Link from "next/link";

export default function DemoSection() {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-primary via-primary-container to-[#17489A] rounded-3xl p-8 sm:p-12 text-white shadow-float relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white uppercase tracking-wider mb-4 border border-white/10">
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              Live Preview
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              See a Digital Business Card in Action
            </h2>

            <p className="text-body-lg text-white/80 leading-relaxed mb-8">
              See what your customers see after tapping your NFC card. Try our live demo customer profile to experience the one-tap contact buttons, directions, and the Save Contact feature.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/p/demo-customer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-primary font-bold text-label-lg hover:bg-white/90 shadow-card transition-all active:scale-[0.98]"
              >
                <span>View Demo Card</span>
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </Link>
              <span className="text-xs text-white/70">
                Safe demo customer profile • No login required
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
