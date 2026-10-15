import type { ReactNode } from "react"
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info"
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./dialog"

export function ConfirmationDialog({
  title,
  description,
  actions,
  busy = false,
  variant = "info",
  onClose,
}: {
  title: string
  description: ReactNode
  actions: ReactNode
  busy?: boolean
  variant?: "info" | "warning"
  onClose: () => void
}) {
  const Icon = variant === "warning" ? WarningIcon : InfoIcon
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent
        role="alertdialog"
        showCloseButton={false}
        className="max-w-md gap-6 p-6"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex flex-col items-start gap-3">
          <Icon
            aria-hidden
            className={`size-6 shrink-0 ${variant === "warning" ? "text-warning" : "text-primary"}`}
          />
          <DialogDescription className="text-sm leading-6 text-foreground">
            {description}
          </DialogDescription>
        </div>
        <div className="flex flex-wrap justify-end gap-2">{actions}</div>
      </DialogContent>
    </Dialog>
  )
}
