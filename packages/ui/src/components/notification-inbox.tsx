import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Tabs } from "@base-ui/react/tabs"
import type {
  CurrentUser,
  DataClients,
  NotificationFieldsFragment,
} from "@workspace/data"
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell"
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check"
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/csr/ClipboardText"
import { FilmStripIcon } from "@phosphor-icons/react/dist/csr/FilmStrip"
import { CertificateIcon } from "@phosphor-icons/react/dist/csr/Certificate"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { useToast } from "@workspace/ui/components/toaster"
import {
  markAllNotifications,
  markNotification,
  notificationCopy,
  notificationTime,
  notificationsOptions,
} from "../lib/notifications"

export function NotificationInbox({
  dataClients,
  user,
  emptyDescription = "Course updates, learner submissions, and reviews will appear here.",
  title,
  tab: controlledTab,
  page: controlledPage,
  onChange,
  footer,
  variant = "popover",
}: {
  dataClients: DataClients
  user: CurrentUser
  emptyDescription?: string
  title?: ReactNode
  tab?: "all" | "unread"
  page?: number
  onChange?: (tab: "all" | "unread", page: number) => void
  footer?: ReactNode
  variant?: "popover" | "page"
}) {
  const cache = useQueryClient()
  const { toast } = useToast()
  const id = useId()
  const [localTab, setLocalTab] = useState<"all" | "unread">("all")
  const [localPage, setLocalPage] = useState(1)
  const tab = controlledTab ?? localTab,
    page = controlledPage ?? localPage
  const change = (nextTab: "all" | "unread", nextPage: number) => {
    if (onChange) onChange(nextTab, nextPage)
    else {
      setLocalTab(nextTab)
      setLocalPage(nextPage)
    }
  }
  const query = useQuery({
    ...notificationsOptions(dataClients, user, tab === "unread", page),
    refetchInterval: 60_000,
  })
  const [busy, setBusy] = useState<string | null>(null)
  const lock = useRef(false)
  const unreadCount = query.data?.unreadCount ?? 0
  const pages = Math.max(1, Math.ceil((query.data?.totalCount ?? 0) / 20))
  useEffect(() => {
    if (query.data && page > pages) change(tab, pages)
  }, [query.data, page, pages, tab])
  const markRead = async (notificationId?: string) => {
    if (lock.current) return
    lock.current = true
    setBusy(notificationId ?? "all")
    try {
      if (notificationId) await markNotification(dataClients, notificationId)
      else await markAllNotifications(dataClients)
      await cache.invalidateQueries({
        queryKey: [
          "workspace",
          dataClients.graphqlUrl,
          user.id,
          "notifications",
        ],
      })
      if (!notificationId)
        toast({
          title: "Notifications updated",
          description: "All notifications marked as read.",
          status: "success",
        })
    } catch {
      toast({
        title: "Couldn’t update notifications",
        description: "Try again to mark them as read.",
        status: "error",
      })
    } finally {
      lock.current = false
      setBusy(null)
    }
  }
  const readAction = (
    <Button
      variant="link"
      size="sm"
      className="h-auto px-0 text-xs"
      disabled={!unreadCount || !!busy || query.isPending}
      onClick={() => void markRead()}
    >
      {busy === "all" ? "Marking as read..." : "Mark all as read"}
    </Button>
  )
  return (
    <>
      {variant === "popover" && (
        <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 px-5 py-3">
          {title ?? <h2 className="text-sm font-semibold">Notifications</h2>}
          {readAction}
        </div>
      )}
      <Tabs.Root
        value={tab}
        onValueChange={(value) =>
          change(value === "unread" ? "unread" : "all", 1)
        }
        className="flex min-h-0 flex-1 flex-col"
      >
        <div
          className={
            variant === "page"
              ? "flex shrink-0 items-center justify-between gap-3 border-b border-border/70"
              : "border-y border-border/70"
          }
        >
          <Tabs.List
            className={`flex shrink-0 gap-5 ${variant === "popover" ? "px-5" : ""}`}
            aria-label="Filter notifications"
          >
            <Tabs.Tab
              value="all"
              className="relative flex min-h-11 items-center border-b-2 border-transparent text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:border-primary data-active:font-medium data-active:text-foreground"
            >
              All
            </Tabs.Tab>
            <Tabs.Tab
              value="unread"
              className="relative flex min-h-11 items-center gap-2 border-b-2 border-transparent text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:border-primary data-active:font-medium data-active:text-foreground"
            >
              Unread
              {unreadCount > 0 && (
                <span className="flex min-w-5 items-center justify-center rounded bg-destructive px-1 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Tabs.Tab>
          </Tabs.List>
          {variant === "page" && readAction}
        </div>
        {(["all", "unread"] as const).map((value) => (
          <Tabs.Panel
            key={value}
            value={value}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            style={{ maxHeight: footer ? "min(440px, 55svh)" : undefined }}
          >
            {query.isPending ? (
              <div role="status" className="space-y-5 p-5">
                <span className="sr-only">Loading notifications</span>
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex gap-3">
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : query.isError && !query.data ? (
              <div className="px-5 py-10 text-center">
                <p role="alert" className="text-sm font-medium">
                  Notifications couldn’t be loaded
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try again to load your inbox.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => void query.refetch()}
                >
                  Try again
                </Button>
              </div>
            ) : query.data.items.length ? (
              <div className="p-2">
                {query.data.items.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    disabled={!!busy}
                    pending={busy === notification.id}
                    onRead={() => void markRead(notification.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center px-5 py-12">
                <EmptyState
                  icon={BellIcon}
                  title={
                    tab === "unread"
                      ? "You’re all caught up"
                      : "No notifications yet"
                  }
                  description={
                    tab === "unread"
                      ? "You’ve read all your notifications."
                      : emptyDescription
                  }
                />
              </div>
            )}
            {query.isError && query.data && (
              <p role="alert" className="px-5 pb-3 text-xs text-destructive">
                Refresh failed. Showing previously loaded notifications.
              </p>
            )}
          </Tabs.Panel>
        ))}
      </Tabs.Root>
      {pages > 1 && (
        <div className="flex shrink-0 items-center justify-between border-t border-border/70 px-5 py-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={page <= 1 || query.isFetching}
            onClick={() => change(tab, page - 1)}
          >
            Previous
          </Button>
          <span
            id={`${id}-page`}
            className="text-xs text-muted-foreground tabular-nums"
          >
            {page} / {pages}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={page >= pages || query.isFetching}
            onClick={() => change(tab, page + 1)}
          >
            Next
          </Button>
        </div>
      )}
      {footer && (
        <div className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-t border-border/70 px-5 py-2">
          {footer}
        </div>
      )}
    </>
  )
}

export function NotificationRow({
  notification,
  disabled,
  pending,
  onRead,
}: {
  notification: NotificationFieldsFragment
  disabled: boolean
  pending: boolean
  onRead: () => void
}) {
  const copy = notificationCopy[notification.type]
  const Icon = notification.type.startsWith("submission")
    ? FilmStripIcon
    : notification.type.startsWith("assessment") ||
        notification.type === "grading_pending"
      ? ClipboardTextIcon
      : notification.type === "certificate_issued"
        ? CertificateIcon
        : CheckCircleIcon
  const unread = !notification.readAt
  return (
    <article className="flex items-start gap-3 rounded-lg px-3 py-4 transition-colors hover:bg-muted/40">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
      >
        <Icon aria-hidden className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-5 ${unread ? "font-medium" : "text-muted-foreground"}`}
        >
          {copy.title}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {copy.description}
        </p>
        <time
          dateTime={notification.createdAt}
          title={new Date(notification.createdAt).toLocaleString()}
          className="mt-1 block text-xs text-muted-foreground"
        >
          {notificationTime(notification.createdAt)}
        </time>
      </div>
      {unread ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative size-9 shrink-0 text-muted-foreground"
          disabled={disabled}
          onClick={onRead}
          aria-label={`Mark ${copy.title.toLowerCase()} as read`}
          title="Mark as read"
        >
          <CheckIcon
            aria-hidden
            className={
              pending ? "animate-pulse motion-reduce:animate-none" : ""
            }
          />
          <span
            aria-hidden
            className="absolute top-0 right-0 size-1.5 rounded-full bg-primary"
          />
        </Button>
      ) : (
        <span className="sr-only">Read</span>
      )}
    </article>
  )
}
