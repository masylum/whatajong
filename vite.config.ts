import { fileURLToPath, resolve } from "node:url"
import { defineConfig } from "vite"
import solid from "vite-plugin-solid"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import legacy from "@vitejs/plugin-legacy"

const legacyPluginOptions = {
  modernTargets: "since 2020-01-01, not dead",
  modernPolyfills: true,
  renderLegacyChunks: false,
} as const

const rootPath = fileURLToPath(new URL("./src/renderer", import.meta.url))
const outDir = fileURLToPath(new URL("./dist", import.meta.url))

export default defineConfig(() => {
  return {
    build: { target: "modules", outDir, emptyOutDir: true },
    root: rootPath,
    publicDir: `${rootPath}/public`,
    resolve: {
      alias: {
        "@": rootPath,
      },
    },
    plugins: [solid(), vanillaExtractPlugin(), legacy(legacyPluginOptions)],
  }
})
