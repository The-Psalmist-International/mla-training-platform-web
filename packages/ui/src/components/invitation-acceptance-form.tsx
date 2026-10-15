import { useEffect, useState, type ReactNode } from "react"
import { Form, FormikProvider, useFormik } from "formik"
import { useMutation } from "@apollo/client/react"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { ACCEPT_INVITATION_MUTATION } from "@workspace/data/apollo/auth/query"
import type { AuthPayload } from "@workspace/data"
import { Button } from "./button"
import { FormInput, FormFeedback } from "./form-input"
import { useToast } from "./toaster"
import { invitationSchema, invitationToken } from "../lib/invitation"

export function InvitationAcceptanceForm({
  beforeAccept,
  onAccepted,
  signInLink,
}: {
  beforeAccept: () => Promise<void>
  onAccepted: (payload: AuthPayload) => Promise<void>
  signInLink: ReactNode
}) {
  const [token, setToken] = useState<string | null>(null),
    [ready, setReady] = useState(false),
    [accepted, setAccepted] = useState(false),
    [unavailable, setUnavailable] = useState(false)
  const [accept] = useMutation(ACCEPT_INVITATION_MUTATION)
  const { toast } = useToast()
  useEffect(() => {
    setToken(invitationToken(window.location.hash))
    setReady(true)
  }, [])
  const form = useFormik({
    initialValues: { name: "", password: "", confirmation: "" },
    validationSchema: invitationSchema,
    onSubmit: async ({ name, password }, helpers) => {
      if (!token) return
      let payload: AuthPayload
      try {
        await beforeAccept()
        const response = await accept({
          variables: { input: { token, name: name.trim(), password } },
          context: { toast: false },
        })
        if (!response.data) throw new Error("Missing invitation response")
        payload = response.data.acceptInvitation
      } catch (error) {
        const code = CombinedGraphQLErrors.is(error)
          ? error.errors[0]?.extensions?.code
          : undefined
        if (code === "INVALID_TOKEN") {
          setUnavailable(true)
          return
        }
        toast({
          title: "Invitation could not be accepted",
          status: "error",
          description:
            code === "CONFLICT"
              ? "An account already exists for this email. Sign in instead."
              : code === "RATE_LIMITED"
                ? "Too many attempts. Please try again later."
                : "Check your connection and try again. Your invitation has not been confirmed.",
        })
        return
      }
      setAccepted(true)
      setToken(null)
      helpers.resetForm()
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search
      )
      try {
        await onAccepted(payload)
      } catch {
        toast({
          title: "Account created",
          status: "warning",
          description:
            "Automatic sign-in could not finish. Open your learner or staff app and sign in with your new password.",
        })
      }
    },
  })
  if (!ready)
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Loading your invitation…
      </p>
    )
  if (accepted)
    return (
      <div className="space-y-5">
        <p role="status" className="text-sm leading-6 text-muted-foreground">
          Your account is ready. Taking you to your learning or workspace
          account.
        </p>
        {signInLink}
      </div>
    )
  if (!token || unavailable)
    return (
      <div className="space-y-5">
        <p role="alert" className="text-sm leading-6 text-muted-foreground">
          {unavailable
            ? "This invitation has expired, was revoked, or has already been used. Ask your administrator for a replacement, or sign in if you already accepted it."
            : "This invitation link is missing or invalid. Open the complete link from your invitation email, or ask your administrator for a new invitation."}
        </p>
        {signInLink}
      </div>
    )
  return (
    <FormikProvider value={form}>
      <Form
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          if (form.isSubmitting) event.preventDefault()
          else form.handleSubmit(event)
        }}
      >
        <div className="space-y-2">
          <label htmlFor="invite-name" className="text-sm font-medium">
            Full name
          </label>
          <FormInput
            id="invite-name"
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            maxLength={100}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="invite-password" className="text-sm font-medium">
            Password
          </label>
          <FormInput
            id="invite-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            aria-describedby="invite-password-help"
            required
          />
          <p
            id="invite-password-help"
            className="text-xs text-muted-foreground"
          >
            Use at least 12 characters.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="invite-confirmation" className="text-sm font-medium">
            Confirm password
          </label>
          <FormInput
            id="invite-confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <FormFeedback />
        <Button
          type="submit"
          className="h-11 w-full"
          disabled={form.isSubmitting}
          aria-busy={form.isSubmitting}
        >
          {form.isSubmitting ? "Creating your account…" : "Accept invitation"}
        </Button>
        {signInLink}
      </Form>
    </FormikProvider>
  )
}
