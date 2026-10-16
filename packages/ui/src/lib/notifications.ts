import { queryOptions } from "@tanstack/react-query"
import {
  MY_NOTIFICATIONS_PAGE_QUERY,
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
  type DataClients,
  type CurrentUser,
  type NotificationType,
} from "@workspace/data"

export const notificationCopy: Record<
  NotificationType,
  { title: string; description: string }
> = {
  submission_failed: {
    title: "Please upload your video again",
    description:
      "We couldn’t prepare your video response. Check the requirements and try uploading it again.",
  },
  grading_pending: {
    title: "Assessment ready for review",
    description: "A learner’s submitted answers are waiting for grading.",
  },
  assessment_graded: {
    title: "Assessment graded",
    description: "Your assessment results are ready to view.",
  },
  submission_pending_review: {
    title: "Video submission ready for review",
    description: "A learner’s video is ready for your feedback.",
  },
  submission_reviewed: {
    title: "Video submission reviewed",
    description: "Feedback on your video submission is ready.",
  },
  certificate_issued: {
    title: "Certificate issued",
    description: "Your course certificate is now available.",
  },
  course_completed: {
    title: "Course completed",
    description: "You’ve completed all the required course content.",
  },
  course_assigned: {
    title: "Course assigned",
    description: "A new course was assigned to you. Start learning.",
  },
}
export function notificationsOptions(
  clients: DataClients,
  user: CurrentUser,
  unreadOnly = false,
  page = 1,
  pageSize = 20
) {
  const variables = {
    unreadOnly,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }
  return queryOptions({
    queryKey: [
      "workspace",
      clients.graphqlUrl,
      user.id,
      "notifications",
      variables,
    ],
    staleTime: 15_000,
    queryFn: async ({ signal }) => {
      const result = await clients.apolloClient.query({
        query: MY_NOTIFICATIONS_PAGE_QUERY,
        variables,
        fetchPolicy: "network-only",
        context: { toast: "query-cache", fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing notifications response")
      return result.data.myNotificationsPage
    },
  })
}
export async function markNotification(clients: DataClients, id: string) {
  const result = await clients.apolloClient.mutate({
    mutation: MARK_NOTIFICATION_READ_MUTATION,
    variables: { id },
    context: { toast: false },
  })
  if (!result.data) throw new Error("Missing notification response")
  return result.data.markNotificationRead
}
export async function markAllNotifications(clients: DataClients) {
  const result = await clients.apolloClient.mutate({
    mutation: MARK_ALL_NOTIFICATIONS_READ_MUTATION,
    context: { toast: false },
  })
  if (!result.data) throw new Error("Missing notifications response")
  return result.data.markAllNotificationsRead
}
export function notificationTime(createdAt: string, now = Date.now()) {
  const age = Math.max(0, now - new Date(createdAt).getTime())
  if (!Number.isFinite(age)) return "Recently"
  if (age < 60_000) return "Just now"
  const [value, unit] =
    age < 3_600_000
      ? [Math.floor(age / 60_000), "minute"]
      : age < 86_400_000
        ? [Math.floor(age / 3_600_000), "hour"]
        : [Math.floor(age / 86_400_000), "day"]
  return new Intl.RelativeTimeFormat(undefined, { numeric: "always" }).format(
    -Number(value),
    unit as Intl.RelativeTimeFormatUnit
  )
}
