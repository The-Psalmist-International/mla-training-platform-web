import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { DataTable } from "@workspace/ui/components/data-table"
import {
  enrollmentTableColumns,
  type EnrollmentRow,
} from "../../components/enrollments/EnrollmentCollectionPage"
import {
  enrollmentProgressSearch,
  validateEnrollmentsSearch,
} from "./enrollments-search"
import { validateCourseSearch } from "../course/course-search"

const enrollmentId = "00000000-0000-4000-8000-000000000001"
const row: EnrollmentRow = {
  id: enrollmentId,
  userId: "learner",
  learnerName: "Ada Learner",
  learnerEmail: "ada@example.test",
  learnerAvatarUrl: null,
  createdAt: "2026-10-01T10:00:00Z",
  completedAt: null,
}

describe("admin and instructor enrollments", () => {
  it("restores course, learner search, page size and page from the URL", () => {
    expect(
      validateEnrollmentsSearch({
        course: "course",
        q: " Ada ",
        page: "4",
        pageSize: "50",
        modal: "assign",
      })
    ).toMatchObject({
      course: "course",
      q: "Ada",
      page: 4,
      pageSize: 50,
      modal: "assign",
    })
    expect(
      validateEnrollmentsSearch({ q: " ", page: -1, pageSize: 21 })
    ).toMatchObject({ q: undefined, page: undefined, pageSize: undefined })
    expect(validateEnrollmentsSearch({ q: "a".repeat(300) }).q).toHaveLength(
      200
    )
  })

  it("opens the existing progress dialog on the same filtered course page", () => {
    const state = validateEnrollmentsSearch({
      course: "course",
      q: "Ada",
      page: 4,
      pageSize: 50,
      modal: "assign",
    })
    const target = enrollmentProgressSearch(state, enrollmentId)
    expect(validateCourseSearch({ ...target })).toMatchObject({
      tab: "learners",
      courseQ: "Ada",
      coursePage: 4,
      coursePageSize: 50,
      action: "learner",
      selection: enrollmentId,
    })
    expect(target).not.toHaveProperty("modal")
  })

  it("renders the shared table with learner identity, course, dates and a real progress action", () => {
    const html = renderToStaticMarkup(
      createElement(DataTable<EnrollmentRow>, {
        rows: [
          row,
          {
            ...row,
            id: "completed",
            learnerName: "Completed Learner",
            completedAt: "2026-10-14T12:00:00Z",
          },
        ],
        columns: enrollmentTableColumns("Workplace safety", vi.fn()),
        getRowId: (item) => item.id,
        ariaLabel: "Enrollments",
        search: { value: "", onChange: vi.fn() },
        onRefresh: vi.fn(),
        pagination: {
          pageIndex: 0,
          pageSize: 20,
          totalCount: 42,
          onPageChange: vi.fn(),
          onPageSizeChange: vi.fn(),
        },
      })
    )
    for (const content of [
      "<table",
      "Ada Learner",
      "ada@example.test",
      "Workplace safety",
      "Enrolled on",
      "Completed on",
      "Not completed",
      "Completed",
      "Showing 1 to 2 out of 42",
      'aria-label="Refresh Enrollments"',
      'aria-label="View learner progress for Ada Learner"',
      'aria-label="Enrollments pagination"',
    ])
      expect(html).toContain(content)
    expect(html).not.toContain('aria-label="Grid view"')
    expect(html).not.toContain("Remove enrollment")
  })
})
