import { useSyncExternalStore } from "react"
import { useRouter, useSearch } from "@tanstack/react-router"
import { LearnerShell } from "../components/LearnerShell"
import { LearnerWorkspaceContent } from "../components/LearnerWorkspaceContent"

export function HomePage() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  const search = useSearch({ from: "/" })
  return (
    <LearnerShell tab={search.tab}>
      {user && (
        <LearnerWorkspaceContent
          key={`${user.id}:${search.tab}`}
          user={user}
          search={search}
        />
      )}
    </LearnerShell>
  )
}
