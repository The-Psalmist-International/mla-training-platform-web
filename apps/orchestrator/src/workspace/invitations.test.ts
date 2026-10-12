import { describe, expect, it, vi } from "vitest"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { QueryClient } from "@tanstack/react-query"
import {
  createDataClients,
  type CurrentUser,
  type InvitationListItem,
} from "@workspace/data"
import {
  getInvitationStatus,
  invitationsTableOptions,
  sendInvitation,
  revokeInvitation,
  isInvitationQueueError,
  invitationErrorMessage,
} from "./invitations"
import {
  validateInvitationsSearch,
  invitationsParamsFromSearch,
  updateInvitationsSearch,
} from "./invitations-search"

const admin: CurrentUser = {
  id: "admin",
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
}
const invitation: InvitationListItem = {
  id: "invite",
  email: "ada@example.com",
  role: "learner",
  invitedBy: "admin",
  acceptedBy: null,
  acceptedAt: null,
  revokedAt: null,
  createdAt: "2026-10-12T00:00:00Z",
  expiresAt: "2026-10-19T00:00:00Z",
}
const params = {
  search: "ada",
  role: "learner" as const,
  status: "pending" as const,
  pageIndex: 2,
  pageSize: 20,
}
function clientsFor(data: object) {
  const request = vi
    .fn<typeof fetch>()
    .mockImplementation(
      async () =>
        new Response(JSON.stringify({ data }), {
          headers: { "content-type": "application/json" },
        })
    )
  return {
    request,
    clients: createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    }),
  }
}
describe("invitation integration", () => {
  it("queries matching totals using server filters and pagination", async () => {
    const { clients, request } = clientsFor({
      invitationsPage: { items: [], totalCount: 42 },
    })
    const cache = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    expect(
      await cache.fetchQuery(invitationsTableOptions(clients, admin, params))
    ).toEqual({ items: [], totalCount: 42 })
    const body = JSON.parse(String(request.mock.calls[0]?.[1]?.body))
    expect(body.operationName).toBe("InvitationsPage")
    expect(body.variables).toEqual({
      search: "ada",
      role: "learner",
      status: "pending",
      limit: 20,
      offset: 40,
    })
    cache.clear()
  })
  it("sends create and revoke mutations", async () => {
    const { clients, request } = clientsFor({
      createInvitation: invitation,
      revokeInvitation: true,
    })
    expect(
      await sendInvitation(clients, admin, {
        email: invitation.email,
        role: invitation.role,
      })
    ).toMatchObject(invitation)
    await revokeInvitation(clients, admin, invitation.id)
    const bodies = request.mock.calls.map((call) =>
      JSON.parse(String(call[1]?.body))
    )
    expect(bodies[0]).toMatchObject({
      operationName: "CreateInvitation",
      variables: { input: { email: invitation.email, role: "learner" } },
    })
    expect(bodies[1]).toMatchObject({
      operationName: "RevokeInvitation",
      variables: { id: invitation.id },
    })
  })
  it("prevents non-admin requests", async () => {
    const { clients, request } = clientsFor({})
    const instructor = { ...admin, role: "instructor" as const }
    const cache = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    await expect(
      cache.fetchQuery(invitationsTableOptions(clients, instructor, params))
    ).rejects.toThrow("Admin access required")
    await expect(
      sendInvitation(clients, instructor, {
        email: invitation.email,
        role: "learner",
      })
    ).rejects.toThrow("Admin access required")
    await expect(
      revokeInvitation(clients, instructor, invitation.id)
    ).rejects.toThrow("Admin access required")
    expect(request).not.toHaveBeenCalled()
    cache.clear()
  })
  it("classifies expiry at the exact boundary with accepted and revoked precedence", () => {
    const expiry = Date.parse(invitation.expiresAt)
    expect(getInvitationStatus(invitation, expiry - 1)).toBe("pending")
    expect(getInvitationStatus(invitation, expiry)).toBe("expired")
    expect(
      getInvitationStatus(
        { ...invitation, revokedAt: invitation.createdAt },
        expiry
      )
    ).toBe("revoked")
    expect(
      getInvitationStatus(
        {
          ...invitation,
          acceptedAt: invitation.createdAt,
          revokedAt: invitation.createdAt,
        },
        expiry
      )
    ).toBe("accepted")
  })
  it("explains partial queue failure without claiming delivery", () => {
    const error = new CombinedGraphQLErrors({
      errors: [
        {
          message: "Queue unavailable",
          extensions: { code: "EMAIL_QUEUE_UNAVAILABLE" },
        },
      ],
    })
    expect(isInvitationQueueError(error)).toBe(true)
    expect(invitationErrorMessage(error)).toContain("invitation was created")
    expect(invitationErrorMessage(error)).toContain("could not be queued")
    expect(isInvitationQueueError(new Error("Network"))).toBe(false)
  })
})
describe("invitation URL state", () => {
  it("preserves create without an invitation and requires selection for row actions", () => {
    expect(
      validateInvitationsSearch({ modal: "create", invitation: "ignored" })
    ).toMatchObject({ modal: "create", invitation: undefined })
    expect(validateInvitationsSearch({ modal: "revoke" }).modal).toBeUndefined()
    expect(
      validateInvitationsSearch({ modal: "resend", invitation: " invite " })
    ).toMatchObject({ modal: "resend", invitation: "invite" })
  })
  it("normalizes filters, rejects invalid pagination, and closes without losing filters", () => {
    const state = validateInvitationsSearch({
      q: " ada ",
      role: "learner",
      status: "expired",
      page: "3",
      pageSize: "50",
      modal: "revoke",
      invitation: "invite",
    })
    expect(invitationsParamsFromSearch(state)).toEqual({
      search: "ada",
      role: "learner",
      status: "expired",
      pageIndex: 2,
      pageSize: 50,
    })
    expect(
      updateInvitationsSearch(state, {
        modal: undefined,
        invitation: undefined,
      })
    ).toMatchObject({ q: "ada", role: "learner", status: "expired", page: 3 })
    expect(
      invitationsParamsFromSearch(
        validateInvitationsSearch({
          page: -1,
          pageSize: 99,
          role: "owner",
          status: "active",
        })
      )
    ).toEqual({
      search: "",
      role: "all",
      status: "all",
      pageIndex: 0,
      pageSize: 20,
    })
  })
})
