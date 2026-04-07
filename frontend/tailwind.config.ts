import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
            },
            colors: {
                surface: "rgba(255,255,255,0.04)",
                border: "rgba(255,255,255,0.08)",
            },
        },
    },
    plugins: [],
};

export default config;
