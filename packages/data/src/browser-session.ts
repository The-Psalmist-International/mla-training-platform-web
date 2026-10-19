import { CombinedGraphQLErrors } from "@apollo/client/errors"
import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  RefreshSessionDocument,
} from "../apollo/auth/query"
import type { AuthPayload, CurrentUser } from "../apollo/auth/query"
import type { DataClients } from "./clients"

/** One session per router. Tokens stay in memory; renewal uses the HttpOnly cookie. */
export function createBrowserSession(
  clients: DataClients,
  options: {
    roles: readonly CurrentUser["role"][]
    wrongRole: string
    onExpired?: () => void
  }
) {
  let user: CurrentUser | null = null
  let generation = 0
  let initialized = false
  let renewAt = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let refreshing: Promise<void> | undefined
  let stopWatching: (() => void) | undefined
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())
  const rejected = (error: unknown) =>
    (CombinedGraphQLErrors.is(error) &&
      error.errors.some((entry) =>
        ["UNAUTHENTICATED", "SESSION_REUSED"].includes(
          String(entry.extensions?.code)
        )
      )) ||
    (error instanceof Error && error.message === options.wrongRole)

  const clearSession = async () => {
    generation += 1
    clearTimeout(timer)
    timer = undefined
    stopWatching?.()
    stopWatching = undefined
    const hadUser = user !== null
    user = null
    renewAt = 0
    if (hadUser) notify()
    await clients.setAccessToken(null)
  }
  const schedule = (retry = false) => {
    clearTimeout(timer)
    if (typeof window === "undefined" || !user) return
    timer = setTimeout(
      () => {
        void ensure().catch(() => schedule(true))
      },
      retry ? 15000 : Math.max(1, Math.min(renewAt - Date.now(), 2147483647))
    )
  }
  const watch = () => {
    if (typeof window === "undefined" || stopWatching) return
    const check = () => {
      void ensure().catch(() => schedule(true))
    }
    window.addEventListener("focus", check)
    window.document.addEventListener("visibilitychange", check)
    stopWatching = () => {
      window.removeEventListener("focus", check)
      window.document.removeEventListener("visibilitychange", check)
    }
  }
  const adopt = async (payload: AuthPayload, current: number) => {
    if (current !== generation) return
    if (!options.roles.includes(payload.user.role))
      throw new Error(options.wrongRole)
    if (
      !payload.accessToken ||
      !Number.isFinite(payload.expiresIn) ||
      payload.expiresIn <= 0
    )
      throw new Error("Invalid session response")
    if (user?.id === payload.user.id && user.role === payload.user.role) {
      clients.rotateAccessToken(payload.accessToken)
    } else {
      await clients.setAccessToken(payload.accessToken)
    }
    if (current !== generation) return
    const unchanged =
      user &&
      (Object.keys(payload.user) as (keyof CurrentUser)[]).every(
        (key) => user?.[key] === payload.user[key]
      )
    if (!unchanged) user = payload.user
    const lifetime = payload.expiresIn * 1000
    renewAt = Date.now() + lifetime - Math.min(60000, lifetime / 10)
    watch()
    schedule()
    if (!unchanged) notify()
  }
  const refresh = () => {
    if (refreshing) return refreshing
    const current = generation
    const run = async () => {
      if (current !== generation) return
      const result = await clients.apolloClient.mutate({
        mutation: RefreshSessionDocument,
        context: { toast: false, anonymous: true, skipSessionRenewal: true },
      })
      if (!result.data) throw new Error("Missing session response")
      await adopt(result.data.refreshSession, current)
    }
    // Serialize rotations between tabs on the same frontend origin. The browser
    // sends the latest cookie once the previous tab's refresh has completed.
    const runLocked = async () => {
      if (typeof navigator !== "undefined" && navigator.locks) {
        await navigator.locks.request(`mla-refresh:${clients.graphqlUrl}`, run)
      } else await run()
    }
    refreshing = runLocked()
      .catch(async (error) => {
        if (current !== generation) return
        if (rejected(error)) {
          const hadUser = user !== null
          await clearSession()
          if (hadUser) options.onExpired?.()
        }
        throw error
      })
      .finally(() => {
        refreshing = undefined
      })
    return refreshing
  }
  const ensure = async () => {
    if (user && Date.now() >= renewAt) await refresh()
    else if (user) schedule()
  }
  clients.setSessionRenewal(ensure)
  const unsubscribe = clients.subscribeAuthFailure(() => {
    if (user) {
      void clearSession().catch(() => {})
      options.onExpired?.()
    }
  })
  return {
    clearSession,
    getUser: () => user,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    updateProfile(profile: {
      id: string
      name: string
      phone?: string | null
      avatarUrl?: string | null
    }) {
      if (!user || user.id !== profile.id) return
      user = {
        ...user,
        name: profile.name,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
      }
      notify()
    },
    async establish(payload: AuthPayload) {
      initialized = true
      const clearing = clearSession(),
        current = generation
      await clearing
      await adopt(payload, current)
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
        context: { toast: false, anonymous: true },
      })
      if (current !== generation) return
      if (!result.data) throw new Error("Missing sign-in response")
      if (!options.roles.includes(result.data.login.user.role)) {
        try {
          await clients.apolloClient.mutate({
            mutation: LOGOUT_MUTATION,
            context: { toast: false, anonymous: true },
          })
        } finally {
          if (current === generation) await clearSession()
        }
        throw new Error(options.wrongRole)
      }
      await adopt(result.data.login, current)
    },
    async restore() {
      if (!refreshing && initialized) return ensure()
      initialized = true
      try {
        await refresh()
      } catch (error) {
        if (rejected(error)) return
        initialized = false
        throw error
      }
    },
    async signOut() {
      initialized = true
      await clearSession()
      await clients.apolloClient.mutate({
        mutation: LOGOUT_MUTATION,
        context: { toast: false, anonymous: true },
      })
    },
    async dispose() {
      unsubscribe()
      clients.setSessionRenewal(undefined)
      listeners.clear()
      await clearSession()
    },
  }
}
