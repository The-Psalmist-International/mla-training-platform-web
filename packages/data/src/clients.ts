import { ApolloLink, HttpLink } from "@apollo/client"
import { Observable } from "rxjs"
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
import {
  QueryCache,
  QueryClient,
  isCancelledError,
} from "@tanstack/react-query"

export interface RequestNotification {
  kind: "query" | "mutation"
  operationName?: string
  queryKey?: readonly unknown[]
  status: "success" | "error"
  error?: unknown
}

export interface DataClientOptions {
  graphqlUrl: string
  /** Supply a request-local token source for authenticated SSR in a future auth slice. */
  getAccessToken?: () => string | null | Promise<string | null>
  fetch?: typeof globalThis.fetch
  /** User-facing outcomes only; no credentials, variables, or response data. */
  onRequestComplete?: (event: RequestNotification) => void
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
  let ensureSession: (() => Promise<void>) | undefined
  let authGeneration = 0
  const authFailureListeners = new Set<() => void>()
  const queryGenerations = new WeakMap<object, number>()
  const notify = (event: RequestNotification) => {
    if (
      isCancelledError(event.error) ||
      (event.error instanceof Error && event.error.name === "AbortError")
    )
      return
    try {
      options.onRequestComplete?.(event)
    } catch {
      /* Feedback must not change a request's result. */
    }
  }
  const queryCache = new QueryCache({
    onSuccess: (_data, query) => {
      if (queryGenerations.get(query) === authGeneration)
        notify({ kind: "query", queryKey: query.queryKey, status: "success" })
    },
    onError: (error, query) => {
      if (queryGenerations.get(query) === authGeneration)
        notify({
          kind: "query",
          queryKey: query.queryKey,
          status: "error",
          error,
        })
    },
  })
  queryCache.subscribe((event) => {
    if (event.type === "updated" && event.action.type === "fetch")
      queryGenerations.set(event.query, authGeneration)
  })
  const queryClient = new QueryClient({
    queryCache,
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  })
  const notificationLink = new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        const context = operation.getContext()
        const kind =
          operation.operationType === "mutation" ? "mutation" : "query"
        let completed = false
        const report = (error?: unknown) => {
          if (completed) return
          completed = true
          // Managed queries report after TanStack retries and validates their response.
          // Compound mutations have one flow-owned toast rather than one per subrequest.
          if (
            context.toast === false ||
            context.toast === "query-cache" ||
            context.authGeneration !== authGeneration
          )
            return
          notify({
            kind,
            operationName: operation.operationName,
            status: error ? "error" : "success",
            error,
          })
        }
        const subscription = forward(operation).subscribe({
          next: (result) => {
            if (result.errors?.length) report(new CombinedGraphQLErrors(result))
            else report()
            observer.next(result)
          },
          error: (error: unknown) => {
            report(error)
            observer.error(error)
          },
          complete: () => observer.complete(),
        })
        return () => subscription.unsubscribe()
      })
  )
  const authLink = new SetContextLink(async (previousContext) => {
    if (
      accessToken &&
      !previousContext.anonymous &&
      !previousContext.skipSessionRenewal
    )
      await ensureSession?.()
    const generation = authGeneration
    const token = previousContext.anonymous
      ? null
      : options.getAccessToken
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
    link: authLink
      .concat(notificationLink)
      .concat(errorLink)
      .concat(
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
    setSessionRenewal(renew: (() => Promise<void>) | undefined) {
      ensureSession = renew
    },
    // Renewing the same identity must not cancel requests or discard active forms.
    rotateAccessToken(token: string) {
      accessToken = token
    },
    /** Optional and scoped to these clients, never a process-global auth handler. */
    subscribeAuthFailure(listener: () => void) {
      authFailureListeners.add(listener)
      return () => {
        authFailureListeners.delete(listener)
      }
    },
    /** In-memory only. Call on login/logout/account switch, not same-user renewal. */
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
