import { useEffect, useState } from "react"
import { Form, FormikProvider, useFormik } from "formik"
import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { FormInput, FormFeedback } from "@workspace/ui/components/form-input"
import { useToast } from "@workspace/ui/components/toaster"
import { LearnerAuthLayout } from "../components/LearnerAuthLayout"
import { signInSchema } from "../auth/validation"
import { authErrorMessage, googleAuthorizationUrl } from "../auth/session"

export function SignInPage() {
  const { auth, graphqlUrl } = useRouter().options.context
  const navigate = useNavigate(),
    { toast } = useToast()
  const [restoring, setRestoring] = useState(true),
    [googlePending, setGooglePending] = useState(false)
  useEffect(() => {
    let active = true
    void auth
      .restore()
      .then(() => {
        if (active && auth.getUser())
          void navigate({
            to: "/",
            search: { tab: "overview", page: 1 },
            replace: true,
          })
      })
      .catch((error) => {
        if (active)
          toast({
            title: "Session could not be restored",
            description: authErrorMessage(error),
            status: "error",
          })
      })
      .finally(() => {
        if (active) setRestoring(false)
      })
    return () => {
      active = false
    }
  }, [auth, navigate, toast])
  const form = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: signInSchema,
    onSubmit: async ({ email, password }, helpers) => {
      try {
        await auth.signIn(email, password)
        if (!auth.getUser()) return
        helpers.setFieldValue("password", "", false)
        toast({ title: "Signed in", status: "success" })
        await navigate({
          to: "/",
          search: { tab: "overview", page: 1 },
          replace: true,
        })
      } catch (error) {
        toast({
          title: "Unable to sign in",
          description: authErrorMessage(error),
          status: "error",
        })
      }
    },
  })
  const pending = form.isSubmitting || restoring || googlePending
  const google = async () => {
    if (pending) return
    setGooglePending(true)
    try {
      window.location.assign(
        await googleAuthorizationUrl(graphqlUrl, window.location.origin)
      )
    } catch (error) {
      toast({
        title: "Google sign-in unavailable",
        description:
          error instanceof Error ? error.message : "Please try again.",
        status: "error",
      })
      setGooglePending(false)
    }
  }
  return (
    <LearnerAuthLayout
      title="Welcome back"
      description="Sign in to continue your learning journey."
      topRight={
        <p className="rounded-lg border border-border/60 bg-background/95 px-4 py-3 text-right text-xs leading-5 text-muted-foreground sm:text-sm">
          Don't have a learner account?{" "}
          <Link
            to="/sign-up"
            className="font-medium text-primary hover:underline"
          >
            Create an account.
          </Link>
        </p>
      }
    >
      <Button
        variant="outline"
        className="h-11 w-full gap-3"
        disabled={pending}
        onClick={() => void google()}
        aria-busy={googlePending}
      >
        <img
          src="/images/google.png"
          alt=""
          aria-hidden
          className="size-5 object-contain"
        />
        {googlePending ? "Connecting to Google…" : "Sign in with Google"}
      </Button>
      <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>or continue with email</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <FormikProvider value={form}>
        <Form
          className="space-y-5"
          noValidate
          onSubmit={(event) => {
            if (pending) event.preventDefault()
            else form.handleSubmit(event)
          }}
        >
          <div className="space-y-2">
            <label htmlFor="learner-email" className="text-sm font-medium">
              Email address
            </label>
            <FormInput
              id="learner-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="learner-password" className="text-sm font-medium">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="auth-link text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <FormInput
              id="learner-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              disabled={pending}
            />
          </div>
          <FormFeedback />
          <Button
            type="submit"
            className="h-11 w-full"
            disabled={pending}
            aria-busy={form.isSubmitting}
          >
            {form.isSubmitting
              ? "Signing in…"
              : restoring
                ? "Checking session…"
                : "Sign in"}
          </Button>
        </Form>
      </FormikProvider>
    </LearnerAuthLayout>
  )
}
