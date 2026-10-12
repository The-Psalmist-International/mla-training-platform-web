import { useId, type ComponentProps } from "react"
import { DatabaseIcon } from "@phosphor-icons/react/dist/csr/Database"
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus"
import { cn } from "@workspace/ui/lib/utils"

type FileInputProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "multiple"
> & {
  file: File | null
  emptyText?: string
  helperText?: string
}

export function FileInput({
  file,
  emptyText = "No file selected",
  helperText = "Click to select a file.",
  className,
  id,
  disabled,
  "aria-describedby": describedBy,
  ...props
}: FileInputProps) {
  const generatedId = useId()
  const descriptionId = `${id ?? generatedId}-selection`
  return (
    <div
      data-slot="file-input"
      className={cn(
        "relative flex min-h-50 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-background px-6 py-8 text-center transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25 has-[[aria-invalid=true]]:border-destructive",
        disabled ? "opacity-50" : "hover:border-muted-foreground/50",
        className
      )}
    >
      <input
        {...props}
        id={id}
        type="file"
        disabled={disabled}
        aria-describedby={[descriptionId, describedBy]
          .filter(Boolean)
          .join(" ")}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <div
        className="pointer-events-none flex w-full flex-col items-center gap-2"
        id={descriptionId}
      >
        <span
          className="relative mb-1 text-muted-foreground"
          aria-hidden="true"
        >
          <DatabaseIcon size={40} weight="light" />
          <PlusIcon
            size={18}
            className="absolute -right-1 -bottom-1 bg-background"
          />
        </span>
        <span className="max-w-full text-sm break-all text-foreground">
          {file ? file.name : emptyText}
        </span>
        <span className="text-sm text-muted-foreground">
          {file
            ? `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(file.size / (1024 * 1024))} MB${disabled ? "" : " · Click to choose another file."}`
            : helperText}
        </span>
      </div>
    </div>
  )
}
