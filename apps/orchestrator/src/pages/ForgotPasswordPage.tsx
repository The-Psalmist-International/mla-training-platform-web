import { useState } from "react"
import { Form, FormikProvider, useFormik } from "formik"
import { useMutation } from "@apollo/client/react"
import { Link } from "@tanstack/react-router"
import { REQUEST_PASSWORD_RESET_MUTATION } from "@workspace/data/apollo/auth/query"
import { Button } from "@workspace/ui/components/button"
import { useToast } from "@workspace/ui/components/toaster"
import { FormInput, FormFeedback } from "@workspace/ui/components/form-input"
import { forgotPasswordSchema } from "../auth/validation"
import { AuthLayout } from "../components/layout/AuthLayout"
import { authErrorMessage } from "../auth/session"

export function ForgotPasswordPage() {
  const { toast } = useToast()
  const [sent, setSent] = useState(false)
  const [requestReset] = useMutation(REQUEST_PASSWORD_RESET_MUTATION)
  const form = useFormik({
    initialValues: { email: "" },
    validationSchema: forgotPasswordSchema,
    onSubmit: async ({ email }, helpers) => {
      helpers.setStatus(undefined)
      try {
        await requestReset({ variables: { email: email.trim().toLowerCase() }, context: { toast: false } })
        setSent(true)
        toast({ title: "Password reset requested", description: "If an account exists for this email, you will receive a reset link shortly.", status: "success" })
      } catch (failure) {
        toast({ title: "Reset link could not be requested", description: authErrorMessage(failure), status: "error" })
      }
    },
  })
  const loading = form.isSubmitting
  return (
    <AuthLayout
      title="Forgot password?"
      description="Enter your email address and we’ll help you get back into your account."
    >
      {sent ? (
        <p role="status" className="text-sm leading-6 text-muted-foreground">
          If an account exists for this email, you’ll receive a password reset
          link shortly. Check your inbox and spam folder.
        </p>
      ) : (
        <FormikProvider value={form}>
          <Form
            className="space-y-6"
            noValidate
            onSubmit={(event) => {
              if (loading) event.preventDefault()
              else form.handleSubmit(event)
            }}
          >
            <div className="space-y-2">
              <label htmlFor="reset-email" className="text-sm font-medium">
                Email address{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </label>
              <FormInput
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Your email address"
                disabled={loading}
              />
            </div>
            <FormFeedback />
            <Button
              type="submit"
              className="h-10 w-full"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </Form>
        </FormikProvider>
      )}
      <Link
        to="/sign-in"
        className="auth-link mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        Back to sign in
      </Link>
    </AuthLayout>
  )
}
