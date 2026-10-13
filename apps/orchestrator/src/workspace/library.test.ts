import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { QueryClient } from "@tanstack/react-query"
import { createDataClients, type CurrentUser } from "@workspace/data"
import {
  DataTable,
  type DataTableProps,
  type DataTableLayout,
} from "@workspace/ui/components/data-table"
import { LibraryCard } from "../components/LibraryCollectionPage"
import { LibraryRowActions } from "../components/LibraryRowActions"
import {
  libraryTableOptions,
  formatVideoDuration,
  formatVideoSize,
  type LibraryItem,
} from "./library"
import { validateCoursesSearch, validateVideosSearch } from "./library-search"

const row: LibraryItem = {
  id: "course-id",
  title: "Leadership",
  description: "Practical foundations for academy leaders.",
  status: "published",
  certificateEnabled: true,
  createdAt: "2026-10-12T00:00:00Z",
}
const admin: CurrentUser = {
  id: "admin",
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
}
describe("library primary actions", () => {
  const renderActions = (status: LibraryItem["status"], user = admin) =>
    renderToStaticMarkup(
      createElement(LibraryRowActions, {
        item: { ...row, ownerId: "another-author", status },
        view: "courses",
        user,
        onSelect: () => {},
        onExpand: () => {},
      })
    )
  it("keeps view, edit, and expand visible for an editable course with other actions behind the menu", () => {
    const html = renderActions("draft")
    expect(html).toContain('aria-label="View details for Leadership"')
    expect(html).toContain('aria-label="Edit course for Leadership"')
    expect(html).toContain('aria-label="Expand course for Leadership"')
    expect(html).toContain('aria-label="More actions for Leadership"')
    expect(html).not.toContain('aria-label="Archive course for Leadership"')
  })
  it("keeps edit unavailable for published, archived, and other instructors' courses", () => {
    for (const html of [
      renderActions("published"),
      renderActions("archived"),
      renderActions("draft", { ...admin, role: "instructor" }),
    ]) {
      expect(html).not.toContain('aria-label="Edit course for Leadership"')
      expect(html).toContain('aria-label="Expand course for Leadership"')
    }
    expect(renderActions("archived")).not.toContain(
      'aria-label="More actions for Leadership"'
    )
  })
})
const tableProps: DataTableProps<LibraryItem> = {
  rows: [row],
  columns: [{ id: "title", header: "Title", cell: (item) => item.title }],
  getRowId: (item) => item.id,
  ariaLabel: "Courses",
  search: { value: "", onChange: () => {} },
  filters: createElement("span", null, "Status filter"),
  onRefresh: () => {},
  pagination: {
    pageIndex: 0,
    pageSize: 20,
    totalCount: 42,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
}
const card = (item: LibraryItem) =>
  createElement(LibraryCard, { item, view: "courses" })
function render(
  layout?: DataTableLayout<LibraryItem>,
  patch: Partial<DataTableProps<LibraryItem>> = {}
) {
  return renderToStaticMarkup(
    createElement(DataTable<LibraryItem>, { ...tableProps, ...patch, layout })
  )
}
describe("DataTable layouts", () => {
  it("defaults to a cell table without a toggle", () => {
    const html = render()
    expect(html).toContain("<table")
    expect(html).not.toContain('aria-label="Grid view"')
    expect(html).not.toContain("<article")
  })
  it("supports grid-only without a table or toggle and preserves shared controls", () => {
    const html = render({ mode: "grid", renderCard: card })
    expect(html).toContain("<article")
    expect(html).not.toContain("<table")
    expect(html).not.toContain('aria-label="Table view"')
    for (const expected of [
      "Status filter",
      'aria-label="Refresh Courses"',
      'aria-label="Courses pagination"',
      "Showing 1 to 1 out of 42",
      "Rows per page",
    ])
      expect(html).toContain(expected)
  })
  it("starts toggle mode in a table and supports a controlled grid selection", () => {
    const table = render({ mode: "toggle", renderCard: card })
    const grid = render({
      mode: "toggle",
      view: "grid",
      onViewChange: () => {},
      renderCard: card,
    })
    expect(table).toContain("<table")
    expect(table).toMatch(/aria-label="Table view"[^>]*aria-pressed="true"/)
    expect(grid).toContain("<article")
    expect(grid).toMatch(/aria-label="Grid view"[^>]*aria-pressed="true"/)
    expect(grid).not.toContain("<table")
  })
  it("renders grid loading, empty, and error states without calling the card renderer", () => {
    const renderCard = vi.fn(card)
    const layout = { mode: "grid" as const, renderCard }
    expect(render(layout, { isLoading: true })).toContain(
      'data-slot="data-table-loading-card"'
    )
    expect(
      render(layout, { rows: [], emptyState: "No courses yet" })
    ).toContain("No courses yet")
    expect(render(layout, { errorState: "Could not load" })).toContain(
      "Could not load"
    )
    expect(renderCard).not.toHaveBeenCalled()
  })
})
describe("library data and URL state", () => {
  it("keeps layout changes out of the data query key", () => {
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
    })
    const search = validateCoursesSearch({
      q: "Lead",
      page: "3",
      pageSize: "50",
      status: "published",
      scope: "mine",
    })
    expect(
      libraryTableOptions(clients, admin, "courses", search).queryKey
    ).toEqual(
      libraryTableOptions(clients, admin, "courses", {
        ...search,
        layout: "grid",
      }).queryKey
    )
    expect(validateCoursesSearch({ ...search, layout: "grid" })).toMatchObject({
      q: "Lead",
      page: 3,
      pageSize: 50,
      status: "published",
      scope: "mine",
      layout: "grid",
    })
    expect(
      validateCoursesSearch({ status: "ready", layout: "unknown" }).status
    ).toBeUndefined()
    expect(
      validateVideosSearch({ status: "draft", scope: "mine" })
    ).toMatchObject({ status: undefined, scope: undefined })
  })
  it.each(["courses", "videos"] as const)(
    "queries server search, filters and matching totals for %s",
    async (view) => {
      const field = view === "courses" ? "coursesPage" : "myVideoAssetsPage"
      const request = vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: { [field]: { items: [], totalCount: 42 } },
          }),
          { headers: { "content-type": "application/json" } }
        )
      )
      const clients = createDataClients({
        graphqlUrl: "http://localhost:4000/graphql",
        fetch: request,
      })
      const cache = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      })
      const validate =
        view === "courses" ? validateCoursesSearch : validateVideosSearch
      const search = validate({
        q: "Lead",
        status: view === "courses" ? "draft" : "processing",
        page: 3,
        pageSize: 50,
      })
      expect(
        await cache.fetchQuery(
          libraryTableOptions(
            clients,
            { ...admin, role: "instructor" },
            view,
            search
          )
        )
      ).toEqual({ items: [], totalCount: 42 })
      const body = JSON.parse(String(request.mock.calls[0]?.[1]?.body))
      expect(body.operationName).toBe(
        view === "courses" ? "CoursesPage" : "MyVideoAssetsPage"
      )
      expect(body.variables).toEqual({
        search: "Lead",
        status: view === "courses" ? "draft" : "processing",
        limit: 50,
        offset: 100,
        ...(view === "courses" ? { mine: true } : {}),
      })
      cache.clear()
    }
  )
  it("shows real card content with a neutral preview when no image is available", () => {
    const html = renderToStaticMarkup(
      createElement(LibraryCard, { item: row, view: "courses" })
    )
    expect(html).toContain(row.title)
    expect(html).toContain(row.description)
    expect(html).toContain("bg-linear-to-br")
    expect(html).not.toContain("<img")
    expect(formatVideoDuration(3661)).toBe("1:01:01")
    expect(formatVideoDuration(null)).toBe("Duration unavailable")
    expect(formatVideoSize("1048576")).toBe("1.0 MB")
    expect(formatVideoSize(null)).toBe("Size unavailable")
  })
})
