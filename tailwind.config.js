/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── NFCISTA Premium Design System Colors ─────────────────────────────
      colors: {
        // Obsidian Luxury Theme Tokens (Homepage Redesign)
        ink: "#040507",
        "ink-alt": "#06080B",
        line: "#14171D",
        fg: "#F2F4F8",
        muted: "#9BA4B3",
        dim: "#7C8696",
        brand: "#2563EB",
        "brand-hover": "#3B6BFF",
        "brand-text": "#6F93FF",

        // Foundation tokens (Preserved for existing routes and components)
        canvas: "#FBFBFC",
        "surface-base": "#FFFFFF",
        "surface-subtle": "#F3F4F6",
        "surface-elevated": "#FFFFFF",
        "text-primary": "#0F172A",
        "text-secondary": "#475569",
        "text-muted": "#94A3B8",
        "border-hairline": "#E2E8F0",
        "border-strong": "#CBD5E1",
        "accent-primary": "#1D4ED8",
        "accent-hover": "#1E40AF",
        success: "#059669",
        warning: "#D97706",
        danger: "#DC2626",

        // Aligned Core Brand Tokens
        primary: {
          DEFAULT: "#1D4ED8",
          hover: "#1E40AF",
          container: "#2563eb",
          fixed: "#dbe1ff",
        },
        "on-primary": "#ffffff",
        "on-surface": "#0F172A",
        "on-surface-variant": "#475569",
        outline: "#94A3B8",
        "outline-variant": "#E2E8F0",
        background: "#FBFBFC",
        "on-background": "#0F172A",
        error: {
          DEFAULT: "#DC2626",
          container: "#fee2e2",
        },
        "on-error": "#ffffff",

        // Preserved legacy tokens for backward-compatible rendering
        surface: "#FFFFFF",
        "surface-dim": "#F3F4F6",
        "surface-bright": "#FFFFFF",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#F8FAFC",
        "surface-container": "#F1F5F9",
        "surface-container-high": "#E2E8F0",
        "surface-container-highest": "#CBD5E1",
        "surface-variant": "#F1F5F9",
        "surface-tint": "#1D4ED8",
        "inverse-surface": "#0F172A",
        "inverse-on-surface": "#F8FAFC",

        // Secondary & Tertiary
        secondary: {
          DEFAULT: "#006591",
          container: "#39b8fd",
        },
        "on-secondary": "#ffffff",
        tertiary: {
          DEFAULT: "#48566a",
          container: "#606e83",
        },
        "on-tertiary": "#ffffff",
      },

      // ── NFCISTA Typography Scale ─────────────────────────────────────────
      fontSize: {
        display: [
          "44px",
          { lineHeight: "52px", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        "display-mobile": [
          "32px",
          { lineHeight: "38px", letterSpacing: "-0.025em", fontWeight: "700" },
        ],
        h1: [
          "28px",
          { lineHeight: "36px", letterSpacing: "-0.025em", fontWeight: "700" },
        ],
        h2: [
          "20px",
          { lineHeight: "28px", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        h3: [
          "16px",
          { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        body: [
          "15px",
          { lineHeight: "22px", letterSpacing: "0", fontWeight: "400" },
        ],
        small: [
          "13px",
          { lineHeight: "18px", letterSpacing: "+0.005em", fontWeight: "400" },
        ],
        label: [
          "13px",
          { lineHeight: "16px", letterSpacing: "+0.01em", fontWeight: "600" },
        ],
        micro: [
          "11px",
          { lineHeight: "14px", letterSpacing: "+0.04em", fontWeight: "500" },
        ],

        // Preserved legacy typography tokens
        "headline-xl": [
          "36px",
          { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-xl-mobile": [
          "28px",
          { lineHeight: "34px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-lg": [
          "24px",
          { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "700" },
        ],
        "headline-md": [
          "20px",
          { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "body-lg": [
          "16px",
          { lineHeight: "24px", letterSpacing: "0", fontWeight: "400" },
        ],
        "body-md": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0", fontWeight: "400" },
        ],
        "body-sm": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "400" },
        ],
        "label-lg": [
          "15px",
          { lineHeight: "20px", letterSpacing: "-0.005em", fontWeight: "600" },
        ],
        "label-md": [
          "13px",
          { lineHeight: "18px", letterSpacing: "0", fontWeight: "600" },
        ],
        "label-sm": [
          "11px",
          { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "500" },
        ],
      },

      // ── NFCISTA Corrected Border Radius Hierarchy ────────────────────────
      borderRadius: {
        none: "0px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
        full: "9999px",
        DEFAULT: "8px",
      },

      // ── NFCISTA Geometric Spacing Scale ──────────────────────────────────
      spacing: {
        "2xs": "2px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        base: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
        // Legacy space tokens
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        gutter: "1rem",
        "gutter-desktop": "1.5rem",
        margin: "1rem",
        "margin-desktop": "2rem",
      },

      // ── Font Family ──────────────────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-inter-tight)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "var(--font-hanken)", "system-ui", "sans-serif"],
        mono: [
          "var(--font-jetbrains-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },

      // ── Keyframes & Animations (Obsidian Homepage) ─────────────────────────
      keyframes: {
        tapPulse: {
          "0%": { transform: "scale(0.7)", opacity: "0.9" },
          "100%": { transform: "scale(1.7)", opacity: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        tapPulse: "tapPulse 3.2s cubic-bezier(0, 0, 0.2, 1) infinite",
        fadeUp: "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },

      // ── Elevation & Shadows (Restrained Neutral Elevation) ───────────────
      boxShadow: {
        "2xs": "0 1px 2px 0 rgba(15,23,42,0.03)",
        card: "0 1px 3px 0 rgba(15,23,42,0.04), 0 1px 2px -1px rgba(15,23,42,0.02)",
        dropdown: "0 4px 6px -1px rgba(15,23,42,0.06), 0 2px 4px -2px rgba(15,23,42,0.03)",
        float: "0 10px 25px -5px rgba(15,23,42,0.08), 0 8px 10px -6px rgba(15,23,42,0.04)",
        // Neutralized button shadow — no blue glow
        "btn-primary": "0 1px 2px 0 rgba(15,23,42,0.05)",
      },

      // ── Motion & Animation Philosophy ────────────────────────────────────
      transitionDuration: {
        150: "150ms",
        200: "200ms",
      },
      transitionTimingFunction: {
        subtle: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};