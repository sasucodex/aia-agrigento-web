// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://aiaagrigento.it",
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    host: true,
  },
  redirects: {
    "/servizi": {
      status: 301,
      destination: "/area-associati",
    },
    "/utilita": {
      status: 301,
      destination: "/area-associati",
    },
    "/corso-arbitri": {
      status: 301,
      destination: "/diventa-arbitro",
    },
    "/news": {
      status: 301,
      destination: "/blog",
    },
  },
  adapter: vercel(),
});
