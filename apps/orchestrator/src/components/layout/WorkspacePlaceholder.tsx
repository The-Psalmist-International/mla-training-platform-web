import { EmptyState } from "@workspace/ui/components/empty-state"
import { workspaceViews, type WorkspaceView } from "../../workspace/navigation"
import { workspaceIcons } from "../../workspace/icons"
import { WorkspacePageFrame } from "./WorkspacePageFrame"

const emptyTitles = {
  overview: "Your workspace is ready",
  analytics: "Analytics are coming next",
  notifications: "No notifications yet",
  courses: "No courses yet",
  videos: "No videos yet",
  enrollments: "No enrollments yet",
  assessments: "No assessment reviews yet",
  submissions: "No video submissions yet",
  people: "No people yet",
  invitations: "No invitations yet",
  certificates: "No certificates yet",
  delivery: "No email delivery outcomes yet",
} satisfies Record<Exclude<WorkspaceView, "account">, string>

export function WorkspacePlaceholder({ view }: { view: WorkspaceView }) {
  const page = workspaceViews[view]
  const description =
    view === "overview"
      ? "Choose a section from the sidebar to get started."
      : view === "notifications"
        ? undefined
        : page.scope

  return (
    <WorkspacePageFrame view={view}>
      <div className="flex min-h-0 flex-1 items-center justify-center py-12">
        {view === "account" ? (
          <div className="max-w-sm text-center">
            <h2 className="text-sm font-medium">{page.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {page.description}
            </p>
          </div>
        ) : (
          <EmptyState
            icon={workspaceIcons[view]}
            title={emptyTitles[view]}
            description={description}
          />
        )}
      </div>
    </WorkspacePageFrame>
  )
}
