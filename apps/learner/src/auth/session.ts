import { CombinedGraphQLErrors } from "@apollo/client/errors"
import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  type AuthPayload,
  type CurrentUser,
  type DataClients,
} from "@workspace/data"
import { RefreshSessionDocument } from "@workspace/data/apollo/auth/query"

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

/** Router-local credentials; refresh tokens remain in the API's HttpOnly cookie. */
export function createLearnerSession(
  clients: DataClients,
  onExpired?: () => void
) {
  let user: CurrentUser | null = null,
    deadline = 0,
    generation = 0,
    initialized = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let restoring: Promise<void> | undefined
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())
  const clearSession = async () => {
    generation += 1
    clearTimeout(timer)
    timer = undefined
    deadline = 0
    const hadUser = user !== null
    user = null
    if (hadUser) notify()
    await clients.setAccessToken(null)
  }
  const expire = () => {
    if (user && Date.now() >= deadline) {
      void clearSession().catch(() => {})
      onExpired?.()
    }
  }
  const adopt = async (payload: AuthPayload, current: number) => {
    if (current !== generation) return
    if (payload.user.role !== "learner") {
      try {
        await clients.apolloClient.mutate({
          mutation: LOGOUT_MUTATION,
          context: { toast: false },
        })
      } finally {
        if (current === generation) await clearSession()
      }
      throw new Error("STAFF_ACCOUNT")
    }
    if (
      !payload.accessToken ||
      !Number.isFinite(payload.expiresIn) ||
      payload.expiresIn <= 0
    )
      throw new Error("Invalid session response")
    deadline = Date.now() + payload.expiresIn * 1000
    await clients.setAccessToken(payload.accessToken)
    if (current !== generation) return
    if (Date.now() >= deadline) {
      await clearSession()
      throw new Error("Session expired")
    }
    user = payload.user
    if (typeof window !== "undefined")
      timer = setTimeout(expire, Math.min(deadline - Date.now(), 2147483647))
    notify()
  }
  const stop = clients.subscribeAuthFailure(() => {
    if (user) {
      void clearSession().catch(() => {})
      onExpired?.()
    }
  })
  return {
    clearSession,
    updateProfile(profile: { id: string; name: string; phone?: string | null; avatarUrl?: string | null }) {
      if (!user || user.id !== profile.id || Date.now() >= deadline) return
      user = { ...user, name: profile.name, phone: profile.phone, avatarUrl: profile.avatarUrl }
      notify()
    },
    async establish(payload: AuthPayload) {
      initialized = true
      const clearing = clearSession(),
        current = generation
      await clearing
      await adopt(payload, current)
    },
    getUser: () => {
      expire()
      return user
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    async signIn(email: string, password: string) {
      initialized = true
      const clearing = clearSession(),
        current = generation
      await clearing
      if (current !== generation) return
      const result = await clients.apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { input: { email: email.trim().toLowerCase(), password } },
        context: { toast: false },
      })
      if (!result.data) throw new Error("Missing sign-in response")
      await adopt(result.data.login, current)
    },
    restore() {
      if (restoring) return restoring
      if (initialized) return Promise.resolve()
      initialized = true
      const current = generation
      restoring = (async () => {
        try {
          const result = await clients.apolloClient.mutate({
            mutation: RefreshSessionDocument,
            context: { toast: false },
          })
          if (!result.data) throw new Error("Missing session response")
          await adopt(result.data.refreshSession, current)
        } catch (error) {
          if (current !== generation) return
          const unauthenticated =
            CombinedGraphQLErrors.is(error) &&
            error.errors.some(
              (entry) => entry.extensions?.code === "UNAUTHENTICATED"
            )
          if (unauthenticated) {
            await clearSession()
            return
          }
          initialized = false
          throw error
        }
      })().finally(() => {
        restoring = undefined
      })
      return restoring
    },
    async signOut() {
      initialized = true
      await clearSession()
      await clients.apolloClient.mutate({
        mutation: LOGOUT_MUTATION,
        context: { toast: false },
      })
    },
    async dispose() {
      stop()
      listeners.clear()
      await clearSession()
    },
  }
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
