import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { createBrowserSession, type DataClients } from "@workspace/data"

export function authErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === "STAFF_ACCOUNT")
    return "This account belongs to the staff workspace. Sign in with your learner account."
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors[0]?.extensions?.code
    if (code === "RATE_LIMITED")
      return "Too many attempts. Please wait a moment and try again."
    if (code === "UNAUTHENTICATED" || code === "FORBIDDEN")
      return "Unable to sign in. Check your email and password."
    if (code === "BAD_USER_INPUT") return "Check your details and try again."
    if (code === "INVALID_TOKEN")
      return "This link has expired or was already used. Please request a new one."
  }
  return "We couldn't connect to your account. Please try again."
}

/** Router-local credentials with silent HttpOnly-cookie renewal. */
export function createLearnerSession(
  clients: DataClients,
  onExpired?: () => void
) {
  return createBrowserSession(clients, {
    roles: ["learner"],
    wrongRole: "STAFF_ACCOUNT",
    onExpired,
  })
}
export type LearnerSession = ReturnType<typeof createLearnerSession>

export async function googleAuthorizationUrl(
  graphqlUrl: string,
  origin: string,
  request: typeof fetch = fetch
) {
  const response = await request(new URL("/auth/google", graphqlUrl), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      returnTo: new URL("/auth/callback", origin).toString(),
    }),
  })
  if (!response.ok)
    throw new Error(
      "Google sign-in is unavailable. Try email and password or contact your administrator."
    )
  const result: unknown = await response.json()
  if (
    !result ||
    typeof result !== "object" ||
    !("authorizationUrl" in result) ||
    typeof result.authorizationUrl !== "string"
  )
    throw new Error("Google sign-in could not be started.")
  const url = new URL(result.authorizationUrl)
  if (
    url.origin !== "https://accounts.google.com" ||
    url.username ||
    url.password
  )
    throw new Error("Invalid Google sign-in destination.")
  return url.toString()
}
