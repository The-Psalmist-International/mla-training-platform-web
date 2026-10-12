import { createContext, useContext, useState, type ReactNode } from "react"
import { Toast } from "@base-ui/react/toast"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle"
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning"
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info"
import { XIcon } from "@phosphor-icons/react/dist/csr/X"
import { createToasts, type ToastController } from "@workspace/ui/lib/toast"
import { cn } from "@workspace/ui/lib/utils"

const ToastContext = createContext<ToastController | null>(null)
const icons = {
  success: CheckCircleIcon,
  error: WarningCircleIcon,
  warning: WarningIcon,
  information: InfoIcon,
}

export function ToastProvider({ children, controller }: { children: ReactNode; controller?: ToastController }) {
  const [local] = useState(createToasts)
  const toasts = controller ?? local
  return (
    <ToastContext.Provider value={toasts}>
      <Toast.Provider toastManager={toasts.manager} limit={3}>
        {children}
        <ToastViewport />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

function ToastViewport() {
  const { toasts } = Toast.useToastManager()
  return (
    <Toast.Portal>
      <Toast.Viewport className="pointer-events-none fixed right-4 bottom-4 left-4 z-[100] flex max-h-[calc(100svh-2rem)] flex-col gap-2 outline-none sm:left-auto sm:w-96" aria-label="Notifications">
        {toasts.map((toast) => {
          const status = toast.type && toast.type in icons ? toast.type as keyof typeof icons : "information"
          const Icon = icons[status]
          return (
            <Toast.Root key={toast.id} toast={toast} className="pointer-events-auto flex shrink-0 items-start gap-3 rounded-lg bg-popover p-3 text-popover-foreground shadow-xl ring-1 ring-inset ring-border transition-[opacity,transform] duration-200 ease-out data-starting:translate-y-5 data-starting:opacity-0 data-ending:translate-y-2 data-ending:opacity-0 data-limited:hidden motion-reduce:transform-none motion-reduce:transition-none">
              <Icon weight="fill" size={20} aria-hidden className={cn("mt-0.5 shrink-0", status === "success" ? "text-success-foreground" : status === "error" ? "text-destructive" : status === "warning" ? "text-warning" : "text-ring")} />
              <Toast.Content className="min-w-0 flex-1 pt-0.5">
                <Toast.Title className="text-sm font-medium leading-5" />
                <Toast.Description className="mt-0.5 text-sm leading-5 break-words text-muted-foreground" />
              </Toast.Content>
              <Toast.Close aria-label="Dismiss notification" className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]">
                <XIcon size={16} aria-hidden />
              </Toast.Close>
            </Toast.Root>
          )
        })}
      </Toast.Viewport>
    </Toast.Portal>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within a ToastProvider")
  return context
}
