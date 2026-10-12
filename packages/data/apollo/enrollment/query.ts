import type {
  MyEnrollmentsQuery,
  CourseEnrollmentsQuery,
} from "../../src/generated/graphql"

export {
  MyEnrollmentsDocument as MY_ENROLLMENTS_QUERY,
  CourseEnrollmentsDocument as COURSE_ENROLLMENTS_QUERY,
} from "../../src/generated/graphql"
export type {
  MyEnrollmentsQuery as MyEnrollmentsQueryResult,
  MyEnrollmentsQueryVariables,
  CourseEnrollmentsQuery as CourseEnrollmentsQueryResult,
  CourseEnrollmentsQueryVariables,
} from "../../src/generated/graphql"
export type EnrollmentListItem = MyEnrollmentsQuery["myEnrollments"][number]
export type CourseEnrollmentListItem =
  CourseEnrollmentsQuery["courseEnrollments"][number]
