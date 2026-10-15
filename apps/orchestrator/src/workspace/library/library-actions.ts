import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { queryOptions } from "@tanstack/react-query"
import {
  COURSE_DETAILS_QUERY,
  CREATE_COURSE_MUTATION,
  UPDATE_COURSE_MUTATION,
  PUBLISH_COURSE_MUTATION,
  UNPUBLISH_COURSE_MUTATION,
  ARCHIVE_COURSE_MUTATION,
  CREATE_COURSE_MODULE_MUTATION,
  VIDEO_ASSET_DETAILS_QUERY,
  PREVIEW_LESSON_VIDEO_QUERY,
  CREATE_LESSON_VIDEO_UPLOAD_MUTATION,
  REFRESH_LESSON_VIDEO_UPLOAD_MUTATION,
  SYNC_LESSON_VIDEO_ASSET_MUTATION,
  SET_LESSON_VIDEO_THUMBNAIL_MUTATION,
  type CurrentUser,
  type DataClients,
  type CreateLessonVideoUploadMutation,
} from "@workspace/data"
import * as yup from "yup"

function requireAuthor(user: CurrentUser) {
  if (user.role !== "admin" && user.role !== "instructor")
    throw new Error("Workspace access required")
}
export async function saveVideoThumbnail(clients: DataClients, user: CurrentUser, id: string, thumbnailUrl: string | null) {
  requireAuthor(user)
  const result = await clients.apolloClient.mutate({
    mutation: SET_LESSON_VIDEO_THUMBNAIL_MUTATION,
    variables: { id, thumbnailUrl },
    context: { toast: false },
  })
  if (!result.data) throw new Error("Missing video thumbnail response")
  return result.data.setLessonVideoThumbnail
}
export const courseFormSchema = yup.object({
  thumbnailUrl: yup
    .string()
    .trim()
    .max(2048, "Image URL must be 2,048 characters or fewer.")
    .test(
      "https-image",
      "Enter an HTTPS image URL without credentials.",
      (value) => {
        if (!value) return true
        try {
          const url = new URL(value)
          return url.protocol === "https:" && !url.username && !url.password
        } catch {
          return false
        }
      }
    ),
  title: yup
    .string()
    .trim()
    .required("Enter a course title.")
    .max(200, "Title must be 200 characters or fewer."),
  description: yup
    .string()
    .trim()
    .max(10000, "Description must be 10,000 characters or fewer.")
    .defined(),
  certificateEnabled: yup.boolean().required(),
})
export type CourseFormValues = {
  thumbnailUrl?: string
  title: string
  description: string
  certificateEnabled: boolean
}
export const courseModuleSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Enter a section title.")
    .max(200, "Title must be 200 characters or fewer."),
})
export type CourseAction = "publish" | "unpublish" | "archive"
export function courseDetailsOptions(
  clients: DataClients,
  user: CurrentUser,
  id: string
) {
  return queryOptions({
    queryKey: ["workspace", clients.graphqlUrl, user.id, "course-details", id],
    queryFn: async ({ signal }) => {
      requireAuthor(user)
      const result = await clients.apolloClient.query({
        query: COURSE_DETAILS_QUERY,
        variables: { id },
        fetchPolicy: "network-only",
        context: { toast: "query-cache", fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing course details response")
      return result.data.course
    },
  })
}
export async function saveCourse(
  clients: DataClients,
  user: CurrentUser,
  input: CourseFormValues,
  id?: string
) {
  requireAuthor(user)
  const values = {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    ...(input.thumbnailUrl !== undefined
      ? { thumbnailUrl: input.thumbnailUrl.trim() || null }
      : {}),
  }
  if (id) {
    const result = await clients.apolloClient.mutate({
      mutation: UPDATE_COURSE_MUTATION,
      context: { toast: false },
      variables: { id, input: values },
    })
    if (!result.data) throw new Error("Missing course update response")
    return result.data.updateCourse
  }
  const result = await clients.apolloClient.mutate({
    mutation: CREATE_COURSE_MUTATION,
    context: { toast: false },
    variables: { input: values },
  })
  if (!result.data) throw new Error("Missing course create response")
  return result.data.createCourse
}
export async function addCourseModule(
  clients: DataClients,
  user: CurrentUser,
  courseId: string,
  title: string
) {
  requireAuthor(user)
  const result = await clients.apolloClient.mutate({
    mutation: CREATE_COURSE_MODULE_MUTATION,
    context: { toast: false },
    variables: { courseId, input: { title: title.trim() } },
  })
  if (!result.data) throw new Error("Missing course section response")
  return result.data.createCourseModule
}
export async function changeCourseStatus(
  clients: DataClients,
  user: CurrentUser,
  id: string,
  action: CourseAction
) {
  requireAuthor(user)
  if (action === "publish") {
    const result = await clients.apolloClient.mutate({
      mutation: PUBLISH_COURSE_MUTATION,
      context: { toast: false },
      variables: { id },
    })
    if (!result.data) throw new Error("Missing publication response")
    return result.data.publishCourse
  }
  if (action === "unpublish") {
    const result = await clients.apolloClient.mutate({
      mutation: UNPUBLISH_COURSE_MUTATION,
      context: { toast: false },
      variables: { id },
    })
    if (!result.data) throw new Error("Missing unpublication response")
    return result.data.unpublishCourse
  }
  const result = await clients.apolloClient.mutate({
    mutation: ARCHIVE_COURSE_MUTATION,
    context: { toast: false },
    variables: { id },
  })
  if (!result.data) throw new Error("Missing archive response")
  return result.data.archiveCourse
}
export function videoDetailsOptions(
  clients: DataClients,
  user: CurrentUser,
  id: string
) {
  return queryOptions({
    queryKey: ["workspace", clients.graphqlUrl, user.id, "video-details", id],
    queryFn: async ({ signal }) => {
      requireAuthor(user)
      const result = await clients.apolloClient.query({
        query: VIDEO_ASSET_DETAILS_QUERY,
        variables: { id },
        fetchPolicy: "network-only",
        context: { toast: "query-cache", fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing video details response")
      return result.data.videoAsset
    },
  })
}
export function videoPreviewOptions(
  clients: DataClients,
  user: CurrentUser,
  id: string
) {
  return queryOptions({
    queryKey: ["workspace", clients.graphqlUrl, user.id, "video-preview", id],
    gcTime: 0,
    queryFn: async ({ signal }) => {
      requireAuthor(user)
      const result = await clients.apolloClient.query({
        query: PREVIEW_LESSON_VIDEO_QUERY,
        variables: { id },
        fetchPolicy: "no-cache",
        context: { toast: "query-cache", fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing video preview response")
      const url = new URL(result.data.previewLessonVideo.url)
      if (
        url.protocol !== "https:" ||
        url.hostname !== "player.mediadelivery.net" ||
        !url.pathname.startsWith("/embed/")
      )
        throw new Error("Invalid video preview URL")
      return result.data.previewLessonVideo
    },
  })
}
export type LessonUpload =
  CreateLessonVideoUploadMutation["createLessonVideoUpload"]
export async function createVideoUpload(
  clients: DataClients,
  user: CurrentUser,
  input: { title: string; mimeType: string; requestKey: string }
) {
  requireAuthor(user)
  const result = await clients.apolloClient.mutate({
    mutation: CREATE_LESSON_VIDEO_UPLOAD_MUTATION,
    context: { toast: false },
    variables: { input },
  })
  if (!result.data) throw new Error("Missing upload response")
  return result.data.createLessonVideoUpload
}
export async function refreshVideoUpload(
  clients: DataClients,
  user: CurrentUser,
  id: string
) {
  requireAuthor(user)
  const result = await clients.apolloClient.mutate({
    mutation: REFRESH_LESSON_VIDEO_UPLOAD_MUTATION,
    context: { toast: false },
    variables: { id },
  })
  if (!result.data) throw new Error("Missing upload renewal response")
  return result.data.refreshLessonVideoUpload
}
export async function syncVideo(
  clients: DataClients,
  user: CurrentUser,
  id: string
) {
  requireAuthor(user)
  const result = await clients.apolloClient.mutate({
    mutation: SYNC_LESSON_VIDEO_ASSET_MUTATION,
    context: { toast: false },
    variables: { id },
  })
  if (!result.data) throw new Error("Missing video status response")
  return result.data.syncLessonVideoAsset
}
export function libraryErrorCode(error: unknown) {
  return CombinedGraphQLErrors.is(error)
    ? error.errors[0]?.extensions?.code
    : undefined
}
export function libraryActionError(error: unknown) {
  const code = libraryErrorCode(error)
  if (code === "COURSE_NOT_READY")
    return "Complete every section and lesson before publishing. Text lessons need content, videos must be ready, and assessments need valid questions."
  if (code === "MEDIA_NOT_CONFIGURED")
    return "Video uploads are not configured. Configure the backend's Bunny lesson library and try again."
  if (code === "MEDIA_PROVIDER_UNAVAILABLE")
    return "The video provider is unavailable. Refresh the library before retrying. A failed video creation requires a new upload request."
  if (code === "MEDIA_UPLOAD_PENDING")
    return "The video record is still being created. Wait, refresh the library, and resume the existing upload."
  if (code === "VIDEO_NOT_READY")
    return "This video is not ready to play. Check its processing status and try again."
  if (code === "ENROLLMENT_REQUIRED")
    return "Course content requires enrollment unless you own the course or are an administrator."
  if (code === "CONFLICT")
    return "This record changed or the action no longer applies. Refresh its details and try again."
  if (code === "NOT_FOUND")
    return "This record is unavailable. Close the dialog and refresh the library."
  if (code === "FORBIDDEN" || code === "UNAUTHENTICATED")
    return "Your current account cannot perform this action. Sign in again or check your permissions."
  if (code === "RATE_LIMITED")
    return "Too many requests. Wait a moment before trying again."
  if (code === "BAD_USER_INPUT")
    return "Check the entered values and try again."
  return "We couldn't complete this action. Check your connection and try again."
}
