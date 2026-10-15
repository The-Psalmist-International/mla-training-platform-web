import type { ReactNode } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen"
import { CertificateIcon } from "@phosphor-icons/react/dist/csr/Certificate"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle"
import type { CurrentUser } from "@workspace/data"
import { MY_ENROLLMENTS_QUERY } from "@workspace/data/apollo/enrollment/query"
import {
  COURSES_PAGE_QUERY,
  type CourseListItem,
} from "@workspace/data/apollo/course/query"
import { MY_CERTIFICATES_QUERY } from "@workspace/data/apollo/certificate/query"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  firstName,
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
      ) : (
        <Enrollments user={user} search={search} />
      )}
    </>
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {query.data?.slice(0, limit).map((enrollment) => (
            <CourseCard
              key={enrollment.id}
              course={enrollment.course}
              detail={
                enrollment.completedAt
                  ? `Completed ${formatDate(enrollment.completedAt)}`
                  : "Enrolled"
              }
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {query.data?.items.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              detail="Available training"
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
}: {
  course: CourseListItem
  detail: string
}) {
  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="relative aspect-[16/8] overflow-hidden bg-muted">
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
      <div className="p-5">
        <p className="mb-3 text-xs text-primary">{detail}</p>
        <h3 className="line-clamp-2 text-base leading-6 font-medium">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {course.description || "Training from your academy."}
        </p>
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
      <div role="status" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <span className="sr-only">Loading your training…</span>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            aria-hidden
            className="overflow-hidden rounded-xl border border-border/70"
          >
            <Skeleton className="aspect-[16/8] rounded-none" />
            <div className="space-y-3 p-5">
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
