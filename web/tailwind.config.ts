import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        graphite: { 900: "#0a0a0b", 800: "#111113", 700: "#1a1a1d", 600: "#26262b" },
        titanium: { 100: "#e8e6e1", 300: "#bfbcb4", 500: "#8d8a83", 700: "#55534e" },
        deep: "#0b1b4d",
        violet: { glow: "#6d4aff" },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: { marquee: "marquee 45s linear infinite" },
    },
  },
  plugins: [],
};

export default config;
