import { useEffect, useRef, useState } from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown"
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check"
import { XIcon } from "@phosphor-icons/react/dist/csr/X"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "./button"
import { UserAvatar } from "./user-avatar"

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  avatarUrl?: string | null
  disabled?: boolean
}

function ComboboxItemLabel({ item }: { item: ComboboxOption }) {
  return (
    <>
      {item.avatarUrl !== undefined && (
        <UserAvatar
          name={item.label}
          avatarUrl={item.avatarUrl}
          size="sm"
          className="shrink-0"
        />
      )}
      <div className="min-w-0">
        <div className="break-words">{item.label}</div>
        {item.description && (
          <div className="mt-0.5 text-xs text-muted-foreground">
            {item.description}
          </div>
        )}
      </div>
    </>
  )
}
export interface ComboboxProps {
  options: readonly ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  /** Enables multi-select. Pair with `values` / `onValuesChange`. */
  multiple?: boolean
  values?: string[]
  onValuesChange?: (values: string[]) => void
  onSearchChange?: (search: string) => void
  placeholder?: string
  emptyText?: string
  selectedLabel?: string
  loading?: boolean
  error?: string
  onRetry?: () => void
  disabled?: boolean
  required?: boolean
  id?: string
  name?: string
  className?: string
  "aria-label"?: string
  "aria-describedby"?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  multiple = false,
  values = [],
  onValuesChange,
  onSearchChange,
  placeholder = "Search and select...",
  emptyText = "No matching options.",
  selectedLabel = "Selected item",
  loading = false,
  error,
  onRetry,
  disabled,
  required,
  id,
  name,
  className,
  ...accessibility
}: ComboboxProps) {
  if (multiple)
    return (
      <MultiCombobox
        options={options}
        values={values}
        onValuesChange={onValuesChange ?? (() => {})}
        onSearchChange={onSearchChange}
        placeholder={placeholder}
        emptyText={emptyText}
        loading={loading}
        error={error}
        onRetry={onRetry}
        disabled={disabled}
        id={id}
        className={className}
        {...accessibility}
      />
    )
  const [lastSelected, setLastSelected] = useState<ComboboxOption | null>(null)
  const [search, setSearch] = useState("")
  useEffect(() => {
    if (!onSearchChange) return
    const timer = setTimeout(() => onSearchChange(search), 250)
    return () => clearTimeout(timer)
  }, [search, onSearchChange])
  const option = options.find((entry) => entry.value === value)
  useEffect(() => {
    if (
      option &&
      (lastSelected?.value !== option.value ||
        lastSelected.label !== option.label ||
        lastSelected.description !== option.description)
    )
      setLastSelected(option)
  }, [option, lastSelected])
  const selected =
    option ??
    (lastSelected?.value === value
      ? lastSelected
      : value
        ? { value, label: selectedLabel }
        : null)
  return (
    <ComboboxPrimitive.Root<ComboboxOption>
      items={options}
      value={selected}
      disabled={disabled}
      required={required}
      name={name}
      filter={onSearchChange ? null : undefined}
      isItemEqualToValue={(item, chosen) => item.value === chosen.value}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      onValueChange={(next) => {
        setLastSelected(next)
        setSearch("")
        onValueChange(next?.value ?? "")
        onSearchChange?.("")
      }}
      onInputValueChange={(nextSearch, details) => {
        if (
          details.reason === "input-change" ||
          details.reason === "input-clear" ||
          details.reason === "clear-press"
        )
          setSearch(nextSearch)
      }}
      onOpenChange={(open) => {
        if (!open) {
          setSearch("")
          onSearchChange?.("")
        }
      }}
    >
      <ComboboxPrimitive.InputGroup
        className={cn(
          "flex h-10 w-full items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/25",
          disabled && "opacity-50",
          className
        )}
      >
        <ComboboxPrimitive.Input
          id={id}
          placeholder={placeholder}
          {...accessibility}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        {!!value && (
          <ComboboxPrimitive.Clear
            aria-label="Clear selection"
            className="flex size-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <XIcon aria-hidden className="size-4" />
          </ComboboxPrimitive.Clear>
        )}
        <ComboboxPrimitive.Trigger
          aria-label="Show options"
          className="flex size-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <CaretDownIcon aria-hidden className="size-4" />
        </ComboboxPrimitive.Trigger>
      </ComboboxPrimitive.InputGroup>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={4} className="isolate z-50">
          <ComboboxPrimitive.Popup className="max-h-(--available-height) w-(--anchor-width) min-w-48 overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
            {loading && (
              <ComboboxPrimitive.Status className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </ComboboxPrimitive.Status>
            )}
            {error && (
              <div
                role="status"
                className="px-3 py-2 text-sm text-muted-foreground"
              >
                {error}
                {onRetry && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onRetry}
                  >
                    Try again
                  </Button>
                )}
              </div>
            )}
            {!loading && !error && (
              <ComboboxPrimitive.Empty className="px-3 py-3 text-sm text-muted-foreground">
                {emptyText}
              </ComboboxPrimitive.Empty>
            )}
            <ComboboxPrimitive.List>
              {(item: ComboboxOption) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  disabled={item.disabled}
                  className="relative flex cursor-default items-center gap-2 rounded-sm py-2 pr-3 pl-8 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50"
                >
                  <ComboboxPrimitive.ItemIndicator className="absolute left-2">
                    <CheckIcon aria-hidden className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                  <ComboboxItemLabel item={item} />
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}

function MultiCombobox({
  options,
  values,
  onValuesChange,
  onSearchChange,
  placeholder,
  emptyText,
  loading,
  error,
  onRetry,
  disabled,
  id,
  className,
  ...accessibility
}: {
  options: readonly ComboboxOption[]
  values: string[]
  onValuesChange: (values: string[]) => void
  onSearchChange?: (search: string) => void
  placeholder?: string
  emptyText?: string
  loading?: boolean
  error?: string
  onRetry?: () => void
  disabled?: boolean
  id?: string
  className?: string
  "aria-label"?: string
  "aria-describedby"?: string
}) {
  const [, setSearch] = useState("")
  const known = useRef(new Map<string, ComboboxOption>())
  for (const item of options) known.current.set(item.value, item)
  const selected = values.map(
    (entry) =>
      options.find((item) => item.value === entry) ??
      known.current.get(entry) ?? { value: entry, label: entry }
  )
  return (
    <ComboboxPrimitive.Root<ComboboxOption, true>
      multiple
      items={options}
      value={selected}
      disabled={disabled}
      filter={onSearchChange ? null : undefined}
      isItemEqualToValue={(item, chosen) => item.value === chosen.value}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      onValueChange={(next) => {
        setSearch("")
        onValuesChange(next.map((item) => item.value))
        onSearchChange?.("")
      }}
      onInputValueChange={(nextSearch, details) => {
        if (
          details.reason === "input-change" ||
          details.reason === "input-clear" ||
          details.reason === "clear-press"
        )
          setSearch(nextSearch)
      }}
      onOpenChange={(open) => {
        if (!open) {
          setSearch("")
          onSearchChange?.("")
        }
      }}
    >
      <ComboboxPrimitive.InputGroup
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1 focus-within:ring-2 focus-within:ring-ring/25",
          disabled && "opacity-50",
          className
        )}
      >
        <ComboboxPrimitive.Chips className="flex flex-wrap items-center gap-1">
          <ComboboxPrimitive.Value>
            {(current: ComboboxOption[]) =>
              current.map((item) => (
                <ComboboxPrimitive.Chip
                  key={item.value}
                  className="flex max-w-full items-center gap-1 rounded-sm bg-muted py-0.5 pr-1 pl-1 text-xs"
                >
                  <UserAvatar
                    name={item.label}
                    avatarUrl={item.avatarUrl}
                    className="size-5"
                  />
                  <span className="max-w-40 truncate">{item.label}</span>
                  <ComboboxPrimitive.ChipRemove
                    aria-label={`Remove ${item.label}`}
                    className="flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <XIcon aria-hidden className="size-3" />
                  </ComboboxPrimitive.ChipRemove>
                </ComboboxPrimitive.Chip>
              ))
            }
          </ComboboxPrimitive.Value>
        </ComboboxPrimitive.Chips>
        <ComboboxPrimitive.Input
          id={id}
          placeholder={selected.length ? "" : placeholder}
          {...accessibility}
          className="h-8 min-w-24 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        {selected.length > 0 && (
          <ComboboxPrimitive.Clear
            aria-label="Clear selection"
            className="flex size-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <XIcon aria-hidden className="size-4" />
          </ComboboxPrimitive.Clear>
        )}
        <ComboboxPrimitive.Trigger
          aria-label="Show options"
          className="flex size-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <CaretDownIcon aria-hidden className="size-4" />
        </ComboboxPrimitive.Trigger>
      </ComboboxPrimitive.InputGroup>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={4} className="isolate z-50">
          <ComboboxPrimitive.Popup className="max-h-(--available-height) w-(--anchor-width) min-w-48 overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
            {loading && (
              <ComboboxPrimitive.Status className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </ComboboxPrimitive.Status>
            )}
            {error && (
              <div
                role="status"
                className="px-3 py-2 text-sm text-muted-foreground"
              >
                {error}
                {onRetry && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onRetry}
                  >
                    Try again
                  </Button>
                )}
              </div>
            )}
            {!loading && !error && (
              <ComboboxPrimitive.Empty className="px-3 py-3 text-sm text-muted-foreground">
                {emptyText}
              </ComboboxPrimitive.Empty>
            )}
            <ComboboxPrimitive.List>
              {(item: ComboboxOption) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  disabled={item.disabled}
                  className="relative flex cursor-default items-center gap-2 rounded-sm py-2 pr-3 pl-8 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50"
                >
                  <ComboboxPrimitive.ItemIndicator className="absolute left-2">
                    <CheckIcon aria-hidden className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                  <ComboboxItemLabel item={item} />
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}
