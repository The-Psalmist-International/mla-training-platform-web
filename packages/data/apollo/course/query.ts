import type { CoursesQuery } from "../../src/generated/graphql"

export { CoursesDocument as COURSES_QUERY } from "../../src/generated/graphql"
export { CoursesPageDocument as COURSES_PAGE_QUERY } from "../../src/generated/graphql"
export type {
  CourseStatus,
  CoursesQuery as CoursesQueryResult,
  CoursesQueryVariables,
} from "../../src/generated/graphql"
export type CourseListItem = CoursesQuery["courses"][number]
