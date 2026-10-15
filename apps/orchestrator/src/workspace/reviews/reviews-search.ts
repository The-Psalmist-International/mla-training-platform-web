import {
  validateCollectionSearch,
  type CollectionSearchState,
} from "../collection-search"
import type { CourseSearchState } from "../course/course-search"

export type ReviewQueueType = "assessment" | "video"

export interface ReviewsSearchState extends CollectionSearchState {
  q?: string
}

export function validateReviewsSearch(
  search: Record<string, unknown>
): ReviewsSearchState {
  return {
    ...validateCollectionSearch(search),
    q:
      typeof search.q === "string"
        ? search.q.trim().slice(0, 200) || undefined
        : undefined,
  }
}

// Keep the target review on the same course page so its grading dialog can open.
export function reviewDialogSearch(
  type: ReviewQueueType,
  selection: string
): CourseSearchState {
  return type === "video"
    ? {
        tab: "reviews",
        reviewType: "video",
        action: "review-video",
        selection,
      }
    : {
        tab: "reviews",
        action: "review-assessment",
        selection,
      }
}
