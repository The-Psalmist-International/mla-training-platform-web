import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import {
  Link,
  useNavigate,
  useParams,
  useRouter,
  useSearch,
} from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
import {
  LearnerCourseStateDocument,
  LearnerCourseContentDocument,
  JoinLearnerCourseDocument,
} from "@workspace/data/apollo/learner-course/query"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight"
import { ListIcon } from "@phosphor-icons/react/dist/csr/List"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle"
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye"
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { ErrorState } from "@workspace/ui/components/error-state"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { BrandLoader } from "@workspace/ui/components/brand-loader"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet"
import { LearnerShell } from "../components/LearnerShell"
import { CourseSidebar } from "../components/course/CourseSidebar"
import { TextLesson } from "../components/course/TextLesson"
import { VideoLesson } from "../components/course/VideoLesson"
import { AssessmentLesson } from "../components/course/AssessmentLesson"
import type { QuizResultMeta } from "../components/course/AssessmentLesson"
import { VideoAssignment } from "../components/course/VideoAssignment"
import {
  chooseCourseLesson,
  orderedCourseLessons,
  courseBackSearch,
  learnerResource,
  learnerMutation,
  learnerCourseError,
  type CourseLesson,
} from "../workspace/course"

export function LearnerCoursePage() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  return (
    <LearnerShell tab="learning" courseMode>
      {user && <CoursePlayer key={user.id} user={user} />}
    </LearnerShell>
  )
}

function CoursePlayer({ user }: { user: CurrentUser }) {
  const { dataClients } = useRouter().options.context
  const { courseId } = useParams({ from: "/courses/$courseId" })
  const search = useSearch({ from: "/courses/$courseId" })
  const navigate = useNavigate()
  const cache = useQueryClient()
  const [drawer, setDrawer] = useState(false)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState("")
  const [quizExpired, setQuizExpired] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResultMeta | null>(null)
  const state = useQuery({
    ...learnerResource(dataClients, user, "state", LearnerCourseStateDocument, {
      courseId,
    }),
    refetchInterval: (query) =>
      query.state.data?.myCourseEnrollment ? 10000 : false,
  })
  const enrollment = state.data?.myCourseEnrollment ?? null
  const outline = state.data?.courseOutline
  const content = useQuery({
    ...learnerResource(
      dataClients,
      user,
      "content",
      LearnerCourseContentDocument,
      { courseId }
    ),
    enabled: !!enrollment,
  })
  const current = outline
    ? chooseCourseLesson(outline, enrollment, search.lesson)
    : undefined
  const ordered = outline ? orderedCourseLessons(outline) : []
  const index = ordered.findIndex((item) => item.id === current?.id)
  const previous = index > 0 ? ordered.at(index - 1) : undefined
  const next = index >= 0 ? ordered.at(index + 1) : undefined
  const lesson: CourseLesson | undefined = content.data?.course.modules
    .flatMap((module) =>
      module.items.map((item) => ({
        ...item,
        moduleId: module.id,
        moduleTitle: module.title,
      }))
    )
    .find((item) => item.id === current?.id)
  const completed =
    enrollment?.progress.some(
      (row) => row.itemId === current?.id && row.status === "completed"
    ) ?? false
  useEffect(() => {
    if (current && !search.lesson)
      void navigate({
        to: "/courses/$courseId",
        params: { courseId },
        search: { ...search, lesson: current.id },
        replace: true,
        resetScroll: false,
      })
  }, [current, search, navigate, courseId])
  useEffect(() => {
    document.getElementById("lesson-heading")?.focus({ preventScroll: true })
    document.getElementById("lesson-scroll")?.scrollTo({ top: 0 })
  }, [current?.id])
  useEffect(() => {
    setQuizExpired(false)
    setQuizResult(null)
  }, [current?.id])
  const handleQuizResult = useCallback((meta: QuizResultMeta | null) => {
    setQuizResult(meta)
  }, [])
  const handleQuizExpired = useCallback((expired: boolean) => {
    setQuizExpired(expired)
  }, [])
  const refetchState = state.refetch
  const refresh = useCallback(async () => {
    await refetchState()
    await Promise.all([
      cache.invalidateQueries({
        queryKey: ["learner", user.id, "enrollments"],
      }),
      cache.invalidateQueries({
        queryKey: ["learner", user.id, "enrollments-page"],
      }),
    ])
  }, [refetchState, cache, user.id])
  const join = async () => {
    if (joining) return
    setJoining(true)
    setJoinError("")
    try {
      await learnerMutation(dataClients, JoinLearnerCourseDocument, {
        courseId,
      })
      await refresh()
    } catch (error) {
      setJoinError(learnerCourseError(error))
      await refresh()
    } finally {
      setJoining(false)
    }
  }
  const back = (
    <Link
      to="/"
      search={courseBackSearch(search)}
      className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeftIcon aria-hidden className="size-4" />
      Back to{" "}
      {search.from === "library"
        ? "course library"
        : search.from === "overview"
          ? "overview"
          : "my learning"}
    </Link>
  )
  if (state.isPending)
    return (
      <div role="status" className="space-y-6 p-6">
        <span className="sr-only">Loading course</span>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  if (!outline || state.isError)
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="shrink-0">{back}</div>
        <div className="flex min-h-0 flex-1 items-center justify-center py-12">
          <ErrorState
            title="This course could not be loaded"
            description={learnerCourseError(state.error)}
            action={
              <Button variant="outline" onClick={() => void state.refetch()}>
                Try again
              </Button>
            }
          />
        </div>
      </div>
    )
  const sidebar = (
    <CourseSidebar
      course={outline}
      enrollment={enrollment}
      currentId={current?.id}
      nextId={next?.id}
      search={search}
      onSelect={() => setDrawer(false)}
    />
  )
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 py-2 lg:px-6">
        {back}
        <Button
          variant="outline"
          className="lg:hidden"
          onClick={() => setDrawer(true)}
        >
          <ListIcon aria-hidden />
          Course content
        </Button>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-80 shrink-0 flex-col border-r border-border/70 lg:flex">
          {sidebar}
        </aside>
        <Sheet open={drawer} onOpenChange={setDrawer}>
          <SheetContent side="left" className="gap-0">
            <SheetHeader>
              <SheetTitle>Course content</SheetTitle>
              <SheetDescription>
                Choose a lesson or see what is next.
              </SheetDescription>
            </SheetHeader>
            {sidebar}
          </SheetContent>
        </Sheet>
        <div id="lesson-scroll" className="min-w-0 flex-1 overflow-y-auto">
          {enrollment &&
            ((lesson?.type === "assessment" &&
              (quizExpired || quizResult?.status === "needs_grading")) ||
              (lesson?.type === "video_prompt" &&
                lesson.videoPrompt?.requiresReview)) && (
              <div
                role="status"
                className={`sticky top-0 z-10 w-full ${
                  quizExpired ? "bg-amber-600" : "bg-blue-600"
                } text-white`}
              >
                <p className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 text-sm font-medium sm:px-8 lg:px-12">
                  {quizExpired ? (
                    <WarningCircleIcon
                      aria-hidden
                      weight="fill"
                      className="size-5 shrink-0"
                    />
                  ) : lesson?.type === "assessment" ? (
                    <InfoIcon
                      aria-hidden
                      weight="fill"
                      className="size-5 shrink-0"
                    />
                  ) : (
                    <EyeIcon
                      aria-hidden
                      weight="fill"
                      className="size-5 shrink-0"
                    />
                  )}
                  {quizExpired
                    ? "Time is up. Your answers were submitted automatically — your result will appear here in a moment."
                    : lesson?.type === "assessment"
                      ? "Your answers have been submitted. Your result will appear here after grading."
                      : "Your instructor will review your submission."}
                </p>
              </div>
            )}
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 lg:px-12 lg:py-10">
            {!enrollment ? (
              <section className="max-w-3xl py-6">
                <p className="text-xs font-medium text-primary">
                  Course overview
                </p>
                <h1
                  id="learner-heading"
                  className="mt-3 text-3xl font-semibold tracking-tight"
                >
                  {outline.title}
                </h1>
                <p className="mt-5 text-sm leading-7 whitespace-pre-wrap text-muted-foreground">
                  {outline.description}
                </p>
                <p className="mt-6 text-sm text-muted-foreground">
                  {ordered.length} lessons · Enroll to start learning and save
                  your progress.
                </p>
                {joinError && (
                  <Alert variant="warning" className="mt-5">
                    {joinError}
                  </Alert>
                )}
                <Button
                  className="mt-6"
                  disabled={joining}
                  onClick={() => void join()}
                >
                  {joining ? "Enrolling…" : "Enroll in course"}
                  <ArrowRightIcon aria-hidden />
                </Button>
              </section>
            ) : !current ? (
              <Alert>
                {ordered.length
                  ? "This lesson is no longer available. Choose a lesson from the course content."
                  : "This course has no lessons yet."}
              </Alert>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {current.moduleTitle} <span aria-hidden>·</span> Lesson{" "}
                  {index + 1} of {ordered.length}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h1
                    id="lesson-heading"
                    tabIndex={-1}
                    className="min-w-0 flex-1 text-2xl leading-8 font-semibold tracking-tight outline-none"
                  >
                    {current.title}
                  </h1>
                  {lesson?.type === "assessment" && quizResult ? (
                    <span className="inline-flex shrink-0 items-center gap-2">
                      <StatusBadge tone={quizResult.tone}>
                        {quizResult.label}
                      </StatusBadge>
                      {quizResult.score && (
                        <span className="text-sm font-medium tabular-nums">
                          {quizResult.score}
                        </span>
                      )}
                    </span>
                  ) : (
                    completed && (
                      <StatusBadge tone="success">
                        <CheckCircleIcon aria-hidden className="size-3.5" />
                        Completed
                      </StatusBadge>
                    )
                  )}
                </div>
                {content.isPending ? (
                  <div className="flex min-h-72 items-center justify-center">
                    <BrandLoader label="Loading lesson…" className="py-6" />
                  </div>
                ) : content.isError || !lesson ? (
                  <div className="py-8">
                    <ErrorState
                      title="Lesson content could not be loaded"
                      action={
                        <Button
                          variant="outline"
                          onClick={() => void content.refetch()}
                        >
                          Try again
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div key={lesson.id}>
                    {lesson.type === "text" ? (
                      <TextLesson
                        lesson={lesson}
                        enrollmentId={enrollment.id}
                        completed={completed}
                        refresh={refresh}
                      />
                    ) : lesson.type === "video_lesson" ? (
                      <VideoLesson
                        lesson={lesson}
                        courseId={courseId}
                        enrollment={enrollment}
                        user={user}
                        refresh={refresh}
                      />
                    ) : lesson.type === "assessment" ? (
                      <AssessmentLesson
                        lesson={lesson}
                        enrollmentId={enrollment.id}
                        user={user}
                        refresh={refresh}
                        onResultMeta={handleQuizResult}
                        onExpiredNotice={handleQuizExpired}
                      />
                    ) : (
                      <VideoAssignment
                        lesson={lesson}
                        enrollmentId={enrollment.id}
                        user={user}
                        refresh={refresh}
                      />
                    )}
                  </div>
                )}
                {!content.isPending && !content.isError && lesson && (
                <nav
                  aria-label="Lesson navigation"
                  className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6"
                >
                  {previous ? (
                    <Button
                      variant="outline"
                      render={
                        <Link
                          to="/courses/$courseId"
                          params={{ courseId }}
                          search={{ ...search, lesson: previous.id }}
                        />
                      }
                    >
                      <ArrowLeftIcon aria-hidden />
                      Previous lesson
                    </Button>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <Link
                      to="/courses/$courseId"
                      params={{ courseId }}
                      search={{ ...search, lesson: next.id }}
                      className="flex max-w-full items-center gap-4 rounded-md border border-border px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-medium text-primary">
                          Next lesson
                        </span>
                        <span className="mt-1 block text-sm font-medium">
                          {next.title}
                        </span>
                      </span>
                      <ArrowRightIcon aria-hidden className="size-5 shrink-0" />
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {enrollment.completedAt
                        ? "You have completed this course."
                        : "You have reached the final lesson."}
                    </p>
                  )}
                </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
