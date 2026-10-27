import React from "react";
import Link from "next/link";

/**
 * NFCISTA Reusable Design System Button
 *
 * Implements the tactile, engineered button hierarchy:
 * - primary: Deep cobalt solid
 * - secondary: Crisp neutral surface with hairline border
 * - ghost: Minimal transparent action
 * - destructive: Soft tinted error action
 */
export default function Button({
  children,
  variant = "primary", // "primary" | "secondary" | "ghost" | "destructive"
  size = "md", // "sm" | "md" | "lg" | "icon"
  href,
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,
  icon,
  iconPosition = "left",
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium font-sans transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-1 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100";

  const variantStyles = {
    primary:
      "bg-primary hover:bg-accent-hover text-white border border-transparent shadow-btn-primary",
    secondary:
      "bg-white hover:bg-surface-subtle text-text-primary border border-border-hairline hover:border-border-strong shadow-2xs",
    ghost:
      "bg-transparent hover:bg-surface-subtle text-text-secondary hover:text-text-primary border border-transparent",
    destructive:
      "bg-red-50 hover:bg-red-100 text-danger border border-red-200/80 shadow-2xs",
  };

  const sizeStyles = {
    sm: "h-8 px-3 text-xs rounded-md gap-1.5",
    md: "h-10 sm:h-10 min-h-[44px] sm:min-h-[40px] px-4 text-sm rounded-md gap-2",
    lg: "h-12 px-6 text-base rounded-lg gap-2.5",
    icon: "h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] p-0 rounded-md",
  };

  const combinedClasses = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${
    sizeStyles[size] || sizeStyles.md
  } ${className}`.trim();

  const content = (
    <>
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!isLoading && icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClasses} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={combinedClasses}
      {...props}
    >
      {content}
    </button>
  );
}
