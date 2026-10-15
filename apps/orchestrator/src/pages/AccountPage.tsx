import { useState, useSyncExternalStore } from "react"
import { Navigate, useNavigate, useRouter } from "@tanstack/react-router"
import { AccountSettingsPopover } from "@workspace/ui/components/account-settings-popover"

export function AccountPage() {
  const { auth, dataClients } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)
  if (!user) return <Navigate to="/sign-in" replace />
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6">
      <AccountSettingsPopover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) void navigate({ to: "/workspace" })
        }}
        user={user}
        dataClients={dataClients}
        onProfileSaved={(profile) => auth.updateProfile(profile)}
        onSessionEnded={async () => {
          await auth.signOut().catch(() => {})
          await navigate({ to: "/sign-in", replace: true })
        }}
      />
    </div>
  )
}
