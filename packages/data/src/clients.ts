import { HttpLink } from "@apollo/client"
import { SetContextLink } from "@apollo/client/link/context"
import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-tanstack-start"
import { QueryClient } from "@tanstack/react-query"

export interface DataClientOptions {
  graphqlUrl: string
  /** Supply a request-local token source for authenticated SSR in a future auth slice. */
  getAccessToken?: () => string | null | Promise<string | null>
  fetch?: typeof globalThis.fetch
}

export function validateGraphqlUrl(value: string) {
  const url = new URL(value)
  if (!(["http:", "https:"] as string[]).includes(url.protocol) || url.username || url.password) {
    throw new Error("VITE_GRAPHQL_URL must be an absolute HTTP(S) URL without credentials.")
  }
  return url.toString()
}

/** Call inside getRouter: never share these clients across server requests. */
export function createDataClients(options: DataClientOptions) {
  const graphqlUrl = validateGraphqlUrl(options.graphqlUrl)
  let accessToken: string | null = null
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  })
  const authLink = new SetContextLink(async (previousContext) => {
    const token = options.getAccessToken ? await options.getAccessToken() : accessToken
    return {
      headers: {
        ...previousContext.headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    }
  })
  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(new HttpLink({
      uri: graphqlUrl,
      credentials: "include",
      fetch: options.fetch,
    })),
    // Mutations are never automatically retried by a transport retry link.
    defaultOptions: {
      watchQuery: { errorPolicy: "none" },
      query: { errorPolicy: "none" },
      mutate: { errorPolicy: "none" },
    },
  })

  return {
    apolloClient,
    queryClient,
    graphqlUrl,
    /** In-memory only. Call on login/logout/account switch; no browser storage or refresh flow yet. */
    async setAccessToken(token: string | null) {
      accessToken = token
      await queryClient.cancelQueries()
      queryClient.clear()
      await apolloClient.clearStore()
    },
  }
}

export type DataClients = ReturnType<typeof createDataClients>
