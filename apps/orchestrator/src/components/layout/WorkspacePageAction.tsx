import { Link } from "@tanstack/react-router"
import type { CurrentUser } from "@workspace/data"
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus"
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple"
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus"
import { Button } from "@workspace/ui/components/button"
import type { WorkspaceView } from "../../workspace/navigation"
import {
  validateCoursesSearch,
  validateVideosSearch,
} from "../../workspace/library/library-search"

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
  if (
    (role === "admin" || role === "instructor") &&
    (view === "courses" || view === "videos")
  ) {
    const course = view === "courses",
      Icon = course ? PlusIcon : UploadSimpleIcon,
      label = course ? "Create course" : "Upload video"
    return (
      <Button
        render={
          course ? (
            <Link
              to="/workspace/courses"
              search={(previous) =>
                validateCoursesSearch({
                  ...previous,
                  modal: "create",
                  item: undefined,
                })
              }
            />
          ) : (
            <Link
              to="/workspace/videos"
              search={(previous) =>
                validateVideosSearch({
                  ...previous,
                  modal: "upload",
                  item: undefined,
                })
              }
            />
          )
        }
        className={className}
        aria-label={label}
        title={label}
      >
        <Icon aria-hidden />
        <span className={compact ? "hidden sm:inline" : undefined}>
          {label}
        </span>
      </Button>
    )
  }
  if (view === "enrollments" && role === "admin") {
    return (
      <Button
        render={<Link to="/workspace/enrollments" search={{ modal: "assign" }} />}
        className={className}
        aria-label="Assign course"
        title="Assign course"
      >
        <UserPlusIcon aria-hidden />
        <span className={compact ? "hidden sm:inline" : undefined}>
          Assign course
        </span>
      </Button>
    )
  }
  if ((view === "people" || view === "invitations") && role === "admin") {
    return (
      <Button
        render={
          <Link to="/workspace/invitations" search={{ modal: "create" }} />
        }
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
