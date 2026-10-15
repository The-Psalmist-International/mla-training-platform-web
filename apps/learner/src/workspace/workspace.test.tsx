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
import { CourseCard, DataState } from "../components/LearnerWorkspaceContent"

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
