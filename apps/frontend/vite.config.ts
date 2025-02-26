import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import solid from "vite-plugin-solid"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import legacy from "@vitejs/plugin-legacy"

const legacyPluginOptions = {
  modernTargets: "since 2020-01-01, not dead",
  modernPolyfills: true,
  renderLegacyChunks: false,
} as const

export default defineConfig(() => {
  return {
    build: { target: "modules" },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [solid(), vanillaExtractPlugin(), legacy(legacyPluginOptions)],
  }
})
