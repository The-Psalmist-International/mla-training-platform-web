import type { ReactNode } from "react"
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree"
import { Button } from "./button"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu"

export type TableRowAction = {
  label: string
  ariaLabel?: string
  icon: ReactNode
  onSelect: () => void
  disabled?: boolean
  destructive?: boolean
}

export function TableRowActions({
  subject,
  primary = [],
  secondary = [],
}: {
  subject: string
  primary?: TableRowAction[]
  secondary?: TableRowAction[]
}) {
  if (!primary.length && !secondary.length) return null
  return (
    <div className="flex shrink-0 items-center justify-end gap-1 whitespace-nowrap">
      {primary.map((action) => (
        <Tooltip key={action.label}>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={
                  action.ariaLabel ?? `${action.label} for ${subject}`
                }
                disabled={action.disabled}
                onClick={action.onSelect}
              />
            }
          >
            {action.icon}
          </TooltipTrigger>
          <TooltipContent>{action.label}</TooltipContent>
        </Tooltip>
      ))}
      {!!secondary.length && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${subject}`}
              />
            }
          >
            <DotsThreeIcon aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 max-w-[calc(100vw-2rem)]"
          >
            {secondary.map((action) => (
              <DropdownMenuItem
                key={action.label}
                disabled={action.disabled}
                variant={action.destructive ? "destructive" : "default"}
                onClick={action.onSelect}
                className="whitespace-nowrap"
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
