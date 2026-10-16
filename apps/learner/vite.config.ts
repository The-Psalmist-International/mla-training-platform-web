import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { programmaticStart } from "../../tooling/programmatic-start.mts"
import { targetedVendorChunks } from "../../tooling/vendor-chunks.mts"
import { routeFiles } from "./src/route-definitions.ts"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    programmaticStart(routeFiles),
    targetedVendorChunks(),
    devtools(),
    tailwindcss(),
    tanstackStart({ router: { enableRouteGeneration: false } }),
    nitro(),
    viteReact(),
  ],
})

export default config
