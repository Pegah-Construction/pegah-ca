import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f6f5f2",
        ink: "#1b1e24",
        // Deep corporate blue brand scale
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
          900: "#0f1f4d",
        },
        concrete: {
          100: "#ece9e3",
          200: "#dcd8cf",
          300: "#bfbab0",
          400: "#9a958b",
          500: "#6f6a61",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        "8xl": "88rem",
      },
      letterSpacing: {
        label: "0.18em",
      },
    },
  },
  plugins: [],
};

export default config;
