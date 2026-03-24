import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B3A6B",
          50: "#E8EDF5",
          100: "#D1DBEB",
          200: "#A3B7D7",
          300: "#7593C3",
          400: "#476FAF",
          500: "#1B3A6B",
          600: "#162F56",
          700: "#112441",
          800: "#0B182B",
          900: "#060C16",
        },
        accent: {
          DEFAULT: "#E8A020",
          50: "#FDF5E6",
          100: "#FAEACC",
          200: "#F5D599",
          300: "#F0C066",
          400: "#ECAB33",
          500: "#E8A020",
          600: "#BA801A",
          700: "#8B6013",
          800: "#5D400D",
          900: "#2E2006",
        },
        neutral: {
          light: "#F4F2EE",
          dark: "#2C2C2A",
        },
        success: "#1D7A50",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      lineHeight: {
        relaxed: "1.7",
      },
      maxWidth: {
        container: "1280px",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
