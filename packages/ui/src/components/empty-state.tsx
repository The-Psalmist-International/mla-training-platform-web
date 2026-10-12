import type { ReactNode } from "react"
import type { Icon } from "@phosphor-icons/react"
import { cn } from "cn"

export type EmptyStateProps = {
  icon: Icon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex max-w-md flex-col items-center text-center",
        className
      )}
    >
      <Icon
        aria-hidden
        weight="regular"
        className="mb-3 size-12 text-muted-foreground"
      />
      <h2 className="text-lg font-medium">{title}</h2>
      {description && (
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}
      {action != null && <div className="mt-6">{action}</div>}
    </div>
  )
}
