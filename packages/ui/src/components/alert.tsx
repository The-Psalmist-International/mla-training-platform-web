import type { ComponentProps } from "react"
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle"
import { cn } from "@workspace/ui/lib/utils"

export function Alert({
  variant = "info",
  className,
  children,
  ...props
}: ComponentProps<"div"> & { variant?: "info" | "warning" }) {
  const Icon = variant === "warning" ? WarningCircleIcon : InfoIcon
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      role={variant === "warning" ? "alert" : "note"}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-sm leading-6",
        variant === "warning"
          ? "border-destructive/25 bg-destructive/5 text-destructive"
          : "border-ring/25 bg-ring/5 text-foreground",
        className
      )}
      {...props}
    >
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 size-5 shrink-0",
          variant === "info" && "text-ring"
        )}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
