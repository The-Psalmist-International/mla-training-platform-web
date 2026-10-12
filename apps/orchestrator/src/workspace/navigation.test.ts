import { describe, expect, it } from "vitest"
import {
  canAccessView,
  navigationGroups,
  viewForPath,
  workspaceViews,
} from "./navigation"

describe("orchestrator navigation", () => {
  it("gives each destination a unique deep-link path", () => {
    const paths = Object.values(workspaceViews).map((view) => view.path)
    expect(new Set(paths).size).toBe(paths.length)
    for (const [view, page] of Object.entries(workspaceViews))
      expect(viewForPath(page.path)).toBe(view)
    expect(viewForPath("/workspace/courses/")).toBe("courses")
    expect(viewForPath("/workspace/unknown")).toBeUndefined()
  })
  it("restricts administration links and direct route access to admins", () => {
    for (const view of navigationGroups[3].items) {
      expect(canAccessView("admin", view)).toBe(true)
      expect(canAccessView("instructor", view)).toBe(false)
      expect(canAccessView("learner", view)).toBe(false)
    }
  })
  it("permits both staff roles to access course and review workspaces", () => {
    for (const group of navigationGroups.slice(0, 3))
      for (const view of group.items) {
        expect(canAccessView("admin", view)).toBe(true)
        expect(canAccessView("instructor", view)).toBe(true)
        expect(canAccessView(undefined, view)).toBe(false)
      }
    expect(canAccessView("instructor", "account")).toBe(true)
    expect(canAccessView("learner", "account")).toBe(false)
  })
})
