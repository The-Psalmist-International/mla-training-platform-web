import type { ReactNode } from "react"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle"
import { EmptyState } from "./empty-state"

export type ErrorStateProps = {
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  description = "Check your connection and try again.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div data-slot="error-state" role="alert">
      <EmptyState
        icon={WarningCircleIcon}
        title={title}
        description={description}
        action={action}
        className={className}
      />
    </div>
  )
}
