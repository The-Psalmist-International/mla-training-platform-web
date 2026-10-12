import { useEffect, useSyncExternalStore, type CSSProperties } from "react"
import { Link, Outlet, useRouter, useRouterState } from "@tanstack/react-router"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { ThemeToggle } from "@workspace/ui/components/theme-toggle"
import { WorkspaceSidebar } from "./WorkspaceSidebar"
import { viewForPath, workspaceViews } from "../workspace/navigation"

export function WorkspaceLayout() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const view = viewForPath(pathname)
  const page = view ? workspaceViews[view] : undefined
  useEffect(() => {
    // Focus the new page title after client navigation, without moving focus during initial render.
    const frame = requestAnimationFrame(() =>
      document.getElementById("page-heading")?.focus({ preventScroll: true })
    )
    return () => cancelAnimationFrame(frame)
  }, [pathname])
  if (!user) return null
  return (
    <SidebarProvider
      className="workspace-shell"
      style={
        {
          "--sidebar-width": "17rem",
          "--sidebar-width-icon": "3.5rem",
        } as CSSProperties
      }
    >
      <a
        href="#workspace-content"
        className="sr-only fixed top-4 left-4 z-50 rounded-md bg-background p-3 text-sm focus:not-sr-only"
      >
        Skip to content
      </a>
      <WorkspaceSidebar user={user} />
      <SidebarInset
        id="workspace-content"
        tabIndex={-1}
        className="min-w-0 border border-border/70 bg-card shadow-none outline-none md:min-h-[calc(100svh-1rem)] md:peer-data-[variant=inset]:shadow-none"
      >
        <header className="flex h-16 shrink-0 items-center gap-3 px-4 sm:px-6">
          <SidebarTrigger className="size-11 shrink-0 text-muted-foreground" />
          <Separator
            orientation="vertical"
            className="h-4 data-vertical:self-center"
          />
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="hidden sm:inline-flex">
                <BreadcrumbLink render={<Link to="/workspace" />}>
                  Workspace
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:inline-flex" />
              {page && page.group !== "Workspace" && (
                <>
                  <BreadcrumbItem className="hidden md:inline-flex">
                    {page.group}
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:inline-flex" />
                </>
              )}
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate text-sm font-medium">
                  {page?.title ?? "Workspace"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
