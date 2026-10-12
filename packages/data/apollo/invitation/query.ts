import type { InvitationsQuery } from "../../src/generated/graphql"

export { InvitationsDocument as INVITATIONS_QUERY } from "../../src/generated/graphql"
export type {
  InvitationsQuery as InvitationsQueryResult,
  InvitationsQueryVariables,
} from "../../src/generated/graphql"
export type InvitationListItem = InvitationsQuery["invitations"][number]
