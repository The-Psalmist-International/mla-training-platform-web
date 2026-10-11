import { createRouter } from "@tanstack/react-router"
import type {} from "@tanstack/react-start"
import { routerWithApolloClient } from "@apollo/client-integration-tanstack-start"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { createDataClients } from "@workspace/data"
import { UiProvider } from "@workspace/ui/components/ui-provider"
import { routeTree } from "./route-tree"
import { createAuthSession } from "./auth/session"

export function getRouter() {
  const clients = createDataClients({
    graphqlUrl:
      import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql",
  })
  const router = createRouter({
    routeTree,
    context: {
      ...routerWithApolloClient.defaultContext,
      queryClient: clients.queryClient,
      graphqlUrl: clients.graphqlUrl,
      dataClients: clients,
      auth: createAuthSession(clients),
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    Wrap: UiProvider,
  })
  setupRouterSsrQueryIntegration({ router, queryClient: clients.queryClient })
  return routerWithApolloClient(router, clients.apolloClient)
}

declare module "@tanstack/react-start" {
  interface Register {
    ssr: true
    router: ReturnType<typeof getRouter>
  }
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
