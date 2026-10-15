import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import { InvitationAcceptanceForm } from "@workspace/ui/components/invitation-acceptance-form"
import { authCallbackUrl } from "@workspace/ui/lib/invitation"
import { LearnerAuthLayout } from "../components/LearnerAuthLayout"

export function AcceptInvitationPage() {
  const { auth } = useRouter().options.context
  const navigate = useNavigate()
  return (
    <LearnerAuthLayout
      title="Accept your invitation"
      description="Create your account and begin your learning journey."
    >
      <InvitationAcceptanceForm
        beforeAccept={auth.clearSession}
        onAccepted={async (payload) => {
          if (payload.user.role !== "learner")
            window.location.assign(
              authCallbackUrl(
                import.meta.env.VITE_WORKSPACE_URL ??
                  (import.meta.env.DEV ? "http://localhost:5000" : undefined)
              )
            )
          else {
            await auth.establish(payload)
            if (auth.getUser())
              await navigate({
                to: "/",
                search: { tab: "overview", page: 1 },
                replace: true,
              })
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
    </LearnerAuthLayout>
  )
}
