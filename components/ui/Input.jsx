import React, { forwardRef } from "react";

/**
 * NFCISTA Reusable Design System Input
 *
 * Implements standard form input styling:
 * - 40px desktop / 44px mobile touch target
 * - Hairline 1px border with crisp cobalt focus ring
 * - Built-in label, helper, and error state layout
 */
const Input = forwardRef(function Input(
  {
    label,
    id,
    type = "text",
    placeholder,
    value,
    defaultValue,
    onChange,
    error,
    helperText,
    disabled = false,
    required = false,
    icon,
    iconPosition = "left",
    className = "",
    wrapperClassName = "",
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
  const describedBy = errorId || helperId || undefined;

  return (
    <div className={`flex flex-col space-y-1.5 w-full ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-text-primary flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center w-full">
        {icon && iconPosition === "left" && (
          <span className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={`w-full min-h-[44px] sm:min-h-[40px] h-10 px-3.5 py-2 text-base sm:text-sm text-text-primary bg-white rounded-md border transition-all duration-150 placeholder:text-text-muted focus:outline-none focus:ring-1 disabled:opacity-40 disabled:cursor-not-allowed ${
            icon && iconPosition === "left" ? "pl-9" : ""
          } ${icon && iconPosition === "right" ? "pr-9" : ""} ${
            error
              ? "border-danger focus:border-danger focus:ring-danger text-danger"
              : "border-border-hairline hover:border-border-strong focus:border-primary focus:ring-primary"
          } ${className}`.trim()}
          {...props}
        />

        {icon && iconPosition === "right" && (
          <span className="absolute right-3 text-text-muted pointer-events-none flex items-center justify-center">
            {icon}
          </span>
        )}
      </div>

      {error ? (
        <p id={errorId} className="text-xs text-danger font-medium leading-none mt-1">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-text-muted leading-none mt-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
