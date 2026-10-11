import { CombinedGraphQLErrors } from "@apollo/client/errors"
import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
} from "@workspace/data/apollo/auth/query"
import type { CurrentUser, DataClients } from "@workspace/data"

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

/** Request/router scoped. Never persist access tokens or credentials. */
export function createAuthSession(clients: DataClients) {
  let user: CurrentUser | null = null
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())
  const clearSession = async () => {
    await clients.setAccessToken(null)
    user = null
    notify()
  }
  return {
    clearSession,
    getUser: () => user,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    async signIn(email: string, password: string) {
      // Public auth operations must not send an old/expired bearer token.
      await clearSession()
      const result = await clients.apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { input: { email, password } },
      })
      const payload = result.data?.login
      if (!payload) throw new Error("Missing sign-in response")
      if (payload.user.role === "learner") {
        try {
          await clients.apolloClient.mutate({ mutation: LOGOUT_MUTATION })
        } finally {
          await clearSession()
        }
        throw new Error("LEARNER_ACCOUNT")
      }
      await clients.setAccessToken(payload.accessToken)
      user = payload.user
      notify()
    },
    async signOut() {
      await clients.setAccessToken(null)
      await clients.apolloClient.mutate({ mutation: LOGOUT_MUTATION })
      await clearSession()
    },
  }
}
export type AuthSession = ReturnType<typeof createAuthSession>
