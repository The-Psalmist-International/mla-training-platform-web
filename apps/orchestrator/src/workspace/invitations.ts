import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { queryOptions } from "@tanstack/react-query"
import {
  INVITATIONS_PAGE_QUERY,
  CREATE_INVITATION_MUTATION,
  REVOKE_INVITATION_MUTATION,
  type CurrentUser,
  type DataClients,
  type InvitationListItem,
  type UserRole,
} from "@workspace/data"

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired"
export function getInvitationStatus(
  invitation: InvitationListItem,
  now = Date.now()
): InvitationStatus {
  if (invitation.acceptedAt) return "accepted"
  if (invitation.revokedAt) return "revoked"
  return new Date(invitation.expiresAt).getTime() > now ? "pending" : "expired"
}
export interface InvitationsTableParams {
  search: string
  role: UserRole | "all"
  status: InvitationStatus | "all"
  pageIndex: number
  pageSize: number
}
export function invitationsTableOptions(
  clients: DataClients,
  user: CurrentUser,
  params: InvitationsTableParams
) {
  return queryOptions({
    queryKey: [
      "workspace",
      clients.graphqlUrl,
      user.id,
      "invitations-table",
      params,
    ],
    queryFn: async ({ signal }) => {
      if (user.role !== "admin") throw new Error("Admin access required")
      const result = await clients.apolloClient.query({
        query: INVITATIONS_PAGE_QUERY,
        variables: {
          search: params.search || undefined,
          role: params.role === "all" ? undefined : params.role,
          status: params.status === "all" ? undefined : params.status,
          limit: params.pageSize,
          offset: params.pageIndex * params.pageSize,
        },
        fetchPolicy: "network-only",
        context: { fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing invitations response")
      return result.data.invitationsPage
    },
  })
}
export async function sendInvitation(
  clients: DataClients,
  actor: CurrentUser,
  input: { email: string; role: UserRole }
) {
  if (actor.role !== "admin") throw new Error("Admin access required")
  const result = await clients.apolloClient.mutate({
    mutation: CREATE_INVITATION_MUTATION,
    variables: { input },
  })
  if (!result.data) throw new Error("Missing invitation response")
  return result.data.createInvitation
}
export async function revokeInvitation(
  clients: DataClients,
  actor: CurrentUser,
  id: string
) {
  if (actor.role !== "admin") throw new Error("Admin access required")
  const result = await clients.apolloClient.mutate({
    mutation: REVOKE_INVITATION_MUTATION,
    variables: { id },
  })
  if (result.data?.revokeInvitation !== true)
    throw new Error("Missing revocation response")
}
export function isInvitationQueueError(error: unknown) {
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (item) => item.extensions?.code === "EMAIL_QUEUE_UNAVAILABLE"
    )
  )
}
export function invitationErrorMessage(error: unknown) {
  if (isInvitationQueueError(error))
    return "The invitation was created, but its email could not be queued. Retry to create a replacement invitation."
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors[0]?.extensions?.code
    if (code === "CONFLICT")
      return "This email already belongs to an account. Manage their access from People."
    if (code === "FORBIDDEN" || code === "UNAUTHENTICATED")
      return "Administrator access is required. Sign in again to continue."
    if (code === "RATE_LIMITED")
      return "Too many invitations were sent. Wait a moment and try again."
    if (code === "NOT_FOUND" || code === "INVALID_TOKEN")
      return "This invitation is no longer available. Refresh the table."
    if (code === "BAD_USER_INPUT")
      return "Check the email and role, then try again."
  }
  return "We couldn't update the invitation. Please try again."
}
