import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { RefreshSessionDocument } from "@workspace/data/apollo/auth/query"
import { Button } from "@workspace/ui/components/button"
import { authCallbackUrl } from "@workspace/ui/lib/invitation"
import { AuthLayout } from "../components/layout/AuthLayout"
import { authErrorMessage } from "../auth/session"

export function AuthCallbackPage() {
  const { auth, dataClients } = useRouter().options.context
  const search = useSearch({ from: "/auth/callback" })
  const navigate = useNavigate(),
    started = useRef(false)
  const [failure, setFailure] = useState<string | null>(null)
  useEffect(() => {
    if (started.current) return
    started.current = true
    if (search.error || search.status !== "success") {
      setFailure(
        "Sign-in was cancelled or could not be completed. Please try again."
      )
      return
    }
    void (async () => {
      await auth.clearSession()
      const response = await dataClients.apolloClient.mutate({
        mutation: RefreshSessionDocument,
        context: { toast: false },
      })
      const payload = response.data?.refreshSession
      if (!payload) throw new Error("Missing session response")
      if (payload.user.role === "learner") {
        window.location.assign(
          authCallbackUrl(
            import.meta.env.VITE_LEARNER_URL ??
              (import.meta.env.DEV ? "http://localhost:5001" : undefined)
          )
        )
        return
      }
      await auth.establish(payload)
      if (!auth.getUser()) throw new Error("Session expired")
      await navigate({ to: "/workspace", replace: true })
    })().catch((error) => setFailure(authErrorMessage(error)))
  }, [auth, dataClients, navigate, search.error, search.status])
  return (
    <AuthLayout
      title={failure ? "Sign-in could not finish" : "Signing you in"}
      description="Securely connecting your account to the workspace."
    >
      {failure ? (
        <>
          <p role="alert" className="mb-6 text-sm leading-6 text-destructive">
            {failure}
          </p>
          <Button className="h-10 w-full" render={<Link to="/sign-in" />}>
            Back to sign in
          </Button>
        </>
      ) : (
        <p role="status" className="text-sm text-muted-foreground">
          Completing sign-in…
        </p>
      )}
    </AuthLayout>
  )
}
