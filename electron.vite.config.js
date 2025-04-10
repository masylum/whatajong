import { resolve } from "node:path"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import legacy from "@vitejs/plugin-legacy"
import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import solid from "vite-plugin-solid"

const legacyPluginOptions = {
  modernTargets: "since 2020-01-01, not dead",
  modernPolyfills: true,
  renderLegacyChunks: false,
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve("src/renderer"),
      },
    },
    plugins: [solid(), vanillaExtractPlugin(), legacy(legacyPluginOptions)],
  },
})
