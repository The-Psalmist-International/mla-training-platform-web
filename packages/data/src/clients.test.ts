import { describe, expect, it, vi } from "vitest"
import { createDataClients, validateGraphqlUrl } from "./clients"
import { HEALTH_QUERY } from "../apollo/platform/query"
import { LOGOUT_MUTATION } from "../apollo/auth/query"
import { backendHealthOptions } from "./health"

const graphqlUrl = "http://localhost:4000/graphql"

describe("shared data clients", () => {
  it("creates isolated clients and caches for separate requests/apps", () => {
    const first = createDataClients({ graphqlUrl })
    const second = createDataClients({ graphqlUrl })
    first.queryClient.setQueryData(["private"], "first user")
    first.apolloClient.writeQuery({
      query: HEALTH_QUERY,
      data: { health: "first" },
    })
    expect(second.queryClient.getQueryData(["private"])).toBeUndefined()
    expect(second.apolloClient.readQuery({ query: HEALTH_QUERY })).toBeNull()
    expect(first.apolloClient).not.toBe(second.apolloClient)
  })

  it("sends credentials and the latest bearer token, then clears both caches on logout", async () => {
    const request = vi.fn<typeof fetch>().mockImplementation(
      async () =>
        new Response(JSON.stringify({ data: { health: "ok" } }), {
          headers: { "content-type": "application/json" },
        })
    )
    const clients = createDataClients({ graphqlUrl, fetch: request })
    await clients.setAccessToken("first-token")
    await clients.apolloClient.query({
      query: HEALTH_QUERY,
      fetchPolicy: "network-only",
    })
    expect(request.mock.calls[0]?.[1]?.credentials).toBe("include")
    expect(
      new Headers(request.mock.calls[0]?.[1]?.headers).get("authorization")
    ).toBe("Bearer first-token")
    clients.queryClient.setQueryData(["private"], "secret")
    await clients.setAccessToken(null)
    expect(clients.queryClient.getQueryData(["private"])).toBeUndefined()
    expect(clients.apolloClient.readQuery({ query: HEALTH_QUERY })).toBeNull()
    await clients.apolloClient.query({
      query: HEALTH_QUERY,
      fetchPolicy: "network-only",
    })
    expect(
      new Headers(request.mock.calls[1]?.[1]?.headers).get("authorization")
    ).toBe("")
  })

  it("reads injected request-local authentication on each operation", async () => {
    let token = "request-token"
    const request = vi.fn<typeof fetch>().mockImplementation(
      async () =>
        new Response(JSON.stringify({ data: { health: "ok" } }), {
          headers: { "content-type": "application/json" },
        })
    )
    const clients = createDataClients({
      graphqlUrl,
      fetch: request,
      getAccessToken: () => token,
    })
    await clients.apolloClient.query({
      query: HEALTH_QUERY,
      fetchPolicy: "network-only",
    })
    token = "rotated-token"
    await clients.apolloClient.query({
      query: HEALTH_QUERY,
      fetchPolicy: "network-only",
    })
    expect(
      new Headers(request.mock.calls[1]?.[1]?.headers).get("authorization")
    ).toBe("Bearer rotated-token")
  })

  it.each([
    ["GraphQL UNAUTHENTICATED", 200, "UNAUTHENTICATED", true],
    ["HTTP 401", 401, undefined, true],
    ["GraphQL FORBIDDEN", 200, "FORBIDDEN", false],
    ["HTTP 403", 403, undefined, false],
    ["HTTP 500", 500, undefined, false],
    ["connection failure", 0, undefined, false],
  ])(
    "reports only confirmed auth failures: %s",
    async (_, status, code, expires) => {
      const request = vi.fn<typeof fetch>().mockImplementation(async () => {
        if (!status) throw new TypeError("Failed to fetch")
        return new Response(
          JSON.stringify({
            errors: [{ message: "Request failed", extensions: { code } }],
          }),
          { status, headers: { "content-type": "application/json" } }
        )
      })
      const clients = createDataClients({ graphqlUrl, fetch: request })
      const listener = vi.fn()
      const unsubscribe = clients.subscribeAuthFailure(listener)
      await clients.setAccessToken("active-token")
      await expect(
        clients.apolloClient.mutate({ mutation: LOGOUT_MUTATION })
      ).rejects.toThrow()
      expect(listener).toHaveBeenCalledTimes(expires ? 1 : 0)
      expect(request).toHaveBeenCalledTimes(1)
      unsubscribe()
      await clients.apolloClient
        .mutate({ mutation: LOGOUT_MUTATION })
        .catch(() => {})
      expect(listener).toHaveBeenCalledTimes(expires ? 1 : 0)
    }
  )

  it("ignores public auth failures and isolates subscriptions between clients", async () => {
    const request = vi.fn<typeof fetch>().mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            errors: [
              { message: "Expired", extensions: { code: "UNAUTHENTICATED" } },
            ],
          }),
          {
            headers: { "content-type": "application/json" },
          }
        )
    )
    const first = createDataClients({ graphqlUrl, fetch: request })
    const second = createDataClients({ graphqlUrl, fetch: request })
    const firstListener = vi.fn()
    const secondListener = vi.fn()
    first.subscribeAuthFailure(firstListener)
    second.subscribeAuthFailure(secondListener)
    await first.apolloClient
      .mutate({ mutation: LOGOUT_MUTATION })
      .catch(() => {})
    expect(firstListener).not.toHaveBeenCalled()
    await first.setAccessToken("active-token")
    await first.apolloClient
      .mutate({ mutation: LOGOUT_MUTATION })
      .catch(() => {})
    expect(firstListener).toHaveBeenCalledOnce()
    expect(secondListener).not.toHaveBeenCalled()
  })

  it.each(["new-token", "old-token"])(
    "ignores an obsolete request after a new auth generation using %s",
    async (newToken) => {
      let respond!: (response: Response) => void
      let markStarted!: () => void
      const started = new Promise<void>((resolve) => {
        markStarted = resolve
      })
      const request = vi.fn<typeof fetch>().mockImplementation(() => {
        markStarted()
        return new Promise<Response>((resolve) => {
          respond = resolve
        })
      })
      const clients = createDataClients({ graphqlUrl, fetch: request })
      const listener = vi.fn()
      clients.subscribeAuthFailure(listener)
      await clients.setAccessToken("old-token")
      const pending = clients.apolloClient.mutate({ mutation: LOGOUT_MUTATION })
      const rejected = expect(pending).rejects.toThrow()
      await started
      await clients.setAccessToken(newToken)
      respond(
        new Response(
          JSON.stringify({
            errors: [
              { message: "Expired", extensions: { code: "UNAUTHENTICATED" } },
            ],
          }),
          {
            headers: { "content-type": "application/json" },
          }
        )
      )
      await rejected
      expect(listener).not.toHaveBeenCalled()
    }
  )

  it("rejects unsafe or relative endpoint configuration", () => {
    expect(() => validateGraphqlUrl("/graphql")).toThrow()
    expect(() => validateGraphqlUrl("javascript:alert(1)")).toThrow()
    expect(() =>
      validateGraphqlUrl("https://user:password@example.com/graphql")
    ).toThrow()
    expect(validateGraphqlUrl(graphqlUrl)).toBe(graphqlUrl)
  })

  it("keys REST health checks by backend and does not retry mutations", () => {
    expect(backendHealthOptions(graphqlUrl).queryKey).toEqual([
      "backend-health",
      "http://localhost:4000/health",
    ])
    expect(
      createDataClients({ graphqlUrl }).queryClient.getDefaultOptions()
        .mutations?.retry
    ).toBe(false)
  })
})
