import { useId, useState, type ComponentProps } from "react"
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye"
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash"
import { cn } from "@workspace/ui/lib/utils"

export function Input({
  className,
  type,
  id,
  disabled,
  ...props
}: ComponentProps<"input">) {
  const fallbackId = useId()
  const [visible, setVisible] = useState(false)
  const password = type === "password"
  const inputId = id ?? (password ? fallbackId : undefined)
  const input = (
    <input
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:opacity-50 aria-invalid:border-destructive",
        className,
        password && "pr-12"
      )}
      {...props}
      id={inputId}
      type={password && visible ? "text" : type}
      disabled={disabled}
    />
  )
  if (!password) return input
  return (
    <div className="relative w-full">
      {input}
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={inputId}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
      >
        {visible ? (
          <EyeSlashIcon aria-hidden className="size-4" />
        ) : (
          <EyeIcon aria-hidden className="size-4" />
        )}
      </button>
    </div>
  )
}
