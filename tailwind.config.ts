/**
 * TAILWIND CSS v4 — CONFIGURATION
 *
 * ⚠️  In Tailwind CSS v4, the theme is configured entirely via CSS
 *   using `@theme {}` blocks inside `globals.css`. This file is NOT
 *   used for theme tokens. See: src/app/globals.css → @theme {}
 *
 * This file is kept for:
 *   - Content path configuration (file scanning for class detection)
 *   - Any v4-supported plugin registrations
 *
 * References:
 *   https://tailwindcss.com/docs/v4-beta
 */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Theme extensions belong in globals.css @theme {} in Tailwind v4.
  // Do NOT add colors, fonts, spacing, or animations here.
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
