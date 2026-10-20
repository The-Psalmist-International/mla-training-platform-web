import { useEffect, useState } from "react"
import { Form, FormikProvider, useFormik } from "formik"
import { useMutation } from "@apollo/client/react"
import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import {
  RequestEmailVerificationDocument,
  VerifyLearnerEmailDocument,
} from "@workspace/data/apollo/auth/query"
import { Button } from "@workspace/ui/components/button"
import { FormInput, FormFeedback } from "@workspace/ui/components/form-input"
import { LearnerAuthLayout } from "../components/LearnerAuthLayout"
import { forgotPasswordSchema } from "../auth/validation"
import { authErrorMessage } from "../auth/session"
import { invitationToken } from "@workspace/ui/lib/invitation"

export function VerificationRequestForm({
  initialEmail = "",
}: {
  initialEmail?: string
}) {
  const [sent, setSent] = useState(false)
  const [request] = useMutation(RequestEmailVerificationDocument)
  const form = useFormik({
    initialValues: { email: initialEmail },
    validationSchema: forgotPasswordSchema,
    onSubmit: async ({ email }, helpers) => {
      helpers.setStatus(undefined)
      try {
        await request({
          variables: {
            email: email.trim().toLowerCase(),
            appUrl: window.location.origin,
          },
          context: { toast: false, anonymous: true },
        })
        setSent(true)
      } catch (error) {
        helpers.setStatus(authErrorMessage(error))
      }
    },
  })
  return (
    <FormikProvider value={form}>
      <Form noValidate className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="verification-email" className="text-sm font-medium">
            Email address
          </label>
          <FormInput
            name="email"
            id="verification-email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <FormFeedback />
        {sent && (
          <p role="status" className="text-sm leading-6 text-muted-foreground">
            If a signup is pending for this email, a new link is on its way.
            Only the newest link will work.
          </p>
        )}
        <Button
          type="submit"
          variant="outline"
          disabled={form.isSubmitting}
          aria-busy={form.isSubmitting}
          className="w-full"
        >
          {form.isSubmitting ? "Sending..." : "Send a new verification link"}
        </Button>
      </Form>
    </FormikProvider>
  )
}

export function VerifyEmailPage() {
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [verify] = useMutation(VerifyLearnerEmailDocument)
  const { auth } = useRouter().options.context
  const navigate = useNavigate()
  useEffect(() => {
    setToken(invitationToken(window.location.hash))
    setReady(true)
  }, [])
  const submit = async () => {
    if (!token || busy) return
    setBusy(true)
    setError("")
    try {
      await auth.clearSession()
      const result = await verify({
        variables: { token },
        context: { toast: false, anonymous: true },
      })
      if (!result.data) throw new Error("Missing verification response")
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname
      )
      setToken(null)
      await auth.establish(result.data.verifyLearnerEmail)
      await navigate({
        to: "/",
        search: { tab: "overview", page: 1 },
        replace: true,
      })
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <LearnerAuthLayout
      title="Verify your email"
      description="Confirm your email address to activate your learner account."
    >
      <div className="space-y-6">
        {ready && token && (
          <Button
            className="h-10 w-full"
            disabled={busy}
            aria-busy={busy}
            onClick={() => void submit()}
          >
            {busy ? "Verifying..." : "Verify email and continue"}
          </Button>
        )}
        {ready && !token && (
          <p role="status" className="text-sm leading-6 text-muted-foreground">
            Open the link in your verification email, or request a new link
            below. Haven't signed up yet? Create an account first.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm leading-6 text-destructive">
            {error}
          </p>
        )}
        {!busy && <VerificationRequestForm />}
        <div className="flex justify-between gap-4 text-sm">
          <Link to="/sign-up" className="text-primary hover:underline">
            Create account
          </Link>
          <Link to="/sign-in" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </LearnerAuthLayout>
  )
}
