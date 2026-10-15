import { useEffect, useState } from "react"
import { Link, useRouter, useRouterState } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverTrigger,
  PopoverTitle,
  PopoverContent,
} from "@workspace/ui/components/popover"
import { notificationsOptions } from "../../workspace/notifications/notifications"
import { NotificationInbox } from "./NotificationInbox"

export function WorkspaceNotifications({ user }: { user: CurrentUser }) {
  const { dataClients } = useRouter().options.context
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [open, setOpen] = useState(false)
  const query = useQuery({
    ...notificationsOptions(dataClients, user, false, 1, 1),
    refetchInterval: 60_000,
  })
  const unread = query.data?.unreadCount ?? 0
  useEffect(() => setOpen(false), [pathname])
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-11 text-muted-foreground"
            aria-label={
              unread ? `Notifications, ${unread} unread` : "Notifications"
            }
            title="Notifications"
          >
            <BellIcon aria-hidden />
            {unread > 0 && (
              <span
                aria-hidden
                className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-destructive ring-2 ring-background"
              />
            )}
          </Button>
        }
      />
      <PopoverContent>
        <NotificationInbox
          user={user}
          title={
            <PopoverTitle className="text-sm font-semibold">
              Notifications
            </PopoverTitle>
          }
          footer={
            <>
              <span className="text-xs text-muted-foreground">
                Your workspace updates
              </span>
              <Button
                variant="link"
                size="sm"
                className="h-auto px-0 text-xs"
                render={
                  <Link
                    to="/workspace/notifications"
                    onClick={() => setOpen(false)}
                  />
                }
              >
                View all notifications
              </Button>
            </>
          }
        />
      </PopoverContent>
    </Popover>
  )
}
