import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "@workspace/ui/lib/utils"

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverTitle = PopoverPrimitive.Title
function PopoverContent({
  className,
  children,
  align = "end",
  sideOffset = 12,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "sideOffset">) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        sideOffset={sideOffset}
        collisionPadding={18}
        className="z-50"
      >
        <PopoverPrimitive.Popup
          {...props}
          className={cn(
            "flex max-h-(--available-height) w-[min(448px,calc(100vw-36px))] origin-(--transform-origin) flex-col overflow-hidden rounded-[20px] bg-popover text-popover-foreground ring-1 ring-border/70 transition-[opacity,transform] duration-150 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transform-none motion-reduce:transition-none",
            className
          )}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}
export { Popover, PopoverTrigger, PopoverTitle, PopoverContent }
