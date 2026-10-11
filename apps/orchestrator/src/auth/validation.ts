import * as Yup from "yup"

const email = Yup.string()
  .trim()
  .email("Enter a valid email address.")
  .max(254, "Email must be 254 characters or fewer.")
  .required("Enter your email address.")
const password = Yup.string()
  .required("Enter your password.")
  .max(128, "Password must be 128 characters or fewer.")

export const signInSchema = Yup.object({
  email,
  password,
  remember: Yup.boolean().required(),
})
export const forgotPasswordSchema = Yup.object({ email })
export const resetPasswordSchema = Yup.object({
  password: password.min(12, "Use at least 12 characters."),
  confirmation: Yup.string()
    .required("Confirm your password.")
    .oneOf([Yup.ref("password")], "Your passwords don’t match."),
})
