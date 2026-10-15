import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { queryOptions } from "@tanstack/react-query"
import {
  ADMIN_EMAIL_MESSAGES_PAGE_QUERY,
  ADMIN_EMAIL_MESSAGE_QUERY,
  type CurrentUser,
  type DataClients,
  type EmailDeliveryListItem,
  type EmailDeliveryStatus,
} from "@workspace/data"
import { invitationSchema } from "../invitations/invitation-validation"

export const emailStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "bounced", label: "Bounced" },
  { value: "complained", label: "Complained" },
  { value: "failed", label: "Failed" },
  { value: "skipped", label: "Skipped" },
] as const
export const emailPurposeOptions = [
  { value: "invitation", label: "Invitation" },
  { value: "password_reset", label: "Password reset" },
  { value: "grading_pending", label: "Assessment awaiting grading" },
  { value: "assessment_graded", label: "Assessment graded" },
  { value: "submission_pending_review", label: "Submission awaiting review" },
  { value: "submission_reviewed", label: "Submission reviewed" },
  { value: "certificate_issued", label: "Certificate issued" },
  { value: "course_completed", label: "Course completed" },
] as const
export type EmailPurpose = (typeof emailPurposeOptions)[number]["value"]
export function emailPurposeLabel(purpose: string) {
  return (
    emailPurposeOptions.find((option) => option.value === purpose)?.label ??
    purpose.replaceAll("_", " ")
  )
}
const recipientSchema = invitationSchema.pick(["email"])
export function validEmailRecipient(value: string) {
  return !value || recipientSchema.isValidSync({ email: value })
}
export interface EmailDeliveryTableParams {
  recipient: string
  status: EmailDeliveryStatus | "all"
  purpose: EmailPurpose | "all"
  pageIndex: number
  pageSize: number
}
export function emailDeliveryTableOptions(
  clients: DataClients,
  user: CurrentUser,
  params: EmailDeliveryTableParams
) {
  return queryOptions({
    queryKey: [
      "workspace",
      clients.graphqlUrl,
      user.id,
      "email-delivery-table",
      params,
    ],
    queryFn: async ({ signal }) => {
      if (user.role !== "admin") throw new Error("Admin access required")
      if (!validEmailRecipient(params.recipient))
        throw new Error("Enter a complete recipient email address")
      const result = await clients.apolloClient.query({
        query: ADMIN_EMAIL_MESSAGES_PAGE_QUERY,
        variables: {
          recipient: params.recipient.trim().toLowerCase() || undefined,
          status: params.status === "all" ? undefined : params.status,
          purpose: params.purpose === "all" ? undefined : params.purpose,
          limit: params.pageSize,
          offset: params.pageIndex * params.pageSize,
        },
        fetchPolicy: "network-only",
        context: { toast: "query-cache", fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing email delivery response")
      return result.data.adminEmailMessagesPage
    },
  })
}
export function emailDeliveryDetailOptions(
  clients: DataClients,
  user: CurrentUser,
  id: string
) {
  return queryOptions({
    queryKey: [
      "workspace",
      clients.graphqlUrl,
      user.id,
      "email-delivery-detail",
      id,
    ],
    queryFn: async ({ signal }) => {
      if (user.role !== "admin") throw new Error("Admin access required")
      const result = await clients.apolloClient.query({
        query: ADMIN_EMAIL_MESSAGE_QUERY,
        variables: { id },
        fetchPolicy: "network-only",
        context: { toast: "query-cache", fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing email detail response")
      return result.data.adminEmailMessage
    },
  })
}
export const emailStatusDescriptions: Record<EmailDeliveryStatus, string> = {
  pending:
    "This email is waiting to be sent. Pending does not confirm that a delivery job has been queued.",
  sent: "The email provider accepted this email for sending. Delivery to the recipient has not been confirmed.",
  delivered:
    "The receiving mail server accepted this email. This does not confirm that the recipient read it.",
  bounced:
    "The receiving mail server rejected this email. Check the recipient address before creating a replacement invitation.",
  complained:
    "The recipient reported this email as spam. Investigate before contacting them again.",
  failed:
    "Sending or queueing this email failed. Review the failure code and provider configuration.",
  skipped:
    "This email was not sent. The notification may be disabled, no longer applicable, or associated with an expired link.",
}
export function emailDeliveryTone(
  status: EmailDeliveryStatus
): "success" | "neutral" | "destructive" {
  return status === "delivered"
    ? "success"
    : ["failed", "bounced", "complained"].includes(status)
      ? "destructive"
      : "neutral"
}
export function emailOutcomeAt(email: EmailDeliveryListItem) {
  switch (email.status) {
    case "complained":
      return email.complainedAt
    case "bounced":
      return email.bouncedAt
    case "delivered":
      return email.deliveredAt
    case "sent":
      return email.sentAt
    default:
      return null
  }
}
export function emailDeliveryErrorMessage(error: unknown) {
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors[0]?.extensions?.code
    if (code === "NOT_FOUND")
      return "This email record no longer exists. Close this dialog and refresh the table."
    if (code === "FORBIDDEN" || code === "UNAUTHENTICATED")
      return "Administrator access is required. Sign in again to continue."
  }
  return "We couldn't load this email record. Try again."
}
