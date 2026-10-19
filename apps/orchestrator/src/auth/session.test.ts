import { afterEach, describe, expect, it, vi } from "vitest"
import { createDataClients } from "@workspace/data"
import { LOGOUT_MUTATION } from "@workspace/data/apollo/auth/query"
import { createAuthSession, type AuthSession } from "./session"

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

const sessions: AuthSession[] = []
const user = {
  id: "staff-1",
  name: "Staff",
  email: "staff@example.com",
  role: "admin",
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
const login = (token = "token", expiresIn = 60) =>
  json({ data: { login: { accessToken: token, expiresIn, user } } })
const expired = () =>
  json({
    errors: [{ message: "Expired", extensions: { code: "UNAUTHENTICATED" } }],
  })

function setup(expiresIn = 60) {
  const request = vi
    .fn<typeof fetch>()
    .mockResolvedValue(login("token", expiresIn))
  const clients = createDataClients({
    graphqlUrl: "http://localhost:4000/graphql",
    fetch: request,
  })
  const session = createAuthSession(clients)
  sessions.push(session)
  return { request, clients, session }
}

function browser() {
  const window = Object.assign(new EventTarget(), {
    document: new EventTarget(),
  })
  vi.stubGlobal("window", window)
  return window
}

afterEach(async () => {
  vi.restoreAllMocks()
  for (const session of sessions.splice(0)) await session.dispose()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("auth session expiry", () => {
  it("restores the staff session after reload and single-flights concurrent guards", async () => {
    const { session, request } = setup()
    request.mockResolvedValueOnce(
      json({
        data: {
          refreshSession: {
            accessToken: "restored-token",
            expiresIn: 900,
            user,
          },
        },
      })
    )
    await Promise.all([session.restore(), session.restore()])
    await session.restore()
    expect(session.getUser()).toEqual(user)
    expect(request).toHaveBeenCalledTimes(1)
    const options = request.mock.calls[0]![1]!
    expect(options.credentials).toBe("include")
    expect(new Headers(options.headers).get("authorization")).toBe("")
    expect(JSON.parse(String(options.body)).operationName).toBe(
      "RefreshSession"
    )
  })
  it("does not refresh again after a successful interactive login", async () => {
    const { session, request } = setup()
    await session.signIn(user.email, "password")
    await session.restore()
    expect(request).toHaveBeenCalledTimes(1)
    expect(session.getUser()).toEqual(user)
  })
  it("permits restoration retry after an outage without treating it as rejected credentials", async () => {
    const { session, request } = setup()
    request.mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce(
      json({
        data: {
          refreshSession: { accessToken: "restored", expiresIn: 900, user },
        },
      })
    )
    await expect(session.restore()).rejects.toThrow("Offline")
    await session.restore()
    expect(session.getUser()).toEqual(user)
  })
  it.each(["UNAUTHENTICATED", "SESSION_REUSED"])(
    "requires sign-in after confirmed session rejection: %s",
    async (code) => {
      const { session, request } = setup()
      request.mockResolvedValueOnce(
        json({ errors: [{ message: "Rejected", extensions: { code } }] })
      )
      await session.restore()
      await session.restore()
      expect(session.getUser()).toBeNull()
      expect(request).toHaveBeenCalledTimes(1)
    }
  )
  it("does not resurrect a session when restoration completes after sign-out", async () => {
    const { session, request } = setup()
    const response = deferred<Response>()
    request
      .mockImplementationOnce(() => response.promise)
      .mockResolvedValueOnce(json({ data: { logout: true } }))
    const restoring = session.restore()
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1))
    await session.signOut()
    response.resolve(
      json({
        data: {
          refreshSession: { accessToken: "stale", expiresIn: 900, user },
        },
      })
    )
    await restoring
    expect(session.getUser()).toBeNull()
  })
  it("does not log a learner out of the shared API when restoring the staff app", async () => {
    const { session, request } = setup()
    request.mockResolvedValueOnce(
      json({
        data: {
          refreshSession: {
            accessToken: "learner-token",
            expiresIn: 900,
            user: { ...user, role: "learner" },
          },
        },
      })
    )
    await session.restore()
    expect(session.getUser()).toBeNull()
    expect(request).toHaveBeenCalledTimes(1)
  })
  it("establishes invited staff sessions directly without another login or token persistence", async () => {
    const { session, request } = setup()
    await session.establish({
      accessToken: "invited-staff-token",
      expiresIn: 900,
      user: { ...user, role: "instructor" },
    })
    expect(session.getUser()?.role).toBe("instructor")
    expect(request).not.toHaveBeenCalled()
    await expect(
      session.establish({
        accessToken: "learner-token",
        expiresIn: 900,
        user: { ...user, role: "learner" },
      })
    ).rejects.toThrow("LEARNER_ACCOUNT")
    expect(session.getUser()).toBeNull()
  })
  it.each(["graphql", "http"])(
    "clears and notifies synchronously on confirmed %s expiry",
    async (kind) => {
      const { session, clients, request } = setup()
      await session.signIn(user.email, "password")
      clients.queryClient.setQueryData(["private"], "staff data")
      const observed: unknown[] = []
      session.subscribe(() => observed.push(session.getUser()))
      const cleanup = deferred<void>()
      const setToken = clients.setAccessToken.bind(clients)
      vi.spyOn(clients, "setAccessToken").mockImplementationOnce(
        async (token) => {
          await cleanup.promise
          await setToken(token)
        }
      )
      request.mockResolvedValueOnce(
        kind === "graphql" ? expired() : json({ message: "Expired" }, 401)
      )
      await expect(
        clients.apolloClient.mutate({ mutation: LOGOUT_MUTATION })
      ).rejects.toThrow()
      expect(session.getUser()).toBeNull()
      expect(observed).toEqual([null])
      cleanup.resolve()
      await vi.waitFor(() =>
        expect(clients.queryClient.getQueryData(["private"])).toBeUndefined()
      )
    }
  )

  it.each(["network", "forbidden", "server"])(
    "keeps the authenticated session after a %s failure",
    async (kind) => {
      const { session, clients, request } = setup()
      await session.signIn(user.email, "password")
      const listener = vi.fn()
      session.subscribe(listener)
      if (kind === "network")
        request.mockRejectedValueOnce(new TypeError("Failed to fetch"))
      else
        request.mockResolvedValueOnce(
          kind === "forbidden"
            ? json({
                errors: [
                  { message: "Forbidden", extensions: { code: "FORBIDDEN" } },
                ],
              })
            : json({ message: "Unavailable" }, 503)
        )
      await expect(
        clients.apolloClient.mutate({ mutation: LOGOUT_MUTATION })
      ).rejects.toThrow()
      expect(session.getUser()).toEqual(user)
      expect(listener).not.toHaveBeenCalled()
    }
  )

  it("renews before expiry without clearing private caches", async () => {
    vi.useFakeTimers()
    browser()
    const { session, clients, request } = setup(2)
    await session.signIn(user.email, "password")
    request.mockResolvedValueOnce(
      json({
        data: {
          refreshSession: { accessToken: "renewed", expiresIn: 900, user },
        },
      })
    )
    clients.queryClient.setQueryData(["private"], "staff data")
    const listener = vi.fn()
    session.subscribe(listener)
    await vi.advanceTimersByTimeAsync(1_999)
    expect(session.getUser()).toEqual(user)
    await vi.advanceTimersByTimeAsync(1)
    expect(session.getUser()).toEqual(user)
    expect(listener).not.toHaveBeenCalled()
    expect(clients.queryClient.getQueryData(["private"])).toBe("staff data")
    expect(
      JSON.parse(String(request.mock.calls[1]?.[1]?.body)).operationName
    ).toBe("RefreshSession")
  })

  it("retries a background renewal outage without signing out or spinning", async () => {
    vi.useFakeTimers()
    browser()
    const { session, clients, request } = setup(2)
    await session.signIn(user.email, "password")
    const identity = session.getUser()
    clients.queryClient.setQueryData(["private"], "staff data")
    request.mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce(
      json({
        data: {
          refreshSession: { accessToken: "renewed", expiresIn: 900, user },
        },
      })
    )
    await vi.advanceTimersByTimeAsync(2_000)
    expect(session.getUser()).toBe(identity)
    expect(request).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(14_000)
    expect(request).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(1_000)
    expect(request).toHaveBeenCalledTimes(3)
    expect(session.getUser()).toBe(identity)
    expect(clients.queryClient.getQueryData(["private"])).toBe("staff data")
  })

  it("ends a background session only when refresh credentials are rejected", async () => {
    vi.useFakeTimers()
    browser()
    const { session, request } = setup(2)
    await session.signIn(user.email, "password")
    request.mockResolvedValueOnce(expired())
    await vi.advanceTimersByTimeAsync(2_000)
    expect(session.getUser()).toBeNull()
    await vi.advanceTimersByTimeAsync(30_000)
    expect(request).toHaveBeenCalledTimes(2)
  })

  it.each(["guard", "focus", "visibilitychange"])(
    "renews an elapsed deadline on %s even before the timer runs",
    async (check) => {
      vi.useFakeTimers()
      const window = browser()
      const { session, request } = setup(2)
      await session.signIn(user.email, "password")
      request.mockResolvedValueOnce(
        json({
          data: {
            refreshSession: { accessToken: "renewed", expiresIn: 900, user },
          },
        })
      )
      const listener = vi.fn()
      session.subscribe(listener)
      vi.setSystemTime(Date.now() + 2_001)
      if (check === "guard") await session.restore()
      if (check === "focus") window.dispatchEvent(new Event("focus"))
      if (check === "visibilitychange")
        window.document.dispatchEvent(new Event("visibilitychange"))
      await vi.advanceTimersByTimeAsync(0)
      expect(session.getUser()).toEqual(user)
      expect(listener).not.toHaveBeenCalled()
    }
  )

  it("does not sign out synchronously on clock expiry or create browser timers in SSR", async () => {
    vi.useFakeTimers()
    const { session } = setup(2)
    const timeout = vi.spyOn(globalThis, "setTimeout")
    await session.signIn(user.email, "password")
    expect(timeout).not.toHaveBeenCalledWith(expect.any(Function), 2_000)
    vi.setSystemTime(Date.now() + 2_001)
    expect(session.getUser()).toEqual(user)
  })

  it("replaces old expiry timers on re-login and tears them down on logout", async () => {
    vi.useFakeTimers()
    const window = browser()
    const { session, request } = setup(2)
    await session.signIn(user.email, "password")
    await vi.advanceTimersByTimeAsync(1_000)
    request.mockResolvedValueOnce(login("new-token", 60))
    await session.signIn(user.email, "password")
    await vi.advanceTimersByTimeAsync(1_001)
    expect(session.getUser()).toEqual(user)
    const remove = vi.spyOn(window, "removeEventListener")
    request.mockResolvedValueOnce(json({ data: { logout: true } }))
    await session.signOut()
    expect(session.getUser()).toBeNull()
    expect(remove).toHaveBeenCalledWith("focus", expect.any(Function))
    await vi.advanceTimersByTimeAsync(60_000)
    expect(session.getUser()).toBeNull()
  })

  it("bounds long-lived expiry timers without prematurely expiring the user", async () => {
    vi.useFakeTimers()
    browser()
    const timeout = vi.spyOn(globalThis, "setTimeout")
    const { session, request } = setup(3_000_000)
    await session.signIn(user.email, "password")
    request.mockResolvedValueOnce(
      json({
        data: {
          refreshSession: { accessToken: "renewed", expiresIn: 900, user },
        },
      })
    )
    expect(timeout).toHaveBeenCalledWith(expect.any(Function), 2_147_483_647)
    await vi.advanceTimersByTimeAsync(2_147_483_647)
    expect(session.getUser()).toEqual(user)
    await vi.advanceTimersByTimeAsync(3_000_000_000 - 2_147_483_647)
    expect(session.getUser()).toEqual(user)
  })

  it.each(["new-token", "token"])(
    "does not let an old response expire a new login using %s",
    async (newToken) => {
      const { session, clients, request } = setup()
      await session.signIn(user.email, "password")
      const response = deferred<Response>()
      const started = deferred<void>()
      request.mockImplementationOnce(() => {
        started.resolve()
        return response.promise
      })
      const pending = clients.apolloClient.mutate({ mutation: LOGOUT_MUTATION })
      const rejected = expect(pending).rejects.toThrow()
      await started.promise
      request.mockResolvedValueOnce(login(newToken))
      await session.signIn(user.email, "password")
      const listener = vi.fn()
      session.subscribe(listener)
      response.resolve(expired())
      await rejected
      expect(session.getUser()).toEqual(user)
      expect(listener).not.toHaveBeenCalled()
    }
  )

  it("does not emit session changes for invalid public login credentials", async () => {
    const { session, request } = setup()
    const listener = vi.fn()
    session.subscribe(listener)
    request.mockResolvedValueOnce(expired())
    await expect(session.signIn(user.email, "wrong password")).rejects.toThrow()
    expect(session.getUser()).toBeNull()
    expect(listener).not.toHaveBeenCalled()
    expect(
      new Headers(request.mock.calls[0]?.[1]?.headers).get("authorization")
    ).toBe("")
  })

  it("clears local state immediately even when logout fails", async () => {
    const { session, request } = setup()
    await session.signIn(user.email, "password")
    request.mockRejectedValueOnce(new TypeError("Failed to fetch"))
    const signingOut = session.signOut()
    expect(session.getUser()).toBeNull()
    await expect(signingOut).rejects.toThrow()
  })
})
