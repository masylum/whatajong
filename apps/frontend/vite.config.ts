import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import solid from "vite-plugin-solid"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"

export default defineConfig(() => {
  return {
    build: {
      sourcemap: true,
      target: "esnext",
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [solid(), vanillaExtractPlugin()],
  }
})
