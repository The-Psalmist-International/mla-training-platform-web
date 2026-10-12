import { workspaceViews, type WorkspaceView } from "../workspace/navigation"

export function WorkspacePlaceholder({ view }: { view: WorkspaceView }) {
  const page = workspaceViews[view]
  return (
    <section aria-labelledby="page-heading" className="p-6 sm:p-8">
      <h1
        id="page-heading"
        tabIndex={-1}
        className="text-2xl font-semibold tracking-tight outline-none"
      >
        {page.title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {page.description}
      </p>
      <div className="mt-10 max-w-2xl border-t border-border/60 pt-5">
        <p className="text-sm font-medium">Workspace preview</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {page.scope}
        </p>
      </div>
    </section>
  )
}
