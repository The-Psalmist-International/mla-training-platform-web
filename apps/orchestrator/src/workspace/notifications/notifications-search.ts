import { validateCollectionSearch } from "../collection-search"
export interface NotificationsSearchState {
  page?: number
  tab?: "unread"
}
export function validateNotificationsSearch(
  search: Record<string, unknown>
): NotificationsSearchState {
  const { page } = validateCollectionSearch(search)
  return {
    page,
    tab: search.tab === "unread" ? ("unread" as const) : undefined,
  }
}
