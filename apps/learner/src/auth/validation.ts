import * as Yup from "yup"

const email = Yup.string()
  .trim()
  .email("Enter a valid email address.")
  .max(254)
  .required("Enter your email address.")
const password = Yup.string()
  .max(128, "Use 128 characters or fewer.")
  .required("Enter your password.")
export const signInSchema = Yup.object({ email, password })
export const forgotPasswordSchema = Yup.object({ email })
export const resetPasswordSchema = Yup.object({
  password: password.min(12, "Use at least 12 characters."),
  confirmation: Yup.string()
    .required("Confirm your password.")
    .oneOf([Yup.ref("password")], "Your passwords don't match."),
})
