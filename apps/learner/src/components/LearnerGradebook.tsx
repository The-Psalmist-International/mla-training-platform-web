import { useNavigate, useRouter } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
import {
  LearnerGradebookDocument,
  LearnerGradebookCoursesDocument,
} from "@workspace/data/apollo/gradebook/query"
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus"
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { BrandLoader } from "@workspace/ui/components/brand-loader"
import { DataTable } from "@workspace/ui/components/data-table"
import { learnerResource } from "../workspace/course"
import type { LearnerSearch } from "../workspace/navigation"

type Props = { user: CurrentUser; search: LearnerSearch }

export function LearnerGradebook({ user, search }: Props) {
  const { dataClients } = useRouter().options.context
  const navigate = useNavigate()
  const update = (patch: Partial<LearnerSearch>) => {
    void navigate({ to: "/", search: { ...search, ...patch } })
  }
  const limit = search.pageSize ?? 20
  const query = useQuery(
    learnerResource(
      dataClients,
      user,
      "gradebook-courses",
      LearnerGradebookCoursesDocument,
      { limit, offset: (search.page - 1) * limit }
    )
  )
  return (
    <section
      className="flex min-w-0 flex-1 flex-col gap-5"
      aria-label="Gradebook"
    >
      <p className="text-sm text-muted-foreground">
        Your assessment results by course. Expand a course to see individual
        attempts. Passed assessments count once, even when you have several
        attempts.
      </p>
      {query.isPending ? (
        <BrandLoader label="Loading your gradebook" className="py-10" />
      ) : (
        <DataTable
          rows={query.data?.myGradebookCourses.items ?? []}
          getRowId={(row) => row.id}
          ariaLabel="Gradebook courses"
          columns={[
            {
              id: "course",
              header: "Course",
              cell: (row) => <span className="font-medium">{row.title}</span>,
            },
            {
              id: "assessments",
              header: "Assessments attempted",
              cell: (row) => row.assessmentCount,
            },
            {
              id: "passed",
              header: "Assessments passed",
              cell: (row) => `${row.passedCount} / ${row.assessmentCount}`,
            },
            {
              id: "attempts",
              header: "Total attempts",
              cell: (row) => row.attemptCount,
            },
            {
              id: "pending",
              header: "Awaiting grading",
              cell: (row) => row.pendingCount,
            },
            {
              id: "expand",
              header: <span className="sr-only">Expand course</span>,
              className: "w-12 text-right",
              cell: (row) => (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${search.gradeCourse === row.id ? "Collapse" : "Expand"} ${row.title}`}
                  aria-expanded={search.gradeCourse === row.id}
                  onClick={() =>
                    update({
                      gradeCourse:
                        search.gradeCourse === row.id ? undefined : row.id,
                      attempt: undefined,
                    })
                  }
                >
                  {search.gradeCourse === row.id ? (
                    <MinusIcon aria-hidden />
                  ) : (
                    <PlusIcon aria-hidden />
                  )}
                </Button>
              ),
            },
          ]}
          renderExpandedRow={(row) =>
            search.gradeCourse === row.id ? (
              <CourseAttempts user={user} courseId={row.id} title={row.title} />
            ) : null
          }
          onRefresh={() => {
            void query.refetch()
            void dataClients.queryClient.invalidateQueries({
              predicate: (entry) =>
                entry.queryKey.includes("gradebook-course-attempts"),
            })
          }}
          pagination={{
            pageIndex: search.page - 1,
            pageSize: limit,
            totalCount: query.data?.myGradebookCourses.totalCount ?? 0,
            onPageChange: (page) =>
              update({
                page: page + 1,
                gradeCourse: undefined,
                attempt: undefined,
              }),
            onPageSizeChange: (pageSize) =>
              update({
                pageSize,
                page: 1,
                gradeCourse: undefined,
                attempt: undefined,
              }),
          }}
          isFetching={query.isFetching}
          emptyState="No assessment attempts yet. Courses will appear here when you start an assessment."
          errorState={
            query.isError ? (
              <Alert variant="warning">
                Your gradebook could not be loaded.{" "}
                <Button variant="outline" onClick={() => void query.refetch()}>
                  Try again
                </Button>
              </Alert>
            ) : undefined
          }
        />
      )}
    </section>
  )
}

function CourseAttempts({
  user,
  courseId,
  title,
}: {
  user: CurrentUser
  courseId: string
  title: string
}) {
  const { dataClients } = useRouter().options.context
  const resource = learnerResource(
    dataClients,
    user,
    "gradebook-course-attempts",
    LearnerGradebookDocument,
    { courseId, limit: 100, offset: 0 }
  )
  const query = useQuery({
    ...resource,
    queryFn: async ({ signal }) => {
      const first = await dataClients.apolloClient.query({
        query: LearnerGradebookDocument,
        variables: { courseId, limit: 100, offset: 0 },
        fetchPolicy: "network-only",
        context: { toast: false, fetchOptions: { signal } },
      })
      if (!first.data) throw new Error("Missing gradebook response")
      const items = [...first.data.myGradebook.items]
      const total = first.data.myGradebook.totalCount
      while (items.length < total) {
        const next = await dataClients.apolloClient.query({
          query: LearnerGradebookDocument,
          variables: { courseId, limit: 100, offset: items.length },
          fetchPolicy: "network-only",
          context: { toast: false, fetchOptions: { signal } },
        })
        if (!next.data) throw new Error("Missing gradebook response")
        if (!next.data.myGradebook.items.length) break
        items.push(...next.data.myGradebook.items)
      }
      return { myGradebook: { ...first.data.myGradebook, items } }
    },
  })
  if (query.isPending)
    return (
      <BrandLoader
        label={`Loading assessments for ${title}`}
        className="py-6"
      />
    )
  return (
    <DataTable
      embedded
      rows={query.data?.myGradebook.items ?? []}
      getRowId={(row) => row.id}
      ariaLabel={`${title} assessment attempts`}
      columns={[
        {
          id: "assessment",
          header: "Assessment",
          cell: (row) => row.assessmentTitle,
        },
        {
          id: "attempt",
          header: "Attempt",
          cell: (row) => (
            <span className="text-muted-foreground">
              Attempt {row.attemptNumber}
            </span>
          ),
        },
        {
          id: "score",
          header: "Score",
          cell: (row) =>
            row.score === null ? "—" : `${row.score} / ${row.maxScore}`,
        },
        {
          id: "result",
          header: "Result",
          cell: (row) =>
            row.status === "in_progress"
              ? "In progress"
              : row.status === "needs_grading"
                ? "Awaiting grading"
                : row.passed
                  ? "Passed"
                  : "Not passed",
        },
      ]}
      onRefresh={() => void query.refetch()}
      isFetching={query.isFetching}
      pagination={{
        pageIndex: 0,
        pageSize: query.data?.myGradebook.items.length || 1,
        totalCount: query.data?.myGradebook.items.length ?? 0,
        onPageChange: () => undefined,
        onPageSizeChange: () => undefined,
      }}
      emptyState="No assessment attempts."
      errorState={
        query.isError ? (
          <Alert variant="warning">
            Assessments could not be loaded.{" "}
            <Button variant="outline" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </Alert>
        ) : undefined
      }
    />
  )
}
