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
  CourseLearnersDocument,
  CourseManagementDocument,
  type CourseLearnersQuery,
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
import { courseResourceOptions } from "../../workspace/course/course-management"
import type { CourseSearchState } from "../../workspace/course/course-search"
import type { CourseWorkspace } from "../course/course-workspace"
import { CourseLearnerDialog } from "../course/CourseLearnersPanel"
import { formatPeopleCreatedAt } from "../../workspace/people/people"
import {
  validateEnrollmentsSearch,
  type EnrollmentsSearchState,
} from "../../workspace/enrollments/enrollments-search"
import { workspaceIcons } from "../../workspace/icons"
import { WorkspacePageFrame } from "../layout/WorkspacePageFrame"
import { WorkspacePageAction } from "../layout/WorkspacePageAction"
import { EnrollmentAssignDialog } from "./EnrollmentAssignDialog"

export type EnrollmentRow =
  CourseLearnersQuery["courseEnrollmentsPage"]["items"][number]

export function enrollmentTableColumns(
  courseTitle: string,
  onProgress: (row: EnrollmentRow) => void
): DataTableColumn<EnrollmentRow>[] {
  return [
    {
      id: "learner",
      header: "Learner",
      className: "min-w-56",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            name={row.learnerName}
            email={row.learnerEmail ?? undefined}
            avatarUrl={row.learnerAvatarUrl}
          />
          <div className="min-w-0">
            <p className="font-medium">{row.learnerName}</p>
            {row.learnerEmail && (
              <p className="mt-1 text-xs text-muted-foreground">
                {row.learnerEmail}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "course",
      header: "Course",
      className: "min-w-48",
      cell: () => courseTitle,
    },
    {
      id: "enrolled",
      header: "Enrolled on",
      className: "whitespace-nowrap tabular-nums",
      cell: (row) => formatPeopleCreatedAt(row.createdAt),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge tone={row.completedAt ? "success" : "neutral"}>
          {row.completedAt ? "Completed" : "Enrolled"}
        </StatusBadge>
      ),
    },
    {
      id: "completed",
      header: "Completed on",
      className: "whitespace-nowrap tabular-nums",
      cell: (row) =>
        row.completedAt
          ? formatPeopleCreatedAt(row.completedAt)
          : "Not completed",
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
              label: "View learner progress",
              icon: <EyeIcon aria-hidden />,
              onSelect: () => onProgress(row),
            },
          ]}
        />
      ),
    },
  ]
}

export function EnrollmentCollectionPage() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  return user ? <EnrollmentTable key={user.id} user={user} /> : null
}

function EnrollmentTable({ user }: { user: CurrentUser }) {
  const { dataClients } = useRouter().options.context
  const navigate = useNavigate()
  const id = useId()
  const state = validateEnrollmentsSearch(useSearch({ strict: false }))
  const [search, setSearch] = useState(state.q ?? "")
  const update = useCallback(
    (patch: Partial<EnrollmentsSearchState>, replace = false) => {
      void navigate({
        to: ".",
        search: (previous) =>
          validateEnrollmentsSearch({ ...previous, ...patch }),
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
      "enrollment-course",
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
  const query = useQuery({
    ...courseResourceOptions(
      dataClients,
      user,
      "enrollments-table",
      CourseLearnersDocument,
      {
        courseId,
        limit: pageSize,
        offset: pageIndex * pageSize,
        search: state.q,
      }
    ),
    enabled: coursesQuery.isSuccess && !!courseId,
  })
  const total = query.data?.courseEnrollmentsPage.totalCount ?? 0
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
  const [selection, setSelection] = useState<string | null>(null)
  const onProgress = (row: EnrollmentRow) => setSelection(row.id)
  const detailsQuery = useQuery({
    ...courseResourceOptions(
      dataClients,
      user,
      "enrollment-dialog-course",
      CourseManagementDocument,
      { id: courseId }
    ),
    enabled: !!selection && !!courseId,
  })
  const detailsCourse = detailsQuery.data?.course
  const ownsDialog =
    user.role === "admin" || detailsCourse?.ownerId === user.id
  const dialogSearch: CourseSearchState = useMemo(
    () =>
      selection
        ? { action: "learner" as const, selection }
        : {},
    [selection]
  )
  const learnerWorkspace: CourseWorkspace | null = useMemo(
    () =>
      detailsCourse
        ? {
            course: detailsCourse,
            user,
            clients: dataClients,
            owns: !!ownsDialog,
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
          }
        : null,
    [detailsCourse, user, dataClients, ownsDialog, dialogSearch, query.refetch]
  )
  const selectedRow = query.data?.courseEnrollmentsPage.items.find(
    (row) => row.id === selection
  )
  return (
    <WorkspacePageFrame view="enrollments">
      {selection && learnerWorkspace && (
        <CourseLearnerDialog
          key={selection}
          workspace={learnerWorkspace}
          available={!!selectedRow && !!ownsDialog}
          learnerName={selectedRow?.learnerName ?? "Learner"}
          learnerAvatarUrl={selectedRow?.learnerAvatarUrl ?? null}
          learnerEmail={selectedRow?.learnerEmail ?? null}
        />
      )}
      {state.modal === "assign" && user.role === "admin" && (
        <EnrollmentAssignDialog
          user={user}
          courseId={courseId}
          onClose={() => update({ modal: undefined })}
        />
      )}
      <DataTable
        rows={query.data?.courseEnrollmentsPage.items ?? []}
        columns={enrollmentTableColumns(
          course?.title ?? "Selected course",
          onProgress
        )}
        getRowId={(row) => row.id}
        ariaLabel="Enrollments"
        search={{
          value: search,
          onChange: (value) => setSearch(value.slice(0, 200)),
          placeholder: "Search learner names or emails",
          label: "Search enrollments",
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
              title="Enrollments could not be loaded"
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
            icon={workspaceIcons.enrollments}
            title={
              !courseId
                ? "No courses available"
                : state.q
                  ? "No matching enrollments"
                  : "No enrollments yet"
            }
            description={
              !courseId
                ? "Create a course before managing enrollments."
                : state.q
                  ? "Try another learner name or email, or clear your search."
                  : "Learners will appear here when they are enrolled in this course."
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
              ) : courseId ? (
                <WorkspacePageAction view="enrollments" role={user.role} />
              ) : undefined
            }
          />
        }
      />
    </WorkspacePageFrame>
  )
}
