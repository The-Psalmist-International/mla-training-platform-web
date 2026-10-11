import { describe, expect, it, vi } from "vitest"
import { createDataClients, validateGraphqlUrl } from "./clients"
import { HEALTH_QUERY } from "./operations"
import { backendHealthOptions } from "./health"

const graphqlUrl = "http://localhost:4000/graphql"

describe("shared data clients", () => {
  it("creates isolated clients and caches for separate requests/apps", () => {
    const first = createDataClients({ graphqlUrl })
    const second = createDataClients({ graphqlUrl })
    first.queryClient.setQueryData(["private"], "first user")
    first.apolloClient.writeQuery({ query: HEALTH_QUERY, data: { health: "first" } })
    expect(second.queryClient.getQueryData(["private"])).toBeUndefined()
    expect(second.apolloClient.readQuery({ query: HEALTH_QUERY })).toBeNull()
    expect(first.apolloClient).not.toBe(second.apolloClient)
  })

  it("sends credentials and the latest bearer token, then clears both caches on logout", async () => {
    const request = vi.fn<typeof fetch>().mockImplementation(async () => new Response(
      JSON.stringify({ data: { health: "ok" } }),
      { headers: { "content-type": "application/json" } },
    ))
    const clients = createDataClients({ graphqlUrl, fetch: request })
    await clients.setAccessToken("first-token")
    await clients.apolloClient.query({ query: HEALTH_QUERY, fetchPolicy: "network-only" })
    expect(request.mock.calls[0]?.[1]?.credentials).toBe("include")
    expect(new Headers(request.mock.calls[0]?.[1]?.headers).get("authorization")).toBe("Bearer first-token")
    clients.queryClient.setQueryData(["private"], "secret")
    await clients.setAccessToken(null)
    expect(clients.queryClient.getQueryData(["private"])).toBeUndefined()
    expect(clients.apolloClient.readQuery({ query: HEALTH_QUERY })).toBeNull()
    await clients.apolloClient.query({ query: HEALTH_QUERY, fetchPolicy: "network-only" })
    expect(new Headers(request.mock.calls[1]?.[1]?.headers).get("authorization")).toBe("")
  })

  it("reads injected request-local authentication on each operation", async () => {
    let token = "request-token"
    const request = vi.fn<typeof fetch>().mockImplementation(async () => new Response(
      JSON.stringify({ data: { health: "ok" } }),
      { headers: { "content-type": "application/json" } },
    ))
    const clients = createDataClients({ graphqlUrl, fetch: request, getAccessToken: () => token })
    await clients.apolloClient.query({ query: HEALTH_QUERY, fetchPolicy: "network-only" })
    token = "rotated-token"
    await clients.apolloClient.query({ query: HEALTH_QUERY, fetchPolicy: "network-only" })
    expect(new Headers(request.mock.calls[1]?.[1]?.headers).get("authorization")).toBe("Bearer rotated-token")
  })

  it("rejects unsafe or relative endpoint configuration", () => {
    expect(() => validateGraphqlUrl("/graphql")).toThrow()
    expect(() => validateGraphqlUrl("javascript:alert(1)")).toThrow()
    expect(() => validateGraphqlUrl("https://user:password@example.com/graphql")).toThrow()
    expect(validateGraphqlUrl(graphqlUrl)).toBe(graphqlUrl)
  })

  it("keys REST health checks by backend and does not retry mutations", () => {
    expect(backendHealthOptions(graphqlUrl).queryKey).toEqual(["backend-health", "http://localhost:4000/health"])
    expect(createDataClients({ graphqlUrl }).queryClient.getDefaultOptions().mutations?.retry).toBe(false)
  })
})
