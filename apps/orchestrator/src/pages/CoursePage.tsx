import { useSyncExternalStore } from "react"
import {
  Link,
  useNavigate,
  useParams,
  useRouter,
  useSearch,
} from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft"
import { Button } from "@workspace/ui/components/button"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ErrorState } from "@workspace/ui/components/error-state"
import { useToast } from "@workspace/ui/components/toaster"
import { CourseThumbnail } from "../components/CourseThumbnail"
import { CourseLibraryDialog } from "../components/CourseLibraryDialog"
import { LibraryRowActions } from "../components/LibraryRowActions"
import { courseDetailsOptions } from "../workspace/library-actions"
import {
  validateCoursesSearch,
  type LibrarySearchState,
} from "../workspace/library-search"

export function CoursePage() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  const { courseId } = useParams({ from: "/workspace/courses/$courseId" })
  if (!user) return null
  return (
    <CourseDetails
      key={`${user.id}-${courseId}`}
      user={user}
      courseId={courseId}
    />
  )
}

function CourseDetails({
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
  const search = validateCoursesSearch(useSearch({ strict: false }))
  const listSearch = { ...search, modal: undefined, item: undefined }
  const query = useQuery(courseDetailsOptions(dataClients, user, courseId))
  const course = query.data
  const openAction = (modal: NonNullable<LibrarySearchState["modal"]>) => {
    void navigate({
      to: ".",
      search: { ...search, modal, item: courseId },
      resetScroll: false,
    })
  }
  const closeAction = () => {
    if (auth.getUser() === user)
      void navigate({
        to: ".",
        search: listSearch,
        replace: true,
        resetScroll: false,
      })
  }
  const changed = (message: string) => {
    if (auth.getUser() !== user) return
    toast({ title: "Course updated", description: message, status: "success" })
    void queryClient.invalidateQueries({
      queryKey: [
        "workspace",
        dataClients.graphqlUrl,
        user.id,
        "course-details",
        courseId,
      ],
    })
    void queryClient.invalidateQueries({
      queryKey: ["workspace", dataClients.graphqlUrl, user.id, "library-table"],
    })
  }
  const modal = search.modal
  return (
    <section
      aria-labelledby="page-heading"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6"
    >
      <div className="mb-6">
        <Button
          variant="ghost"
          render={<Link to="/workspace/courses" search={listSearch} />}
        >
          <ArrowLeftIcon aria-hidden />
          Back to courses
        </Button>
      </div>
      {query.isPending ? (
        <div role="status" className="space-y-4">
          <span className="sr-only">Loading course</span>
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : query.isError || !course ? (
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
        <div className="space-y-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-3">
              <h1
                id="page-heading"
                tabIndex={-1}
                className="text-2xl font-semibold tracking-tight"
              >
                {course.title}
              </h1>
              <div className="flex items-center gap-3">
                <StatusBadge
                  tone={course.status === "published" ? "success" : "neutral"}
                >
                  {course.status.charAt(0).toUpperCase() +
                    course.status.slice(1)}
                </StatusBadge>
                <span className="text-sm text-muted-foreground">
                  {course.certificateEnabled
                    ? "Certificate enabled"
                    : "Certificate not enabled"}
                </span>
              </div>
            </div>
            <LibraryRowActions
              item={course}
              view="courses"
              user={user}
              onSelect={openAction}
            />
          </header>
          <div
            className={
              course.thumbnailUrl
                ? "grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
                : "max-w-3xl"
            }
          >
            {course.thumbnailUrl && (
              <CourseThumbnail
                title={course.title}
                thumbnailUrl={course.thumbnailUrl}
                showPlaceholder={false}
              />
            )}
            <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
              {course.description || "No course description yet."}
            </p>
          </div>
          <section aria-labelledby="course-sections" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="course-sections" className="text-lg font-semibold">
                Sections and lessons
              </h2>
              <span className="text-sm text-muted-foreground">
                {course.modules.length} sections
              </span>
            </div>
            {course.modules.length ? (
              <ol className="space-y-4">
                {course.modules.map((module, index) => (
                  <li
                    key={module.id}
                    className="overflow-hidden rounded-lg border border-border"
                  >
                    <h3 className="bg-muted/40 px-4 py-3 font-medium">
                      {index + 1}. {module.title}
                    </h3>
                    {module.items.length ? (
                      <ol className="divide-y divide-border">
                        {module.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                          >
                            <span className="font-medium">{item.title}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {item.type.replaceAll("_", " ")}
                              {item.required ? " · Required" : ""}
                            </span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="px-4 py-4 text-sm text-muted-foreground">
                        No lessons yet.
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                No sections have been added yet.
              </p>
            )}
          </section>
        </div>
      )}
      {course &&
        search.item === courseId &&
        (modal === "details" ||
          modal === "edit" ||
          modal === "publish" ||
          modal === "unpublish" ||
          modal === "archive") && (
          <CourseLibraryDialog
            modal={modal}
            id={courseId}
            user={user}
            onClose={closeAction}
            onChanged={changed}
          />
        )}
    </section>
  )
}
