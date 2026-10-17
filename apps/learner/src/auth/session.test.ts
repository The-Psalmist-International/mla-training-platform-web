import { afterEach, describe, expect, it, vi } from "vitest"
import { createDataClients } from "@workspace/data"
import {
  createLearnerSession,
  googleAuthorizationUrl,
  type LearnerSession,
} from "./session"
import { signInSchema, resetPasswordSchema } from "./validation"

const user = {
  id: "learner",
  name: "Learner",
  email: "learner@example.test",
  role: "learner",
}
const payload = (role = "learner") => ({
  accessToken: "memory-only-token",
  expiresIn: 900,
  user: { ...user, role },
})
const sessions: LearnerSession[] = []
function setup(request = vi.fn<typeof fetch>()) {
  const clients = createDataClients({
    graphqlUrl: "http://localhost:4000/graphql",
    fetch: request,
  })
  const session = createLearnerSession(clients)
  sessions.push(session)
  return { clients, session, request }
}
afterEach(async () => {
  for (const session of sessions.splice(0)) await session.dispose()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
describe("learner authentication", () => {
  it("calls the real login operation, normalizes email and installs an in-memory bearer token", async () => {
    const { session, request, clients } = setup()
    request.mockResolvedValueOnce(Response.json({ data: { login: payload() } }))
    await session.signIn("  LEARNER@example.test ", "valid-password")
    expect(session.getUser()).toEqual(user)
    const operation = JSON.parse(String(request.mock.calls[0]?.[1]?.body))
    expect(operation).toMatchObject({
      operationName: "Login",
      variables: { input: { email: user.email, password: "valid-password" } },
    })
    request.mockResolvedValueOnce(Response.json({ data: { logout: true } }))
    await session.signOut()
    expect(session.getUser()).toBeNull()
    expect(clients.queryClient.getQueryCache().getAll()).toHaveLength(0)
  })
  it.each(["admin", "instructor"])(
    "rejects %s accounts and clears their refresh cookie via logout",
    async (role) => {
      const { session, request } = setup()
      request
        .mockResolvedValueOnce(
          Response.json({ data: { login: payload(role) } })
        )
        .mockResolvedValueOnce(Response.json({ data: { logout: true } }))
      await expect(session.signIn(user.email, "password")).rejects.toThrow(
        "STAFF_ACCOUNT"
      )
      expect(session.getUser()).toBeNull()
      expect(
        JSON.parse(String(request.mock.calls[1]?.[1]?.body)).operationName
      ).toBe("Logout")
    }
  )
  it("single-flights refresh-cookie restoration so concurrent routes do not rotate twice", async () => {
    const { session, request } = setup()
    request.mockResolvedValueOnce(
      Response.json({ data: { refreshSession: payload() } })
    )
    await Promise.all([session.restore(), session.restore()])
    await session.restore()
    expect(session.getUser()).toEqual(user)
    expect(request).toHaveBeenCalledTimes(1)
    expect(
      JSON.parse(String(request.mock.calls[0]?.[1]?.body)).operationName
    ).toBe("RefreshSession")
    expect(request.mock.calls[0]?.[1]?.credentials).toBe("include")
  })
  it("does not revoke a staff session when the learner app is opened", async () => {
    const { session, request } = setup()
    request.mockResolvedValueOnce(
      Response.json({
        data: {
          refreshSession: { ...payload(), user: { ...user, role: "admin" } },
        },
      })
    )
    await session.restore()
    expect(session.getUser()).toBeNull()
    expect(request).toHaveBeenCalledTimes(1)
  })
  it("treats a missing cookie as signed out but permits retry after a network outage", async () => {
    const first = setup()
    first.request.mockResolvedValueOnce(
      Response.json({
        errors: [
          { message: "No cookie", extensions: { code: "UNAUTHENTICATED" } },
        ],
      })
    )
    await first.session.restore()
    expect(first.session.getUser()).toBeNull()
    const second = setup()
    second.request
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce(
        Response.json({ data: { refreshSession: payload() } })
      )
    await expect(second.session.restore()).rejects.toThrow()
    await second.session.restore()
    expect(second.session.getUser()).toEqual(user)
  })
  it("cannot resurrect a session from a refresh response arriving after sign-out", async () => {
    let release!: (response: Response) => void
    const { session, request } = setup()
    request
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            release = resolve
          })
      )
      .mockResolvedValueOnce(Response.json({ data: { logout: true } }))
    const restoring = session.restore()
    await vi.waitFor(() => expect(release).toBeTypeOf("function"))
    await session.signOut()
    release(Response.json({ data: { refreshSession: payload() } }))
    await restoring
    expect(session.getUser()).toBeNull()
  })
  it("rejects malformed fields and requires matching new passwords", async () => {
    await expect(
      signInSchema.validate({ email: "invalid", password: "" })
    ).rejects.toThrow()
    await expect(
      resetPasswordSchema.validate({
        password: "long-valid-password",
        confirmation: "other",
      })
    ).rejects.toThrow()
    await expect(
      signInSchema.validate({ email: user.email, password: "current" })
    ).resolves.toBeDefined()
  })
  it("starts Google sign-in with credentials and a learner return URL", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        authorizationUrl:
          "https://accounts.google.com/o/oauth2/v2/auth?state=opaque",
      })
    )
    const url = await googleAuthorizationUrl(
      "http://localhost:4000/graphql",
      "http://localhost:5001",
      request
    )
    expect(url).toContain("https://accounts.google.com/")
    expect(request.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
      method: "POST",
    })
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body))).toEqual({
      returnTo: "http://localhost:5001/auth/callback",
    })
  })
  it.each([
    "https://evil.test/",
    "javascript:alert(1)",
    "https://accounts.google.com.evil.test/",
    "https://accounts.google.com:8443/",
  ])("rejects a forged Google destination %s", async (authorizationUrl) => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ authorizationUrl }))
    await expect(
      googleAuthorizationUrl(
        "http://localhost:4000/graphql",
        "http://localhost:5001",
        request
      )
    ).rejects.toThrow()
  })
})
