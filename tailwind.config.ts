import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./tests/**/*.{ts,tsx}", "./e2e/**/*.ts"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        credible: "rgb(var(--color-credible) / <alpha-value>)",
        caution: "rgb(var(--color-caution) / <alpha-value>)",
        critical: "rgb(var(--color-critical) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 18px 50px rgb(20 32 51 / 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
