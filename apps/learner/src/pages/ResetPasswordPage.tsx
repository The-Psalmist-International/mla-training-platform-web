import { useEffect, useState } from "react"
import { Form, FormikProvider, useFormik } from "formik"
import { useMutation } from "@apollo/client/react"
import { Link, useRouter } from "@tanstack/react-router"
import { RESET_PASSWORD_MUTATION } from "@workspace/data/apollo/auth/query"
import { Button } from "@workspace/ui/components/button"
import { useToast } from "@workspace/ui/components/toaster"
import { FormInput, FormFeedback } from "@workspace/ui/components/form-input"
import { resetPasswordSchema } from "../auth/validation"
import { LearnerAuthLayout as AuthLayout } from "../components/LearnerAuthLayout"
import { authErrorMessage } from "../auth/session"

export function ResetPasswordPage() {
  const { toast } = useToast()
  const { auth } = useRouter().options.context
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [complete, setComplete] = useState(false)
  const [resetPassword] = useMutation(RESET_PASSWORD_MUTATION)
  const form = useFormik({
    initialValues: { password: "", confirmation: "" },
    validationSchema: resetPasswordSchema,
    onSubmit: async ({ password }, helpers) => {
      if (!token) return
      helpers.setStatus(undefined)
      try {
        await resetPassword({
          variables: { input: { token, password } },
          context: { toast: false },
        })
        await auth.clearSession()
        helpers.resetForm()
        setToken(null)
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname
        )
        setComplete(true)
        toast({
          title: "Password updated",
          description: "You can now sign in with your new password.",
          status: "success",
        })
      } catch (failure) {
        toast({
          title: "Password could not be updated",
          description: authErrorMessage(failure),
          status: "error",
        })
      }
    },
  })
  const loading = form.isSubmitting
  useEffect(() => {
    setToken(new URLSearchParams(window.location.hash.slice(1)).get("token"))
    setReady(true)
  }, [])
  return (
    <AuthLayout
      title="Reset password"
      description="Choose a new password to securely access your account."
    >
      {complete ? (
        <p role="status" className="text-sm leading-6 text-muted-foreground">
          Your password has been updated. You can now sign in with your new
          password.
        </p>
      ) : ready && !token ? (
        <p role="alert" className="text-sm text-destructive">
          This reset link is missing its token. Please request a new link.
        </p>
      ) : (
        <FormikProvider value={form}>
          <Form
            className="space-y-6"
            noValidate
            onSubmit={(event) => {
              if (loading || !token) event.preventDefault()
              else form.handleSubmit(event)
            }}
          >
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                New password
              </label>
              <FormInput
                id="new-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                aria-describedby="password-help"
                disabled={loading}
              />
              <p id="password-help" className="text-xs text-muted-foreground">
                Use at least 12 characters.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm password
              </label>
              <FormInput
                id="confirm-password"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                required
                disabled={loading}
              />
            </div>
            <FormFeedback />
            <Button
              type="submit"
              className="h-10 w-full"
              disabled={loading || !token}
              aria-busy={loading}
            >
              {loading ? "Updating…" : "Update password"}
            </Button>
          </Form>
        </FormikProvider>
      )}
      <Button
        variant="outline"
        className="mt-6 h-10 w-full"
        render={
          <Link
            to={ready && !token && !complete ? "/forgot-password" : "/sign-in"}
          />
        }
      >
        {ready && !token && !complete
          ? "Request a new link"
          : "Back to sign in"}
      </Button>
    </AuthLayout>
  )
}
