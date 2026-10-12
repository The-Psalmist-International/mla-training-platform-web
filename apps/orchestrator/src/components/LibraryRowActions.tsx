import type { CurrentUser } from "@workspace/data"
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu"
import type { LibraryItem } from "../workspace/library"
import type {
  LibraryView,
  LibrarySearchState,
} from "../workspace/library-search"

export function LibraryRowActions({
  item,
  view,
  user,
  onSelect,
}: {
  item: LibraryItem
  view: LibraryView
  user: CurrentUser
  onSelect: (
    modal: NonNullable<LibrarySearchState["modal"]>,
    id: string
  ) => void
}) {
  const owns = user.role === "admin" || item.ownerId === user.id
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${item.title}`}
          />
        }
      >
        <DotsThreeIcon aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSelect("details", item.id)}>
          View details
        </DropdownMenuItem>
        {view === "courses" ? (
          <>
            {owns && item.status === "draft" && (
              <>
                <DropdownMenuItem onClick={() => onSelect("edit", item.id)}>
                  Edit course
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelect("publish", item.id)}>
                  Publish course
                </DropdownMenuItem>
              </>
            )}
            {owns && item.status === "published" && (
              <DropdownMenuItem onClick={() => onSelect("unpublish", item.id)}>
                Return to draft
              </DropdownMenuItem>
            )}
            {owns && item.status !== "archived" && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onSelect("archive", item.id)}
              >
                Archive course
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <>
            {item.status === "ready" && (
              <DropdownMenuItem onClick={() => onSelect("preview", item.id)}>
                Preview video
              </DropdownMenuItem>
            )}
            {item.status === "pending_upload" && (
              <DropdownMenuItem onClick={() => onSelect("resume", item.id)}>
                Resume upload
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
