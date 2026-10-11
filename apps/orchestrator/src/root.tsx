import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import type { ApolloClientIntegration } from "@apollo/client-integration-tanstack-start"
import type { QueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"
import appCss from "@workspace/ui/globals.css?url"
import { themeInitScript } from "@workspace/ui/components/theme-provider"
import type { DataClients } from "@workspace/data"
import type { AuthSession } from "./auth/session"

interface RouterContext extends ApolloClientIntegration.RouterContext {
  queryClient: QueryClient
  graphqlUrl: string
  dataClients: DataClients
  auth: AuthSession
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Martyrs | Orchestrator" },
    ],
    links: [
      {
        rel: "preload",
        href: "/SeasonCollectionVF-TRIAL.ttf",
        as: "font",
        type: "font/ttf",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "data:," },
    ],
  }),
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <a
        href="/"
        className="mt-4 inline-block text-primary underline underline-offset-4"
      >
        Return home
      </a>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
