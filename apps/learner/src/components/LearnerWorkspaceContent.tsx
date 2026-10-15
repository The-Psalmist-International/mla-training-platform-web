import type { ReactNode } from "react"
import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen"
import { CertificateIcon } from "@phosphor-icons/react/dist/csr/Certificate"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle"
import type { CurrentUser } from "@workspace/data"
import {
  MY_ENROLLMENTS_QUERY,
  MY_ENROLLMENTS_PAGE_QUERY,
  type EnrollmentListItem,
} from "@workspace/data/apollo/enrollment/query"
import {
  COURSES_PAGE_QUERY,
  type CourseListItem,
} from "@workspace/data/apollo/course/query"
import { MY_CERTIFICATES_QUERY } from "@workspace/data/apollo/certificate/query"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  DataTable,
  type DataTableLayout,
} from "@workspace/ui/components/data-table"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import {
  courseReturnSearch,
  type LearnerCourseSearch,
} from "../workspace/course"
import {
  firstName,
  learnerSearch,
  type LearnerSearch,
  type LearnerTab,
} from "../workspace/navigation"

const pageSize = 12

export function LearnerWorkspaceContent({
  user,
  search,
}: {
  user: CurrentUser
  search: LearnerSearch
}) {
  const { tab } = search
  return (
    <>
      <div className="mb-8">
        <h1
          id="learner-heading"
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight outline-none"
        >
          {tab === "overview"
            ? `Welcome back, ${firstName(user.name)}`
            : tab === "learning"
              ? "My learning"
              : tab === "library"
                ? "Course library"
                : "Results"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {tab === "overview"
            ? "Your next step starts with the training assigned to you."
            : tab === "learning"
              ? "Keep track of the courses you have been enrolled in."
              : tab === "library"
                ? "Explore the training available in your academy."
                : "Your earned training certificates, all in one place."}
        </p>
      </div>
      {tab === "library" ? (
        <Library user={user} search={search} />
      ) : tab === "results" ? (
        <Results user={user} search={search} />
      ) : tab === "learning" ? (
        <EnrollmentGrid user={user} search={search} />
      ) : (
        <Enrollments user={user} search={search} />
      )}
    </>
  )
}

export const enrollmentGridLayout: DataTableLayout<EnrollmentListItem> = {
  mode: "grid",
  renderCard: (row) => <EnrollmentCourseCard enrollment={row} />,
}

export function EnrollmentCourseCard({
  enrollment: row,
  courseSearch,
}: {
  enrollment: EnrollmentListItem
  courseSearch?: LearnerCourseSearch
}) {
  const progress = row.learningProgress
  return (
    <CourseCard
      course={row.course}
      courseSearch={courseSearch}
      detail={
        <>
          <StatusBadge>Enrolled</StatusBadge>
          <StatusBadge tone={row.completedAt ? "success" : "neutral"}>
            {row.completedAt ? "Completed" : "In progress"}
          </StatusBadge>
        </>
      }
    >
      <div className="mt-auto pt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">Course progress</span>
          <span className="font-medium tabular-nums">
            {progress.percentage}%
          </span>
        </div>
        <progress
          aria-label={`${row.course.title} course progress`}
          value={progress.percentage}
          max={100}
          className="block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-muted [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {row.completedAt
            ? "Course completed"
            : progress.totalRequiredItems > 0
              ? `${progress.completedRequiredItems} of ${progress.totalRequiredItems} required lessons completed`
              : "No required lessons yet"}
        </p>
      </div>
    </CourseCard>
  )
}

function EnrollmentGrid({
  user,
  search,
}: {
  user: CurrentUser
  search: LearnerSearch
}) {
  const { dataClients } = useRouter().options.context
  const navigate = useNavigate()
  const size = search.pageSize ?? 20
  const term = search.q?.trim() || undefined
  const updateSearch = (patch: Partial<LearnerSearch>, replace = false) =>
    void navigate({
      to: "/",
      search: (previous) => learnerSearch({ ...previous, ...patch }),
      resetScroll: false,
      replace,
    })
  const query = useQuery({
    queryKey: ["learner", user.id, "enrollments-page", search.page, size, term],
    queryFn: async () => {
      const result = await dataClients.apolloClient.query({
        query: MY_ENROLLMENTS_PAGE_QUERY,
        variables: {
          limit: size,
          offset: (search.page - 1) * size,
          search: term,
        },
        fetchPolicy: "network-only",
        context: { toast: false },
      })
      if (!result.data) throw new Error("Missing enrollments")
      return result.data.myEnrollmentsPage
    },
  })
  return (
    <section
      className="flex min-w-0 flex-1 flex-col"
      aria-label="Enrolled courses"
    >
      <DataTable
        rows={query.data?.items ?? []}
        columns={[]}
        layout={{
          mode: "grid",
          renderCard: (row) => (
            <EnrollmentCourseCard
              enrollment={row}
              courseSearch={courseReturnSearch(search)}
            />
          ),
        }}
        gridClassName="grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        getRowId={(row) => row.id}
        ariaLabel="enrollments"
        search={{
          value: search.q ?? "",
          onChange: (q) => updateSearch({ q, page: 1 }, true),
          placeholder: "Search courses…",
          label: "Search enrolled courses",
        }}
        onRefresh={() => void query.refetch()}
        pagination={{
          pageIndex: search.page - 1,
          pageSize: size,
          totalCount: query.data?.totalCount ?? 0,
          onPageChange: (pageIndex) => updateSearch({ page: pageIndex + 1 }),
          onPageSizeChange: (nextSize) =>
            updateSearch({ pageSize: nextSize, page: 1 }),
        }}
        isLoading={query.isPending}
        isFetching={query.isFetching}
        errorState={
          query.isError ? (
            <div role="alert">
              <EmptyState
                icon={WarningCircleIcon}
                title="We couldn't load your enrollments"
                description="Check your connection and try again."
                action={
                  <Button
                    variant="outline"
                    onClick={() => void query.refetch()}
                  >
                    Try again
                  </Button>
                }
              />
            </div>
          ) : undefined
        }
        emptyState={
          <EmptyState
            icon={BookOpenIcon}
            title={
              term
                ? "No matching courses"
                : search.page > 1
                  ? "No more courses"
                  : "No training assigned yet"
            }
            description={
              term
                ? "Try another course title or clear your search."
                : search.page > 1
                  ? "Go back to the previous page to see your courses."
                  : "Courses will appear here when your administrator enrolls you."
            }
            action={
              term ? (
                <Button
                  variant="outline"
                  onClick={() => updateSearch({ q: undefined, page: 1 })}
                >
                  Clear search
                </Button>
              ) : search.page === 1 ? (
                <LibraryLink />
              ) : undefined
            }
          />
        }
      />
    </section>
  )
}

function Enrollments({
  user,
  search,
}: {
  user: CurrentUser
  search: LearnerSearch
}) {
  const { dataClients } = useRouter().options.context
  const overview = search.tab === "overview"
  const limit = overview ? 3 : pageSize
  const query = useQuery({
    queryKey: ["learner", user.id, "enrollments", search.tab, search.page],
    queryFn: async () => {
      const result = await dataClients.apolloClient.query({
        query: MY_ENROLLMENTS_QUERY,
        variables: { limit: limit + 1, offset: (search.page - 1) * limit },
        fetchPolicy: "network-only",
        context: { toast: false },
      })
      if (!result.data) throw new Error("Missing enrollments")
      return result.data.myEnrollments
    },
  })
  return (
    <section
      className="flex flex-1 flex-col"
      aria-label={overview ? "Your learning" : "Enrolled courses"}
    >
      {overview && (
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-base font-medium">Your learning</h2>
          <Link
            to="/"
            search={{ tab: "learning", page: 1 }}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        </div>
      )}
      <DataState
        pending={query.isPending}
        error={query.isError}
        retry={() => void query.refetch()}
        empty={query.data?.length === 0}
        emptyTitle={
          search.page > 1 ? "No more courses" : "No training assigned yet"
        }
        emptyDescription={
          search.page > 1
            ? "Go back to the previous page to see your courses."
            : "Courses will appear here when your administrator enrolls you. You can explore the course library in the meantime."
        }
        action={search.page === 1 ? <LibraryLink /> : undefined}
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {query.data?.slice(0, limit).map((enrollment) => (
            <EnrollmentCourseCard
              key={enrollment.id}
              enrollment={enrollment}
              courseSearch={courseReturnSearch(search)}
            />
          ))}
        </div>
      </DataState>
      {!overview && !query.isPending && !query.isError && (
        <Pagination search={search} hasNext={query.data.length > limit} />
      )}
    </section>
  )
}

function Library({
  user,
  search,
}: {
  user: CurrentUser
  search: LearnerSearch
}) {
  const { dataClients } = useRouter().options.context
  const query = useQuery({
    queryKey: ["learner", user.id, "library", search.page],
    queryFn: async () => {
      const result = await dataClients.apolloClient.query({
        query: COURSES_PAGE_QUERY,
        variables: {
          limit: pageSize,
          offset: (search.page - 1) * pageSize,
          status: "published",
        },
        fetchPolicy: "network-only",
        context: { toast: false },
      })
      if (!result.data) throw new Error("Missing courses")
      return result.data.coursesPage
    },
  })
  return (
    <section className="flex flex-1 flex-col" aria-label="Published courses">
      <DataState
        pending={query.isPending}
        error={query.isError}
        retry={() => void query.refetch()}
        empty={query.data?.items.length === 0}
        emptyTitle={
          search.page > 1 ? "No more courses" : "No courses available yet"
        }
        emptyDescription={
          search.page > 1
            ? "Go back to the previous page to see available training."
            : "Published courses will appear here when your academy makes them available."
        }
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {query.data?.items.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              courseSearch={courseReturnSearch(search)}
              detail={<StatusBadge>Available training</StatusBadge>}
            />
          ))}
        </div>
      </DataState>
      {!query.isPending && !query.isError && (
        <Pagination
          search={search}
          hasNext={search.page * pageSize < query.data.totalCount}
        />
      )}
    </section>
  )
}

function Results({
  user,
  search,
}: {
  user: CurrentUser
  search: LearnerSearch
}) {
  const { dataClients } = useRouter().options.context
  const query = useQuery({
    queryKey: ["learner", user.id, "certificates", search.page],
    queryFn: async () => {
      const result = await dataClients.apolloClient.query({
        query: MY_CERTIFICATES_QUERY,
        variables: {
          limit: pageSize + 1,
          offset: (search.page - 1) * pageSize,
        },
        fetchPolicy: "network-only",
        context: { toast: false },
      })
      if (!result.data) throw new Error("Missing certificates")
      return result.data.myCertificates
    },
  })
  return (
    <section
      className="flex flex-1 flex-col"
      aria-label="Training certificates"
    >
      <DataState
        pending={query.isPending}
        error={query.isError}
        retry={() => void query.refetch()}
        empty={query.data?.length === 0}
        emptyTitle={
          search.page > 1 ? "No more certificates" : "No certificates yet"
        }
        emptyDescription={
          search.page > 1
            ? "Go back to the previous page to see your certificates."
            : "When you complete an eligible course and a certificate is issued, it will appear here."
        }
        icon="certificate"
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {query.data?.slice(0, pageSize).map((certificate) => (
            <article
              key={certificate.id}
              className="rounded-xl border border-border/70 p-6"
            >
              <CertificateIcon
                aria-hidden
                className="mb-5 size-8 text-primary"
              />
              <h2 className="text-base font-medium">
                {certificate.courseTitle}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {certificate.recipientName}
              </p>
              <p className="mt-5 text-xs text-muted-foreground">
                Issued {formatDate(certificate.issuedAt)}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="break-all text-muted-foreground">
                  {certificate.certificateNumber}
                </span>
                <span
                  className={
                    certificate.status === "revoked"
                      ? "text-destructive"
                      : "text-primary"
                  }
                >
                  {certificate.status === "revoked" ? "Revoked" : "Issued"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </DataState>
      {!query.isPending && !query.isError && (
        <Pagination search={search} hasNext={query.data.length > pageSize} />
      )}
    </section>
  )
}

export function CourseCard({
  course,
  detail,
  children,
  courseSearch,
}: {
  course: CourseListItem
  detail: ReactNode
  children?: ReactNode
  courseSearch?: LearnerCourseSearch
}) {
  return (
    <article
      className={`relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-3 ${courseSearch ? "transition-colors hover:border-primary/40" : ""}`}
    >
      <div className="relative aspect-[16/8] shrink-0 overflow-hidden rounded-lg bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpenIcon
            aria-hidden
            className="size-10 text-muted-foreground/60"
          />
        </div>
        {course.thumbnailUrl && (
          <img
            src={course.thumbnailUrl}
            alt=""
            loading="lazy"
            className="relative h-full w-full object-cover outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
            onError={(event) => {
              event.currentTarget.style.display = "none"
            }}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <h3 className="line-clamp-2 text-base leading-6 font-medium">
          {courseSearch ? (
            <Link
              to="/courses/$courseId"
              params={{ courseId: course.id }}
              search={courseSearch}
              className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
            >
              {course.title}
            </Link>
          ) : (
            course.title
          )}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {course.description || "Training from your academy."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {detail}
          {course.certificateEnabled && (
            <span
              role="img"
              aria-label="Certificate included"
              title="Certificate included"
              className="ml-auto inline-flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <CertificateIcon aria-hidden className="size-4" />
            </span>
          )}
        </div>
        {children}
      </div>
    </article>
  )
}

function LibraryLink() {
  return (
    <Button
      variant="outline"
      render={<Link to="/" search={{ tab: "library", page: 1 }} />}
    >
      Explore course library
      <ArrowRightIcon aria-hidden />
    </Button>
  )
}

export function DataState({
  pending,
  error,
  retry,
  empty,
  emptyTitle,
  emptyDescription,
  action,
  icon,
  children,
}: {
  pending: boolean
  error: boolean
  retry: () => void
  empty: boolean
  emptyTitle: string
  emptyDescription: string
  action?: ReactNode
  icon?: "certificate"
  children: ReactNode
}) {
  if (pending)
    return (
      <div role="status" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <span className="sr-only">Loading your training…</span>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            aria-hidden
            className="overflow-hidden rounded-xl border border-border/70 p-3"
          >
            <Skeleton className="aspect-[16/8] rounded-lg" />
            <div className="space-y-3 px-2 pt-5 pb-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  if (error)
    return (
      <div
        className="flex flex-1 items-center justify-center py-20"
        role="alert"
      >
        <EmptyState
          icon={WarningCircleIcon}
          title="We couldn’t load your training"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={retry}>
              Try again
            </Button>
          }
        />
      </div>
    )
  if (empty)
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/70 px-6 py-20">
        <EmptyState
          icon={icon === "certificate" ? CertificateIcon : BookOpenIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={action}
        />
      </div>
    )
  return <>{children}</>
}

function Pagination({
  search,
  hasNext,
}: {
  search: LearnerSearch
  hasNext: boolean
}) {
  if (search.page === 1 && !hasNext) return null
  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-end gap-3"
    >
      <PageLink
        tab={search.tab}
        page={search.page - 1}
        disabled={search.page === 1}
      >
        Previous
      </PageLink>
      <span className="text-sm text-muted-foreground tabular-nums">
        Page {search.page}
      </span>
      <PageLink tab={search.tab} page={search.page + 1} disabled={!hasNext}>
        Next
      </PageLink>
    </nav>
  )
}

function PageLink({
  tab,
  page,
  disabled,
  children,
}: {
  tab: LearnerTab
  page: number
  disabled: boolean
  children: ReactNode
}) {
  return disabled ? (
    <Button variant="outline" disabled>
      {children}
    </Button>
  ) : (
    <Button variant="outline" render={<Link to="/" search={{ tab, page }} />}>
      {children}
    </Button>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date)
}
