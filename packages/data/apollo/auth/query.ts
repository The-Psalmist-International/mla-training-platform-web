import { gql, type TypedDocumentNode } from "@apollo/client"

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: "admin" | "instructor" | "learner"
}

export const CURRENT_USER_QUERY: TypedDocumentNode<{ me: CurrentUser | null }> =
  gql`
    query CurrentUser {
      me {
        id
        name
        email
        role
      }
    }
  `

export interface AuthPayload {
  user: CurrentUser
  accessToken: string
  expiresIn: number
}
export const LOGIN_MUTATION: TypedDocumentNode<
  { login: AuthPayload },
  { input: { email: string; password: string } }
> = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      expiresIn
      user {
        id
        name
        email
        role
      }
    }
  }
`
export const LOGOUT_MUTATION: TypedDocumentNode<{ logout: boolean }> = gql`
  mutation Logout {
    logout
  }
`
export const REQUEST_PASSWORD_RESET_MUTATION: TypedDocumentNode<
  { requestPasswordReset: boolean },
  { email: string }
> = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`
export const RESET_PASSWORD_MUTATION: TypedDocumentNode<
  { resetPassword: boolean },
  { input: { token: string; password: string } }
> = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`
