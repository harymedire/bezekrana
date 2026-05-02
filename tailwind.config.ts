import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        coral: {
          50: "#FFF1F0",
          100: "#FFE2E0",
          200: "#FFC4C0",
          300: "#FFA39E",
          400: "#FF837C",
          500: "#FF6B6B",
          600: "#E84F4F",
          700: "#C73838",
          800: "#9F2828",
          900: "#7A1D1D",
        },
        sun: {
          50: "#FFFBE6",
          100: "#FFF6BF",
          200: "#FFEE82",
          300: "#FFE556",
          400: "#FFDB3F",
          500: "#FFD93D",
          600: "#E5BD1F",
          700: "#B89510",
          800: "#8C6F08",
          900: "#665004",
        },
        teal: {
          50: "#E8F9F7",
          100: "#CFF3EE",
          200: "#A7E8DF",
          300: "#7FDED0",
          400: "#5ED4C2",
          500: "#4ECDC4",
          600: "#33B0A6",
          700: "#268B83",
          800: "#1B6660",
          900: "#114641",
        },
        plum: {
          50: "#F4EFF9",
          100: "#E6D9F0",
          200: "#CFB6E4",
          300: "#B591D2",
          400: "#9B72C1",
          500: "#7F58A8",
          600: "#6B4E9B",
          700: "#553C7A",
          800: "#3F2C5A",
          900: "#291D3B",
        },
        cream: "#FFF9F2",
      },
      fontFamily: {
        display: ['"Baloo 2"', "system-ui", "sans-serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        playful: "0 8px 0 0 rgba(107, 78, 155, 0.15)",
        "playful-hover": "0 4px 0 0 rgba(107, 78, 155, 0.15)",
        soft: "0 10px 30px -10px rgba(107, 78, 155, 0.25)",
      },
      borderRadius: {
        bubble: "1.75rem",
      },
      animation: {
        wiggle: "wiggle 2s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
