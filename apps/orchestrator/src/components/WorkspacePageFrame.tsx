import type { ReactNode } from "react"
import { workspaceViews, type WorkspaceView } from "../workspace/navigation"

export type WorkspacePageFrameProps = {
  view: WorkspaceView
  children: ReactNode
  toolbar?: ReactNode
}

export function WorkspacePageFrame({
  view,
  children,
  toolbar,
}: WorkspacePageFrameProps) {
  return (
    <section
      aria-labelledby="page-heading"
      className="flex min-h-0 min-w-0 flex-1 flex-col px-4 py-6 sm:px-6"
    >
      <h1 id="page-heading" tabIndex={-1} className="sr-only">
        {workspaceViews[view].title}
      </h1>
      {toolbar != null && <div className="mb-6 shrink-0">{toolbar}</div>}
      {children}
    </section>
  )
}
