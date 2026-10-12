import { HttpLink } from "@apollo/client"
import { SetContextLink } from "@apollo/client/link/context"
import { ErrorLink } from "@apollo/client/link/error"
import {
  CombinedGraphQLErrors,
  ServerError,
  ServerParseError,
} from "@apollo/client/errors"
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
  if (
    !(["http:", "https:"] as string[]).includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error(
      "VITE_GRAPHQL_URL must be an absolute HTTP(S) URL without credentials."
    )
  }
  return url.toString()
}

/** Call inside getRouter: never share these clients across server requests. */
export function createDataClients(options: DataClientOptions) {
  const graphqlUrl = validateGraphqlUrl(options.graphqlUrl)
  let accessToken: string | null = null
  let authGeneration = 0
  const authFailureListeners = new Set<() => void>()
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  })
  const authLink = new SetContextLink(async (previousContext) => {
    const generation = authGeneration
    const token = options.getAccessToken
      ? await options.getAccessToken()
      : accessToken
    return {
      authToken: token,
      authGeneration: generation,
      headers: {
        ...previousContext.headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    }
  })
  const errorLink = new ErrorLink(({ error, operation }) => {
    const unauthenticated =
      (CombinedGraphQLErrors.is(error) &&
        error.errors.some(
          (entry) => entry.extensions?.code === "UNAUTHENTICATED"
        )) ||
      ((ServerError.is(error) || ServerParseError.is(error)) &&
        error.statusCode === 401)
    const context = operation.getContext()
    if (!unauthenticated || !context.authToken) return

    const notifyIfCurrent = (token: string | null) => {
      // A response from a previous login must never invalidate the current one,
      // even if the server issued the same token again.
      if (
        context.authGeneration === authGeneration &&
        context.authToken === token
      ) {
        authFailureListeners.forEach((listener) => listener())
      }
    }
    const getAccessToken = options.getAccessToken
    if (getAccessToken) {
      void Promise.resolve()
        .then(() => getAccessToken())
        .then(notifyIfCurrent)
        .catch(() => {})
    } else {
      notifyIfCurrent(accessToken)
    }
  })
  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(errorLink).concat(
      new HttpLink({
        uri: graphqlUrl,
        credentials: "include",
        fetch: options.fetch,
      })
    ),
    // Keep Apollo's default strict error policy; no automatic mutation retry link.
  })

  return {
    apolloClient,
    queryClient,
    graphqlUrl,
    /** Optional and scoped to these clients, never a process-global auth handler. */
    subscribeAuthFailure(listener: () => void) {
      authFailureListeners.add(listener)
      return () => {
        authFailureListeners.delete(listener)
      }
    },
    /** In-memory only. Call on login/logout/account switch; no browser storage or refresh flow yet. */
    async setAccessToken(token: string | null) {
      accessToken = token
      authGeneration += 1
      await queryClient.cancelQueries()
      queryClient.clear()
      await apolloClient.clearStore()
    },
  }
}

export type DataClients = ReturnType<typeof createDataClients>
