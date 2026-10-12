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
  let deadline = 0
  let generation = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let stopWatching: (() => void) | undefined
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())
  const clearSession = async () => {
    generation += 1
    clearTimeout(timer)
    timer = undefined
    stopWatching?.()
    stopWatching = undefined
    deadline = 0
    const hadUser = user !== null
    user = null
    // Hide protected content before token/cache cleanup (which may be slow).
    if (hadUser) notify()
    await clients.setAccessToken(null)
  }
  const expireIfNeeded = () => {
    if (user && Date.now() >= deadline) {
      void clearSession().catch(() => {})
    }
  }
  const watchExpiry = () => {
    if (typeof window === "undefined") return
    const currentGeneration = generation
    const schedule = () => {
      if (currentGeneration !== generation) return
      expireIfNeeded()
      if (!user) return
      // Long lifetimes must not overflow the browser's signed 32-bit timer delay.
      timer = setTimeout(
        schedule,
        Math.max(1, Math.min(deadline - Date.now(), 2_147_483_647))
      )
    }
    window.addEventListener("focus", expireIfNeeded)
    window.document.addEventListener("visibilitychange", expireIfNeeded)
    stopWatching = () => {
      window.removeEventListener("focus", expireIfNeeded)
      window.document.removeEventListener("visibilitychange", expireIfNeeded)
    }
    schedule()
  }
  const unsubscribeAuthFailure = clients.subscribeAuthFailure(() => {
    if (user) void clearSession().catch(() => {})
  })
  return {
    clearSession,
    getUser: () => {
      expireIfNeeded()
      return user
    },
    dispose() {
      unsubscribeAuthFailure()
      return clearSession()
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    async signIn(email: string, password: string) {
      // Public auth operations must not send an old/expired bearer token.
      const clearing = clearSession()
      const signInGeneration = generation
      await clearing
      if (signInGeneration !== generation) return
      const result = await clients.apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { input: { email, password } },
      })
      if (signInGeneration !== generation) return
      const payload = result.data?.login
      if (!payload) throw new Error("Missing sign-in response")
      if (payload.user.role === "learner") {
        try {
          await clients.apolloClient.mutate({ mutation: LOGOUT_MUTATION })
        } finally {
          if (signInGeneration === generation) await clearSession()
        }
        throw new Error("LEARNER_ACCOUNT")
      }
      const expiresIn = payload.expiresIn
      deadline =
        Date.now() +
        (Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn * 1_000 : 0)
      await clients.setAccessToken(payload.accessToken)
      if (signInGeneration !== generation) return
      if (Date.now() >= deadline) {
        await clearSession()
        return
      }
      user = payload.user
      watchExpiry()
      notify()
    },
    async signOut() {
      // Local logout must succeed even when the logout endpoint is unavailable.
      await clearSession()
      await clients.apolloClient.mutate({ mutation: LOGOUT_MUTATION })
    },
  }
}
export type AuthSession = ReturnType<typeof createAuthSession>
