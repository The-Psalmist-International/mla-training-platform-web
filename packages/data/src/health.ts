import { queryOptions } from "@tanstack/react-query"
import { validateGraphqlUrl } from "./clients"

export function backendHealthOptions(graphqlUrl: string) {
  const healthUrl = new URL("/health", validateGraphqlUrl(graphqlUrl)).toString()
  return queryOptions({
    queryKey: ["backend-health", healthUrl] as const,
    queryFn: async ({ signal }) => {
      const response = await fetch(healthUrl, { signal, credentials: "include" })
      if (!response.ok) throw new Error(`Health check failed (${response.status}).`)
      const data: unknown = await response.json()
      if (!data || typeof data !== "object" || !("status" in data) || data.status !== "ok") {
        throw new Error("The backend returned an unexpected health response.")
      }
      return { status: "ok" as const }
    },
  })
}
