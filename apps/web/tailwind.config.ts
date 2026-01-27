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
          },
          animation: {
            scroll: "scroll 40s linear infinite",
          },
          keyframes: {
            scroll: {
              "0%": { transform: "translateX(0)" },
              "100%": { transform: "translateX(-50%)" },
            },
          },
        }
    
  },
  plugins: []
};

export default config;
