import { CircleNotchIcon } from "@phosphor-icons/react/dist/csr/CircleNotch"
import { cn } from "@workspace/ui/lib/utils"

export function Spinner({
  label = "Loading",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <p
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 text-sm text-muted-foreground",
        className
      )}
    >
      <CircleNotchIcon aria-hidden className="size-5 animate-spin" />
      <span className="sr-only">{label}</span>
    </p>
  )
}
