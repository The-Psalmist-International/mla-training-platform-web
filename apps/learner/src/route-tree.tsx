import {
  createRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router"
import { rootRoute } from "./root"
import { learnerSearch } from "./workspace/navigation"
import { learnerCourseSearch } from "./workspace/course"

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: learnerSearch,
  ssr: false,
  beforeLoad: async ({ context }) => {
    await context.auth.restore()
    if (!context.auth.getUser()) throw redirect({ to: "/sign-in" })
  },
  component: lazyRouteComponent(() => import("./pages/HomePage"), "HomePage"),
})
const courseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses/$courseId",
  validateSearch: learnerCourseSearch,
  ssr: false,
  beforeLoad: async ({ context }) => {
    await context.auth.restore()
    if (!context.auth.getUser()) throw redirect({ to: "/sign-in" })
  },
  component: lazyRouteComponent(
    () => import("./pages/LearnerCoursePage"),
    "LearnerCoursePage"
  ),
  head: () => ({ meta: [{ title: "Course | MLA Learners" }] }),
})
const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-in",
  component: lazyRouteComponent(
    () => import("./pages/SignInPage"),
    "SignInPage"
  ),
  head: () => ({ meta: [{ title: "Sign in | MLA Learners" }] }),
})
const forgotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: lazyRouteComponent(
    () => import("./pages/ForgotPasswordPage"),
    "ForgotPasswordPage"
  ),
})
const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-up",
  component: lazyRouteComponent(
    () => import("./pages/SignUpPage"),
    "SignUpPage"
  ),
  head: () => ({ meta: [{ title: "Create account | MLA Learners" }] }),
})
const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-email",
  component: lazyRouteComponent(
    () => import("./pages/VerifyEmailPage"),
    "VerifyEmailPage"
  ),
  head: () => ({ meta: [{ title: "Verify email | MLA Learners" }] }),
})
const resetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  component: lazyRouteComponent(
    () => import("./pages/ResetPasswordPage"),
    "ResetPasswordPage"
  ),
})
const callbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/callback",
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>
  ): { status?: "success"; error?: string } => ({
    status: search.status === "success" ? "success" : undefined,
    error:
      typeof search.error === "string" ? search.error.slice(0, 80) : undefined,
  }),
  component: lazyRouteComponent(
    () => import("./pages/AuthCallbackPage"),
    "AuthCallbackPage"
  ),
})
const acceptInvitationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accept-invitation",
  component: lazyRouteComponent(
    () => import("./pages/AcceptInvitationPage"),
    "AcceptInvitationPage"
  ),
  head: () => ({ meta: [{ title: "Accept invitation | MLA Learners" }] }),
})
export const routeTree = rootRoute.addChildren([
  homeRoute,
  courseRoute,
  signInRoute,
  signUpRoute,
  verifyEmailRoute,
  forgotRoute,
  resetRoute,
  callbackRoute,
  acceptInvitationRoute,
])
