import {
  createRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router"
import { rootRoute } from "./root"
import { routePaths } from "./route-definitions"
import { canAccessView } from "./workspace/navigation"
import { validatePeopleSearch } from "./workspace/people-search"
import { validateInvitationsSearch } from "./workspace/invitations-search"
import { validateCollectionSearch } from "./workspace/collection-search"
import { validateCourseSearch } from "./workspace/course-search"
import { validateEmailDeliverySearch } from "./workspace/email-delivery-search"
import {
  validateCoursesSearch,
  validateVideosSearch,
} from "./workspace/library-search"

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: routePaths.signIn })
  },
})
const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routePaths.signIn,
  component: lazyRouteComponent(
    () => import("./pages/SignInPage"),
    "SignInPage"
  ),
  head: () => ({ meta: [{ title: "Sign in | Martyrs Orchestrator" }] }),
})
const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routePaths.forgotPassword,
  component: lazyRouteComponent(
    () => import("./pages/ForgotPasswordPage"),
    "ForgotPasswordPage"
  ),
})
const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routePaths.resetPassword,
  component: lazyRouteComponent(
    () => import("./pages/ResetPasswordPage"),
    "ResetPasswordPage"
  ),
})
const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routePaths.workspace,
  beforeLoad: ({ context }) => {
    const user = context.auth.getUser()
    if (!canAccessView(user?.role, "overview"))
      throw redirect({ to: routePaths.signIn })
  },
  component: lazyRouteComponent(
    () => import("./components/WorkspaceLayout"),
    "WorkspaceLayout"
  ),
})

const overviewRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("./pages/WorkspacePage"),
    "WorkspacePage"
  ),
  head: () => ({ meta: [{ title: "Overview | Martyrs Orchestrator" }] }),
})
const notificationsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "notifications",
  component: lazyRouteComponent(
    () => import("./pages/NotificationsPage"),
    "NotificationsPage"
  ),
  head: () => ({ meta: [{ title: "Notifications | Martyrs Orchestrator" }] }),
})
const coursesRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "courses",
  validateSearch: validateCoursesSearch,
  component: lazyRouteComponent(
    () => import("./pages/CoursesPage"),
    "CoursesPage"
  ),
  head: () => ({ meta: [{ title: "Courses | Martyrs Orchestrator" }] }),
})
const courseRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "courses/$courseId",
  validateSearch: validateCourseSearch,
  component: lazyRouteComponent(
    () => import("./pages/CoursePage"),
    "CoursePage"
  ),
  head: () => ({ meta: [{ title: "Course | Martyrs Orchestrator" }] }),
})
const videosRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "videos",
  validateSearch: validateVideosSearch,
  component: lazyRouteComponent(
    () => import("./pages/VideoLibraryPage"),
    "VideoLibraryPage"
  ),
  head: () => ({ meta: [{ title: "Video Library | Martyrs Orchestrator" }] }),
})
const enrollmentsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "enrollments",
  validateSearch: validateCollectionSearch,
  component: lazyRouteComponent(
    () => import("./pages/EnrollmentsPage"),
    "EnrollmentsPage"
  ),
  head: () => ({ meta: [{ title: "Enrollments | Martyrs Orchestrator" }] }),
})
const assessmentsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "assessment-reviews",
  validateSearch: validateCollectionSearch,
  component: lazyRouteComponent(
    () => import("./pages/AssessmentReviewsPage"),
    "AssessmentReviewsPage"
  ),
  head: () => ({
    meta: [{ title: "Assessment Reviews | Martyrs Orchestrator" }],
  }),
})
const submissionsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "video-submissions",
  validateSearch: validateCollectionSearch,
  component: lazyRouteComponent(
    () => import("./pages/VideoSubmissionsPage"),
    "VideoSubmissionsPage"
  ),
  head: () => ({
    meta: [{ title: "Video Submissions | Martyrs Orchestrator" }],
  }),
})
const peopleRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "people",
  validateSearch: validatePeopleSearch,
  beforeLoad: ({ context }) => {
    if (!canAccessView(context.auth.getUser()?.role, "people"))
      throw redirect({ to: "/workspace" })
  },
  component: lazyRouteComponent(
    () => import("./pages/PeoplePage"),
    "PeoplePage"
  ),
  head: () => ({ meta: [{ title: "People | Martyrs Orchestrator" }] }),
})
const invitationsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "invitations",
  validateSearch: validateInvitationsSearch,
  beforeLoad: ({ context }) => {
    if (!canAccessView(context.auth.getUser()?.role, "invitations"))
      throw redirect({ to: "/workspace" })
  },
  component: lazyRouteComponent(
    () => import("./pages/InvitationsPage"),
    "InvitationsPage"
  ),
  head: () => ({ meta: [{ title: "Invitations | Martyrs Orchestrator" }] }),
})
const certificatesRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "certificates",
  validateSearch: validateCollectionSearch,
  beforeLoad: ({ context }) => {
    if (!canAccessView(context.auth.getUser()?.role, "certificates"))
      throw redirect({ to: "/workspace" })
  },
  component: lazyRouteComponent(
    () => import("./pages/CertificatesPage"),
    "CertificatesPage"
  ),
  head: () => ({ meta: [{ title: "Certificates | Martyrs Orchestrator" }] }),
})
const deliveryRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "email-delivery",
  validateSearch: validateEmailDeliverySearch,
  beforeLoad: ({ context }) => {
    if (!canAccessView(context.auth.getUser()?.role, "delivery"))
      throw redirect({ to: "/workspace" })
  },
  component: lazyRouteComponent(
    () => import("./pages/EmailDeliveryPage"),
    "EmailDeliveryPage"
  ),
  head: () => ({ meta: [{ title: "Email Delivery | Martyrs Orchestrator" }] }),
})
const accountRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "account",
  component: lazyRouteComponent(
    () => import("./pages/AccountPage"),
    "AccountPage"
  ),
  head: () => ({ meta: [{ title: "Account | Martyrs Orchestrator" }] }),
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  workspaceRoute.addChildren([
    overviewRoute,
    notificationsRoute,
    coursesRoute,
    courseRoute,
    videosRoute,
    enrollmentsRoute,
    assessmentsRoute,
    submissionsRoute,
    peopleRoute,
    invitationsRoute,
    certificatesRoute,
    deliveryRoute,
    accountRoute,
  ]),
])
