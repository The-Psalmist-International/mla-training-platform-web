import type {
  CurrentUserQuery,
  LoginMutation,
} from "../../src/generated/graphql"

export {
  CurrentUserDocument as CURRENT_USER_QUERY,
  LoginDocument as LOGIN_MUTATION,
  LogoutDocument as LOGOUT_MUTATION,
  RequestPasswordResetDocument as REQUEST_PASSWORD_RESET_MUTATION,
  ResetPasswordDocument as RESET_PASSWORD_MUTATION,
} from "../../src/generated/graphql"
export type CurrentUser = NonNullable<CurrentUserQuery["me"]>
export type AuthPayload = LoginMutation["login"]
