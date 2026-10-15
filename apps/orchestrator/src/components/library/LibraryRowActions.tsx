import type { CurrentUser } from "@workspace/data"
import { ArrowsOutIcon } from "@phosphor-icons/react/dist/csr/ArrowsOut"
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye"
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple"
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus"
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt"
import { ArrowUUpLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowUUpLeft"
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive"
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play"
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple"
import {
  TableRowActions,
  type TableRowAction,
} from "@workspace/ui/components/table-row-actions"
import type { LibraryItem } from "../../workspace/library/library"
import type {
  LibraryView,
  LibrarySearchState,
} from "../../workspace/library/library-search"

export function LibraryRowActions({
  item,
  view,
  user,
  onSelect,
  onExpand,
}: {
  item: LibraryItem
  view: LibraryView
  user: CurrentUser
  onExpand?: () => void
  onSelect: (
    modal: NonNullable<LibrarySearchState["modal"]>,
    id: string
  ) => void
}) {
  const owns = user.role === "admin" || item.ownerId === user.id
  const primary: TableRowAction[] = [
    {
      label: "View details",
      icon: <EyeIcon aria-hidden />,
      onSelect: () => onSelect("details", item.id),
    },
  ]
  const secondary: TableRowAction[] = []
  if (view === "courses") {
    if (owns && item.status === "draft") {
      primary.push({
        label: "Edit course",
        icon: <PencilSimpleIcon aria-hidden />,
        onSelect: () => onSelect("edit", item.id),
      })
      secondary.push(
        {
          label: "Add section",
          icon: <PlusIcon aria-hidden />,
          onSelect: () => onSelect("details", item.id),
        },
        {
          label: "Publish course",
          icon: <PaperPlaneTiltIcon aria-hidden />,
          onSelect: () => onSelect("publish", item.id),
        }
      )
    }
    if (onExpand)
      primary.push({
        label: "Expand course",
        icon: <ArrowsOutIcon aria-hidden />,
        onSelect: onExpand,
      })
    if (owns && item.status === "published")
      secondary.push({
        label: "Return to draft",
        icon: <ArrowUUpLeftIcon aria-hidden />,
        onSelect: () => onSelect("unpublish", item.id),
      })
    if (owns && item.status !== "archived")
      secondary.push({
        label: "Archive course",
        icon: <ArchiveIcon aria-hidden />,
        onSelect: () => onSelect("archive", item.id),
        destructive: true,
      })
  } else {
    if (item.status === "ready")
      secondary.push({
        label: "Preview video",
        icon: <PlayIcon aria-hidden />,
        onSelect: () => onSelect("preview", item.id),
      })
    if (item.status === "pending_upload")
      secondary.push({
        label: "Resume upload",
        icon: <UploadSimpleIcon aria-hidden />,
        onSelect: () => onSelect("resume", item.id),
      })
  }
  return (
    <TableRowActions
      subject={item.title}
      primary={primary}
      secondary={secondary}
    />
  )
}
