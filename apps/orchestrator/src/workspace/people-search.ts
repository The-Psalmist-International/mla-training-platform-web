import type { UserRole } from "@workspace/data"
import type { PeopleTableParams } from "./people"

export interface PeopleSearchState {
  q?: string
  role?: UserRole
  status?: "active" | "disabled"
  page?: number
  pageSize?: number
  modal?: "role" | "status"
  person?: string
}

export const peoplePageSizes = [10, 20, 50, 100] as const

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

export function validatePeopleSearch(
  search: Record<string, unknown>
): PeopleSearchState {
  const q = typeof search.q === "string" ? search.q.slice(0, 200).trim() : ""
  const role =
    search.role === "admin" ||
    search.role === "instructor" ||
    search.role === "learner"
      ? search.role
      : undefined
  const status =
    search.status === "active" || search.status === "disabled"
      ? search.status
      : undefined
  const page = positiveInteger(search.page, 1, 1_000_000)
  const size = positiveInteger(search.pageSize, 20, 100)
  const pageSize = peoplePageSizes.some((allowed) => allowed === size)
    ? size
    : 20
  const modal =
    search.modal === "role" || search.modal === "status"
      ? search.modal
      : undefined
  const person =
    typeof search.person === "string" &&
    search.person.trim() &&
    search.person.length <= 128
      ? search.person.trim()
      : undefined
  return {
    q: q || undefined,
    role,
    status,
    page: page === 1 ? undefined : page,
    pageSize: pageSize === 20 ? undefined : pageSize,
    modal: modal && person ? modal : undefined,
    person: modal && person ? person : undefined,
  }
}

export function peopleParamsFromSearch(
  search: PeopleSearchState
): PeopleTableParams {
  return {
    search: search.q ?? "",
    role: search.role ?? "all",
    status: search.status ?? "all",
    pageIndex: (search.page ?? 1) - 1,
    pageSize: search.pageSize ?? 20,
  }
}

export function updatePeopleSearch(
  previous: PeopleSearchState,
  patch: Partial<PeopleSearchState>
) {
  return validatePeopleSearch({ ...previous, ...patch })
}
