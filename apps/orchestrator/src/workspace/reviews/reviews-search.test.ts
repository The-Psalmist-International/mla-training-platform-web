import { describe, expect, it } from "vitest"
import {
  reviewDialogSearch,
  validateReviewsSearch,
} from "./reviews-search"

describe("reviews collection URL state", () => {
  it("restores page, page size, course, and query from URL values", () => {
    expect(
      validateReviewsSearch({ page: 2, pageSize: 50, course: "course-1", q: " Ada " })
    ).toEqual({ page: 2, pageSize: 50, course: "course-1", q: "Ada" })
  })

  it("normalizes defaults and rejects unsafe search text", () => {
    expect(validateReviewsSearch({})).toEqual({
      page: undefined,
      pageSize: undefined,
      course: undefined,
      q: undefined,
    })
    expect(validateReviewsSearch({ q: "x".repeat(300) }).q).toHaveLength(200)
    expect(validateReviewsSearch({ q: "   " }).q).toBeUndefined()
  })

  it("opens the course grading dialog for the selected review", () => {
    expect(
      reviewDialogSearch("assessment", "00000000-0000-4000-8000-000000000001")
    ).toEqual({
      tab: "reviews",
      action: "review-assessment",
      selection: "00000000-0000-4000-8000-000000000001",
    })
    expect(
      reviewDialogSearch("video", "00000000-0000-4000-8000-000000000002")
    ).toEqual({
      tab: "reviews",
      reviewType: "video",
      action: "review-video",
      selection: "00000000-0000-4000-8000-000000000002",
    })
  })
})
