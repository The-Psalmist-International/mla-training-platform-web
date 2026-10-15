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
  it("opens and closes the assign dialog without touching pagination", () => {
    expect(
      validateCollectionSearch({ modal: "assign", course: "course-id" })
    ).toEqual({ modal: "assign", course: "course-id" })
    expect(validateCollectionSearch({ modal: "create" }).modal).toBeUndefined()
    expect(
      validateCollectionSearch({ modal: "assign", course: "course-id", page: 2 })
    ).toMatchObject({ modal: "assign", page: 2 })
    expect(
      validateCollectionSearch({
        modal: undefined,
        course: "course-id",
        page: 2,
      })
    ).toEqual({ modal: undefined, course: "course-id", page: 2 })
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
