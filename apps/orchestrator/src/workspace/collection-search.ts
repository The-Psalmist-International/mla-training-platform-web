export interface CollectionSearchState {
  page?: number
  pageSize?: number
  course?: string
  modal?: "assign"
}

export function validateCollectionSearch(
  search: Record<string, unknown>
): CollectionSearchState {
  const page = Number(search.page ?? 1)
  const size = Number(search.pageSize ?? 20)
  return {
    page:
      Number.isSafeInteger(page) && page > 1 && page <= 1_000_000
        ? page
        : undefined,
    pageSize:
      [10, 20, 50, 100].includes(size) && size !== 20 ? size : undefined,
    course:
      typeof search.course === "string" &&
      search.course.trim() &&
      search.course.length <= 128
        ? search.course.trim()
        : undefined,
    modal: search.modal === "assign" ? "assign" : undefined,
  }
}
