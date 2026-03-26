import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://bookd.ai",
  output: "static",
  adapter: cloudflare(),
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Inter",
        cssVariable: "--font-inter",
      },
      {
        provider: fontProviders.google(),
        name: "Noto Sans Arabic",
        cssVariable: "--font-arabic",
      },
    ],
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ar", "de"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
