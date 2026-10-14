import { useEffect, useSyncExternalStore, type CSSProperties } from "react"
import {
  Link,
  Navigate,
  Outlet,
  useRouter,
  useRouterState,
  useSearch,
} from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
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
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell"
import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { WorkspaceSidebar } from "./WorkspaceSidebar"
import { WorkspacePageAction } from "./WorkspacePageAction"
import { viewForPath, workspaceViews } from "../workspace/navigation"
import { courseManagementOptions } from "../workspace/course-management"
import {
  courseListSearch,
  validateCourseSearch,
} from "../workspace/course-search"

export function WorkspaceLayout() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const view = viewForPath(pathname)
  const page = view ? workspaceViews[view] : undefined
  const courseId = useRouterState({
    select: (state) =>
      state.matches.find(
        (match) => match.routeId === "/workspace/courses/$courseId"
      )?.params.courseId,
  })
  useEffect(() => {
    // Focus the new page title after client navigation, without moving focus during initial render.
    const frame = requestAnimationFrame(() =>
      document.getElementById("page-heading")?.focus({ preventScroll: true })
    )
    return () => cancelAnimationFrame(frame)
  }, [pathname])
  if (!user) return <Navigate to="/sign-in" replace />
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
        className="h-svh min-h-0 min-w-0 overflow-hidden border border-border/70 bg-card shadow-none outline-none md:h-[calc(100svh-1rem)] md:peer-data-[variant=inset]:shadow-none"
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
              {courseId ? (
                <CourseBreadcrumb courseId={courseId} user={user} />
              ) : (
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbPage className="truncate text-sm font-medium">
                    {page?.title ?? "Workspace"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    render={<Link to="/workspace/notifications" />}
                    variant="ghost"
                    size="icon"
                    className="size-11 text-muted-foreground"
                    aria-label="Notifications"
                    aria-current={view === "notifications" ? "page" : undefined}
                  >
                    <BellIcon aria-hidden />
                  </Button>
                }
              />
              <TooltipContent side="bottom" sideOffset={8}>
                Notifications
              </TooltipContent>
            </Tooltip>
            <WorkspacePageAction view={view} role={user.role} compact />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}

function CourseBreadcrumb({
  courseId,
  user,
}: {
  courseId: string
  user: CurrentUser
}) {
  const { dataClients } = useRouter().options.context
  const search = useSearch({ strict: false })
  const course = useQuery(courseManagementOptions(dataClients, user, courseId))
  return (
    <>
      <BreadcrumbItem className="shrink-0">
        <BreadcrumbLink
          render={
            <Link
              to="/workspace/courses"
              search={courseListSearch(validateCourseSearch(search))}
            />
          }
        >
          Courses
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem className="min-w-0">
        <BreadcrumbPage className="truncate text-sm font-medium">
          {course.data?.course.title ?? "Course"}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </>
  )
}
