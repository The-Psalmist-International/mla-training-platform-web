import type { Plugin } from "vite"

export function targetedVendorChunks(): Plugin {
  return {
    name: "martyrs:targeted-vendor-chunks",
    config() {
      return {
        environments: {
          client: {
            build: {
              rolldownOptions: {
                preserveEntrySignatures: false,
                output: {
                  // Keep initialization order safe across manually separated vendors.
                  strictExecutionOrder: true,
                  codeSplitting: {
                    // Don't pull unrelated dependencies into a matching vendor group.
                    includeDependenciesRecursively: false,
                    groups: [
                      {
                        name: "vendor-react",
                        test: /[\\/]node_modules[\\/](?:react|react-dom|scheduler|use-sync-external-store)[\\/]/,
                        entriesAware: true,
                      },
                      {
                        name: "vendor-tanstack",
                        test: /[\\/]node_modules[\\/](?:@tanstack[\\/][^\\/]+|seroval|seroval-plugins)[\\/]/,
                        entriesAware: true,
                      },
                      {
                        name: "vendor-apollo",
                        test: /[\\/]node_modules[\\/](?:@apollo[\\/][^\\/]+|@wry[\\/][^\\/]+|graphql|graphql-tag|rxjs|optimism)[\\/]/,
                        entriesAware: true,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      }
    },
  }
}
