export const learnerTabs = [
  { id: "overview", label: "Overview" },
  { id: "learning", label: "My learning" },
  { id: "library", label: "Course library" },
  { id: "results", label: "Results" },
] as const

export type LearnerTab = (typeof learnerTabs)[number]["id"]
export type LearnerSearch = { tab: LearnerTab; page: number }

export function learnerSearch(search: Record<string, unknown>): LearnerSearch {
  const tab =
    learnerTabs.find((item) => item.id === search.tab)?.id ?? "overview"
  const page =
    typeof search.page === "string" && /^\d+$/.test(search.page)
      ? Number(search.page)
      : search.page
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
