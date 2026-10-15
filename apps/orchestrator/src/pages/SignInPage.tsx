import { useEffect } from "react"
import { Form, FormikProvider, useFormik } from "formik"
import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { useToast } from "@workspace/ui/components/toaster"
import { FormInput, FormFeedback } from "@workspace/ui/components/form-input"
import { signInSchema } from "../auth/validation"
import { AuthLayout } from "../components/layout/AuthLayout"
import { authErrorMessage } from "../auth/session"

const emailKey = "martyrs.orchestrator.remembered-email"

export function SignInPage() {
  const { auth } = useRouter().options.context
  const navigate = useNavigate()
  const { toast } = useToast()
  const form = useFormik({
    initialValues: { email: "", password: "", remember: false },
    validationSchema: signInSchema,
    onSubmit: async ({ email, password, remember }, helpers) => {
      helpers.setStatus(undefined)
      const normalizedEmail = email.trim().toLowerCase()
      try {
        await auth.signIn(normalizedEmail, password)
        if (!auth.getUser()) return
        toast({ title: "Signed in", status: "success" })
        helpers.setFieldValue("password", "", false)
        try {
          if (remember) localStorage.setItem(emailKey, normalizedEmail)
          else localStorage.removeItem(emailKey)
        } catch {
          /* No credentials are stored. */
        }
        await navigate({ to: "/workspace", replace: true })
      } catch (failure) {
        toast({ title: "Unable to sign in", status: "error", description:
          failure instanceof Error && failure.message === "LEARNER_ACCOUNT"
            ? "This workspace is for administrators and instructors. Please use the learner app."
            : authErrorMessage(failure)
        })
      }
    },
  })
  const { setValues, isSubmitting: pending } = form
  useEffect(() => {
    try {
      const saved = localStorage.getItem(emailKey)
      if (saved) {
        void setValues({ email: saved, password: "", remember: true }, false)
      }
    } catch {
      /* Storage can be unavailable. */
    }
  }, [setValues])

  return (
    <AuthLayout
      title="Sign in to your account"
      description="Enter your credentials to access your account."
    >
      <FormikProvider value={form}>
        <Form
          className="space-y-6"
          noValidate
          onSubmit={(event) => {
            if (pending) event.preventDefault()
            else form.handleSubmit(event)
          }}
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email address{" "}
              <span className="ml-1 text-destructive" aria-hidden>
                *
              </span>
            </label>
            <FormInput
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="Your email address"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="password" className="text-sm font-medium">
                Password{" "}
                <span className="ml-1 text-destructive" aria-hidden>
                  *
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="auth-link text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <FormInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="*********"
              required
              disabled={pending}
            />
          </div>
          <FormFeedback />
          <p className="text-sm leading-6 text-muted-foreground">
            Unable to access your account?{" "}
            <span className="auth-link font-medium text-primary">
              Contact support
            </span>
          </p>
          <Button
            type="submit"
            className="h-10 w-full transition-[background-color,opacity]"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </Form>
      </FormikProvider>
    </AuthLayout>
  )
}
