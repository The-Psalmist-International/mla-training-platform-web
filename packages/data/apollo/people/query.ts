import type { UsersQuery } from "../../src/generated/graphql"

export { UsersDocument as USERS_QUERY } from "../../src/generated/graphql"
export type {
  UserRole,
  UsersQuery as UsersQueryResult,
  UsersQueryVariables,
} from "../../src/generated/graphql"
export type UserListItem = UsersQuery["users"][number]
