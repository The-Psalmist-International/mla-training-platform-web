import { useEffect, useRef, useState } from "react"
import { useBlocker, useRouter } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useFormik } from "formik"
import * as yup from "yup"
import type { CurrentUser } from "@workspace/data"
import { MY_VIDEO_SUBMISSIONS_QUERY } from "@workspace/data/apollo/submission/query"
import {
  StartLearnerSubmissionDocument,
  ResumeLearnerSubmissionDocument,
  SyncLearnerSubmissionDocument,
} from "@workspace/data/apollo/learner-course/query"
import { Markdown } from "@workspace/ui/components/markdown"
import { FileInput } from "@workspace/ui/components/file-input"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import {
  learnerResource,
  learnerMutation,
  learnerCourseError,
  type CourseLesson,
} from "../../workspace/course"
import {
  submissionMimeType,
  transferSubmission,
} from "../../workspace/submission-upload"

export function VideoAssignment({
  lesson,
  enrollmentId,
  user,
  refresh,
}: {
  lesson: CourseLesson
  enrollmentId: string
  user: CurrentUser
  refresh: () => Promise<void>
}) {
  const { dataClients } = useRouter().options.context
  const [error, setError] = useState("")
  const [percentage, setPercentage] = useState(0)
  const [checking, setChecking] = useState(false)
  const controller = useRef<AbortController | null>(null)
  const pending = useRef(false)
  const requestKey = useRef<string | null>(null)
  const uploadId = useRef<string | null>(null)
  const query = useQuery({
    ...learnerResource(
      dataClients,
      user,
      "submissions",
      MY_VIDEO_SUBMISSIONS_QUERY,
      { enrollmentId, itemId: lesson.id, limit: 1, offset: 0 }
    ),
    refetchInterval: (q) =>
      ["uploading", "processing", "pending_review"].includes(
        q.state.data?.myVideoSubmissions.at(0)?.status ?? ""
      )
        ? 10000
        : false,
  })
  const latest = query.data?.myVideoSubmissions.at(0)
  const form = useFormik<{ file: File | null }>({
    initialValues: { file: null },
    validationSchema: yup.object({
      file: yup
        .mixed<File>()
        .required("Choose a video.")
        .test(
          "format",
          "Choose an MP4, WebM, MOV, AVI, or MKV video.",
          (file) => !!file && !!submissionMimeType(file)
        )
        .test(
          "size",
          "Choose a non-empty video.",
          (file) => !!file && file.size > 0
        ),
    }),
    onSubmit: async ({ file }) => {
      if (!file || pending.current) return
      pending.current = true
      setError("")
      setPercentage(0)
      const abort = new AbortController()
      controller.current = abort
      try {
        const id = latest?.status === "uploading" ? latest.id : uploadId.current
        const target = id
          ? (
              await learnerMutation(
                dataClients,
                ResumeLearnerSubmissionDocument,
                { id }
              )
            ).refreshVideoSubmissionUpload
          : (
              await learnerMutation(
                dataClients,
                StartLearnerSubmissionDocument,
                {
                  input: {
                    enrollmentId,
                    itemId: lesson.id,
                    mimeType: submissionMimeType(file)!,
                    requestKey:
                      requestKey.current ??
                      (requestKey.current = crypto.randomUUID()),
                  },
                }
              )
            ).startVideoSubmission
        uploadId.current = target.submission.id
        await query.refetch()
        await transferSubmission({
          file,
          userId: user.id,
          submissionId: target.submission.id,
          target: target.upload,
          renew: async () =>
            (
              await learnerMutation(
                dataClients,
                ResumeLearnerSubmissionDocument,
                { id: target.submission.id }
              )
            ).refreshVideoSubmissionUpload.upload,
          signal: abort.signal,
          onProgress: setPercentage,
        })
        await learnerMutation(dataClients, SyncLearnerSubmissionDocument, {
          id: target.submission.id,
        })
        uploadId.current = null
        requestKey.current = null
        form.resetForm()
        await query.refetch()
        await refresh()
      } catch (failure) {
        setError(
          failure instanceof Error && /Upload|upload/.test(failure.message)
            ? failure.message
            : learnerCourseError(failure)
        )
        await query.refetch()
      } finally {
        pending.current = false
        controller.current = null
      }
    },
  })
  useEffect(() => () => controller.current?.abort(), [])
  useBlocker({
    shouldBlockFn: () => pending.current,
    enableBeforeUnload: form.isSubmitting,
  })
  const check = async () => {
    if (!latest || checking) return
    setChecking(true)
    setError("")
    try {
      await learnerMutation(dataClients, SyncLearnerSubmissionDocument, {
        id: latest.id,
      })
      await query.refetch()
      await refresh()
    } catch (failure) {
      setError(learnerCourseError(failure))
    } finally {
      setChecking(false)
    }
  }
  const canUpload =
    !latest || ["uploading", "needs_revision", "failed"].includes(latest.status)
  return (
    <section className="space-y-5 pt-6">
      <Markdown value={lesson.videoPrompt?.instructions ?? ""} />
      <p className="text-sm text-muted-foreground">
        Maximum video length:{" "}
        {Math.ceil((lesson.videoPrompt?.maxDurationSeconds ?? 300) / 60)}{" "}
        minutes.
        {lesson.videoPrompt?.requiresReview
          ? " Your instructor will review your submission."
          : "This lesson completes after the video passes processing."}
      </p>
      {query.isPending ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading your submissions…
        </p>
      ) : query.isError ? (
        <Alert variant="warning">
          Your submission could not be loaded.
          <Button variant="outline" onClick={() => void query.refetch()}>
            Try again
          </Button>
        </Alert>
      ) : (
        <>
          {latest && (
            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/40 px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  tone={
                    latest.status === "approved"
                      ? "success"
                      : latest.status === "failed"
                        ? "destructive"
                        : "neutral"
                  }
                >
                  {latest.status.replaceAll("_", " ")}
                </StatusBadge>
                {["processing", "pending_review"].includes(latest.status) && (
                  <span role="status" className="text-xs text-muted-foreground">
                    Checking automatically…{" "}
                    <button
                      type="button"
                      disabled={checking || form.isSubmitting}
                      onClick={() => void check()}
                      className="underline underline-offset-2 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:no-underline disabled:opacity-60"
                    >
                      {checking ? "Checking…" : "Check now"}
                    </button>
                  </span>
                )}
              </div>
              <ol className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <li
                  aria-current={
                    latest.status === "uploading" ? "step" : undefined
                  }
                  className="font-medium text-foreground"
                >
                  1. Submitted
                </li>
                <li
                  aria-current={
                    ["processing", "pending_review"].includes(latest.status)
                      ? "step"
                      : undefined
                  }
                  className={
                    ["processing", "pending_review"].includes(latest.status)
                      ? "font-medium text-foreground"
                      : undefined
                  }
                >
                  2.{" "}
                  {lesson.videoPrompt?.requiresReview
                    ? "Instructor review"
                    : "Processing"}
                </li>
                <li
                  className={
                    ["approved", "needs_revision", "failed"].includes(
                      latest.status
                    )
                      ? "font-medium text-foreground"
                      : undefined
                  }
                >
                  3. Result
                </li>
              </ol>
              {latest.feedback && (
                <p className="text-sm leading-6">{latest.feedback}</p>
              )}
              {["processing", "pending_review"].includes(latest.status) && (
                <p className="text-sm text-muted-foreground">
                  {latest.status === "processing"
                    ? "Your video is processing. This page updates on its own — no need to refresh."
                    : lesson.videoPrompt?.requiresReview
                      ? "Your video is with your instructor for review. This page updates on its own when they respond."
                      : "Your video is awaiting review. This page updates on its own."}
                </p>
              )}
            </div>
          )}
          {canUpload && (
            <form noValidate onSubmit={form.handleSubmit} className="space-y-4">
              <FileInput
                aria-label="Assignment video"
                file={form.values.file}
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv"
                helperText={
                  latest?.status === "uploading"
                    ? "Choose the same video to resume your upload."
                    : "Choose a video to submit for this lesson."
                }
                disabled={form.isSubmitting}
                aria-invalid={!!(form.touched.file && form.errors.file)}
                aria-describedby={
                  form.touched.file && form.errors.file
                    ? "submission-file-error"
                    : undefined
                }
                onChange={(event) => {
                  void form.setFieldValue(
                    "file",
                    event.currentTarget.files?.[0] ?? null
                  )
                  void form.setFieldTouched("file", true, false)
                }}
                onRemove={() => {
                  void form.setFieldValue("file", null)
                }}
              />
              {form.touched.file && form.errors.file && (
                <p
                  id="submission-file-error"
                  className="text-xs text-destructive"
                >
                  {form.errors.file}
                </p>
              )}
              {form.isSubmitting && (
                <div role="status">
                  <p className="mb-2 text-xs tabular-nums">
                    Uploading {percentage}%
                  </p>
                  <progress
                    max={100}
                    value={percentage}
                    aria-label="Video upload progress"
                    className="h-2 w-full accent-primary"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <Button type="submit" disabled={form.isSubmitting}>
                  {form.isSubmitting
                    ? "Uploading…"
                    : latest?.status === "uploading"
                      ? "Resume upload"
                      : "Submit video"}
                </Button>
                {form.isSubmitting && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => controller.current?.abort()}
                  >
                    Pause upload
                  </Button>
                )}
              </div>
            </form>
          )}
        </>
      )}
      {error && <Alert variant="warning">{error}</Alert>}
    </section>
  )
}
