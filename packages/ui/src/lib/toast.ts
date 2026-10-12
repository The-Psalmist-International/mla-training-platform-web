import { Toast } from "@base-ui/react/toast"
import type { ReactNode } from "react"

export type ToastStatus = "success" | "error" | "warning" | "information"
export type ToastMessage = {
  id?: string
  title: ReactNode
  description?: ReactNode
  status?: ToastStatus
  duration?: number
}

/** Create once per router, never as a process-global SSR singleton. */
export function createToasts() {
  const manager = Toast.createToastManager()
  return {
    manager,
    toast({ status = "information", duration, ...message }: ToastMessage) {
      return manager.add({
        ...message,
        type: status,
        priority: status === "error" ? "high" : "low",
        timeout: duration === Infinity ? 0 : duration ?? (status === "error" ? 8000 : 5000),
      })
    },
    clear: () => manager.close(),
  }
}
export type ToastController = ReturnType<typeof createToasts>
