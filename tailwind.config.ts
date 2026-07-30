import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Blueprint & Ironwork" palette. Theme-aware tokens are driven by CSS
        // variables (see globals.css :root / .dark) so the whole UI flips
        // between light and dark. rgb(... / <alpha-value>) keeps /opacity working.
        paper: "rgb(var(--c-paper) / <alpha-value>)",       // page background
        surface: "rgb(var(--c-surface) / <alpha-value>)",   // card / section surface (was bg-white)
        ink: "rgb(var(--c-ink) / <alpha-value>)",           // primary text & headings
        brand: {
          50: "rgb(var(--c-brand-50) / <alpha-value>)",     // tinted card background (flips)
          100: "#dbe3f6",
          200: "#b8c8ec",
          300: "#8da6df",
          400: "#5c7ccd",
          500: "#3a5abf",
          // 600–900 stay saturated (used as button / band backgrounds with white
          // text). Brand-blue *text* is lightened for dark mode via .dark overrides
          // in globals.css so links stay readable.
          600: "#2a45a6",
          700: "#1f3a93",
          800: "#172c70",
          900: "#12224f",
        },
        // Safety amber — the single decisive accent
        accent: {
          50: "#fdf4e6",
          100: "#f9e2be",
          200: "#f3c883",
          300: "#ecad4e",
          400: "#e79a2f",
          500: "#e08a1e",
          600: "#c0730f",
          700: "rgb(var(--c-accent-700) / <alpha-value>)",  // eyebrow / label text (brightens in dark)
          800: "#6f4209",
          900: "#4b2c06",
        },
        // Cool steel / concrete neutrals (all flip)
        concrete: {
          50: "rgb(var(--c-concrete-50) / <alpha-value>)",
          100: "rgb(var(--c-concrete-100) / <alpha-value>)",
          200: "rgb(var(--c-concrete-200) / <alpha-value>)",
          300: "rgb(var(--c-concrete-300) / <alpha-value>)",
          400: "rgb(var(--c-concrete-400) / <alpha-value>)", // muted secondary text
          500: "rgb(var(--c-concrete-500) / <alpha-value>)", // strong secondary text
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "8xl": "88rem",
      },
      letterSpacing: {
        label: "0.06em",
      },
    },
  },
  plugins: [],
};

export default config;
