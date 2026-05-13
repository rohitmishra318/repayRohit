/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cabinet Grotesk'", "'DM Sans'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: { blue: "#2563EB", indigo: "#4F46E5", teal: "#0D9488" },
        risk: { high: "#DC2626", medium: "#D97706", low: "#16A34A" },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.08)",
        "kpi": "inset 0 1px 0 rgb(255 255 255 / 0.8), 0 1px 3px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};