import React from "react";

/**
 * ProfileLinkSection — Categorized section wrapper
 * Renders small uppercase monospaced section headers (e.g. CONTACT, SOCIAL, BUSINESS).
 *
 * @param {{ title: string, children: React.ReactNode, className?: string }} props
 */
export default function ProfileLinkSection({ title, children, className = "" }) {
  // If no children rendered, omit the entire section
  if (!children) return null;

  return (
    <section className={`space-y-2.5 ${className}`.trim()} aria-label={`${title} section`}>
      <div className="flex items-center gap-2.5 px-1 pt-1">
        <h2 className="text-[11px] sm:text-[11.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          {title}
        </h2>
        <div className="h-px bg-slate-100 flex-1" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </section>
  );
}
