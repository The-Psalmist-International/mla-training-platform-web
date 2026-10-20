import { createElement, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ApolloProvider } from "@apollo/client/react"
import { createDataClients } from "@workspace/data"
import {
  RegisterLearnerDocument,
  RequestEmailVerificationDocument,
  VerifyLearnerEmailDocument,
} from "@workspace/data/apollo/auth/query"
import { SignUpPage } from "../pages/SignUpPage"
import { VerificationRequestForm } from "../pages/VerifyEmailPage"
import { signUpSchema } from "./validation"
import { createLearnerSession } from "./session"

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) =>
    createElement("a", { ...props, href: to }, children),
}))
vi.mock("@workspace/ui/components/theme-toggle", () => ({
  ThemeToggle: () => null,
}))

describe("verified learner signup", () => {
  it("requires a name, valid email, a strong password and matching confirmation", async () => {
    const values = {
      name: " New learner ",
      email: "new@example.test",
      password: "strong learner password",
      confirmation: "strong learner password",
    }
    expect(await signUpSchema.validate(values)).toMatchObject({
      name: "New learner",
    })
    for (const patch of [
      { name: " " },
      { name: "a".repeat(101) },
      { email: "invalid" },
      { password: "short" },
      { confirmation: "different password" },
    ])
      await expect(
        signUpSchema.validate({ ...values, ...patch })
      ).rejects.toThrow()
  })
  it("renders existing accessible form controls and an explicit verification request", () => {
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
    })
    const signup = renderToStaticMarkup(
      <ApolloProvider client={clients.apolloClient}>
        <SignUpPage />
      </ApolloProvider>
    )
    expect(signup).toContain("Create your learner account")
    expect(signup).toContain('autoComplete="new-password"')
    expect(signup).toContain('name="confirmation"')
    expect(signup).toContain('href="/sign-in"')
    const resend = renderToStaticMarkup(
      <ApolloProvider client={clients.apolloClient}>
        <VerificationRequestForm initialEmail="pending@example.test" />
      </ApolloProvider>
    )
    expect(resend).toContain("Send a new verification link")
    expect(resend).toContain('type="email"')
    expect(resend).toContain("pending@example.test")
  })
  it("keeps the learner signed out through signup and resend, then adopts only the verified payload", async () => {
    const user = {
      id: "new",
      name: "New learner",
      email: "new@example.test",
      role: "learner" as const,
    }
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ data: { registerLearner: true } }))
      .mockResolvedValueOnce(
        Response.json({ data: { requestEmailVerification: true } })
      )
      .mockResolvedValueOnce(
        Response.json({
          data: {
            verifyLearnerEmail: {
              user,
              accessToken: "verified-memory-token",
              expiresIn: 900,
            },
          },
        })
      )
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    })
    const session = createLearnerSession(clients)
    try {
      await clients.apolloClient.mutate({
        mutation: RegisterLearnerDocument,
        variables: {
          input: {
            email: user.email,
            name: user.name,
            password: "strong learner password",
            appUrl: "http://localhost:5001",
          },
        },
        context: { anonymous: true },
      })
      expect(session.getUser()).toBeNull()
      await clients.apolloClient.mutate({
        mutation: RequestEmailVerificationDocument,
        variables: { email: user.email, appUrl: "http://localhost:5001" },
        context: { anonymous: true },
      })
      expect(session.getUser()).toBeNull()
      const result = await clients.apolloClient.mutate({
        mutation: VerifyLearnerEmailDocument,
        variables: { token: "a".repeat(43) },
        context: { anonymous: true },
      })
      await session.establish(result.data!.verifyLearnerEmail)
      expect(session.getUser()).toEqual(user)
      expect(
        request.mock.calls.map(
          (call) => JSON.parse(String(call[1]?.body)).operationName
        )
      ).toEqual([
        "RegisterLearner",
        "RequestEmailVerification",
        "VerifyLearnerEmail",
      ])
      for (const call of request.mock.calls) {
        expect(new Headers(call[1]?.headers).get("authorization")).toBe("")
        expect(call[1]?.credentials).toBe("include")
      }
    } finally {
      await session.dispose()
    }
  })
})
