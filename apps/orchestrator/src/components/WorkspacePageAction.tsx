import { Link } from "@tanstack/react-router"
import type { CurrentUser } from "@workspace/data"
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus"
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple"
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus"
import { Button } from "@workspace/ui/components/button"
import type { WorkspaceView } from "../workspace/navigation"

export function WorkspacePageAction({
  view,
  role,
  compact = false,
}: {
  view: WorkspaceView | undefined
  role: CurrentUser["role"]
  compact?: boolean
}) {
  const className = compact ? "h-10 max-sm:size-11 max-sm:p-0" : undefined
  if (view === "people" && role === "admin") {
    return (
      <Button
        render={<Link to="/workspace/invitations" />}
        className={className}
        aria-label="Invite people"
        title="Invite people"
      >
        <UserPlusIcon aria-hidden />
        <span className={compact ? "hidden sm:inline" : undefined}>
          Invite people
        </span>
      </Button>
    )
  }
  const label =
    view === "courses"
      ? "Create course"
      : view === "videos"
        ? "Upload video"
        : view === "invitations" && role === "admin"
          ? "Invite people"
          : view === "enrollments" && role === "admin"
            ? "Assign course"
            : undefined
  if (!label) return null
  const Icon =
    view === "videos"
      ? UploadSimpleIcon
      : view === "invitations"
        ? UserPlusIcon
        : PlusIcon
  return (
    <Button
      type="button"
      disabled
      className={className}
      aria-label={label}
      title={`${label} is not implemented yet`}
    >
      <Icon aria-hidden />
      <span className={compact ? "hidden sm:inline" : undefined}>{label}</span>
    </Button>
  )
}
