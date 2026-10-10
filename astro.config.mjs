import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
// import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"
import cloudflare from "@astrojs/cloudflare"

// https://astro.build/config
export default defineConfig({
  site: "https://elizabethlegrange.com",
  output: "hybrid",
  adapter: cloudflare(),
  integrations: [mdx(), solidJs(), tailwind({ applyBaseStyles: false })],
  vite: {
    ssr: {
      external: ["fs", "node:fs"],
    },
  },
})