import { queryOptions } from "@tanstack/react-query"
import {
  WORKSPACE_ANALYTICS_QUERY,
  type AnalyticsFilter,
  type CurrentUser,
  type DataClients,
  type WorkspaceAnalyticsQuery,
} from "@workspace/data"

export type AnalyticsData = WorkspaceAnalyticsQuery["workspaceAnalytics"]
export interface AnalyticsSearch {
  range?: "7" | "30" | "90" | "custom"
  from?: string
  to?: string
  courseId?: string
  page?: number
}
const validDay = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value
export function validateAnalyticsSearch(
  raw: Record<string, unknown>
): AnalyticsSearch {
  const custom =
    raw.range === "custom" &&
    validDay(raw.from) &&
    validDay(raw.to) &&
    raw.from <= raw.to &&
    Date.parse(raw.to) - Date.parse(raw.from) <= 365 * 86400000
  const range = custom
    ? "custom"
    : raw.range === "7" || raw.range === "30"
      ? raw.range
      : "90"
  const page = Number(raw.page)
  return {
    range,
    ...(custom ? { from: String(raw.from), to: String(raw.to) } : {}),
    ...(typeof raw.courseId === "string" &&
    /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(
      raw.courseId
    )
      ? { courseId: raw.courseId }
      : {}),
    page: Number.isInteger(page) && page > 0 && page <= 100000 ? page : 1,
  }
}
export function analyticsInput(
  search: AnalyticsSearch,
  now = new Date()
): AnalyticsFilter {
  const end = now.toISOString().slice(0, 10)
  const days = Number(search.range === "custom" ? "90" : (search.range ?? "90"))
  const start = new Date(Date.parse(end) - (days - 1) * 86400000)
    .toISOString()
    .slice(0, 10)
  return {
    from: search.range === "custom" ? search.from! : start,
    to: search.range === "custom" ? search.to! : end,
    courseId: search.courseId,
    page: search.page ?? 1,
  }
}
export function analyticsOptions(
  clients: DataClients,
  user: CurrentUser,
  input: AnalyticsFilter
) {
  return queryOptions({
    queryKey: [
      "workspace",
      clients.graphqlUrl,
      user.id,
      user.role,
      "analytics",
      input,
    ],
    staleTime: 30000,
    queryFn: async ({ signal }) => {
      if (user.role !== "admin" && user.role !== "instructor")
        throw new Error("Workspace access required")
      const result = await clients.apolloClient.query({
        query: WORKSPACE_ANALYTICS_QUERY,
        variables: { input },
        fetchPolicy: "network-only",
        context: { toast: "query-cache", fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing analytics response")
      return result.data.workspaceAnalytics
    },
  })
}
