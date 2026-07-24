import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Blueprint & Ironwork" palette
        paper: "#fafbfd",
        ink: "#12224f", // blueprint navy — primary text & headings
        // Deep corporate blue brand scale (centres on brand blue #1f3a93)
        brand: {
          50: "#eef2fb",
          100: "#dbe3f6",
          200: "#b8c8ec",
          300: "#8da6df",
          400: "#5c7ccd",
          500: "#3a5abf",
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
          700: "#985a0d",
          800: "#6f4209",
          900: "#4b2c06",
        },
        // Cool steel / concrete neutrals
        concrete: {
          50: "#f4f6f9",
          100: "#eef1f5",
          200: "#dde2ea",
          300: "#c1c8d4",
          // Steel gray — muted secondary text, icons, borders
          400: "#5b6472",
          // Dark steel-navy — strong secondary text (accessible on light)
          500: "#33405c",
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
