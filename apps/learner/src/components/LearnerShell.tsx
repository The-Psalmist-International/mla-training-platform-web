import { useState, useSyncExternalStore, type ReactNode } from "react"
import { Navigate, useNavigate, useRouter } from "@tanstack/react-router"
import { useToast } from "@workspace/ui/components/toaster"
import { AccountSettingsPopover } from "@workspace/ui/components/account-settings-popover"
import { LearnerWorkspace } from "./LearnerWorkspace"
import type { LearnerTab } from "../workspace/navigation"

export function LearnerShell({
  tab,
  courseMode = false,
  children,
}: {
  tab: LearnerTab
  courseMode?: boolean
  children: ReactNode
}) {
  const { auth, dataClients } = useRouter().options.context
  const navigate = useNavigate()
  const { toast } = useToast()
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  const [signingOut, setSigningOut] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
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
      tab={tab}
      courseMode={courseMode}
      signingOut={signingOut}
      onSignOut={() => void signOut()}
      onAccountClick={() => setAccountOpen(true)}
    >
      {children}
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
