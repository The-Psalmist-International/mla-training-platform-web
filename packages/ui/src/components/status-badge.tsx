import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode
  tone?: "success" | "neutral"
  className?: string
}) {
  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[10px] leading-none whitespace-nowrap uppercase",
        tone === "success"
          ? "bg-success text-success-foreground"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  )
}
