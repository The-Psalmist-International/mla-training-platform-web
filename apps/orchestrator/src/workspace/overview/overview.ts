import { queryOptions } from "@tanstack/react-query"
import {
  WORKSPACE_OVERVIEW_QUERY,
  type CurrentUser,
  type DataClients,
  type WorkspaceOverviewQuery,
} from "@workspace/data"

export type OverviewData = WorkspaceOverviewQuery["workspaceOverview"]
export function overviewOptions(clients: DataClients, user: CurrentUser) {
  return queryOptions({
    queryKey: ["workspace", clients.graphqlUrl, user.id, "overview"],
    staleTime: 0,
    queryFn: async ({ signal }) => {
      if (user.role !== "admin" && user.role !== "instructor")
        throw new Error("Workspace access required")
      const result = await clients.apolloClient.query({
        query: WORKSPACE_OVERVIEW_QUERY,
        fetchPolicy: "network-only",
        context: { toast: "query-cache", fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing overview response")
      return result.data.workspaceOverview
    },
  })
}
