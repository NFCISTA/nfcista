import React from "react";

/**
 * NFCISTA Reusable Design System Badge
 *
 * Implements compact, restrained status tags:
 * - active: Card or login active
 * - inactive: Card disabled or profile unassigned
 * - pending: Setup pending
 * - danger: Error or banned
 * - verified: Hardware or identity verified
 */
export default function Badge({
  children,
  variant = "neutral", // "active" | "inactive" | "pending" | "danger" | "verified" | "neutral"
  dot = true,
  className = "",
  ...props
}) {
  const variantStyles = {
    active: {
      wrapper: "bg-emerald-50/80 text-emerald-800 border-emerald-200/80",
      dot: "bg-emerald-500",
    },
    success: {
      wrapper: "bg-emerald-50/80 text-emerald-800 border-emerald-200/80",
      dot: "bg-emerald-500",
    },
    inactive: {
      wrapper: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
    },
    neutral: {
      wrapper: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
    },
    pending: {
      wrapper: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
    },
    warning: {
      wrapper: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
    },
    danger: {
      wrapper: "bg-red-50 text-red-800 border-red-200",
      dot: "bg-red-500",
    },
    error: {
      wrapper: "bg-red-50 text-red-800 border-red-200",
      dot: "bg-red-500",
    },
    verified: {
      wrapper: "bg-blue-50 text-blue-800 border-blue-200",
      dot: "bg-primary",
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[11px] font-medium leading-none tracking-normal select-none ${style.wrapper} ${className}`.trim()}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />}
      {children}
    </span>
  );
}
