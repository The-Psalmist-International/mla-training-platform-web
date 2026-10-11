export const routePaths = {
  signIn: "/sign-in",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  workspace: "/workspace",
} as const

export const routeFiles = {
  __root__: "src/root.tsx",
  "/": "src/route-tree.tsx",
  [routePaths.signIn]: "src/pages/SignInPage.tsx",
  [routePaths.forgotPassword]: "src/pages/ForgotPasswordPage.tsx",
  [routePaths.resetPassword]: "src/pages/ResetPasswordPage.tsx",
  [routePaths.workspace]: "src/pages/WorkspacePage.tsx",
}
