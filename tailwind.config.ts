import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // New v6 palette
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          light: "rgb(var(--color-primary-light) / <alpha-value>)",
          soft: "rgb(var(--color-primary-soft) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          light: "rgb(var(--color-secondary-light) / <alpha-value>)",
          soft: "rgb(var(--color-secondary-soft) / <alpha-value>)",
          dark: "rgb(var(--color-secondary-dark) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--color-gold) / <alpha-value>)",
          light: "rgb(var(--color-gold-light) / <alpha-value>)",
          soft: "rgb(var(--color-gold-soft) / <alpha-value>)",
        },
        pink: {
          DEFAULT: "rgb(var(--color-pink) / <alpha-value>)",
          light: "rgb(var(--color-pink-light) / <alpha-value>)",
          soft: "rgb(var(--color-pink-soft) / <alpha-value>)",
        },
        "accent-blue": {
          DEFAULT: "rgb(var(--color-accent-blue) / <alpha-value>)",
          light: "rgb(var(--color-accent-blue-light) / <alpha-value>)",
          soft: "rgb(var(--color-accent-blue-soft) / <alpha-value>)",
        },
        "accent-purple": {
          DEFAULT: "rgb(var(--color-accent-purple) / <alpha-value>)",
          light: "rgb(var(--color-accent-purple-light) / <alpha-value>)",
          soft: "rgb(var(--color-accent-purple-soft) / <alpha-value>)",
        },
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        "bg-main": "rgb(var(--color-bg-main))",
        "bg-card": "rgb(var(--color-bg-card))",
        "text-muted": "rgb(var(--color-text-muted))",
        "border-soft": "rgb(var(--color-border))",

        // Backwards compat aliases
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        lavender: {
          DEFAULT: "rgb(var(--color-lavender) / <alpha-value>)",
          light: "rgb(var(--color-lavender-light) / <alpha-value>)",
          soft: "rgb(var(--color-lavender-soft) / <alpha-value>)",
        },
        blue: {
          DEFAULT: "rgb(var(--color-blue) / <alpha-value>)",
          light: "rgb(var(--color-blue-light) / <alpha-value>)",
          soft: "rgb(var(--color-blue-soft) / <alpha-value>)",
        },
        green: {
          DEFAULT: "rgb(var(--color-green) / <alpha-value>)",
          light: "rgb(var(--color-green-light) / <alpha-value>)",
          soft: "rgb(var(--color-green-soft) / <alpha-value>)",
        },
        peach: {
          DEFAULT: "rgb(var(--color-peach) / <alpha-value>)",
          light: "rgb(var(--color-peach-light) / <alpha-value>)",
          soft: "rgb(var(--color-peach-soft) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-gold) / <alpha-value>)",
          light: "rgb(var(--color-gold-light) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          soft: "rgb(var(--color-surface-soft) / <alpha-value>)",
          raised: "rgb(var(--color-surface-raised) / <alpha-value>)",
        },
        text: {
          DEFAULT: "rgb(var(--color-text) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
          inverse: "rgb(var(--color-text-inverse) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
          soft: "rgb(var(--color-border-soft) / <alpha-value>)",
        },
        xp: "rgb(var(--color-xp) / <alpha-value>)",
        streak: "rgb(var(--color-streak) / <alpha-value>)",
        badge: "rgb(var(--color-badge) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 3px rgb(0 0 0 / 0.03), 0 4px 12px rgb(0 0 0 / 0.02)",
        "card-hover": "0 8px 30px rgb(0 0 0 / 0.06), 0 2px 8px rgb(0 0 0 / 0.03)",
        glow: "0 0 30px rgba(79, 70, 229, 0.12)",
        "glow-soft": "0 0 20px rgba(79, 70, 229, 0.08)",
        "glow-gold": "0 0 20px rgba(245, 165, 36, 0.15)",
        "glow-pink": "0 0 20px rgba(255, 92, 138, 0.12)",
        pill: "0 4px 15px rgba(79, 70, 229, 0.20)",
        "pill-gold": "0 4px 15px rgba(245, 165, 36, 0.25)",
        "pill-pink": "0 4px 15px rgba(255, 92, 138, 0.20)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "fade-scale-in": "fadeScaleIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseGlow 3s ease-in-out infinite",
        "float-slow": "floatSlow 6s ease-in-out infinite",
        "float-medium": "floatMedium 4s ease-in-out infinite",
        "float-fast": "floatFast 3s ease-in-out infinite",
        "coin-sparkle": "coinSparkle 0.6s ease-in-out",
        "progress-fill": "progressFill 1s ease-out both",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeScaleIn: {
          from: { opacity: "0", transform: "scale(0.95) translateY(10px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(79, 70, 229, 0.10)" },
          "50%": { boxShadow: "0 0 30px rgba(79, 70, 229, 0.20)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        floatMedium: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        floatFast: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        coinSparkle: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "50%": { transform: "scale(1.2) rotate(5deg)" },
        },
        progressFill: {
          from: { width: "0%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
