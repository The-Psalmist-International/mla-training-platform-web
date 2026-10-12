import type { CoursesQuery } from "../../src/generated/graphql"

export { CoursesDocument as COURSES_QUERY } from "../../src/generated/graphql"
export { CoursesPageDocument as COURSES_PAGE_QUERY } from "../../src/generated/graphql"
export {
  CourseDetailsDocument as COURSE_DETAILS_QUERY,
  CreateCourseDocument as CREATE_COURSE_MUTATION,
  UpdateCourseDocument as UPDATE_COURSE_MUTATION,
  PublishCourseDocument as PUBLISH_COURSE_MUTATION,
  UnpublishCourseDocument as UNPUBLISH_COURSE_MUTATION,
  ArchiveCourseDocument as ARCHIVE_COURSE_MUTATION,
} from "../../src/generated/graphql"
export type { CourseDetailsQuery } from "../../src/generated/graphql"
export type {
  CourseStatus,
  CoursesQuery as CoursesQueryResult,
  CoursesQueryVariables,
} from "../../src/generated/graphql"
export type CourseListItem = CoursesQuery["courses"][number]
