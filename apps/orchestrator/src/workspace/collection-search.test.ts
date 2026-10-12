import { describe, expect, it } from "vitest"
import { validateCollectionSearch } from "./collection-search"

describe("collection pagination URL state", () => {
  it("restores page, page size, and course from URL values", () => {
    expect(
      validateCollectionSearch({
        page: "3",
        pageSize: "50",
        course: " course-id ",
      })
    ).toEqual({ page: 3, pageSize: 50, course: "course-id" })
  })
  it("normalizes defaults and rejects invalid pagination", () => {
    for (const input of [
      {},
      { page: "invalid", pageSize: 21 },
      { page: -2, pageSize: -1 },
      { page: 1.5, pageSize: 101 },
    ]) {
      expect(validateCollectionSearch(input)).toEqual({
        page: undefined,
        pageSize: undefined,
        course: undefined,
      })
    }
  })
  it("keeps size and course while changing pages and resets pages on course changes", () => {
    const previous = validateCollectionSearch({
      page: 3,
      pageSize: 50,
      course: "one",
    })
    expect(validateCollectionSearch({ ...previous, page: 4 })).toEqual({
      page: 4,
      pageSize: 50,
      course: "one",
    })
    expect(
      validateCollectionSearch({ ...previous, page: undefined, course: "two" })
    ).toEqual({ page: undefined, pageSize: 50, course: "two" })
  })
})
