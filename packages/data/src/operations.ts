import { gql, type TypedDocumentNode } from "@apollo/client"

// These operations match mla-platform-core's current public schema.
export const HEALTH_QUERY: TypedDocumentNode<{ health: string }> = gql`
  query PlatformHealth {
    health
  }
`

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
