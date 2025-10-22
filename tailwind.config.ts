import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate"
import tailwindcssTypography from "@tailwindcss/typography"
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  darkMode: 'selector',
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./constants/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [tailwindcssAnimate, tailwindcssTypography],
} satisfies Config;

export default config;
