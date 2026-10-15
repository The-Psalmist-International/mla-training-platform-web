import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
  COURSE_DETAILS_QUERY,
  CourseAssessmentReviewsDocument,
  CourseVideoReviewsDocument,
  type CourseAssessmentReviewsQuery,
  type CourseVideoReviewsQuery,
  type CurrentUser,
} from "@workspace/data"
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye"
import { Button } from "@workspace/ui/components/button"
import { Combobox } from "@workspace/ui/components/combobox"
import {
  DataTable,
  type DataTableColumn,
} from "@workspace/ui/components/data-table"
import { TableRowActions } from "@workspace/ui/components/table-row-actions"
import { UserAvatar } from "@workspace/ui/components/user-avatar"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { ErrorState } from "@workspace/ui/components/error-state"
import { workspaceCoursesOptions } from "../../workspace/lists"
import {
  courseResourceOptions,
  type ManagedCourse,
} from "../../workspace/course/course-management"
import type { CourseSearchState } from "../../workspace/course/course-search"
import type { CourseWorkspace } from "../course/course-workspace"
import { CourseReviewDialog } from "../course/CourseReviewsPanel"
import { formatPeopleCreatedAt } from "../../workspace/people/people"
import {
  reviewDialogSearch,
  validateReviewsSearch,
  type ReviewsSearchState,
  type ReviewQueueType,
} from "../../workspace/reviews/reviews-search"
import { workspaceIcons } from "../../workspace/icons"
import type { WorkspaceView } from "../../workspace/navigation"
import { WorkspacePageFrame } from "../layout/WorkspacePageFrame"

export type AssessmentReviewRow =
  CourseAssessmentReviewsQuery["assessmentReviewQueuePage"]["items"][number]
export type VideoReviewRow =
  CourseVideoReviewsQuery["videoSubmissionReviewQueuePage"]["items"][number]
export type ReviewRow = AssessmentReviewRow | VideoReviewRow

export function reviewTableColumns(
  queue: ReviewQueueType,
  onReview: (row: ReviewRow) => void
): DataTableColumn<ReviewRow>[] {
  const video = queue === "video"
  return [
    {
      id: "learner",
      header: "Learner",
      className: "min-w-56",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            name={row.learnerName}
            avatarUrl={row.learnerAvatarUrl}
          />
          <p className="min-w-0 font-medium break-words">{row.learnerName}</p>
        </div>
      ),
    },
    {
      id: "lesson",
      header: video ? "Prompt" : "Assessment",
      className: "min-w-48",
      cell: (row) =>
        video
          ? (row as VideoReviewRow).promptTitle
          : (row as AssessmentReviewRow).assessmentTitle,
    },
    {
      id: "attempt",
      header: "Attempt",
      className: "whitespace-nowrap tabular-nums",
      cell: (row) => `Attempt ${row.attemptNumber}`,
    },
    {
      id: "submitted",
      header: "Submitted",
      className: "whitespace-nowrap tabular-nums",
      cell: (row) =>
        formatPeopleCreatedAt(
          video
            ? (row as VideoReviewRow).createdAt
            : (row as AssessmentReviewRow).submittedAt
        ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge tone="neutral">
          {row.status.replaceAll("_", " ")}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "w-20 text-right",
      cell: (row) => (
        <TableRowActions
          subject={row.learnerName}
          primary={[
            {
              label: video
                ? "Review video submission"
                : "Grade assessment answers",
              icon: <EyeIcon aria-hidden />,
              onSelect: () => onReview(row),
            },
          ]}
        />
      ),
    },
  ]
}

export function ReviewsCollectionPage({ queue }: { queue: ReviewQueueType }) {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  return user ? (
    <ReviewsTable key={`${user.id}-${queue}`} user={user} queue={queue} />
  ) : null
}

function ReviewsTable({
  user,
  queue,
}: {
  user: CurrentUser
  queue: ReviewQueueType
}) {
  const video = queue === "video"
  const view: WorkspaceView = video ? "submissions" : "assessments"
  const { dataClients } = useRouter().options.context
  const navigate = useNavigate()
  const id = useId()
  const state = validateReviewsSearch(useSearch({ strict: false }))
  const [search, setSearch] = useState(state.q ?? "")
  const [selection, setSelection] = useState<{
    id: string
    video: boolean
  } | null>(null)
  const update = useCallback(
    (patch: Partial<ReviewsSearchState>, replace = false) => {
      void navigate({
        to: ".",
        search: (previous) =>
          validateReviewsSearch({ ...previous, ...patch }),
        resetScroll: false,
        replace,
      })
    },
    [navigate]
  )
  useEffect(() => setSearch(state.q ?? ""), [state.q])
  useEffect(() => {
    if (search.trim() === (state.q ?? "")) return
    const timeout = setTimeout(
      () => update({ q: search.trim(), page: undefined }, true),
      300
    )
    return () => clearTimeout(timeout)
  }, [search, state.q, update])
  const coursesQuery = useInfiniteQuery(
    workspaceCoursesOptions(dataClients, user)
  )
  const loadedCourses = coursesQuery.data?.pages.flat() ?? []
  const courseId = state.course ?? loadedCourses.at(0)?.id ?? ""
  const needsSelectedCourse =
    !!state.course &&
    !loadedCourses.some((course) => course.id === state.course)
  const selectedQuery = useQuery({
    ...courseResourceOptions(
      dataClients,
      user,
      "review-course",
      COURSE_DETAILS_QUERY,
      { id: state.course ?? "" }
    ),
    enabled: coursesQuery.isSuccess && needsSelectedCourse,
  })
  const courses =
    needsSelectedCourse && selectedQuery.data
      ? [selectedQuery.data.course, ...loadedCourses]
      : loadedCourses
  const course = courses.find((item) => item.id === courseId)
  const pageSize = state.pageSize ?? 20
  const pageIndex = (state.page ?? 1) - 1
  const assessmentsQuery = useQuery({
    ...courseResourceOptions(
      dataClients,
      user,
      "assessment-reviews-table",
      CourseAssessmentReviewsDocument,
      {
        courseId,
        limit: pageSize,
        offset: pageIndex * pageSize,
        search: state.q,
      }
    ),
    enabled: coursesQuery.isSuccess && !!courseId && !video,
  })
  const submissionsQuery = useQuery({
    ...courseResourceOptions(
      dataClients,
      user,
      "video-reviews-table",
      CourseVideoReviewsDocument,
      {
        courseId,
        limit: pageSize,
        offset: pageIndex * pageSize,
        search: state.q,
      }
    ),
    enabled: coursesQuery.isSuccess && !!courseId && video,
  })
  const query = video ? submissionsQuery : assessmentsQuery
  const page = video
    ? submissionsQuery.data?.videoSubmissionReviewQueuePage
    : assessmentsQuery.data?.assessmentReviewQueuePage
  const total = page?.totalCount ?? 0
  useEffect(() => {
    if (!query.data) return
    const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1)
    if (pageIndex > lastPage) update({ page: lastPage + 1 }, true)
  }, [query.data, total, pageSize, pageIndex, update])
  const error =
    coursesQuery.isError ||
    (needsSelectedCourse && selectedQuery.isError) ||
    query.isError
  const loading =
    coursesQuery.isPending ||
    (needsSelectedCourse && selectedQuery.isPending) ||
    (!!courseId && query.isPending)
  const refresh = () => {
    if (coursesQuery.isError || !courseId) void coursesQuery.refetch()
    else if (needsSelectedCourse && selectedQuery.isError)
      void selectedQuery.refetch()
    else void query.refetch()
  }
  const onReview = (row: ReviewRow) =>
    setSelection({ id: row.id, video })
  const owns = user.role === "admin" || course?.ownerId === user.id
  const dialogSearch: CourseSearchState = useMemo(
    () =>
      selection
        ? reviewDialogSearch(queue, selection.id)
        : { tab: "reviews" as const },
    [queue, selection]
  )
  const reviewWorkspace: CourseWorkspace = useMemo(
    () => ({
      // The grading dialog only reads clients/user/search/owns plus
      // refresh/close; the course record itself is unused.
      course: { id: courseId } as ManagedCourse,
      user,
      clients: dataClients,
      owns: !!owns,
      editable: false,
      search: dialogSearch,
      update: (patch) => {
        if (patch.action === undefined && patch.selection === undefined)
          setSelection(null)
      },
      open: () => {},
      close: () => setSelection(null),
      refresh: async () => {
        await query.refetch()
      },
    }),
    [courseId, user, dataClients, owns, dialogSearch, query.refetch]
  )
  const dialogAvailable =
    !!selection &&
    (page?.items.some((row) => row.id === selection.id) ?? false)
  return (
    <WorkspacePageFrame view={view}>
      {selection && (
        <CourseReviewDialog
          key={selection.id}
          workspace={reviewWorkspace}
          available={dialogAvailable}
          video={selection.video}
        />
      )}
      <DataTable
        rows={page?.items ?? []}
        columns={reviewTableColumns(queue, onReview)}
        getRowId={(row) => row.id}
        ariaLabel={video ? "Video submissions" : "Assessment reviews"}
        search={{
          value: search,
          onChange: (value) => setSearch(value.slice(0, 200)),
          placeholder: "Search learners or lesson titles",
          label: video ? "Search video submissions" : "Search assessment reviews",
        }}
        filters={
          <>
            <label htmlFor={id} className="sr-only">
              Course
            </label>
            <Combobox
              id={id}
              value={courseId}
              selectedLabel={course?.title ?? "Selected course"}
              onValueChange={(value) => {
                if (value) update({ course: value, page: undefined })
              }}
              options={courses.map((item) => ({
                value: item.id,
                label: item.title,
              }))}
              placeholder="Select a course"
              loading={
                coursesQuery.isFetching ||
                (needsSelectedCourse && selectedQuery.isFetching)
              }
              disabled={coursesQuery.isPending}
              className="w-full sm:w-64"
            />
            {coursesQuery.hasNextPage && (
              <Button
                variant="outline"
                disabled={coursesQuery.isFetchingNextPage}
                onClick={() => void coursesQuery.fetchNextPage()}
              >
                {coursesQuery.isFetchingNextPage
                  ? "Loading courses…"
                  : "Load more courses"}
              </Button>
            )}
          </>
        }
        onRefresh={refresh}
        pagination={{
          pageIndex,
          pageSize,
          totalCount: total,
          onPageChange: (index) => update({ page: index + 1 }),
          onPageSizeChange: (size) =>
            update({ pageSize: size, page: undefined }),
        }}
        isLoading={loading}
        isFetching={query.isFetching || search.trim() !== (state.q ?? "")}
        errorState={
          error ? (
            <ErrorState
              title={
                video
                  ? "Video submissions could not be loaded"
                  : "Assessment reviews could not be loaded"
              }
              action={
                <Button variant="outline" onClick={refresh}>
                  Try again
                </Button>
              }
            />
          ) : undefined
        }
        emptyState={
          <EmptyState
            icon={workspaceIcons[view]}
            title={
              !courseId
                ? "No courses available"
                : state.q
                  ? video
                    ? "No matching submissions"
                    : "No matching reviews"
                  : video
                    ? "No video submissions to review"
                    : "No assessments to review"
            }
            description={
              !courseId
                ? "Create a course before reviewing learner work."
                : state.q
                  ? "Try another learner name or lesson title, or clear your search."
                  : video
                    ? "Learner videos awaiting feedback will appear here."
                    : "Submitted answers that need grading will appear here."
            }
            action={
              state.q ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("")
                    update({ q: undefined, page: undefined })
                  }}
                >
                  Clear search
                </Button>
              ) : undefined
            }
          />
        }
      />
    </WorkspacePageFrame>
  )
}
