import * as Yup from "yup"

export function invitationToken(hash: string) {
  const values = new URLSearchParams(hash.replace(/^#/, ""))
  const token = values.get("token")
  return values.getAll("token").length === 1 &&
    token &&
    /^[A-Za-z0-9_-]{43}$/.test(token)
    ? token
    : null
}
export const invitationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(100, "Use 100 characters or fewer.")
    .required("Enter your full name."),
  password: Yup.string()
    .min(12, "Use at least 12 characters.")
    .max(128, "Use 128 characters or fewer.")
    .required("Choose a password."),
  confirmation: Yup.string()
    .required("Confirm your password.")
    .oneOf([Yup.ref("password")], "Your passwords don't match."),
})
export function authCallbackUrl(origin: string | undefined) {
  if (!origin)
    throw new Error(
      "The destination app URL is not configured. Your account is ready; open the correct app and sign in."
    )
  const url = new URL(origin)
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error(
      "The destination app URL must be an HTTP(S) origin without credentials or a path."
    )
  return new URL("/auth/callback?status=success", url).toString()
}
