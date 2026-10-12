import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { queryOptions } from "@tanstack/react-query"
import {
  USERS_PAGE_QUERY,
  SET_USER_ROLE_MUTATION,
  SET_USER_DISABLED_MUTATION,
  type CurrentUser,
  type DataClients,
  type UserRole,
} from "@workspace/data"

const createdAtFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
})

export function formatPeopleCreatedAt(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : createdAtFormat.format(date)
}

export type PeopleAccessChange =
  { type: "role"; role: UserRole } | { type: "status"; disabled: boolean }

export async function updatePeopleAccess(
  clients: DataClients,
  actor: CurrentUser,
  id: string,
  change: PeopleAccessChange
) {
  if (actor.role !== "admin") throw new Error("Admin access required")
  if (change.type === "role") {
    const result = await clients.apolloClient.mutate({
      mutation: SET_USER_ROLE_MUTATION,
      variables: { id, role: change.role },
    })
    if (!result.data) throw new Error("Missing role response")
    return result.data.setUserRole
  }
  const result = await clients.apolloClient.mutate({
    mutation: SET_USER_DISABLED_MUTATION,
    variables: { id, disabled: change.disabled },
  })
  if (!result.data) throw new Error("Missing account status response")
  return result.data.setUserDisabled
}

export function peopleAccessErrorMessage(error: unknown) {
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors[0]?.extensions?.code
    if (code === "LAST_ADMIN")
      return "Keep at least one active administrator. Enable or promote another administrator first."
    if (code === "FORBIDDEN" || code === "UNAUTHENTICATED")
      return "Administrator access is required. Sign in again to continue."
    if (code === "NOT_FOUND")
      return "This person no longer exists. Refresh the People table."
    if (code === "BAD_USER_INPUT") return "Choose a valid role and try again."
  }
  return "We couldn't update this person's access. Please try again."
}

export interface PeopleTableParams {
  search: string
  role: UserRole | "all"
  status: "all" | "active" | "disabled"
  pageIndex: number
  pageSize: number
}

export function peopleTableOptions(
  clients: DataClients,
  user: CurrentUser,
  params: PeopleTableParams
) {
  return queryOptions({
    queryKey: [
      "workspace",
      clients.graphqlUrl,
      user.id,
      "people-table",
      params,
    ],
    queryFn: async ({ signal }) => {
      if (user.role !== "admin") throw new Error("Admin access required")
      const result = await clients.apolloClient.query({
        query: USERS_PAGE_QUERY,
        variables: {
          search: params.search || undefined,
          role: params.role === "all" ? undefined : params.role,
          disabled:
            params.status === "all" ? undefined : params.status === "disabled",
          limit: params.pageSize,
          offset: params.pageIndex * params.pageSize,
        },
        fetchPolicy: "network-only",
        context: { fetchOptions: { signal } },
      })
      if (!result.data) throw new Error("Missing people response")
      return result.data.usersPage
    },
  })
}
