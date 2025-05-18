import { fileURLToPath, resolve } from "node:url"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import legacy from "@vitejs/plugin-legacy"
import { defineConfig } from "vite"
import bundlesize from "vite-plugin-bundlesize"
import solid from "vite-plugin-solid"

const legacyPluginOptions = {
  modernTargets: "since 2020-01-01, not dead",
  modernPolyfills: true,
  renderLegacyChunks: false,
} as const

const rootPath = fileURLToPath(new URL("./src/renderer", import.meta.url))
const outDir = fileURLToPath(new URL("./dist", import.meta.url))

export default defineConfig(() => {
  return {
    base: process.env.VITE_ITCH_IO ? "" : undefined,
    build: {
      target: "modules",
      outDir,
      emptyOutDir: true,
      sourcemap: "hidden" as const,
    },
    root: rootPath,
    publicDir: `${rootPath}/public`,
    resolve: {
      alias: {
        "@": rootPath,
      },
    },
    plugins: [
      solid(),
      vanillaExtractPlugin(),
      legacy(legacyPluginOptions),
      bundlesize(),
    ],
  }
})
