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
        background: "#0B0F17",
        surface: "#131924",
        borderDark: "#1E293B",
        accentCyan: "#06B6D4",
        accentBlue: "#3B82F6",
        statusOnline: "#10B981",
        statusStarting: "#F59E0B",
        statusOffline: "#EF4444",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-cyber": "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
