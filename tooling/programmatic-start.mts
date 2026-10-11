import { resolve } from "node:path"
import type { Plugin } from "vite"

/** Start currently obtains its asset manifest from the file-route generator.
 * Supply the same metadata for our explicit route tree without generating routes.
 * This compatibility hook must be checked when upgrading TanStack Start.
 */
export function programmaticStart(routes: Record<string, string>): Plugin {
  return {
    name: "martyrs:programmatic-start-manifest",
    configResolved(config) {
      const manifest = Object.fromEntries(
        Object.entries(routes).map(([id, file]) => [
          id,
          {
            filePath: resolve(config.root, file),
            children:
              id === "__root__"
                ? Object.keys(routes).filter((key) => key !== "__root__")
                : [],
          },
        ])
      )
      const target = globalThis as typeof globalThis & {
        TSS_ROUTES_MANIFEST: typeof manifest
      }
      target.TSS_ROUTES_MANIFEST = manifest
    },
  }
}
