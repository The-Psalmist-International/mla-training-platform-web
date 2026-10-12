import type { UsersQuery } from "../../src/generated/graphql"

export {
  UsersDocument as USERS_QUERY,
  UsersPageDocument as USERS_PAGE_QUERY,
  SetUserRoleDocument as SET_USER_ROLE_MUTATION,
  SetUserDisabledDocument as SET_USER_DISABLED_MUTATION,
} from "../../src/generated/graphql"
export type {
  UserRole,
  UsersQuery as UsersQueryResult,
  UsersQueryVariables,
  UsersPageQuery as UsersPageQueryResult,
  UsersPageQueryVariables,
} from "../../src/generated/graphql"
export type UserListItem = UsersQuery["users"][number]
