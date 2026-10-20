import { useState } from "react"
import { Form, FormikProvider, useFormik } from "formik"
import { useMutation } from "@apollo/client/react"
import { Link } from "@tanstack/react-router"
import { RegisterLearnerDocument } from "@workspace/data/apollo/auth/query"
import { Button } from "@workspace/ui/components/button"
import { FormInput, FormFeedback } from "@workspace/ui/components/form-input"
import { LearnerAuthLayout } from "../components/LearnerAuthLayout"
import { signUpSchema } from "../auth/validation"
import { authErrorMessage } from "../auth/session"
import { VerificationRequestForm } from "./VerifyEmailPage"

export function SignUpPage() {
  const [sentTo, setSentTo] = useState("")
  const [register] = useMutation(RegisterLearnerDocument)
  const form = useFormik({
    initialValues: { name: "", email: "", password: "", confirmation: "" },
    validationSchema: signUpSchema,
    onSubmit: async ({ name, email, password }, helpers) => {
      helpers.setStatus(undefined)
      try {
        await register({
          variables: {
            input: {
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password,
              appUrl: window.location.origin,
            },
          },
          context: { toast: false, anonymous: true },
        })
        setSentTo(email.trim().toLowerCase())
        helpers.resetForm()
      } catch (error) {
        helpers.setStatus(authErrorMessage(error))
      }
    },
  })
  return (
    <LearnerAuthLayout
      title={sentTo ? "Check your email" : "Create your learner account"}
      description={
        sentTo
          ? "Verify your email before you start learning."
          : "Create an account, then verify your email to start learning."
      }
    >
      {sentTo ? (
        <div className="space-y-6">
          <p role="status" className="text-sm leading-6 text-muted-foreground">
            If this email is eligible for a new account, a verification link has
            been sent to{" "}
            <span className="font-medium break-all text-foreground">
              {sentTo}
            </span>
            . Check your inbox and spam folder. The link expires in one hour.
            Already have an account? Sign in below.
          </p>
          <VerificationRequestForm initialEmail={sentTo} />
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setSentTo("")}
          >
            Use different details
          </Button>
        </div>
      ) : (
        <FormikProvider value={form}>
          <Form noValidate className="space-y-5">
            {[
              {
                name: "name",
                label: "Full name",
                type: "text",
                autoComplete: "name",
              },
              {
                name: "email",
                label: "Email address",
                type: "email",
                autoComplete: "email",
              },
              {
                name: "password",
                label: "Password",
                type: "password",
                autoComplete: "new-password",
              },
              {
                name: "confirmation",
                label: "Confirm password",
                type: "password",
                autoComplete: "new-password",
              },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <label
                  htmlFor={`signup-${field.name}`}
                  className="text-sm font-medium"
                >
                  {field.label}
                </label>
                <FormInput
                  id={`signup-${field.name}`}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  required
                />
                {field.name === "password" && (
                  <p className="text-xs text-muted-foreground">
                    Use at least 12 characters.
                  </p>
                )}
              </div>
            ))}
            <FormFeedback />
            <Button
              type="submit"
              disabled={form.isSubmitting}
              aria-busy={form.isSubmitting}
              className="h-10 w-full"
            >
              {form.isSubmitting
                ? "Sending verification link..."
                : "Create account"}
            </Button>
          </Form>
        </FormikProvider>
      )}
      <Link
        to="/sign-in"
        className="mt-6 block text-center text-sm text-primary hover:underline"
      >
        Already have an account? Sign in
      </Link>
    </LearnerAuthLayout>
  )
}
