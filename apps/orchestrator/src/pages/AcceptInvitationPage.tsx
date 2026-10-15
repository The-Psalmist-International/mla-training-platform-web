import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import { InvitationAcceptanceForm } from "@workspace/ui/components/invitation-acceptance-form"
import { authCallbackUrl } from "@workspace/ui/lib/invitation"
import { AuthLayout } from "../components/layout/AuthLayout"

export function AcceptInvitationPage() {
  const { auth } = useRouter().options.context
  const navigate = useNavigate()
  return (
    <AuthLayout
      title="Accept your invitation"
      description="Set up your account to join the academy."
    >
      <InvitationAcceptanceForm
        beforeAccept={auth.clearSession}
        onAccepted={async (payload) => {
          if (payload.user.role === "learner")
            window.location.assign(
              authCallbackUrl(
                import.meta.env.VITE_LEARNER_URL ??
                  (import.meta.env.DEV ? "http://localhost:5001" : undefined)
              )
            )
          else {
            await auth.establish(payload)
            if (auth.getUser())
              await navigate({ to: "/workspace", replace: true })
          }
        }}
        signInLink={
          <Link
            to="/sign-in"
            className="auth-link block text-sm text-primary hover:underline"
          >
            Already have an account? Sign in
          </Link>
        }
      />
    </AuthLayout>
  )
}
