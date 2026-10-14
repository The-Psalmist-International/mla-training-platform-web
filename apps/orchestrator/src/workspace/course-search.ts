import {
  validateCoursesSearch,
  type LibrarySearchState,
} from "./library-search"
import { validateCollectionSearch } from "./collection-search"

export const courseTabs = [
  "general",
  "modules",
  "videos",
  "learners",
  "reviews",
  "settings",
] as const
export type CourseTab = (typeof courseTabs)[number]
export const courseActions = [
  "add-module",
  "edit-module",
  "archive-module",
  "add-lesson",
  "view-lesson",
  "edit-lesson",
  "archive-lesson",
  "move-lesson",
  "questions",
  "upload-video",
  "video-details",
  "video-preview",
  "enroll",
  "learner",
  "review-assessment",
  "review-video",
  "edit-general",
  "publish",
  "unpublish",
  "archive",
] as const
export type CoursePageAction = (typeof courseActions)[number]
export interface CourseSearchState extends LibrarySearchState {
  tab?: CourseTab
  courseQ?: string
  module?: string
  coursePage?: number
  coursePageSize?: number
  reviewType?: "video"
  action?: CoursePageAction
  moduleId?: string
  lessonId?: string
  selection?: string
}
const id = (value: unknown) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : undefined
export function validateCourseSearch(
  search: Record<string, unknown>
): CourseSearchState {
  const page = validateCollectionSearch({
    page: search.coursePage,
    pageSize: search.coursePageSize,
  })
  const tab = courseTabs.find((value) => value === search.tab)
  return {
    ...validateCoursesSearch(search),
    tab: tab === "modules" ? undefined : tab,
    courseQ:
      typeof search.courseQ === "string"
        ? search.courseQ.trim().slice(0, 200) || undefined
        : undefined,
    module: id(search.module),
    coursePage: page.page,
    coursePageSize: page.pageSize,
    reviewType: search.reviewType === "video" ? "video" : undefined,
    action: courseActions.find((value) => value === search.action),
    moduleId: id(search.moduleId),
    lessonId: id(search.lessonId),
    selection: id(search.selection),
  }
}
export function courseListSearch(
  search: CourseSearchState
): LibrarySearchState {
  return validateCoursesSearch({ ...search, modal: undefined, item: undefined })
}
