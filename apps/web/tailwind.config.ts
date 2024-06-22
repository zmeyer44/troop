import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./assets/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        cal: ["var(--font-cal)"],
      },

      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        frosted: {
          DEFAULT: "hsl(var(--frosted)/0.2)",
          foreground: "hsl(var(--frosted-foreground)/0.7)",
          active: "hsl(var(--frosted-foreground)/0.9)",
          10: "hsl(var(--frosted)/0.1)",
          20: "hsl(var(--frosted)/0.2)",
          30: "hsl(var(--frosted)/0.3)",
          40: "hsl(var(--frosted)/0.4)",
          50: "hsl(var(--frosted)/0.5)",
          60: "hsl(var(--frosted)/0.6)",
          70: "hsl(var(--frosted)/0.7)",
          80: "hsl(var(--frosted)/0.8)",
          90: "hsl(var(--frosted)/0.9)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      flex: {
        2: "2",
        3: "3",
        4: "4",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        99: "99",
        mobileTabs: "900",
        "header-": "919",
        header: "920",
        "header+": "921",
        headerDialog: "922",
        "overlay-": "929",
        overlay: "930",
        "overlay+": "931",
        "modal-": "939",
        modal: "940",
        "modal+": "941",
        "toast-": "949",
        toast: "950",
        "toast+": "951",
        "top-": "959",
        top: "960",
        "top+": "961",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
    require("tailwind-scrollbar"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;

export default config;
