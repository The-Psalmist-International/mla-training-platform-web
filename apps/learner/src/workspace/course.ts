import type { OperationVariables, TypedDocumentNode } from "@apollo/client"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { queryOptions } from "@tanstack/react-query"
import type { CurrentUser, DataClients } from "@workspace/data"
import type {
  LearnerCourseStateQuery,
  LearnerCourseContentQuery,
} from "@workspace/data/apollo/learner-course/query"
import { learnerSearch, type LearnerSearch } from "./navigation"

export type LearnerCourseSearch = {
  lesson?: string
  from?: LearnerSearch["tab"]
  page?: number
  pageSize?: number
  q?: string
}
export type CourseOutline = LearnerCourseStateQuery["courseOutline"]
export type CourseEnrollment = NonNullable<
  LearnerCourseStateQuery["myCourseEnrollment"]
>
export type CourseLesson =
  LearnerCourseContentQuery["course"]["modules"][number]["items"][number] & {
    moduleId: string
    moduleTitle: string
  }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function learnerCourseSearch(
  search: Record<string, unknown>
): LearnerCourseSearch {
  const back = learnerSearch({ ...search, tab: search.from ?? "learning" })
  return {
    lesson:
      typeof search.lesson === "string" && uuid.test(search.lesson)
        ? search.lesson
        : undefined,
    from: back.tab,
    page: back.page,
    pageSize: back.pageSize,
    q: back.q,
  }
}
export function courseReturnSearch(search: LearnerSearch): LearnerCourseSearch {
  return {
    from: search.tab,
    page: search.page,
    pageSize: search.pageSize,
    q: search.q,
  }
}
export function courseBackSearch(search: LearnerCourseSearch): LearnerSearch {
  return learnerSearch({ ...search, tab: search.from ?? "learning" })
}
export function orderedCourseLessons(course: CourseOutline) {
  return [...course.modules]
    .sort((a, b) => a.position - b.position)
    .flatMap((module) =>
      [...module.items]
        .sort((a, b) => a.position - b.position)
        .map((item) => ({
          ...item,
          moduleId: module.id,
          moduleTitle: module.title,
        }))
    )
}
export function chooseCourseLesson(
  course: CourseOutline,
  enrollment: CourseEnrollment | null,
  requested?: string
) {
  const lessons = orderedCourseLessons(course)
  if (requested) return lessons.find((lesson) => lesson.id === requested)
  const completed = new Set(
    enrollment?.progress
      .filter((row) => row.status === "completed")
      .map((row) => row.itemId)
  )
  return lessons.find((lesson) => !completed.has(lesson.id)) ?? lessons.at(-1)
}
export function learnerResource<T, V extends OperationVariables>(
  clients: DataClients,
  user: CurrentUser,
  resource: string,
  document: TypedDocumentNode<T, V>,
  variables: V
) {
  return queryOptions({
    queryKey: [
      "learner",
      user.id,
      "course",
      clients.graphqlUrl,
      resource,
      variables,
    ],
    queryFn: async ({ signal }) => {
      const result = await clients.apolloClient.query({
        query: document,
        variables,
        fetchPolicy: "network-only",
        context: { toast: false, fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing course response")
      return result.data
    },
  })
}
export async function learnerMutation<T, V extends OperationVariables>(
  clients: DataClients,
  document: TypedDocumentNode<T, V>,
  variables: V
) {
  const result = await clients.apolloClient.mutate({
    mutation: document,
    variables,
    context: { toast: false },
  })
  if (!result.data) throw new Error("Missing course update")
  return result.data
}
export function learnerCourseError(error: unknown) {
  const code = CombinedGraphQLErrors.is(error)
    ? error.errors[0]?.extensions?.code
    : undefined
  if (code === "LEARNING_QUEUE_UNAVAILABLE")
    return "Your work was saved, but the course completion check is delayed. Retry to finish syncing."
  if (code === "COURSE_UNAVAILABLE" || code === "NOT_FOUND")
    return "This course or lesson is no longer available."
  if (code === "ENROLLMENT_REQUIRED")
    return "Enroll in this course to access its lessons."
  if (code === "ASSESSMENT_ATTEMPT_LIMIT")
    return "You have used all available assessment attempts."
  if (code === "ASSESSMENT_PENDING_GRADING")
    return "Your previous attempt is awaiting grading."
  if (code === "STALE_ATTEMPT_VERSION")
    return "This attempt changed in another tab. Reload it before continuing."
  if (code === "VIDEO_SESSION_EXPIRED")
    return "Your video session expired. Reload the player to continue saving progress."
  return "We couldn't save or load your learning. Check your connection and try again."
}
