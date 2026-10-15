import { useEffect, useRef, useState } from "react"
import { useBlocker, useRouter } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useFormik } from "formik"
import * as yup from "yup"
import type { CurrentUser } from "@workspace/data"
import { MY_ASSESSMENT_ATTEMPTS_QUERY } from "@workspace/data/apollo/assessment/query"
import {
  LearnerAssessmentAttemptDocument,
  StartLearnerAssessmentDocument,
  SaveLearnerAssessmentDocument,
  SubmitLearnerAssessmentDocument,
  type LearnerAttemptFieldsFragment,
} from "@workspace/data/apollo/learner-course/query"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle"
import { TimerIcon } from "@phosphor-icons/react/dist/csr/Timer"
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank"
import { HourglassMediumIcon } from "@phosphor-icons/react/dist/csr/HourglassMedium"
import { RepeatIcon } from "@phosphor-icons/react/dist/csr/Repeat"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  learnerResource,
  learnerMutation,
  learnerCourseError,
  type CourseLesson,
} from "../../workspace/course"

type Attempt = LearnerAttemptFieldsFragment
export type QuizResultMeta = {
  label: string
  tone: "success" | "neutral"
  score: string | null
  status: Attempt["status"]
}

export function AssessmentLesson({
  lesson,
  enrollmentId,
  user,
  refresh,
  onResultMeta,
  onExpiredNotice,
}: {
  lesson: CourseLesson
  enrollmentId: string
  user: CurrentUser
  refresh: () => Promise<void>
  onResultMeta?: (meta: QuizResultMeta | null) => void
  onExpiredNotice?: (expired: boolean) => void
}) {
  const { dataClients } = useRouter().options.context
  const cache = useQueryClient()
  const [selected, setSelected] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const list = useQuery(
    learnerResource(
      dataClients,
      user,
      "attempts",
      MY_ASSESSMENT_ATTEMPTS_QUERY,
      {
        enrollmentId,
        assessmentId: lesson.id,
        limit: lesson.assessment?.attemptLimit ?? 10,
        offset: 0,
      }
    )
  )
  const latest = list.data?.myAssessmentAttempts.at(0)
  const id = selected ?? latest?.id
  const options = learnerResource(
    dataClients,
    user,
    "attempt",
    LearnerAssessmentAttemptDocument,
    { id: id ?? "" }
  )
  const query = useQuery({
    ...options,
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchInterval: (q) => {
      const status = q.state.data?.assessmentAttempt.status
      if (status === "needs_grading") return 10000
      if (status === "in_progress") {
        const deadline = q.state.data?.assessmentAttempt.deadlineAt
        if (!deadline) return false
        // Poll harder as the deadline approaches so expiry flips to the
        // result automatically without a manual refresh.
        return Date.parse(deadline) - Date.now() <= 60000 ? 5000 : 15000
      }
      return false
    },
  })
  const attempt = query.data?.assessmentAttempt
  useEffect(() => {
    if (!onResultMeta) return
    if (!attempt || attempt.status === "in_progress") {
      onResultMeta(null)
      return
    }
    onResultMeta({
      label:
        attempt.status === "needs_grading"
          ? "Awaiting grading"
          : attempt.passed
            ? "Passed"
            : "Not passed",
      tone: attempt.passed ? "success" : "neutral",
      score:
        attempt.score !== null
          ? `${attempt.score} / ${attempt.maxScore}`
          : null,
      status: attempt.status,
    })
  }, [
    attempt?.id,
    attempt?.status,
    attempt?.passed,
    attempt?.score,
    attempt?.maxScore,
    onResultMeta,
  ])
  const accept = (value: Attempt) => {
    cache.setQueryData(
      learnerResource(
        dataClients,
        user,
        "attempt",
        LearnerAssessmentAttemptDocument,
        { id: value.id }
      ).queryKey,
      { assessmentAttempt: value }
    )
    setSelected(value.id)
  }
  const start = async () => {
    if (busy) return
    setBusy(true)
    setError("")
    try {
      const data = await learnerMutation(
        dataClients,
        StartLearnerAssessmentDocument,
        { input: { enrollmentId, assessmentId: lesson.id } }
      )
      accept(data.startAssessmentAttempt)
      void list.refetch()
    } catch (failure) {
      setError(learnerCourseError(failure))
    } finally {
      setBusy(false)
    }
  }
  if (list.isPending || (id && query.isPending))
    return <Skeleton className="mt-6 h-64 w-full" />
  if (list.isError || query.isError)
    return (
      <Alert variant="warning" className="mt-6">
        Assessment could not be loaded.
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => {
            void list.refetch()
            if (id) void query.refetch()
          }}
        >
          Try again
        </Button>
      </Alert>
    )
  return (
    <section className="space-y-5 pt-6">
      <AssessmentMeta
        passMark={lesson.assessment?.passMark ?? 70}
        timeLimitSeconds={lesson.assessment?.timeLimitSeconds ?? null}
        attemptLimit={lesson.assessment?.attemptLimit ?? null}
        attemptNumber={attempt?.attemptNumber ?? latest?.attemptNumber ?? 0}
        deadlineAt={attempt?.deadlineAt ?? null}
        startedAt={attempt?.startedAt ?? null}
        live={attempt?.status === "in_progress"}
      />
      {error && <Alert variant="warning">{error}</Alert>}
      {!attempt ? (
        <Button disabled={busy} onClick={() => void start()}>
          {busy ? "Starting…" : "Start assessment"}
        </Button>
      ) : attempt.status === "in_progress" ? (
        <AttemptForm
          key={attempt.id}
          attempt={attempt}
          onSaved={accept}
          refresh={refresh}
          reload={() => void query.refetch()}
          onExpiredNotice={onExpiredNotice}
        />
      ) : (
        <>
          <ol className="space-y-5">
            {attempt.answers.map((answer, index) => (
              <li
                key={answer.question.id}
                className="border-t border-border/70 pt-4 first:border-t-0 first:pt-0"
              >
                <h3 className="text-sm font-medium">
                  <span className="mb-1 block text-xs font-normal text-muted-foreground">
                    Question {index + 1} of {attempt.answers.length}
                  </span>
                  {answer.question.prompt}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your answer:{" "}
                  {answer.question.options.find(
                    (option) => option.id === answer.selectedOptionId
                  )?.label ??
                    (answer.textAnswer || "No answer")}
                </p>
                {answer.feedback && (
                  <p className="mt-2 text-sm">{answer.feedback}</p>
                )}
                {answer.explanation && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {answer.explanation}
                  </p>
                )}
              </li>
            ))}
          </ol>
          {attempt.status === "graded" &&
            !attempt.passed &&
            (!attempt.attemptLimit ||
              attempt.attemptNumber < attempt.attemptLimit) && (
              <div className="flex justify-end">
                <Button disabled={busy} onClick={() => void start()}>
                  {busy ? "Starting…" : "Try another attempt"}
                </Button>
              </div>
            )}
        </>
      )}
    </section>
  )
}

function AssessmentMeta({
  passMark,
  timeLimitSeconds,
  attemptLimit,
  attemptNumber,
  deadlineAt,
  startedAt,
  live,
}: {
  passMark: number
  timeLimitSeconds: number | null
  attemptLimit: number | null
  attemptNumber: number
  deadlineAt: string | null
  startedAt: string | null
  live: boolean
}) {
  const remaining = useCountdown(deadlineAt, live)
  const total = durationMs(startedAt, deadlineAt, timeLimitSeconds)
  const tone = timerTone(remaining, total)
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${live && tone === "critical" ? "border-destructive/40 bg-destructive/5" : "border-border/70 bg-muted/40"}`}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <dl className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircleIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <dt className="text-muted-foreground">Pass mark</dt>
            <dd className="font-medium tabular-nums">{passMark}%</dd>
          </div>
          {timeLimitSeconds ? (
            <div className="flex items-center gap-2">
              <HourglassMediumIcon
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
              />
              <dt className="text-muted-foreground">Time limit</dt>
              <dd className="font-medium tabular-nums">
                {formatDuration(timeLimitSeconds)}
              </dd>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <RepeatIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <dt className="text-muted-foreground">Attempts</dt>
            <dd className="font-medium tabular-nums">
              {attemptLimit
                ? attemptNumber > 0
                  ? `Attempt ${attemptNumber} of ${attemptLimit}`
                  : `${attemptLimit} attempts allowed`
                : attemptNumber > 0
                  ? `Attempt ${attemptNumber}`
                  : "Unlimited attempts"}
            </dd>
          </div>
          {deadlineAt ? (
            <div className="flex items-center gap-2">
              <CalendarBlankIcon
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
              />
              <dt className="text-muted-foreground">Due date</dt>
              <dd className="font-medium">
                <time dateTime={deadlineAt}>{formatDueDate(deadlineAt)}</time>
              </dd>
            </div>
          ) : null}
        </dl>
        {live && deadlineAt ? (
          <p
            role="timer"
            aria-live={tone !== "ok" ? "assertive" : "off"}
            aria-atomic="true"
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums ${timerToneClass(tone)}`}
          >
            <TimerIcon aria-hidden className="size-4" />
            {remaining === null
              ? "Finishing up…"
              : remaining <= 0
                ? "Time is up"
                : formatRemaining(remaining)}
          </p>
        ) : null}
      </div>
      {live && deadlineAt && remaining !== null && remaining > 0 ? (
        <div
          aria-hidden
          className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ${timerBarClass(tone)}`}
            style={{ width: `${timerFraction(remaining, total)}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}

function useCountdown(deadlineAt: string | null, live: boolean) {
  const target = deadlineAt ? Date.parse(deadlineAt) : NaN
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!live || Number.isNaN(target)) return
    if (target - Date.now() <= 0) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [live, target])
  if (!live || Number.isNaN(target)) return null
  return target - now
}

export type TimerTone = "ok" | "warning" | "critical"

export function timerTone(
  remainingMs: number | null,
  totalMs: number | null
): TimerTone {
  if (remainingMs === null || remainingMs <= 0) return "critical"
  if (!totalMs || totalMs <= 0) return remainingMs <= 60000 ? "critical" : "ok"
  const elapsed = 1 - remainingMs / totalMs
  if (elapsed >= 0.7) return "critical"
  if (elapsed >= 0.5) return "warning"
  return "ok"
}

function timerToneClass(tone: TimerTone) {
  return tone === "critical"
    ? "bg-destructive/10 text-destructive"
    : tone === "warning"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
}

function timerBarClass(tone: TimerTone) {
  return tone === "critical"
    ? "bg-destructive"
    : tone === "warning"
      ? "bg-amber-500"
      : "bg-emerald-500"
}

function durationMs(
  startedAt: string | null,
  deadlineAt: string | null,
  timeLimitSeconds: number | null
) {
  if (startedAt && deadlineAt) {
    const total = Date.parse(deadlineAt) - Date.parse(startedAt)
    if (Number.isFinite(total) && total > 0) return total
  }
  return timeLimitSeconds ? timeLimitSeconds * 1000 : null
}

function timerFraction(remainingMs: number, totalMs: number | null) {
  if (!totalMs || totalMs <= 0) return 100
  return Math.min(100, Math.max(0, (remainingMs / totalMs) * 100))
}

export function formatDuration(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds} seconds`
  const minutes = Math.round(totalSeconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0
    ? `${hours} hour${hours === 1 ? "" : "s"}`
    : `${hours} hr ${rest} min`
}

export function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes)
  const ss = String(seconds).padStart(2, "0")
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

function formatDueDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date)
}

function AttemptForm({
  attempt,
  onSaved,
  refresh,
  reload,
  onExpiredNotice,
}: {
  attempt: Attempt
  onSaved: (attempt: Attempt) => void
  refresh: () => Promise<void>
  reload: () => void
  onExpiredNotice?: (expired: boolean) => void
}) {
  const { dataClients } = useRouter().options.context
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const schema = yup.object(
    Object.fromEntries(
      attempt.answers.map(({ question }) => [
        question.id,
        yup
          .string()
          .max(10000, "Use 10,000 characters or fewer.")
          .required("Answer this question before submitting."),
      ])
    )
  )
  const form = useFormik<Record<string, string>>({
    initialValues: Object.fromEntries(
      attempt.answers.map((answer) => [
        answer.question.id,
        answer.selectedOptionId ?? answer.textAnswer ?? "",
      ])
    ),
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      await persist(values, true)
    },
  })
  const answers = (values: Record<string, string>) =>
    attempt.answers.map(({ question }) =>
      question.type === "short_answer"
        ? { questionId: question.id, textAnswer: values[question.id] ?? "" }
        : {
            questionId: question.id,
            selectedOptionId: values[question.id] || null,
          }
    )
  const [now, setNow] = useState(() => Date.now())
  const expired = attempt.deadlineAt
    ? Date.parse(attempt.deadlineAt) <= now
    : false
  const synced = useRef(false)
  useEffect(() => {
    onExpiredNotice?.(expired)
  }, [expired, onExpiredNotice])
  useEffect(() => {
    if (!attempt.deadlineAt) return
    if (Date.parse(attempt.deadlineAt) - Date.now() > 0) {
      const interval = setInterval(() => setNow(Date.now()), 1000)
      return () => clearInterval(interval)
    }
    // Deadline passed: re-read once so the graded result appears without a
    // manual refresh. The server finalises the attempt on read.
    if (!synced.current) {
      synced.current = true
      reload()
      void refresh()
    }
    return undefined
  }, [attempt.deadlineAt, attempt.id, dataClients, refresh, reload])
  async function persist(values: Record<string, string>, submit = false) {
    if (busy) return false
    setBusy(true)
    setError("")
    setSaved(false)
    try {
      const draft = await learnerMutation(
        dataClients,
        SaveLearnerAssessmentDocument,
        {
          input: {
            attemptId: attempt.id,
            expectedVersion: attempt.version,
            answers: answers(values),
          },
        }
      )
      onSaved(draft.saveAssessmentAnswers)
      form.resetForm({ values })
      if (submit && draft.saveAssessmentAnswers.status === "in_progress") {
        const result = await learnerMutation(
          dataClients,
          SubmitLearnerAssessmentDocument,
          {
            input: {
              attemptId: attempt.id,
              expectedVersion: draft.saveAssessmentAnswers.version,
            },
          }
        )
        onSaved(result.submitAssessmentAttempt)
        await refresh()
      }
      setSaved(true)
      return true
    } catch (failure) {
      setError(learnerCourseError(failure))
      return false
    } finally {
      setBusy(false)
    }
  }
  useBlocker({
    shouldBlockFn: async () =>
      busy ? true : form.dirty ? !(await persist(form.values)) : false,
    enableBeforeUnload: form.dirty || busy,
  })
  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-6">
      {error && (
        <Alert variant="warning">
          {error}
          <Button variant="ghost" onClick={reload}>
            Reload attempt
          </Button>
        </Alert>
      )}
      {attempt.answers.map(({ question }, index) => (
        <fieldset
          key={question.id}
          disabled={busy || expired}
          className="space-y-3 border-t border-border/70 pt-5 first:border-t-0 first:pt-0"
        >
          <legend className="pt-4 text-sm leading-6 font-medium first:pt-0">
            <span className="mb-1 block text-xs font-normal text-muted-foreground">
              Question {index + 1} of {attempt.answers.length}
            </span>
            {question.prompt}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({question.points} points)
            </span>
          </legend>
          {question.type === "short_answer" ? (
            <>
              <label htmlFor={question.id} className="sr-only">
                Your answer to question {index + 1}
              </label>
              <textarea
                id={question.id}
                name={question.id}
                value={form.values[question.id] ?? ""}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                maxLength={10000}
                rows={5}
                aria-invalid={
                  !!(form.touched[question.id] && form.errors[question.id])
                }
                aria-describedby={
                  form.touched[question.id] && form.errors[question.id]
                    ? `${question.id}-error`
                    : undefined
                }
                className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </>
          ) : (
            question.options.map((option) => (
              <label
                key={option.id}
                className="flex min-h-11 items-center gap-3 rounded-md border border-border px-3 py-2 text-sm has-checked:border-primary has-checked:bg-primary/5"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={form.values[question.id] === option.id}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className="size-4 accent-primary"
                />
                {option.label}
              </label>
            ))
          )}
          {form.touched[question.id] && form.errors[question.id] && (
            <p id={`${question.id}-error`} className="text-xs text-destructive">
              {form.errors[question.id]}
            </p>
          )}
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy || expired}>
          {busy ? "Saving…" : "Submit assessment"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy || expired}
          onClick={() => void persist(form.values)}
        >
          Save draft
        </Button>
        {saved && (
          <span role="status" className="text-xs text-muted-foreground">
            Draft saved
          </span>
        )}
      </div>
    </form>
  )
}
