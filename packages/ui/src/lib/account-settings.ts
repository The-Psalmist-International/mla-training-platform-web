import * as Yup from "yup"
import { queryOptions } from "@tanstack/react-query"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import type { DataClients } from "@workspace/data"
import { MyAccountDocument } from "@workspace/data/apollo/auth/query"

export const accountProfileSchema = Yup.object({
  name: Yup.string().trim().required("Enter your full name.").max(100, "Use 100 characters or fewer."),
  phone: Yup.string().trim().max(32, "Use 32 characters or fewer.").matches(/^[+\d\s().-]*$/, "Enter a valid phone number."),
  avatarUrl: Yup.string(),
})
export const accountPasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Enter your current password.").max(128),
  password: Yup.string().required("Enter a new password.").min(12, "Use at least 12 characters.").max(128, "Use 128 characters or fewer.").notOneOf([Yup.ref("currentPassword")], "Choose a different password."),
  confirmation: Yup.string().required("Confirm your new password.").oneOf([Yup.ref("password")], "Your passwords don't match."),
})
export function accountOptions(clients: DataClients, userId: string) {
  return queryOptions({
    queryKey: ["account", clients.graphqlUrl, userId],
    queryFn: async () => {
      const result = await clients.apolloClient.query({ query: MyAccountDocument, fetchPolicy: "network-only", context: { toast: false } })
      if (!result.data?.me || result.data.me.id !== userId) throw new Error("Account unavailable")
      return result.data.me
    },
  })
}
export function accountErrorMessage(error: unknown) {
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors[0]?.extensions?.code
    if (code === "BAD_USER_INPUT") return "Check the details you entered. If changing your password, make sure the current password is correct."
    if (code === "RATE_LIMITED") return "Too many attempts. Please wait a moment and try again."
  }
  return "We couldn’t save your changes. Please try again."
}
