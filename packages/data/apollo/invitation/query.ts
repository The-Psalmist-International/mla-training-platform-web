import type { InvitationsQuery } from "../../src/generated/graphql"

export { InvitationsDocument as INVITATIONS_QUERY } from "../../src/generated/graphql"
export type {
  InvitationsQuery as InvitationsQueryResult,
  InvitationsQueryVariables,
} from "../../src/generated/graphql"
export type InvitationListItem = InvitationsQuery["invitations"][number]
export {
  InvitationsPageDocument as INVITATIONS_PAGE_QUERY,
  CreateInvitationDocument as CREATE_INVITATION_MUTATION,
  RevokeInvitationDocument as REVOKE_INVITATION_MUTATION,
} from "../../src/generated/graphql"
