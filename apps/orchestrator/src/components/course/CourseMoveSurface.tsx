import type { ReactNode } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { DotsSixVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsSixVertical"
import { Button } from "@workspace/ui/components/button"
import type { LibraryItem } from "../../workspace/library/library"

export function CourseMoveSurface({
  item,
  enabled,
  owns,
  children,
}: {
  item: LibraryItem
  enabled: boolean
  owns: boolean
  children: ReactNode
}) {
  const canDrag =
    enabled && owns && !!item.canDelete && item.status !== "archived"
  const canDrop = enabled && owns && item.status === "draft"
  const drag = useDraggable({
    id: item.id,
    disabled: !canDrag,
    data: { title: item.title },
  })
  const drop = useDroppable({ id: item.id, disabled: !canDrop })
  return (
    <div
      ref={(node) => {
        drag.setNodeRef(node)
        drop.setNodeRef(node)
      }}
      className={`relative flex min-w-0 gap-2 rounded-lg ${drop.isOver ? "bg-primary/10 ring-2 ring-primary" : ""} ${drag.isDragging ? "opacity-50" : ""}`}
    >
      {canDrag && (
        <Button
          ref={drag.setActivatorNodeRef}
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Drag ${item.title} into another course`}
          className="mt-2 shrink-0 cursor-grab touch-none active:cursor-grabbing"
          {...drag.attributes}
          {...drag.listeners}
        >
          <DotsSixVerticalIcon aria-hidden />
        </Button>
      )}
      <div className="min-w-0 flex-1">{children}</div>
      {drop.isOver && (
        <span className="pointer-events-none absolute right-2 bottom-2 rounded bg-background px-2 py-1 text-xs text-primary">
          Drop to move as a module
        </span>
      )}
    </div>
  )
}
