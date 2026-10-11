import { createRouter } from "@tanstack/react-router"
import { routerWithApolloClient } from "@apollo/client-integration-tanstack-start"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { createDataClients } from "@workspace/data"
import { UiProvider } from "@workspace/ui/components/ui-provider"
import { routeTree } from "./routeTree.gen"

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
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    Wrap: UiProvider,
  })
  setupRouterSsrQueryIntegration({ router, queryClient: clients.queryClient })
  return routerWithApolloClient(router, clients.apolloClient)
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
