export const learnerTabs = [
  { id: "overview", label: "Overview" },
  { id: "learning", label: "My learning" },
  { id: "library", label: "Course library" },
  { id: "results", label: "Results" },
] as const

export type LearnerTab = (typeof learnerTabs)[number]["id"]
export type LearnerSearch = {
  tab: LearnerTab
  page: number
  pageSize?: number
  q?: string
}

export function learnerSearch(search: Record<string, unknown>): LearnerSearch {
  const tab =
    learnerTabs.find((item) => item.id === search.tab)?.id ?? "overview"
  const page =
    typeof search.page === "string" && /^\d+$/.test(search.page)
      ? Number(search.page)
      : search.page
  const size = Number(search.pageSize)
  return {
    tab,
    page:
      tab !== "overview" &&
      typeof page === "number" &&
      Number.isSafeInteger(page) &&
      page > 0 &&
      page <= 100000
        ? page
        : 1,
    ...(tab === "learning" && [10, 50, 100].includes(size)
      ? { pageSize: size }
      : {}),
    ...(tab === "learning" && typeof search.q === "string" && search.q
      ? { q: search.q.slice(0, 200) }
      : {}),
  }
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there"
}

export function learnerInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "L"
  )
}
