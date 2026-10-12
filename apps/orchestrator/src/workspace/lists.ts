import type { OperationVariables, TypedDocumentNode } from "@apollo/client"
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"
import {
  ADMIN_EMAIL_MESSAGES_QUERY,
  ASSESSMENT_REVIEW_QUEUE_QUERY,
  CERTIFICATE_FOR_ENROLLMENT_QUERY,
  COURSE_ENROLLMENTS_QUERY,
  COURSES_QUERY,
  INVITATIONS_QUERY,
  MY_VIDEO_ASSETS_QUERY,
  USERS_QUERY,
  VIDEO_SUBMISSION_REVIEW_QUEUE_QUERY,
  type CurrentUser,
  type DataClients,
} from "@workspace/data"
import { canAccessView } from "./navigation"

export type CollectionView =
  | "courses"
  | "videos"
  | "enrollments"
  | "assessments"
  | "submissions"
  | "people"
  | "invitations"
  | "certificates"
  | "delivery"

export interface WorkspaceRow {
  id: string
  title: string
  description: string
  status: string
}
export interface WorkspaceList {
  items: WorkspaceRow[]
  hasNextPage: boolean
}
export const workspacePageSize = 20
export const courseScopedViews: readonly CollectionView[] = [
  "enrollments",
  "assessments",
  "submissions",
  "certificates",
]

async function execute<T, TVariables extends OperationVariables>(
  clients: DataClients,
  query: TypedDocumentNode<T, TVariables>,
  variables: TVariables,
  signal: AbortSignal
): Promise<T> {
  const result = await clients.apolloClient.query({
    query,
    variables,
    fetchPolicy: "network-only",
    context: { fetchOptions: { signal } },
  })
  if (!result.data) throw new Error("Missing workspace response")
  return result.data
}

export function workspaceCoursesOptions(
  clients: DataClients,
  user: CurrentUser
) {
  return infiniteQueryOptions({
    queryKey: [
      "workspace",
      clients.graphqlUrl,
      user.id,
      user.role,
      "course-scope",
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const data = await execute(
        clients,
        COURSES_QUERY,
        {
          limit: 100,
          offset: pageParam,
          mine: user.role === "instructor",
        },
        signal
      )
      return data.courses
    },
    getNextPageParam: (lastPage, _pages, lastOffset) =>
      lastPage.length === 100 ? lastOffset + 100 : undefined,
  })
}

export function workspaceListOptions(
  clients: DataClients,
  user: CurrentUser,
  view: CollectionView,
  courseId: string,
  offset: number,
  pageSize = workspacePageSize
) {
  return queryOptions({
    queryKey: [
      "workspace",
      clients.graphqlUrl,
      user.id,
      user.role,
      view,
      courseId,
      offset,
      pageSize,
    ],
    queryFn: async ({ signal }): Promise<WorkspaceList> => {
      if (!canAccessView(user.role, view))
        throw new Error("This section is unavailable for your role.")
      if (courseScopedViews.includes(view) && !courseId) {
        throw new Error("Select a course before loading this section.")
      }
      const page = { limit: pageSize, offset }
      const scope = { ...page, courseId }
      let items: WorkspaceRow[]
      let pageLength: number
      switch (view) {
        case "courses": {
          const data = await execute(
            clients,
            COURSES_QUERY,
            { ...page, mine: user.role === "instructor" },
            signal
          )
          items = data.courses.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            status: item.status,
          }))
          break
        }
        case "videos": {
          const data = await execute(
            clients,
            MY_VIDEO_ASSETS_QUERY,
            page,
            signal
          )
          items = data.myVideoAssets.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.mimeType,
            status: item.status,
          }))
          break
        }
        case "enrollments": {
          const data = await execute(
            clients,
            COURSE_ENROLLMENTS_QUERY,
            scope,
            signal
          )
          items = data.courseEnrollments.map((item) => ({
            id: item.id,
            title: item.learnerName,
            description: "Course enrollment",
            status: item.completedAt ? "completed" : "in_progress",
          }))
          break
        }
        case "assessments": {
          const data = await execute(
            clients,
            ASSESSMENT_REVIEW_QUEUE_QUERY,
            scope,
            signal
          )
          items = data.assessmentReviewQueue.map((item) => ({
            id: item.id,
            title: item.assessmentTitle,
            description: `${item.learnerName} · Attempt ${item.attemptNumber}`,
            status: item.status,
          }))
          break
        }
        case "submissions": {
          const data = await execute(
            clients,
            VIDEO_SUBMISSION_REVIEW_QUEUE_QUERY,
            scope,
            signal
          )
          items = data.videoSubmissionReviewQueue.map((item) => ({
            id: item.id,
            title: item.promptTitle,
            description: `${item.learnerName} · Attempt ${item.attemptNumber}`,
            status: item.status,
          }))
          break
        }
        case "people": {
          const data = await execute(clients, USERS_QUERY, page, signal)
          items = data.users.map((item) => ({
            id: item.id,
            title: item.name,
            description: item.email,
            status: item.disabledAt ? "disabled" : item.role,
          }))
          break
        }
        case "invitations": {
          const data = await execute(clients, INVITATIONS_QUERY, page, signal)
          items = data.invitations.map((item) => ({
            id: item.id,
            title: item.email,
            description: item.role,
            status: item.revokedAt
              ? "revoked"
              : item.acceptedAt
                ? "accepted"
                : Date.parse(item.expiresAt) <= Date.now()
                  ? "expired"
                  : "pending",
          }))
          break
        }
        case "delivery": {
          const data = await execute(
            clients,
            ADMIN_EMAIL_MESSAGES_QUERY,
            page,
            signal
          )
          items = data.adminEmailMessages.map((item) => ({
            id: item.id,
            title: item.recipient,
            description: item.purpose.replaceAll("_", " "),
            status: item.status,
          }))
          break
        }
        case "certificates": {
          // The backend has no global certificate list. Inspect one enrollment page
          // at a time and cap lookup concurrency rather than firing unbounded requests.
          const data = await execute(
            clients,
            COURSE_ENROLLMENTS_QUERY,
            scope,
            signal
          )
          items = []
          for (
            let start = 0;
            start < data.courseEnrollments.length;
            start += 4
          ) {
            signal.throwIfAborted()
            const certificates = await Promise.all(
              data.courseEnrollments
                .slice(start, start + 4)
                .map(async (enrollment) => {
                  const result = await execute(
                    clients,
                    CERTIFICATE_FOR_ENROLLMENT_QUERY,
                    { enrollmentId: enrollment.id },
                    signal
                  )
                  return result.certificateForEnrollment
                })
            )
            for (const item of certificates) {
              if (item)
                items.push({
                  id: item.id,
                  title: item.recipientName,
                  description: `${item.courseTitle} · ${item.certificateNumber}`,
                  status: item.status,
                })
            }
          }
          pageLength = data.courseEnrollments.length
          return { items, hasNextPage: pageLength === pageSize }
        }
      }
      return { items, hasNextPage: items.length === pageSize }
    },
  })
}

export const collectionEmptyStates = {
  courses: {
    title: "No courses yet",
    description:
      "Create your first course to start building your learning content.",
  },
  videos: {
    title: "No videos yet",
    description: "Upload your first lesson video to start your library.",
  },
  enrollments: {
    title: "No enrollments yet",
    description: "Learners will appear here when they enroll in this course.",
  },
  assessments: {
    title: "No assessments to review",
    description: "Submitted answers that need grading will appear here.",
  },
  submissions: {
    title: "No video submissions to review",
    description: "Learner videos awaiting feedback will appear here.",
  },
  people: {
    title: "No people yet",
    description: "Invite people to join the academy and get started.",
  },
  invitations: {
    title: "No invitations yet",
    description:
      "Invite a learner, instructor, or administrator to join the academy.",
  },
  certificates: {
    title: "No certificates for these enrollments",
    description:
      "Certificates are issued automatically when eligible learners complete a course.",
  },
  delivery: {
    title: "No email activity yet",
    description:
      "Delivery updates will appear here when the platform sends an email.",
  },
} satisfies Record<CollectionView, { title: string; description: string }>
