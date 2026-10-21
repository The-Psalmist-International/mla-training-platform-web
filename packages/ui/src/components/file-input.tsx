import {
  useId,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react"
import { DatabaseIcon } from "@phosphor-icons/react/dist/csr/Database"
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus"
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash"
import { Button } from "./button"
import { cn } from "@workspace/ui/lib/utils"

type FileInputProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "multiple"
> & {
  file: File | null
  emptyText?: string
  helperText?: string
  previewUrl?: string | null
  progress?: number
  onRemove?: () => void
  removeLabel?: string
}

export function FileInput({
  file,
  emptyText = "No file selected",
  helperText = "Click to select a file.",
  previewUrl,
  progress,
  onRemove,
  removeLabel = "Remove file",
  className,
  id,
  disabled,
  "aria-describedby": describedBy,
  ...props
}: FileInputProps) {
  const generatedId = useId()
  const [failedPreview, setFailedPreview] = useState<string | null>(null)
  const hasPreview = !!previewUrl && previewUrl !== failedPreview
  const descriptionId = `${id ?? generatedId}-selection`
  const normalizedProgress =
    progress === undefined ? undefined : Math.min(100, Math.max(0, progress))
  const progressAngle = (normalizedProgress ?? 0) * 3.6
  const progressBodyEnd = Math.max(0, progressAngle - 12)
  const progressStyle = {
    background:
      normalizedProgress === 100
        ? "var(--primary)"
        : `conic-gradient(from -90deg, var(--primary) 0deg ${progressBodyEnd}deg, color-mix(in oklch, var(--primary) 35%, white) ${progressAngle}deg, transparent ${Math.min(360, progressAngle + 0.5)}deg 360deg)`,
    WebkitMask:
      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    maskComposite: "exclude",
    filter: "drop-shadow(0 0 4px color-mix(in oklch, var(--primary) 55%, transparent))",
  } as CSSProperties
  return (
    <div
      data-slot="file-input"
      aria-busy={
        normalizedProgress !== undefined && normalizedProgress < 100
      }
      className={cn(
        "relative flex min-h-50 w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-input bg-background px-6 py-8 text-center transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25 has-[[aria-invalid=true]]:border-destructive",
        hasPreview && "aspect-video",
        disabled
          ? normalizedProgress === undefined
            ? "opacity-50"
            : "cursor-wait"
          : "hover:border-muted-foreground/50",
        className
      )}
    >
      {normalizedProgress !== undefined && normalizedProgress > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] rounded-lg p-0.5 transition-opacity duration-150 motion-reduce:transition-none"
          style={progressStyle}
        />
      )}
      {hasPreview && (
        <>
          <img
            src={previewUrl}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setFailedPreview(previewUrl)}
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-black/55"
          />
        </>
      )}
      <input
        {...props}
        id={id}
        type="file"
        disabled={disabled}
        aria-describedby={[descriptionId, describedBy]
          .filter(Boolean)
          .join(" ")}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      {onRemove && (file || previewUrl) && (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="absolute top-3 right-3 z-30 bg-background text-destructive hover:text-destructive"
          aria-label={removeLabel}
          title={removeLabel}
          disabled={disabled}
          onClick={onRemove}
        >
          <TrashIcon aria-hidden />
        </Button>
      )}
      <div
        className="pointer-events-none relative z-10 flex w-full flex-col items-center gap-2"
        id={descriptionId}
      >
        <span
          className={cn(
            "relative mb-1",
            hasPreview ? "text-white" : "text-muted-foreground"
          )}
          aria-hidden="true"
        >
          <DatabaseIcon size={40} weight="light" />
          <PlusIcon
            size={18}
            className={cn(
              "absolute -right-1 -bottom-1",
              hasPreview ? "rounded-full bg-black/40" : "bg-background"
            )}
          />
        </span>
        <span
          className={cn(
            "max-w-full text-sm break-all",
            hasPreview ? "text-white" : "text-foreground"
          )}
        >
          {file ? file.name : emptyText}
        </span>
        <span
          className={cn(
            "text-sm",
            hasPreview ? "text-white/85" : "text-muted-foreground"
          )}
        >
          {file
            ? `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(file.size / (1024 * 1024))} MB${disabled ? "" : " · Click to choose another file."}`
            : helperText}
        </span>
      </div>
    </div>
  )
}
