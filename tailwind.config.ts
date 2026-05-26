import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        ink: {
          900: "#0a0a0c",
          700: "#2a2a30",
          500: "#6b6b76",
          300: "#b8b8c2",
        },
        glass: {
          50: "rgba(255,255,255,0.55)",
          100: "rgba(255,255,255,0.72)",
          200: "rgba(255,255,255,0.85)",
        },
      },
      boxShadow: {
        glass:
          "0 1px 0 0 rgba(255,255,255,0.9) inset, 0 1px 2px rgba(15,15,20,0.04), 0 8px 24px -8px rgba(15,15,20,0.12)",
        pill:
          "0 1px 0 0 rgba(255,255,255,0.9) inset, 0 2px 6px rgba(15,15,20,0.06), 0 12px 32px -10px rgba(15,15,20,0.18)",
        soft: "0 2px 6px rgba(15,15,20,0.05), 0 14px 36px -16px rgba(15,15,20,0.14)",
      },
      backdropBlur: {
        xs: "4px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        shimmer: "shimmer 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
