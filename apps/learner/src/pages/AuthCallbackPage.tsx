import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { LearnerAuthLayout } from "../components/LearnerAuthLayout"
import { authErrorMessage } from "../auth/session"

export function AuthCallbackPage() {
  const { auth } = useRouter().options.context
  const search = useSearch({ from: "/auth/callback" })
  const navigate = useNavigate(),
    started = useRef(false)
  const [failure, setFailure] = useState<string | null>(null)
  useEffect(() => {
    if (started.current) return
    started.current = true
    if (search.error || search.status !== "success") {
      setFailure(
        search.error === "INVITATION_REQUIRED"
          ? "Your administrator needs to invite this Google account before you can sign in."
          : search.error === "OAUTH_CANCELLED"
            ? "Google sign-in was cancelled. Please try again."
            : "Google sign-in could not be completed. Please try again."
      )
      return
    }
    void auth
      .restore()
      .then(async () => {
        if (!auth.getUser()) throw new Error("Missing Google session")
        await navigate({
          to: "/",
          search: { tab: "overview", page: 1 },
          replace: true,
        })
      })
      .catch((error) => setFailure(authErrorMessage(error)))
  }, [auth, navigate, search.error, search.status])
  return (
    <LearnerAuthLayout
      title={failure ? "Let's try that again" : "Signing you in"}
      description={
        failure
          ? "Your learner account hasn't been signed in."
          : "Securely connecting your account to the learner platform."
      }
    >
      {failure ? (
        <>
          <p role="alert" className="mb-6 text-sm leading-6 text-destructive">
            {failure}
          </p>
          <Button className="h-11 w-full" render={<Link to="/sign-in" />}>
            Back to sign in
          </Button>
        </>
      ) : (
        <p role="status" className="text-sm text-muted-foreground">
          Completing sign-in…
        </p>
      )}
    </LearnerAuthLayout>
  )
}
