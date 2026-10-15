import type {
  CurrentUserQuery,
  LoginMutation,
} from "../../src/generated/graphql"

export {
  MyAccountDocument,
  UpdateMyProfileDocument,
  ChangePasswordDocument,
  LogoutAllDocument,
  AcceptInvitationDocument as ACCEPT_INVITATION_MUTATION,
  RefreshSessionDocument,
  CurrentUserDocument as CURRENT_USER_QUERY,
  LoginDocument as LOGIN_MUTATION,
  LogoutDocument as LOGOUT_MUTATION,
  RequestPasswordResetDocument as REQUEST_PASSWORD_RESET_MUTATION,
  ResetPasswordDocument as RESET_PASSWORD_MUTATION,
} from "../../src/generated/graphql"
export type CurrentUser = NonNullable<CurrentUserQuery["me"]> & { phone?: string | null; avatarUrl?: string | null }
export type { MyAccountQuery } from "../../src/generated/graphql"
export type AuthPayload = Omit<LoginMutation["login"], "user"> & { user: CurrentUser }
