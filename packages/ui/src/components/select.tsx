"use client"

import type { ReactNode } from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown"
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check"
import { cn } from "@workspace/ui/lib/utils"

export interface SelectOption<TValue extends string | number> {
  value: TValue
  label: ReactNode
  disabled?: boolean
}

export interface SelectInputProps<TValue extends string | number> {
  options: readonly SelectOption<TValue>[]
  value: TValue
  onValueChange: (value: TValue) => void
  id?: string
  name?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
}

export function SelectInput<TValue extends string | number>({
  options,
  value,
  onValueChange,
  id,
  name,
  disabled,
  required,
  placeholder,
  className,
  ...accessibilityProps
}: SelectInputProps<TValue>) {
  return (
    <SelectPrimitive.Root<TValue>
      value={value}
      onValueChange={(next) => {
        if (next !== null) onValueChange(next)
      }}
      items={options}
      name={name}
      disabled={disabled}
      required={required}
      modal={false}
    >
      <SelectPrimitive.Trigger
        id={id}
        data-slot="select-trigger"
        className={cn(
          "flex h-10 min-w-0 items-center justify-between gap-3 rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
          className
        )}
        {...accessibilityProps}
      >
        <SelectPrimitive.Value placeholder={placeholder} className="truncate" />
        <SelectPrimitive.Icon className="shrink-0 text-muted-foreground">
          <CaretDownIcon aria-hidden className="size-3.5" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          alignItemWithTrigger={false}
          align="start"
          sideOffset={6}
          className="z-50 outline-none"
        >
          <SelectPrimitive.Popup
            data-slot="select-content"
            className="min-w-(--anchor-width) rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none"
          >
            <SelectPrimitive.List className="max-h-[min(20rem,var(--available-height))] overflow-y-auto">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="relative flex min-h-9 cursor-default items-center rounded-sm py-2 pr-8 pl-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center justify-center">
                    <CheckIcon aria-hidden className="size-3.5" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
