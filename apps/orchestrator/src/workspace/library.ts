import { queryOptions } from "@tanstack/react-query"
import {
  COURSES_PAGE_QUERY,
  MY_VIDEO_ASSETS_PAGE_QUERY,
  type CurrentUser,
  type DataClients,
  type CourseStatus,
  type VideoAssetStatus,
} from "@workspace/data"
import type { LibrarySearchState, LibraryView } from "./library-search"

export interface LibraryItem {
  id: string
  title: string
  description: string
  status: CourseStatus | VideoAssetStatus
  createdAt: string
  certificateEnabled?: boolean
  durationSeconds?: number | null
  sizeBytes?: string | null
  mimeType?: string
}
export function libraryTableOptions(
  clients: DataClients,
  user: CurrentUser,
  view: LibraryView,
  search: LibrarySearchState
) {
  const pageSize = search.pageSize ?? 20,
    page = search.page ?? 1
  const mine =
    search.scope === "mine" ||
    (search.scope === undefined && user.role === "instructor")
  const variables = {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search: search.q || undefined,
  }
  return queryOptions({
    queryKey: [
      "workspace",
      clients.graphqlUrl,
      user.id,
      "library-table",
      view,
      { ...variables, status: search.status, mine },
    ],
    queryFn: async ({
      signal,
    }): Promise<{ items: LibraryItem[]; totalCount: number }> => {
      if (user.role !== "admin" && user.role !== "instructor")
        throw new Error("Workspace access required")
      if (view === "courses") {
        const result = await clients.apolloClient.query({
          query: COURSES_PAGE_QUERY,
          variables: {
            ...variables,
            mine,
            status: search.status as CourseStatus | undefined,
          },
          fetchPolicy: "network-only",
          context: { fetchOptions: { signal } },
        })
        if (!result.data) throw new Error("Missing courses response")
        return result.data.coursesPage
      }
      const result = await clients.apolloClient.query({
        query: MY_VIDEO_ASSETS_PAGE_QUERY,
        variables: {
          ...variables,
          status: search.status as VideoAssetStatus | undefined,
        },
        fetchPolicy: "network-only",
        context: { fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing video library response")
      return {
        totalCount: result.data.myVideoAssetsPage.totalCount,
        items: result.data.myVideoAssetsPage.items.map((item) => ({
          ...item,
          description: item.mimeType,
        })),
      }
    },
  })
}
export function formatVideoDuration(seconds: number | null | undefined) {
  if (seconds == null) return "Duration unavailable"
  const hours = Math.floor(seconds / 3600),
    minutes = Math.floor((seconds % 3600) / 60),
    remainder = Math.floor(seconds % 60)
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`
}
export function formatVideoSize(value: string | null | undefined) {
  if (value == null) return "Size unavailable"
  const bytes = Number(value)
  if (!Number.isFinite(bytes) || bytes < 0) return "Size unavailable"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}
