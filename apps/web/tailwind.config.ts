import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        horizon: {
          50: "#eef2ff",
          500: "#6366f1",
          700: "#4338ca"
        }
      }
    }
  },
  plugins: []
};

export default config;
