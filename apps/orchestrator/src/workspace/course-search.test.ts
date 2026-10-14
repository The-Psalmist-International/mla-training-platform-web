import { describe, expect, it } from "vitest"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { validateCourseSearch, courseListSearch } from "./course-search"

const id = "12345678-1234-4123-8123-123456789abc"
describe("course management URLs", () => {
  it("defaults to Modules, bounds table controls, and preserves the parent library filters", () => {
    const state = validateCourseSearch({
      tab: "modules",
      q: " Leadership ",
      page: 3,
      pageSize: 50,
      coursePage: "2",
      coursePageSize: "10",
      courseQ: "Ada Lovelace",
      module: id,
      action: "edit-lesson",
      moduleId: id,
      lessonId: id,
    })
    expect(state).toMatchObject({
      tab: undefined,
      coursePage: 2,
      coursePageSize: 10,
      courseQ: "Ada Lovelace",
      module: id,
      action: "edit-lesson",
    })
    expect(courseListSearch(state)).toMatchObject({
      q: "Leadership",
      page: 3,
      pageSize: 50,
    })
    expect(courseListSearch(state)).not.toHaveProperty("coursePage")
    expect(
      validateCourseSearch({
        tab: "unknown",
        coursePage: -1,
        coursePageSize: 7,
        module: "bad",
        action: "destroy",
      })
    ).toMatchObject({
      tab: undefined,
      coursePage: undefined,
      coursePageSize: undefined,
      module: undefined,
      action: undefined,
    })
  })
  it("restores tab, filter, selection, and pagination with Back/Forward", async () => {
    const root = createRootRoute()
    const route = createRoute({
      getParentRoute: () => root,
      path: "/workspace/courses/$courseId",
      validateSearch: validateCourseSearch,
    })
    const history = createMemoryHistory({
      initialEntries: [
        `/workspace/courses/${id}?tab=videos&module=${id}&coursePage=3&coursePageSize=10&q=Leadership&page=2`,
      ],
    })
    const router = createRouter({
      routeTree: root.addChildren([route]),
      history,
    })
    await router.load()
    const location = router.buildLocation({
      to: "/workspace/courses/$courseId",
      params: { courseId: id },
      search: (previous) =>
        validateCourseSearch({
          ...previous,
          tab: "reviews",
          reviewType: "video",
          coursePage: undefined,
          module: undefined,
        }),
    })
    history.push(location.href)
    await router.load()
    expect(router.state.location.search).toMatchObject({
      tab: "reviews",
      reviewType: "video",
      q: "Leadership",
      page: 2,
    })
    history.back()
    await router.load()
    expect(router.state.location.search).toMatchObject({
      tab: "videos",
      module: id,
      coursePage: 3,
      coursePageSize: 10,
      q: "Leadership",
      page: 2,
    })
    history.forward()
    await router.load()
    expect(router.state.location.search).toMatchObject({
      tab: "reviews",
      reviewType: "video",
    })
  })
})
