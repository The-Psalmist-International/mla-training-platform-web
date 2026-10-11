import { useState, useSyncExternalStore } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { AuthLayout } from "../components/AuthLayout"
import { authErrorMessage } from "../auth/session"

export function WorkspacePage() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, () => null)
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <AuthLayout
      title="You’re signed in"
      description="Welcome to the orchestrator workspace."
    >
      <p className="text-sm leading-6 text-muted-foreground">
        Signed in as {user?.name} ({user?.role}). Your workspace screens are the
        next feature.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        className="mt-6 h-10 w-full"
        disabled={pending}
        onClick={async () => {
          setPending(true)
          setError(null)
          try {
            await auth.signOut()
            await navigate({ to: "/sign-in", replace: true })
          } catch (failure) {
            setError(authErrorMessage(failure))
          } finally {
            setPending(false)
          }
        }}
      >
        {pending ? "Signing out…" : "Sign out"}
      </Button>
    </AuthLayout>
  )
}
