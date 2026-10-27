import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        serif: ['"Playfair Display"', "serif"],
        display: ['"Bebas Neue"', "sans-serif"],
      },
      colors: {
        brand: {
          red: "#E8220A",
          redHover: "#CC1C07",
          gold: "#D4AF37",
          navy: "#0C1220",
          card: "#121622",
          surface: "#172138",
          border: "#1F2639",
          borderLight: "#243050",
          subtle: "#8E9BB2",
        },
      },
    },
  },
  plugins: [],
};
export default config;

