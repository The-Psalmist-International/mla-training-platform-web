import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText"
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree"
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus"
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle"
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/csr/ClipboardText"
import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen"
import { FilmStripIcon } from "@phosphor-icons/react/dist/csr/FilmStrip"
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ErrorState } from "@workspace/ui/components/error-state"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { WorkspacePageFrame } from "../layout/WorkspacePageFrame"
import { WorkspacePageAction } from "../layout/WorkspacePageAction"
import { CourseThumbnail } from "../course/CourseThumbnail"
import { overviewOptions, type OverviewData } from "../../workspace/overview/overview"

const number = (value: number) => new Intl.NumberFormat().format(value)
const linkClass =
  "group flex min-h-36 min-w-0 flex-col justify-between rounded-xl border border-border/70 bg-card p-4 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"

export function OverviewGreeting({ name }: { name: string }) {
  // Keep the first render consistent during hydration, then use the browser's local clock.
  const [hour, setHour] = useState(0)
  useEffect(() => {
    const update = () => setHour(new Date().getHours())
    update()
    const timer = setInterval(update, 60_000)
    return () => clearInterval(timer)
  }, [])
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  return (
    <h2 className="text-2xl font-semibold tracking-tight">
      {greeting}, {name.trim() || "there"}.
    </h2>
  )
}

export function WorkspaceOverview() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  return user ? <OverviewContent key={user.id} user={user} /> : null
}
function OverviewContent({ user }: { user: CurrentUser }) {
  const { dataClients } = useRouter().options.context
  const query = useQuery(overviewOptions(dataClients, user))
  return (
    <WorkspacePageFrame view="overview">
      <div className="flex w-full flex-1 flex-col gap-6">
        <div className="flex shrink-0 flex-wrap items-start justify-between gap-4">
          <OverviewGreeting name={user.name} />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Refresh overview"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              <ArrowClockwiseIcon
                aria-hidden
                className={
                  query.isFetching
                    ? "animate-spin motion-reduce:animate-none"
                    : ""
                }
              />
            </Button>
            <WorkspacePageAction view="courses" role={user.role} />
            {user.role === "admin" && (
              <Button
                variant="outline"
                render={
                  <Link
                    to="/workspace/invitations"
                    search={{ modal: "create" }}
                  />
                }
              >
                <UserPlusIcon aria-hidden />
                Invite people
              </Button>
            )}
          </div>
        </div>
        {query.isPending ? (
          <div role="status" className="space-y-6">
            <span className="sr-only">Loading workspace overview</span>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-32 rounded-lg" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-5">
              <Skeleton className="h-80 lg:col-span-3" />
              <Skeleton className="h-80 lg:col-span-2" />
            </div>
          </div>
        ) : query.isError && !query.data ? (
          <div className="flex justify-center py-16">
            <ErrorState
              title="Your overview could not be loaded"
              description="Try again to get the latest course and learner activity."
              action={
                <Button variant="outline" onClick={() => void query.refetch()}>
                  Try again
                </Button>
              }
            />
          </div>
        ) : query.data ? (
          <>
            {query.isError && (
              <p role="alert" className="text-sm text-destructive">
                Refresh failed. Showing the last loaded overview.
              </p>
            )}
            <OverviewDashboard data={query.data} role={user.role} />
          </>
        ) : null}
      </div>
    </WorkspacePageFrame>
  )
}

function Metric({
  label,
  value,
  description,
  icon,
}: {
  label: string
  value: number
  description: string
  icon: ReactNode
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4"
        >
          {icon}
        </span>
        <p className="max-w-48 text-right text-[10px] leading-4 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="mt-4">
        <p className="text-sm text-foreground">{label}</p>
        <p className="mt-1 text-2xl leading-none font-semibold tracking-tight tabular-nums">
          {number(value)}
        </p>
      </div>
    </>
  )
}

export function OverviewDashboard({
  data,
  role,
}: {
  data: OverviewData
  role: CurrentUser["role"]
}) {
  const admin = role === "admin"
  const completionRate =
    data.totalEnrollments > 0
      ? Math.round((data.completedEnrollments / data.totalEnrollments) * 100)
      : null
  const hasAttention =
    data.pendingReviews +
      data.failedVideos +
      data.incompleteDrafts +
      (admin ? (data.pendingInvitations ?? 0) + (data.emailIssues ?? 0) : 0) >
    0
  const metrics = [
    {
      label: "Published courses",
      value: data.publishedCourses,
      description: "Available for learning",
      icon: <BookOpenIcon />,
      to: "/workspace/courses" as const,
      search: {
        status: "published" as const,
        scope: admin ? ("all" as const) : ("mine" as const),
      },
    },
    {
      label: "Draft courses",
      value: data.draftCourses,
      description: "Work in progress",
      icon: <FileTextIcon />,
      to: "/workspace/courses" as const,
      search: {
        status: "draft" as const,
        scope: admin ? ("all" as const) : ("mine" as const),
      },
    },
  ]
  return (
    <>
      <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            to={metric.to}
            search={metric.search}
            className={linkClass}
          >
            <Metric
              label={metric.label}
              value={metric.value}
              description={metric.description}
              icon={metric.icon}
            />
          </Link>
        ))}
        <Link to="/workspace/enrollments" className={linkClass}>
          <Metric
            label="Active learners"
            value={data.activeLearners}
            description="Learners with unfinished courses"
            icon={<UsersThreeIcon />}
          />
        </Link>
        <Link
          to={
            data.pendingAssessments
              ? "/workspace/assessment-reviews"
              : "/workspace/video-submissions"
          }
          className={linkClass}
        >
          <Metric
            label="Pending reviews"
            value={data.pendingReviews}
            description={`${number(data.pendingAssessments)} assessments · ${number(data.pendingVideoReviews)} videos`}
            icon={<ClipboardTextIcon />}
          />
        </Link>
      </div>
      <div className="grid min-h-80 flex-1 grid-cols-1 gap-6 lg:grid-cols-5">
        <section
          className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border/70 lg:col-span-3"
          aria-labelledby="attention-title"
        >
          <div className="p-5">
            <h3 id="attention-title" className="text-base font-semibold">
              Needs attention
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The next steps that move learning forward.
            </p>
          </div>
          {!hasAttention ? (
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
              <CheckCircleIcon
                aria-hidden
                className="mb-3 size-8 text-primary"
              />
              <p className="font-medium">You’re all caught up</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No reviews, failed videos, or unfinished course requirements to
                follow up.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {data.assessmentReviews.map((group) => (
                <AttentionRow
                  key={`assessment-${group.courseId}`}
                  icon={<ClipboardTextIcon aria-hidden />}
                  title={group.title}
                  description={`${number(group.totalCount)} assessment ${group.totalCount === 1 ? "review" : "reviews"} waiting`}
                  action={
                    <Link
                      to="/workspace/courses/$courseId"
                      params={{ courseId: group.courseId }}
                      search={{ tab: "reviews" }}
                    >
                      Review assessments
                    </Link>
                  }
                />
              ))}
              {data.videoReviews.map((group) => (
                <AttentionRow
                  key={`video-${group.courseId}`}
                  icon={<FilmStripIcon aria-hidden />}
                  title={group.title}
                  description={`${number(group.totalCount)} video ${group.totalCount === 1 ? "submission" : "submissions"} waiting`}
                  action={
                    <Link
                      to="/workspace/courses/$courseId"
                      params={{ courseId: group.courseId }}
                      search={{ tab: "reviews", reviewType: "video" }}
                    >
                      Review videos
                    </Link>
                  }
                />
              ))}
              {data.failedVideoItems.map((video) => (
                <AttentionRow
                  key={video.id}
                  icon={<FilmStripIcon aria-hidden />}
                  title={video.title}
                  description="Video processing failed"
                  action={
                    <Link
                      to="/workspace/videos"
                      search={{ modal: "details", item: video.id }}
                    >
                      Check video
                    </Link>
                  }
                />
              ))}
              {data.draftsNeedingWork.map((course) => (
                <AttentionRow
                  key={course.id}
                  icon={<BookOpenIcon aria-hidden />}
                  title={course.title}
                  description="Complete course content before publishing"
                  action={
                    <Link
                      to="/workspace/courses/$courseId"
                      params={{ courseId: course.id }}
                      search={{ tab: "modules" }}
                    >
                      Continue editing
                    </Link>
                  }
                />
              ))}
              {admin && !!data.pendingInvitations && (
                <AttentionRow
                  icon={<EnvelopeSimpleIcon aria-hidden />}
                  title="Pending invitations"
                  description={`${number(data.pendingInvitations)} people haven’t accepted yet`}
                  action={
                    <Link
                      to="/workspace/invitations"
                      search={{ status: "pending" }}
                    >
                      View invitations
                    </Link>
                  }
                />
              )}
              {admin && !!data.emailIssues && (
                <AttentionRow
                  icon={<EnvelopeSimpleIcon aria-hidden />}
                  title="Email delivery issues"
                  description={`${number(data.emailIssues)} failed, bounced, or complained messages`}
                  action={
                    <Link to="/workspace/email-delivery">Check delivery</Link>
                  }
                />
              )}
            </div>
          )}
        </section>
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <section
            className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border/70"
            aria-labelledby="recent-courses-title"
          >
            <div className="flex items-center justify-between gap-3 p-5">
              <h3 id="recent-courses-title" className="text-base font-semibold">
                Recent courses
              </h3>
              <Link
                to="/workspace/courses"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            {data.recentCourses.length ? (
              <div className="divide-y divide-border/70">
                {data.recentCourses.map((course) => (
                  <Link
                    key={course.id}
                    to="/workspace/courses/$courseId"
                    params={{ courseId: course.id }}
                    className="flex items-center gap-3 p-4 outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <CourseThumbnail
                      title={course.title}
                      thumbnailUrl={course.thumbnailUrl}
                      compact
                      className="w-16"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {course.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updated{" "}
                        {new Intl.DateTimeFormat(undefined, {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(course.updatedAt))}
                      </p>
                    </div>
                    <StatusBadge
                      tone={
                        course.status === "published" ? "success" : "neutral"
                      }
                    >
                      {course.status === "published" ? "Published" : "Draft"}
                    </StatusBadge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
                <BookOpenIcon
                  aria-hidden
                  className="mx-auto mb-3 size-7 text-muted-foreground"
                />
                <p className="text-sm font-medium">
                  Your first course starts here
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a course, add a module, and build your first lesson.
                </p>
              </div>
            )}
          </section>
          <section
            className="shrink-0 rounded-lg bg-muted/40 p-5"
            aria-labelledby="learning-progress-title"
          >
            <div className="flex items-center justify-between gap-3">
              <h3
                id="learning-progress-title"
                className="text-sm font-semibold"
              >
                Learning progress
              </h3>
              <Link
                to="/workspace/enrollments"
                className="text-xs font-medium text-primary hover:underline"
              >
                View learners
              </Link>
            </div>
            {completionRate !== null ? (
              <>
                <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
                  {completionRate}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Course enrollments completed
                </p>
                <div
                  role="progressbar"
                  aria-label="Course enrollment completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={completionRate}
                  className="mt-4 h-2 overflow-hidden rounded-full bg-primary/10"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Completed</dt>
                    <dd className="mt-1 text-sm font-medium tabular-nums">
                      {number(data.completedEnrollments)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Still learning</dt>
                    <dd className="mt-1 text-sm font-medium tabular-nums">
                      {number(
                        data.totalEnrollments - data.completedEnrollments
                      )}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <div className="flex justify-center py-8">
                <EmptyState
                  icon={UsersThreeIcon}
                  title="No enrollments yet"
                  description="Learning progress will appear when learners are enrolled in your courses."
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
function AttentionRow({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action: ReactElement<{ children?: ReactNode }>
}) {
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3 px-5 py-4 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto]">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium break-words">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="col-start-2 w-fit sm:col-start-auto"
        render={action}
      >
        {action.props.children}
      </Button>
    </div>
  )
}
