/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        po: {
          bg: "#07090d",
          panel: "#0f141c",
          line: "rgba(120,160,200,0.14)",
          accent: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
};
