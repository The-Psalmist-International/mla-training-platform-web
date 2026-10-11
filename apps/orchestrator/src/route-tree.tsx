import { createRoute, redirect } from "@tanstack/react-router"
import { rootRoute } from "./root"
import { routePaths } from "./route-definitions"
import { SignInPage } from "./pages/SignInPage"
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage"
import { ResetPasswordPage } from "./pages/ResetPasswordPage"
import { WorkspacePage } from "./pages/WorkspacePage"

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
  component: SignInPage,
  head: () => ({ meta: [{ title: "Sign in | Martyrs Orchestrator" }] }),
})
const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routePaths.forgotPassword,
  component: ForgotPasswordPage,
})
const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routePaths.resetPassword,
  component: ResetPasswordPage,
})
const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routePaths.workspace,
  beforeLoad: ({ context }) => {
    if (!context.auth.getUser()) throw redirect({ to: routePaths.signIn })
  },
  component: WorkspacePage,
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  workspaceRoute,
])
