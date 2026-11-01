import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { DndContext } from "@dnd-kit/core"
import { CourseMoveSurface } from "../../components/course/CourseMoveSurface"
import { validateCoursesSearch, validateVideosSearch } from "../library/library-search"

describe("course movement controls", () => {
  it("preserves a confirmed drop destination in course URL state only", () => {
    const source = "12345678-1234-1234-1234-123456789abc", destination = "22345678-1234-1234-1234-123456789abc"
    expect(validateCoursesSearch({ modal: "move", item: source, destination })).toMatchObject({ modal: "move", item: source, destination })
    expect(validateVideosSearch({ modal: "move", item: source, destination }).modal).toBeUndefined()
    expect(validateCoursesSearch({ modal: "move", item: source, destination: "invalid" }).destination).toBeUndefined()
  })

  it("offers dragging only for an owned active course with no enrollment history", () => {
    const item = { id: "course", title: "Leadership", description: "", status: "draft" as const, createdAt: "2026-11-01", canDelete: true }
    const render = (owns: boolean, canDelete: boolean, status: "draft" | "archived" = "draft") => renderToStaticMarkup(<DndContext><CourseMoveSurface item={{ ...item, canDelete, status }} owns={owns} enabled><span>Course content</span></CourseMoveSurface></DndContext>)
    expect(render(true, true)).toContain('aria-label="Drag Leadership into another course"')
    for (const html of [render(false, true), render(true, false), render(true, true, "archived")]) {
      expect(html).not.toContain('aria-label="Drag Leadership into another course"')
      expect(html).toContain("Course content")
    }
  })
})
