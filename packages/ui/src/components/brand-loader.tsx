import { BoulesIcon } from "@phosphor-icons/react/dist/csr/Boules"
import { cn } from "cn"

export function BrandLoader({
  label = "Loading",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-10 text-center",
        className
      )}
    >
      <span className="relative flex size-16 items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 animate-spin rounded-full border-2 border-muted border-t-primary"
        />
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BoulesIcon aria-hidden weight="fill" className="size-6" />
        </span>
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
