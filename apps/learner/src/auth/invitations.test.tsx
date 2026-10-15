import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ApolloProvider } from "@apollo/client/react"
import { createDataClients } from "@workspace/data"
import { ACCEPT_INVITATION_MUTATION } from "@workspace/data/apollo/auth/query"
import {
  invitationToken,
  invitationSchema,
  authCallbackUrl,
} from "@workspace/ui/lib/invitation"
import { InvitationAcceptanceForm } from "@workspace/ui/components/invitation-acceptance-form"
import { createLearnerSession } from "./session"

vi.mock("@workspace/ui/components/toaster", () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

const token = "a".repeat(43)
describe("invitation acceptance", () => {
  it("reads only a single well-formed fragment token and rejects missing or malformed links", () => {
    expect(invitationToken(`#token=${token}`)).toBe(token)
    for (const hash of [
      "",
      "#token=short",
      `#token=${token}&token=${token}`,
      `#token=${token}=`,
      "#token=%3Cscript%3E",
    ])
      expect(invitationToken(hash)).toBeNull()
  })
  it("validates account setup using the backend name and password limits", async () => {
    await expect(
      invitationSchema.validate({
        name: " Learner ",
        password: "long-valid-password",
        confirmation: "long-valid-password",
      })
    ).resolves.toMatchObject({ name: "Learner" })
    for (const patch of [
      { name: " " },
      { name: "a".repeat(101) },
      { password: "short" },
      { confirmation: "different" },
    ])
      await expect(
        invitationSchema.validate({
          name: "Learner",
          password: "long-valid-password",
          confirmation: "long-valid-password",
          ...patch,
        })
      ).rejects.toThrow()
  })
  it("hands off through the HttpOnly cookie without transferring tokens in an app URL", () => {
    const url = new URL(authCallbackUrl("http://localhost:5001"))
    expect(url.pathname).toBe("/auth/callback")
    expect(url.search).toBe("?status=success")
    expect(url.hash).toBe("")
    for (const origin of [
      undefined,
      "javascript:alert(1)",
      "https://user:secret@example.test",
      "https://example.test/other",
      "https://example.test/?token=bad",
    ])
      expect(() => authCallbackUrl(origin)).toThrow()
  })
  it("uses the real acceptance operation and establishes a learner session from its payload", async () => {
    const payload = {
      accessToken: "invitation-memory-token",
      expiresIn: 900,
      user: {
        id: "learner",
        name: "Learner",
        email: "learner@example.test",
        role: "learner" as const,
      },
    }
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ data: { acceptInvitation: payload } }))
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    })
    const result = await clients.apolloClient.mutate({
      mutation: ACCEPT_INVITATION_MUTATION,
      variables: {
        input: { token, name: "Learner", password: "long-valid-password" },
      },
      context: { toast: false },
    })
    const operation = JSON.parse(String(request.mock.calls[0]?.[1]?.body))
    expect(operation.operationName).toBe("AcceptInvitation")
    expect(operation.variables.input.token).toBe(token)
    expect(String(request.mock.calls[0]?.[0])).not.toContain(token)
    expect(request.mock.calls[0]?.[1]?.credentials).toBe("include")
    const session = createLearnerSession(clients)
    try {
      await session.establish(result.data!.acceptInvitation)
      expect(session.getUser()).toEqual(payload.user)
      await session.restore()
      expect(request).toHaveBeenCalledTimes(1)
    } finally {
      await session.dispose()
    }
  })
  it("does not expose fragments, password fields, or mutation requests during server rendering", () => {
    const request = vi.fn<typeof fetch>()
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    })
    const html = renderToStaticMarkup(
      createElement(ApolloProvider, {
        client: clients.apolloClient,
        children: createElement(InvitationAcceptanceForm, {
          beforeAccept: async () => {},
          onAccepted: async () => {},
          signInLink: createElement("a", { href: "/sign-in" }, "Sign in"),
        }),
      })
    )
    expect(html).toContain("Loading your invitation")
    expect(html).not.toContain(token)
    expect(html).not.toContain('type="password"')
    expect(request).not.toHaveBeenCalled()
  })
})
