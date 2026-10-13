import type { CurrentUser } from "@workspace/data"

export type WorkspaceRole = Extract<CurrentUser["role"], "admin" | "instructor">
export const workspaceViews = {
  overview: {
    path: "/workspace",
    title: "Overview",
    group: "Workspace",
    description:
      "Your workspace for course authoring, learner review, and academy administration.",
    scope: "Choose a workspace from the sidebar to get started.",
  },
  notifications: {
    path: "/workspace/notifications",
    title: "Notifications",
    group: "Workspace",
    description:
      "Stay up to date with assessment reviews, video submissions, and course completion.",
    scope: "Your notification inbox and email preferences will appear here.",
  },
  courses: {
    path: "/workspace/courses",
    title: "Courses",
    group: "Learning",
    description:
      "Organize courses, sections, lessons, assessments, and video-response prompts.",
    scope: "Course lists and authoring tools will appear here.",
  },
  videos: {
    path: "/workspace/videos",
    title: "Video library",
    group: "Learning",
    description:
      "Upload lesson videos and follow their processing status before adding them to a course.",
    scope: "Your lesson video library will appear here.",
  },
  enrollments: {
    path: "/workspace/enrollments",
    title: "Enrollments",
    group: "Learning",
    description:
      "View course enrollments and follow learner progress and completion.",
    scope:
      "Course selection and enrollment details will appear here. Course assignment is available to administrators.",
  },
  assessments: {
    path: "/workspace/assessment-reviews",
    title: "Assessment reviews",
    group: "Review",
    description:
      "Review submitted short answers and finalize assessment grades for your courses.",
    scope: "Course-specific assessment review queues will appear here.",
  },
  submissions: {
    path: "/workspace/video-submissions",
    title: "Video submissions",
    group: "Review",
    description:
      "Watch learner responses, share feedback, and approve submissions or request a revision.",
    scope: "Course-specific video review queues will appear here.",
  },
  people: {
    path: "/workspace/people",
    title: "People",
    group: "Administration",
    description:
      "Manage learner, instructor, and administrator accounts and access.",
    scope:
      "Account lists, role management, and account status controls will appear here.",
    adminOnly: true,
  },
  invitations: {
    path: "/workspace/invitations",
    title: "Invitations",
    group: "Administration",
    description:
      "Invite people to the academy and manage outstanding invitations.",
    scope: "Invitation lists and invitation management will appear here.",
    adminOnly: true,
  },
  certificates: {
    path: "/workspace/certificates",
    title: "Certificates",
    group: "Administration",
    description:
      "Inspect issued certificates by enrollment or certificate ID and manage revocation.",
    scope:
      "Certificate lookup and verification tools will appear here. The backend does not expose an academy-wide certificate list.",
    adminOnly: true,
  },
  delivery: {
    path: "/workspace/email-delivery",
    title: "Email delivery",
    group: "Administration",
    description: "Inspect notification and invitation email delivery outcomes.",
    scope:
      "Delivery diagnostics will appear here. Provider acceptance and actual delivery are tracked separately.",
    adminOnly: true,
  },
  account: {
    path: "/workspace/account",
    title: "My account",
    group: "Account",
    description: "Manage your profile and account security.",
    scope: "Profile and password settings will appear here.",
  },
} as const

export type WorkspaceView = keyof typeof workspaceViews
export type WorkspacePath = (typeof workspaceViews)[WorkspaceView]["path"]
export const navigationGroups = [
  { title: "Workspace", items: ["overview", "notifications"] },
  { title: "Learning", items: ["courses", "videos", "enrollments"] },
  { title: "Review", items: ["assessments", "submissions"] },
  {
    title: "Administration",
    items: ["people", "invitations", "certificates", "delivery"],
  },
] as const

export function canAccessView(
  role: CurrentUser["role"] | undefined,
  view: WorkspaceView
) {
  if (role !== "admin" && role !== "instructor") return false
  return !("adminOnly" in workspaceViews[view]) || role === "admin"
}

export function viewForPath(path: string): WorkspaceView | undefined {
  if (path.startsWith("/workspace/courses/")) return "courses"
  return (Object.keys(workspaceViews) as WorkspaceView[]).find(
    (view) => workspaceViews[view].path === path.replace(/\/$/, "")
  )
}
