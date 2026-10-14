import type { OperationVariables, TypedDocumentNode } from "@apollo/client"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { queryOptions } from "@tanstack/react-query"
import {
  CourseManagementDocument,
  type CurrentUser,
  type DataClients,
  type CourseManagementQuery,
} from "@workspace/data"
import { libraryActionError } from "./library-actions"
import { ThumbnailUploadError } from "./course-thumbnail"

export type ManagedCourse = CourseManagementQuery["course"]
export type ManagedModule = ManagedCourse["modules"][number]
export type ManagedLesson = ManagedModule["items"][number]
export function courseResourceOptions<
  TResult,
  TVariables extends OperationVariables,
>(
  clients: DataClients,
  user: CurrentUser,
  resource: string,
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables
) {
  return queryOptions({
    queryKey: [
      "workspace",
      clients.graphqlUrl,
      user.id,
      "course-management",
      resource,
      variables,
    ],
    queryFn: async ({ signal }) => {
      if (user.role !== "admin" && user.role !== "instructor")
        throw new Error("Workspace access required")
      const result = await clients.apolloClient.query({
        query: document,
        variables,
        fetchPolicy:
          resource === "lesson-playback" || resource === "submission-review"
            ? "no-cache"
            : "network-only",
        context: { toast: "query-cache", fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing course response")
      return result.data
    },
  })
}
export const courseManagementOptions = (
  clients: DataClients,
  user: CurrentUser,
  id: string
) =>
  courseResourceOptions(clients, user, "course", CourseManagementDocument, {
    id,
  })
export async function courseMutation<
  TResult,
  TVariables extends OperationVariables,
>(
  clients: DataClients,
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables
) {
  const result = await clients.apolloClient.mutate({
    mutation: document,
    variables,
    context: { toast: false },
  })
  if (!result.data || Object.keys(result.data).length === 0)
    throw new Error("Missing course update response")
  return result.data
}
export function courseManagementError(error: unknown) {
  if (error instanceof ThumbnailUploadError) return error.message
  const code = CombinedGraphQLErrors.is(error)
    ? error.errors[0]?.extensions?.code
    : undefined
  if (code === "LEARNING_QUEUE_UNAVAILABLE")
    return "Enrollment was saved, but its completion check could not be queued. Retry assigning the same learner."
  if (code === "ASSESSMENT_NOT_READY" || code === "INVALID_QUESTIONS")
    return "Check every question, its points, and correct answers before saving."
  return libraryActionError(error)
}
export function reorderIds(ids: string[], index: number, direction: -1 | 1) {
  const target = index + direction
  if (index < 0 || target < 0 || target >= ids.length) return ids
  const next = [...ids]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
export function reorderTo(ids: string[], activeId: string, targetId: string) {
  const from = ids.indexOf(activeId),
    to = ids.indexOf(targetId)
  if (from < 0 || to < 0 || from === to) return ids
  const next = [...ids]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
