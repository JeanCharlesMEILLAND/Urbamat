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
          DEFAULT: "#662D91",
          50: "#F4EEF8",
          100: "#E5D7EE",
          200: "#CBAFDD",
          300: "#B187CC",
          400: "#945FBC",
          500: "#662D91",
          600: "#56267A",
          700: "#451F62",
          800: "#34174A",
          900: "#220F32",
        },
        surface: {
          DEFAULT: "#F5F2EC",
          50: "#FBFAF7",
          100: "#F5F2EC",
          200: "#EAE5DA",
          300: "#D9D2C2",
        },
        neutral: {
          light: "#F4F2EE",
          dark: "#1F1F1D",
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
