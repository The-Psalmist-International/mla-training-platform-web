import { validateCollectionSearch } from "./collection-search"

export type LibraryView = "courses" | "videos"
export const courseStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const
export const videoStatusOptions = [
  { value: "pending_upload", label: "Awaiting upload" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "failed", label: "Failed" },
] as const
export interface LibrarySearchState {
  q?: string
  status?:
    | "draft"
    | "published"
    | "archived"
    | "pending_upload"
    | "processing"
    | "ready"
    | "failed"
  scope?: "mine" | "all"
  page?: number
  pageSize?: number
  layout?: "grid"
}
export function validateLibrarySearch(
  view: LibraryView,
  search: Record<string, unknown>
): LibrarySearchState {
  const { page, pageSize } = validateCollectionSearch(search)
  const options = view === "courses" ? courseStatusOptions : videoStatusOptions
  const q = typeof search.q === "string" ? search.q.slice(0, 200).trim() : ""
  return {
    q: q || undefined,
    status: options.find((option) => option.value === search.status)?.value,
    scope:
      view === "courses" && (search.scope === "mine" || search.scope === "all")
        ? search.scope
        : undefined,
    page,
    pageSize,
    layout: search.layout === "grid" ? "grid" : undefined,
  }
}
export const validateCoursesSearch = (search: Record<string, unknown>) =>
  validateLibrarySearch("courses", search)
export const validateVideosSearch = (search: Record<string, unknown>) =>
  validateLibrarySearch("videos", search)
