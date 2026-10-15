import { createElement, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import {
  learnerSearch,
  learnerTabs,
  learnerInitials,
  firstName,
} from "./navigation"
import { LearnerWorkspace } from "../components/LearnerWorkspace"
import {
  CourseCard,
  DataState,
  enrollmentGridLayout,
} from "../components/LearnerWorkspaceContent"
import { DataTable } from "@workspace/ui/components/data-table"
import { formatRemaining, timerTone } from "../components/course/AssessmentLesson"
import type { EnrollmentListItem } from "@workspace/data/apollo/enrollment/query"

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    search,
    children,
    ...props
  }: {
    to: string
    search: Record<string, string | number>
    children: ReactNode
  }) =>
    createElement(
      "a",
      {
        ...props,
        href: `${to}?${new URLSearchParams(Object.entries(search).map(([key, value]) => [key, String(value)]))}`,
      },
      children
    ),
}))
vi.mock("@workspace/ui/components/theme-toggle", () => ({
  ThemeToggle: () => createElement("button", { "aria-label": "Switch theme" }),
}))
vi.mock("../components/LearnerNotifications", () => ({
  LearnerNotifications: () =>
    createElement("button", { "aria-label": "Notifications" }),
}))

describe("learner horizontal workspace", () => {
  it("validates URL tab and pagination state without allowing unsafe offsets", () => {
    expect(learnerSearch({})).toEqual({ tab: "overview", page: 1 })
    expect(learnerSearch({ tab: "library", page: "3" })).toEqual({
      tab: "library",
      page: 3,
    })
    for (const tab of learnerTabs)
      expect(learnerSearch({ tab: tab.id }).tab).toBe(tab.id)
    for (const page of [-1, 0, 1.5, NaN, Infinity, "1e3", "-2", "oops", 100001])
      expect(learnerSearch({ tab: "learning", page }).page).toBe(1)
    expect(learnerSearch({ tab: "overview", page: 5 }).page).toBe(1)
    expect(learnerSearch({ tab: "admin", page: 2 }).tab).toBe("overview")
  })

  it("renders a full-height workspace with horizontal, URL-backed page navigation", () => {
    const html = renderToStaticMarkup(
      createElement(LearnerWorkspace, {
        user: {
          id: "learner-1",
          name: "Alex Learner",
          email: "alex@example.test",
          role: "learner",
        },
        tab: "learning",
        signingOut: false,
        onSignOut: vi.fn(),
        onAccountClick: vi.fn(),
        children: createElement("h1", { id: "learner-heading" }, "My learning"),
      })
    )
    expect(html).toContain('aria-label="Learner workspace"')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain("overflow-x-auto")
    expect(html).toContain("min-h-svh")
    expect(html).toContain('href="#learner-content"')
    for (const tab of learnerTabs)
      expect(html).toContain(`tab=${tab.id}&amp;page=1`)
    expect(html).toContain("Account menu for Alex Learner")
    expect(html).toContain('aria-label="Notifications"')
    expect(html).not.toContain('aria-label="Switch theme"')
    expect(html).not.toContain("learner-auth-background")
    expect(html).not.toContain('data-slot="sidebar"')
  })

  it("preserves enrollment search and page size in validated URL state", () => {
    expect(
      learnerSearch({ tab: "learning", page: "4", pageSize: "50", q: "Safety" })
    ).toEqual({ tab: "learning", page: 4, pageSize: 50, q: "Safety" })
    for (const pageSize of [0, -1, 12, 101, "bad"])
      expect(
        learnerSearch({ tab: "learning", pageSize }).pageSize
      ).toBeUndefined()
    expect(
      learnerSearch({ tab: "learning", q: "x".repeat(300) }).q
    ).toHaveLength(200)
    expect(
      learnerSearch({ tab: "library", pageSize: 50, q: "Safety" })
    ).toEqual({ tab: "library", page: 1 })
  })

  it("renders enrollment metadata in a grid only with no table or view toggle", () => {
    const course = {
      id: "course-1",
      ownerId: "instructor-1",
      title: "Workplace safety",
      description: "Essential training",
      thumbnailUrl: null,
      status: "published" as const,
      certificateEnabled: true,
      publishedAt: null,
      createdAt: "2026-10-15T00:00:00Z",
      updatedAt: "2026-10-15T00:00:00Z",
    }
    const rows: EnrollmentListItem[] = [
      {
        id: "e1",
        userId: "learner-1",
        courseId: course.id,
        enrolledBy: "admin-1",
        createdAt: "2026-10-01T00:00:00Z",
        completedAt: null,
        learningProgress: {
          completedRequiredItems: 2,
          totalRequiredItems: 5,
          percentage: 40,
        },
        course,
      },
      {
        id: "e2",
        userId: "learner-1",
        courseId: "course-2",
        enrolledBy: "admin-1",
        createdAt: "2026-10-01T00:00:00Z",
        completedAt: "2026-10-14T00:00:00Z",
        learningProgress: {
          completedRequiredItems: 5,
          totalRequiredItems: 5,
          percentage: 100,
        },
        course: {
          ...course,
          id: "course-2",
          title: "First aid",
          certificateEnabled: false,
        },
      },
    ]
    const html = renderToStaticMarkup(
      createElement(DataTable<EnrollmentListItem>, {
        rows,
        columns: [],
        layout: enrollmentGridLayout,
        gridClassName: "grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
        getRowId: (row) => row.id,
        ariaLabel: "enrollments",
        search: { value: "", onChange: vi.fn() },
        onRefresh: vi.fn(),
        pagination: {
          pageIndex: 0,
          pageSize: 20,
          totalCount: 2,
          onPageChange: vi.fn(),
          onPageSizeChange: vi.fn(),
        },
      })
    )
    for (const content of [
      "Workplace safety",
      "First aid",
      "In progress",
      "Enrolled",
      "Completed",
      "40%",
      "100%",
      "2 of 5 required lessons completed",
      'aria-label="Certificate included"',
      "Showing 1 to 2 out of 2",
      'data-slot="data-table"',
      'aria-label="Refresh enrollments"',
    ])
      expect(html).toContain(content)
    expect(html).not.toContain("Issued")
    expect(html).toContain("<progress")
    expect(html).toContain('value="40" max="100"')
    expect(html).not.toContain("<dl")
    expect(html).not.toContain("Enrolled on")
    expect(html).toContain("lg:grid-cols-3")
    expect(html).not.toContain("@6xl/data-table:grid-cols-4")
    expect(html).not.toContain("<table")
    expect(html).not.toContain('aria-label="Table view"')
    expect(html).not.toContain('aria-label="Grid view"')
    expect(html).toContain('aria-label="enrollments grid scroll area"')
  })

  it("stages the quiz timer green to amber to red by elapsed share", () => {
    const total = 8 * 60 * 1000
    expect(timerTone(total, total)).toBe("ok")
    expect(timerTone(total * 0.6, total)).toBe("ok")
    expect(timerTone(total * 0.5, total)).toBe("warning")
    expect(timerTone(total * 0.29, total)).toBe("critical")
    expect(timerTone(0, total)).toBe("critical")
    expect(timerTone(null, total)).toBe("critical")
    expect(formatRemaining(150000)).toBe("2:30")
    expect(formatRemaining(3723000)).toBe("1:02:03")
  })

  it("provides safe personalisation fallbacks", () => {
    expect(firstName("  Alex Learner ")).toBe("Alex")
    expect(firstName(" ")).toBe("there")
    expect(learnerInitials(" Alex Learner ")).toBe("AL")
    expect(learnerInitials("")).toBe("L")
  })

  it("keeps loading, error and empty distinct instead of displaying failed requests as zero courses", () => {
    const props = {
      pending: false,
      error: false,
      retry: vi.fn(),
      empty: false,
      emptyTitle: "No training assigned yet",
      emptyDescription: "Your courses will appear here.",
      children: createElement("p", null, "Course content"),
    }
    const loading = renderToStaticMarkup(
      createElement(DataState, { ...props, pending: true })
    )
    expect(loading).toContain('role="status"')
    expect(loading).not.toContain("No training assigned yet")
    const failed = renderToStaticMarkup(
      createElement(DataState, { ...props, error: true, empty: true })
    )
    expect(failed).toContain('role="alert"')
    expect(failed).toContain("Try again")
    expect(failed).not.toContain("No training assigned yet")
    const empty = renderToStaticMarkup(
      createElement(DataState, { ...props, empty: true })
    )
    expect(empty).toContain('data-slot="empty-state"')
    expect(empty).toContain("No training assigned yet")
    expect(renderToStaticMarkup(createElement(DataState, props))).toContain(
      "Course content"
    )
  })

  it("renders real course content without fake progress or non-functional start buttons", () => {
    const html = renderToStaticMarkup(
      createElement(CourseCard, {
        course: {
          id: "course-1",
          ownerId: "instructor-1",
          title: "Workplace safety",
          description: "Complete essential workplace training.",
          thumbnailUrl: null,
          status: "published",
          certificateEnabled: true,
          publishedAt: null,
          createdAt: "2026-10-15T00:00:00Z",
          updatedAt: "2026-10-15T00:00:00Z",
        },
        detail: "Enrolled",
      })
    )
    expect(html).toContain("Workplace safety")
    expect(html).toContain("Enrolled")
    expect(html).not.toContain("Start course")
    expect(html).not.toContain("%")
  })
})
