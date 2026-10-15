import {
  validateCollectionSearch,
  type CollectionSearchState,
} from "../collection-search"
import type { CourseSearchState } from "../course/course-search"

export interface EnrollmentsSearchState extends CollectionSearchState {
  q?: string
}

export function validateEnrollmentsSearch(
  search: Record<string, unknown>
): EnrollmentsSearchState {
  return {
    ...validateCollectionSearch(search),
    q:
      typeof search.q === "string"
        ? search.q.trim().slice(0, 200) || undefined
        : undefined,
  }
}

// Keep the target learner on the same course page so its progress dialog can open.
export function enrollmentProgressSearch(
  search: EnrollmentsSearchState,
  enrollmentId: string
): CourseSearchState {
  return {
    tab: "learners",
    courseQ: search.q,
    coursePage: search.page,
    coursePageSize: search.pageSize,
    action: "learner",
    selection: enrollmentId,
  }
}
