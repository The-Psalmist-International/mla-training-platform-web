import * as yup from "yup"
import type { UserRole } from "@workspace/data"

export function normalizeInvitationEmail(email: string) {
  return email.trim().toLowerCase()
}

// Match the backend's Zod email validator, which is stricter than Yup.email().
const validEmail =
  /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i

export const invitationSchema = yup.object({
  email: yup
    .string()
    .transform((value: string) => normalizeInvitationEmail(value))
    .required("Enter an email address.")
    .matches(validEmail, {
      message: "Enter a valid email address.",
      excludeEmptyString: true,
    })
    .max(254, "Email must be 254 characters or fewer."),
  role: yup
    .mixed<UserRole>()
    .oneOf(["admin", "instructor", "learner"], "Choose a valid role.")
    .required("Choose a role."),
})
