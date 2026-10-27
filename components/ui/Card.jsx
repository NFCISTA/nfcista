import React from "react";

/**
 * NFCISTA Reusable Design System Card
 *
 * Implements clean surface containment:
 * - Hairline 1px border against canvas
 * - Restrained 12px radius (rounded-lg)
 * - Composable Header, Title, Content, and Footer components
 */
export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white border border-border-hairline rounded-lg shadow-2xs overflow-hidden ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div
      className={`px-5 py-4 border-b border-border-hairline flex flex-col space-y-1 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3
      className={`text-base font-semibold text-text-primary tracking-tight ${className}`.trim()}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p
      className={`text-xs text-text-secondary leading-relaxed ${className}`.trim()}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`p-5 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div
      className={`px-5 py-3.5 bg-surface-subtle/50 border-t border-border-hairline flex items-center justify-between gap-3 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
