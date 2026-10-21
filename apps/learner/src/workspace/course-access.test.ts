import { describe, expect, it } from "vitest"
import { chooseCourseLesson, type CourseOutline } from "./course"

describe("private lesson navigation", () => {
  const course: CourseOutline = {
    id: "course",
    title: "Course",
    description: "",
    status: "published",
    isPrivate: false,
    modules: [
      {
        id: "section",
        title: "Section",
        position: 0,
        items: [
          {
            id: "private",
            title: "Private",
            type: "text",
            position: 0,
            required: true,
            isPrivate: true,
            isLocked: true,
          },
          {
            id: "public",
            title: "Public",
            type: "text",
            position: 1,
            required: true,
            isPrivate: false,
            isLocked: false,
          },
        ],
      },
    ],
  }
  it("starts with available content instead of trapping a new learner in a locked first lesson", () => {
    expect(chooseCourseLesson(course, null)?.id).toBe("public")
  })
  it("still permits a locked lesson link so its access-required notice is visible", () => {
    expect(chooseCourseLesson(course, null, "private")?.isLocked).toBe(true)
  })
})
