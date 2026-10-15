import { useSyncExternalStore } from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { WorkspacePageFrame } from "../components/layout/WorkspacePageFrame"
import { NotificationInbox } from "../components/notifications/NotificationInbox"
import { validateNotificationsSearch } from "../workspace/notifications/notifications-search"

export function NotificationsPage() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  const search = validateNotificationsSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  if (!user) return null
  return (
    <WorkspacePageFrame view="notifications">
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
        <NotificationInbox
          key={user.id}
          user={user}
          variant="page"
          tab={search.tab ?? "all"}
          page={search.page ?? 1}
          onChange={(tab, page) =>
            void navigate({
              to: "/workspace/notifications",
              search: {
                tab: tab === "unread" ? "unread" : undefined,
                page: page > 1 ? page : undefined,
              },
              resetScroll: false,
            })
          }
        />
      </div>
    </WorkspacePageFrame>
  )
}
