import { gql, type TypedDocumentNode } from "@apollo/client"

export const HEALTH_QUERY: TypedDocumentNode<{ health: string }> = gql`
  query PlatformHealth {
    health
  }
`
