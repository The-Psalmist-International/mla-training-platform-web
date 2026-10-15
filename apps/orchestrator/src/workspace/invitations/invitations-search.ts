import type { UserRole } from "@workspace/data"
import type { InvitationsTableParams } from "./invitations"

export interface InvitationsSearchState {
  q?: string
  role?: UserRole
  status?: "pending" | "accepted" | "revoked" | "expired"
  page?: number
  pageSize?: number
  modal?: "create" | "resend" | "revoke"
  invitation?: string
}

export const invitationsPageSizes = [10, 20, 50, 100] as const

function positiveInteger(value: unknown, fallback: number, maximum: number) {
  const number =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : NaN
  return Number.isSafeInteger(number) && number > 0 && number <= maximum
    ? number
    : fallback
}

export function validateInvitationsSearch(
  search: Record<string, unknown>
): InvitationsSearchState {
  const q = typeof search.q === "string" ? search.q.slice(0, 200).trim() : ""
  const role =
    search.role === "admin" ||
    search.role === "instructor" ||
    search.role === "learner"
      ? search.role
      : undefined
  const status =
    search.status === "pending" ||
    search.status === "accepted" ||
    search.status === "revoked" ||
    search.status === "expired"
      ? search.status
      : undefined
  const page = positiveInteger(search.page, 1, 1_000_000)
  const size = positiveInteger(search.pageSize, 20, 100)
  const pageSize = invitationsPageSizes.some((allowed) => allowed === size)
    ? size
    : 20
  const modal =
    search.modal === "create" ||
    search.modal === "resend" ||
    search.modal === "revoke"
      ? search.modal
      : undefined
  const invitation =
    typeof search.invitation === "string" &&
    search.invitation.trim() &&
    search.invitation.length <= 128
      ? search.invitation.trim()
      : undefined
  return {
    q: q || undefined,
    role,
    status,
    page: page === 1 ? undefined : page,
    pageSize: pageSize === 20 ? undefined : pageSize,
    modal: modal === "create" ? modal : modal && invitation ? modal : undefined,
    invitation:
      modal && modal !== "create" && invitation ? invitation : undefined,
  }
}

export function invitationsParamsFromSearch(
  search: InvitationsSearchState
): InvitationsTableParams {
  return {
    search: search.q ?? "",
    role: search.role ?? "all",
    status: search.status ?? "all",
    pageIndex: (search.page ?? 1) - 1,
    pageSize: search.pageSize ?? 20,
  }
}

export function updateInvitationsSearch(
  previous: InvitationsSearchState,
  patch: Partial<InvitationsSearchState>
) {
  return validateInvitationsSearch({ ...previous, ...patch })
}
