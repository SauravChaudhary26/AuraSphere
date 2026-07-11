/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "var(--ground)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        border: "var(--border)",
        primary: "var(--primary)",
        "primary-bright": "var(--primary-bright)",
        "on-primary": "var(--on-primary)",
        jade: "var(--jade)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
        serif: "var(--font-serif)",
      },
      borderColor: { DEFAULT: "var(--border)" },
      boxShadow: { card: "var(--shadow)", glow: "var(--glow)" },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};
