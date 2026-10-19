import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { createBrowserSession, type DataClients } from "@workspace/data"

export function authErrorMessage(error: unknown) {
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors[0]?.extensions?.code
    if (code === "RATE_LIMITED")
      return "Too many attempts. Please wait a moment and try again."
    if (code === "BAD_USER_INPUT") return "Check your details and try again."
    if (code === "UNAUTHENTICATED" || code === "FORBIDDEN")
      return "Unable to sign in with these details. Check your email and password."
  }
  return "We couldn't reach your account. Please try again."
}

/** Router-local credentials with silent HttpOnly-cookie renewal. */
export function createAuthSession(
  clients: DataClients,
  onExpired?: () => void
) {
  return createBrowserSession(clients, {
    roles: ["admin", "instructor"],
    wrongRole: "LEARNER_ACCOUNT",
    onExpired,
  })
}
export type AuthSession = ReturnType<typeof createAuthSession>
