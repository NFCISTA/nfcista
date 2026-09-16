/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Stitch "Digital Identity" color tokens ──────────────────────────
      colors: {
        // Surface hierarchy
        "surface":                   "#f8f9ff",
        "surface-dim":               "#cbdbf5",
        "surface-bright":            "#f8f9ff",
        "surface-container-lowest":  "#ffffff",
        "surface-container-low":     "#eff4ff",
        "surface-container":         "#e5eeff",
        "surface-container-high":    "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "surface-variant":           "#d3e4fe",
        "surface-tint":              "#0053db",
        // On-surface
        "on-surface":         "#0b1c30",
        "on-surface-variant": "#434655",
        // Inverse
        "inverse-surface":    "#213145",
        "inverse-on-surface": "#eaf1ff",
        // Outline
        "outline":         "#737686",
        "outline-variant": "#c3c6d7",
        // Primary
        "primary":              "#004ac6",
        "on-primary":           "#ffffff",
        "primary-container":    "#2563eb",
        "on-primary-container": "#eeefff",
        "inverse-primary":      "#b4c5ff",
        "primary-fixed":        "#dbe1ff",
        "primary-fixed-dim":    "#b4c5ff",
        "on-primary-fixed":         "#00174b",
        "on-primary-fixed-variant": "#003ea8",
        // Secondary
        "secondary":              "#006591",
        "on-secondary":           "#ffffff",
        "secondary-container":    "#39b8fd",
        "on-secondary-container": "#004666",
        "secondary-fixed":        "#c9e6ff",
        "secondary-fixed-dim":    "#89ceff",
        "on-secondary-fixed":         "#001e2f",
        "on-secondary-fixed-variant": "#004c6e",
        // Tertiary
        "tertiary":              "#48566a",
        "on-tertiary":           "#ffffff",
        "tertiary-container":    "#606e83",
        "on-tertiary-container": "#e9f0ff",
        "tertiary-fixed":        "#d5e3fc",
        "tertiary-fixed-dim":    "#b9c7df",
        "on-tertiary-fixed":         "#0d1c2e",
        "on-tertiary-fixed-variant": "#3a485b",
        // Error
        "error":              "#ba1a1a",
        "on-error":           "#ffffff",
        "error-container":    "#ffdad6",
        "on-error-container": "#93000a",
        // Background
        "background":    "#f8f9ff",
        "on-background": "#0b1c30",
      },

      // ── Stitch typography scale ──────────────────────────────────────────
      fontSize: {
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

      // ── Stitch border-radius tokens ──────────────────────────────────────
      borderRadius: {
        DEFAULT: "0.25rem",
        sm:     "0.25rem",
        md:     "0.75rem",
        lg:     "0.5rem",
        xl:     "0.75rem",
        "2xl":  "1rem",
        "3xl":  "1.5rem",
        full:   "9999px",
      },

      // ── Stitch spacing tokens ────────────────────────────────────────────
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        "gutter":          "1rem",
        "gutter-desktop":  "1.5rem",
        "margin":          "1rem",
        "margin-desktop":  "2rem",
      },

      // ── Font family ──────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
      },

      // ── Elevation shadows ────────────────────────────────────────────────
      boxShadow: {
        // Level 1 — card surfaces
        card: "0 1px 3px 0 rgba(15,23,42,0.04), 0 1px 2px -1px rgba(15,23,42,0.02)",
        // Level 2 — floating / modal
        float: "0 10px 25px -5px rgba(15,23,42,0.08), 0 8px 10px -6px rgba(15,23,42,0.04)",
        // Primary button glow
        "btn-primary": "0 4px 14px 0 rgba(37,99,235,0.25)",
      },
    },
  },
  plugins: [],
};