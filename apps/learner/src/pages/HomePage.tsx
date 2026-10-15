import { useState, useSyncExternalStore } from "react"
import {
  Navigate,
  useNavigate,
  useRouter,
  useSearch,
} from "@tanstack/react-router"
import { useToast } from "@workspace/ui/components/toaster"
import { AccountSettingsPopover } from "@workspace/ui/components/account-settings-popover"
import { LearnerWorkspace } from "../components/LearnerWorkspace"
import { LearnerWorkspaceContent } from "../components/LearnerWorkspaceContent"

export function HomePage() {
  const { auth, dataClients } = useRouter().options.context
  const navigate = useNavigate()
  const { toast } = useToast()
  const search = useSearch({ from: "/" })
  const [signingOut, setSigningOut] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  if (!user) return <Navigate to="/sign-in" replace />
  const signOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await auth.signOut()
    } catch {
      toast({
        title: "Signed out on this device",
        description:
          "The server could not be reached. Your local session has been cleared.",
        status: "warning",
      })
    } finally {
      await navigate({ to: "/sign-in", replace: true })
    }
  }
  return (
    <LearnerWorkspace
      user={user}
      tab={search.tab}
      signingOut={signingOut}
      onSignOut={() => void signOut()}
      onAccountClick={() => setAccountOpen(true)}
    >
      <LearnerWorkspaceContent
        key={`${user.id}:${search.tab}:${search.page}`}
        user={user}
        search={search}
      />
      <AccountSettingsPopover
        open={accountOpen}
        onOpenChange={setAccountOpen}
        user={user}
        dataClients={dataClients}
        onProfileSaved={(profile) => auth.updateProfile(profile)}
        onSessionEnded={async () => {
          setAccountOpen(false)
          await signOut()
        }}
      />
    </LearnerWorkspace>
  )
}
