export default function ComparisonTable() {
  const rows = [
    {
      factor: "What you get",
      typical: "Blank plastic tag or loose sticker",
      nfcista: "Finished, branded piece ready for your counter or pocket",
    },
    {
      factor: "Setup",
      typical: "Manual programming and encoding required by customer",
      nfcista: "Fully programmed and tap-tested on real devices before dispatch",
    },
    {
      factor: "Design",
      typical: "Generic template with sticker overlays",
      nfcista: "Custom-designed around your official logo and brand colors",
    },
    {
      factor: "After the tap",
      typical: "Cluttered multi-link tree or unoptimized page",
      nfcista: "One clear, frictionless business goal per tap",
    },
    {
      factor: "Support",
      typical: "Automated chatbot or zero follow-up",
      nfcista: "Direct human assistance for setup, queries, and link updates",
    },
  ];

  return (
    <section id="difference" className="py-24 md:py-32 bg-ink-alt border-b border-line">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="font-mono text-xs uppercase tracking-wider text-brand-text mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            <span>The NFCISTA Standard</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-fg tracking-[-0.035em]">
            Other sellers ship a chip. We ship the whole result.
          </h2>
          <p className="font-sans text-sm sm:text-base text-muted mt-3">
            Compare a standard raw tag against our complete, tested hardware solution.
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="rounded-[24px] bg-ink border border-line overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-line bg-ink-alt/60">
                  <th scope="col" className="p-5 sm:p-6 font-mono text-xs uppercase tracking-wider text-dim w-1/4">
                    Comparison Factor
                  </th>
                  <th scope="col" className="p-5 sm:p-6 font-mono text-xs uppercase tracking-wider text-muted w-3/8">
                    Typical NFC Seller
                  </th>
                  <th scope="col" className="p-5 sm:p-6 font-mono text-xs uppercase tracking-wider text-brand-text w-3/8 bg-brand/5 border-l border-line">
                    <span className="flex items-center gap-2 font-bold">
                      <span className="w-2 h-2 rounded-full bg-brand" />
                      NFCISTA
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {rows.map((row) => (
                  <tr key={row.factor} className="hover:bg-ink-alt/30 transition-colors">
                    {/* Factor Name */}
                    <td className="p-5 sm:p-6 font-display font-semibold text-fg">
                      {row.factor}
                    </td>

                    {/* Typical Seller */}
                    <td className="p-5 sm:p-6 font-sans text-muted">
                      <div className="flex items-start gap-2.5">
                        <span className="text-dim mt-0.5 select-none" aria-hidden="true">—</span>
                        <span>{row.typical}</span>
                      </div>
                    </td>

                    {/* NFCISTA */}
                    <td className="p-5 sm:p-6 font-sans text-fg bg-brand/[0.02] border-l border-line">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="font-medium">{row.nfcista}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
