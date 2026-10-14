import { useCallback, useMemo, useSyncExternalStore } from "react"
import {
  Link,
  useNavigate,
  useParams,
  useRouter,
  useSearch,
} from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Tabs } from "@base-ui/react/tabs"
import type { CurrentUser } from "@workspace/data"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft"
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise"
import { Button } from "@workspace/ui/components/button"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ErrorState } from "@workspace/ui/components/error-state"
import { useToast } from "@workspace/ui/components/toaster"
import { CourseLibraryDialog } from "../components/CourseLibraryDialog"
import { CourseGeneralPanel } from "../components/course/CourseGeneralPanel"
import { CourseSettingsPanel } from "../components/course/CourseSettingsPanel"
import { CourseModulesPanel } from "../components/course/CourseModulesPanel"
import { CourseContentDialog } from "../components/course/CourseContentDialog"
import { CourseQuestionsDialog } from "../components/course/CourseQuestionsDialog"
import {
  CourseVideosPanel,
  CourseVideoUploadDialog,
  CourseVideoPreviewDialog,
} from "../components/course/CourseVideosPanel"
import { CourseLearnersPanel } from "../components/course/CourseLearnersPanel"
import { CourseReviewsPanel } from "../components/course/CourseReviewsPanel"
import type { CourseWorkspace } from "../components/course/course-workspace"
import { courseManagementOptions } from "../workspace/course-management"
import {
  courseTabs,
  validateCourseSearch,
  courseListSearch,
  type CourseSearchState,
  type CoursePageAction,
} from "../workspace/course-search"

export function CoursePage() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  const { courseId } = useParams({ from: "/workspace/courses/$courseId" })
  if (!user) return null
  return (
    <CourseManager
      key={`${user.id}-${courseId}`}
      user={user}
      courseId={courseId}
    />
  )
}

function CourseManager({
  user,
  courseId,
}: {
  user: CurrentUser
  courseId: string
}) {
  const { dataClients, auth } = useRouter().options.context
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const navigate = useNavigate()
  const rawSearch = useSearch({ strict: false })
  const search = useMemo(() => validateCourseSearch(rawSearch), [rawSearch])
  const query = useQuery(courseManagementOptions(dataClients, user, courseId))
  const course = query.data?.course
  const update = useCallback(
    (patch: Partial<CourseSearchState>, replace = false) => {
      if (auth.getUser() !== user) return
      void navigate({
        to: "/workspace/courses/$courseId",
        params: { courseId },
        search: validateCourseSearch({ ...search, ...patch }),
        replace,
        resetScroll: false,
      })
    },
    [auth, user, navigate, courseId, search]
  )
  const open = (
    action: CoursePageAction,
    patch: Partial<CourseSearchState> = {}
  ) =>
    update({
      action,
      moduleId: undefined,
      lessonId: undefined,
      selection: undefined,
      ...patch,
    })
  const close = () =>
    update(
      {
        action: undefined,
        moduleId: undefined,
        lessonId: undefined,
        selection: undefined,
        modal: undefined,
        item: undefined,
      },
      true
    )
  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "workspace",
          dataClients.graphqlUrl,
          user.id,
          "course-management",
        ],
      }),
      queryClient.invalidateQueries({
        queryKey: [
          "workspace",
          dataClients.graphqlUrl,
          user.id,
          "library-table",
        ],
      }),
      queryClient.invalidateQueries({
        queryKey: [
          "workspace",
          dataClients.graphqlUrl,
          user.id,
          "course-details",
          courseId,
        ],
      }),
    ])
  }, [queryClient, dataClients.graphqlUrl, user.id, courseId])
  const tab = search.tab ?? "modules"
  const owns = !!course && (user.role === "admin" || course.ownerId === user.id)
  const workspace: CourseWorkspace | undefined = course
    ? {
        course,
        user,
        clients: dataClients,
        owns,
        editable: owns && course.status === "draft",
        search,
        update,
        open,
        close,
        refresh,
      }
    : undefined
  const lifecycle =
    search.action === "publish" ||
    search.action === "unpublish" ||
    search.action === "archive"
      ? search.action
      : undefined
  const contentAction =
    search.action &&
    [
      "add-module",
      "edit-module",
      "archive-module",
      "add-lesson",
      "view-lesson",
      "edit-lesson",
      "archive-lesson",
      "move-lesson",
    ].includes(search.action)
  return (
    <section
      aria-labelledby="page-heading"
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6"
    >
      <div className="mb-5">
        <Button
          variant="ghost"
          render={
            <Link to="/workspace/courses" search={courseListSearch(search)} />
          }
        >
          <ArrowLeftIcon aria-hidden />
          Back to courses
        </Button>
      </div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h1
            id="page-heading"
            tabIndex={-1}
            className="text-2xl font-semibold tracking-tight"
          >
            {course?.title ?? "Course management"}
          </h1>
          {course && (
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge
                tone={course.status === "published" ? "success" : "neutral"}
              >
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </StatusBadge>
              <span className="text-xs text-muted-foreground">
                {course.modules.length} modules ·{" "}
                {course.modules.reduce(
                  (total, module) => total + module.items.length,
                  0
                )}{" "}
                lessons
              </span>
              {!owns && (
                <span className="text-xs text-muted-foreground">
                  Read-only course
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh course"
          title="Refresh course"
          disabled={query.isFetching}
          onClick={() => void refresh()}
        >
          <ArrowClockwiseIcon aria-hidden />
        </Button>
      </header>
      {query.isPending ? (
        <div role="status" className="space-y-4">
          <span className="sr-only">Loading course management</span>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : query.isError || !workspace ? (
        <ErrorState
          title="We couldn't load this course"
          action={
            <Button
              variant="outline"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <Tabs.Root
            value={tab}
            onValueChange={(value) =>
              update({
                tab: value as CourseSearchState["tab"],
                courseQ: undefined,
                module: undefined,
                coursePage: undefined,
                coursePageSize: undefined,
                action: undefined,
                moduleId: undefined,
                lessonId: undefined,
                selection: undefined,
              })
            }
            className="min-w-0"
          >
            <Tabs.List
              aria-label="Course management"
              className="mb-6 flex w-full gap-6 overflow-x-auto border-b border-border"
            >
              {courseTabs.map((value) => (
                <Tabs.Tab
                  key={value}
                  value={value}
                  className="min-h-11 shrink-0 border-b-2 border-transparent px-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring data-active:border-primary data-active:text-primary"
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            <Tabs.Panel value="general">
              {tab === "general" && (
                <CourseGeneralPanel workspace={workspace} />
              )}
            </Tabs.Panel>
            <Tabs.Panel value="modules">
              {tab === "modules" && (
                <CourseModulesPanel workspace={workspace} />
              )}
            </Tabs.Panel>
            <Tabs.Panel value="videos">
              {tab === "videos" && <CourseVideosPanel workspace={workspace} />}
            </Tabs.Panel>
            <Tabs.Panel value="learners">
              {tab === "learners" && (
                <CourseLearnersPanel workspace={workspace} />
              )}
            </Tabs.Panel>
            <Tabs.Panel value="reviews">
              {tab === "reviews" && (
                <CourseReviewsPanel workspace={workspace} />
              )}
            </Tabs.Panel>
            <Tabs.Panel value="settings">
              {tab === "settings" && (
                <CourseSettingsPanel workspace={workspace} />
              )}
            </Tabs.Panel>
          </Tabs.Root>
          {contentAction && (
            <CourseContentDialog
              key={`${search.action}-${search.moduleId}-${search.lessonId}`}
              workspace={workspace}
            />
          )}
          {search.action === "questions" && (
            <CourseQuestionsDialog
              key={search.lessonId}
              workspace={workspace}
            />
          )}
          {search.action === "upload-video" && (
            <CourseVideoUploadDialog workspace={workspace} />
          )}
          {search.action === "video-preview" && (
            <CourseVideoPreviewDialog
              key={search.lessonId}
              workspace={workspace}
            />
          )}
          {lifecycle && (
            <CourseLibraryDialog
              modal={lifecycle}
              id={courseId}
              user={user}
              onClose={close}
              onChanged={(message) => {
                if (auth.getUser() === user)
                  toast({
                    title: "Course updated",
                    description: message,
                    status: "success",
                  })
                void refresh()
              }}
            />
          )}
        </>
      )}
    </section>
  )
}
