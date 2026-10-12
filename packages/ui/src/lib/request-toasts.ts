import { CombinedGraphQLErrors } from "@apollo/client/errors"
import type { RequestNotification } from "@workspace/data"
import type { ToastMessage } from "./toast"

const labels: Record<string, string> = {
  "backend-health": "Backend connection",
  "people-table": "People",
  "invitations-table": "Invitations",
  "email-delivery-table": "Email delivery",
  "email-delivery-detail": "Email delivery details",
  "course-details": "Course details",
  "video-details": "Video details",
  "video-preview": "Video preview",
  "course-scope": "Course selection",
  courses: "Courses",
  videos: "Videos",
  enrollments: "Enrollments",
  assessments: "Assessment reviews",
  submissions: "Video submissions",
  certificates: "Certificates",
  Health: "GraphQL connection",
}

export function requestToastMessage(event: RequestNotification): ToastMessage {
  const label = event.operationName
    ? labels[event.operationName] ?? (event.kind === "mutation" ? "Changes" : "Data")
    : event.queryKey?.map((key) => typeof key === "string" ? labels[key] : undefined).find(Boolean) ?? "Data"
  let description = "Check your connection and try again."
  if (CombinedGraphQLErrors.is(event.error)) {
    const code = event.error.errors[0]?.extensions?.code
    const messages: Record<string, string> = {
      UNAUTHENTICATED: "Your session has ended. Sign in again to continue.",
      FORBIDDEN: "Your account does not have permission to access this information.",
      NOT_FOUND: "This record is no longer available. Refresh the page and try again.",
      RATE_LIMITED: "Too many requests. Wait a moment and try again.",
      BAD_USER_INPUT: "Check your filters or entered values and try again.",
      ENROLLMENT_REQUIRED: "Enrollment is required to access this course content.",
      VIDEO_NOT_READY: "This video is still processing or unavailable. Check its status before previewing.",
      MEDIA_NOT_CONFIGURED: "The video library is not configured. Contact an administrator.",
    }
    if (typeof code === "string") description = messages[code] ?? description
  }
  return {
    id: `request:${label}`,
    title: event.status === "success"
      ? `${label} ${event.kind === "mutation" ? "saved" : "loaded"}`
      : `${label} ${event.kind === "mutation" ? "could not be saved" : "could not be loaded"}`,
    description: event.status === "error" ? description : undefined,
    status: event.status,
  }
}
