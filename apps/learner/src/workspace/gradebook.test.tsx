import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { DataTable } from "@workspace/ui/components/data-table"
import { learnerSearch } from "./navigation"

describe("course gradebook", () => {
  it("omits refresh controls and pagination from embedded assessment rows", () => {
    const html = renderToStaticMarkup(<DataTable embedded
      rows={[{ id: "attempt", title: "Quiz" }]}
      columns={[{ id: "title", header: "Assessment", cell: row => row.title }]}
      getRowId={row => row.id} ariaLabel="Course attempts" onRefresh={() => undefined}
      pagination={{ pageIndex: 0, pageSize: 1, totalCount: 1, onPageChange: () => undefined, onPageSizeChange: () => undefined }}
    />)
    expect(html).toContain("Quiz")
    expect(html).not.toContain("Refresh Course attempts")
    expect(html).not.toContain("Course attempts pagination")
    expect(html).not.toContain("Rows per page")
    expect(html).toContain('class="sr-only"')
  })
  it("restores course expansion and main pagination from URL state", () => {
    const course = "12345678-1234-1234-1234-123456789abc"
    expect(learnerSearch({ tab: "gradebook", page: "2", pageSize: "50", gradeCourse: course, gradePage: "3", gradeSize: "20" })).toMatchObject({
      tab: "gradebook", page: 2, pageSize: 50, gradeCourse: course,
    })
    expect(learnerSearch({ tab: "gradebook", gradeCourse: course, gradePage: 3, gradeSize: 20 })).not.toHaveProperty("gradePage")
    expect(learnerSearch({ tab: "overview", gradeCourse: course }).gradeCourse).toBeUndefined()
  })

  it("renders expanded course content in a separate full-width table row", () => {
    const expanded = vi.fn((row: { id: string; title: string }) => row.id === "course-1" ? <section aria-label="Assessment attempts">Assessment details</section> : null)
    const html = renderToStaticMarkup(<DataTable
      rows={[{ id: "course-1", title: "Leadership" }, { id: "course-2", title: "Ministry" }]}
      columns={[{ id: "title", header: "Course", cell: row => row.title }, { id: "count", header: "Attempts", cell: () => 2 }]}
      getRowId={row => row.id} ariaLabel="Gradebook courses" renderExpandedRow={expanded}
      onRefresh={() => undefined}
      pagination={{ pageIndex: 0, pageSize: 20, totalCount: 2, onPageChange: () => undefined, onPageSizeChange: () => undefined }}
    />)
    expect(expanded).toHaveBeenCalledTimes(2)
    expect(html).toContain('colSpan="2"')
    expect(html).toContain('aria-label="Assessment attempts"')
    expect(html.indexOf("Leadership")).toBeLessThan(html.indexOf("Assessment details"))
    expect(html.indexOf("Assessment details")).toBeLessThan(html.indexOf("Ministry"))
    expect(html).toContain("Showing 1 to 2 out of 2")
    expect(html).toContain('aria-label="Gradebook courses pagination"')
  })
})
