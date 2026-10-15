import type { ComponentProps } from "react"
import { useRouter } from "@tanstack/react-router"
import { NotificationInbox as SharedNotificationInbox } from "@workspace/ui/components/notification-inbox"

export { NotificationRow } from "@workspace/ui/components/notification-inbox"

export function NotificationInbox(
  props: Omit<ComponentProps<typeof SharedNotificationInbox>, "dataClients">
) {
  const { dataClients } = useRouter().options.context
  return <SharedNotificationInbox {...props} dataClients={dataClients} />
}
