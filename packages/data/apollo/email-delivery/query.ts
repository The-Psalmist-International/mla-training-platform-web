import type {
  AdminEmailMessagesQuery,
  AdminEmailMessagesQueryVariables,
} from "../../src/generated/graphql"

export { AdminEmailMessagesDocument as ADMIN_EMAIL_MESSAGES_QUERY } from "../../src/generated/graphql"
export {
  AdminEmailMessagesPageDocument as ADMIN_EMAIL_MESSAGES_PAGE_QUERY,
  AdminEmailMessageDocument as ADMIN_EMAIL_MESSAGE_QUERY,
} from "../../src/generated/graphql"
export type {
  EmailDeliveryStatus,
  AdminEmailMessagesQuery as AdminEmailMessagesQueryResult,
  AdminEmailMessagesQueryVariables,
} from "../../src/generated/graphql"
export type EmailDeliveryListItem =
  AdminEmailMessagesQuery["adminEmailMessages"][number]
export type EmailDeliveryPurpose = NonNullable<
  AdminEmailMessagesQueryVariables["purpose"]
>
