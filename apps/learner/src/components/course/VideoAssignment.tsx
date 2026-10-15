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
import { BrandLoader } from "@workspace/ui/components/brand-loader"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { EmptyState } from "@workspace/ui/components/empty-state"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { HourglassMediumIcon } from "@phosphor-icons/react/dist/csr/HourglassMedium"
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info"
import { StopIcon } from "@phosphor-icons/react/dist/csr/Stop"
import { VideoCameraIcon } from "@phosphor-icons/react/dist/csr/VideoCamera"
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple"
import { formatDuration, formatRemaining } from "./AssessmentLesson"
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
  const [method, setMethod] = useState<"upload" | "record">("upload")
  const maxDurationSeconds = lesson.videoPrompt?.maxDurationSeconds ?? 300
  const useRecording = async (file: File) => {
    await form.setFieldValue("file", file)
    await form.setFieldTouched("file", true, false)
    await form.submitForm()
  }
  return (
    <section className="space-y-5 pt-6">
      <Markdown value={lesson.videoPrompt?.instructions ?? ""} />
      <div className="rounded-lg border border-border/70 bg-muted/40 px-4 py-3">
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <HourglassMediumIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <dt className="text-muted-foreground">Maximum length</dt>
            <dd className="font-medium tabular-nums">
              {formatDuration(
                lesson.videoPrompt?.maxDurationSeconds ?? 300
              )}
            </dd>
          </div>
        </dl>
      </div>
      {!lesson.videoPrompt?.requiresReview && (
        <p className="text-sm text-muted-foreground">
          This lesson completes after the video passes processing.
        </p>
      )}
      {query.isPending ? (
        <BrandLoader label="Loading your submissions…" />
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
              <div
                role="group"
                aria-label="Submission method"
                className="flex w-fit items-center gap-1 rounded-lg border border-border p-1"
              >
                <Button
                  type="button"
                  variant={method === "upload" ? "secondary" : "ghost"}
                  aria-pressed={method === "upload"}
                  disabled={form.isSubmitting}
                  onClick={() => setMethod("upload")}
                >
                  <UploadSimpleIcon aria-hidden />
                  Upload video
                </Button>
                <Button
                  type="button"
                  variant={method === "record" ? "secondary" : "ghost"}
                  aria-pressed={method === "record"}
                  disabled={form.isSubmitting}
                  onClick={() => setMethod("record")}
                >
                  <VideoCameraIcon aria-hidden />
                  Record video
                </Button>
              </div>
              {method === "record" ? (
                <InAppRecorder
                  maxDurationSeconds={maxDurationSeconds}
                  disabled={form.isSubmitting}
                  onUse={(file) => void useRecording(file)}
                />
              ) : (
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
              )}
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

type RecorderPhase =
  | "idle"
  | "preview"
  | "recording"
  | "recorded"
  | "denied"
  | "unsupported"

function pickRecordingMimeType() {
  if (
    typeof MediaRecorder === "undefined" ||
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  )
    return null
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ]
  try {
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? null
  } catch {
    return null
  }
}

function InAppRecorder({
  maxDurationSeconds,
  disabled,
  onUse,
}: {
  maxDurationSeconds: number
  disabled: boolean
  onUse: (file: File) => void
}) {
  const [phase, setPhase] = useState<RecorderPhase>("idle")
  const [problem, setProblem] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const liveRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const takeRef = useRef<Blob | null>(null)
  const mimeRef = useRef("")
  const startedAtRef = useRef(0)
  const stopTimerRef = useRef<number | null>(null)
  const tickRef = useRef<number | null>(null)

  // The preview <video> only mounts once we leave idle, so (re)attach the
  // live stream whenever it is rendered while a stream is active.
  useEffect(() => {
    if (
      (phase === "preview" || phase === "recording") &&
      streamRef.current &&
      liveRef.current &&
      liveRef.current.srcObject !== streamRef.current
    ) {
      liveRef.current.srcObject = streamRef.current
      void liveRef.current.play().catch(() => {})
    }
  }, [phase])

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (liveRef.current) liveRef.current.srcObject = null
  }
  const clearTimers = () => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
  }
  useEffect(
    () => () => {
      clearTimers()
      try {
        recorderRef.current?.state !== "inactive" &&
          recorderRef.current?.stop()
      } catch {
        /* Recorder already settled. */
      }
      stopTracks()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const startCamera = async () => {
    setProblem("")
    const mimeType = pickRecordingMimeType()
    if (!mimeType) {
      setPhase("unsupported")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: true,
      })
      mimeRef.current = mimeType
      streamRef.current = stream
      if (liveRef.current) {
        liveRef.current.srcObject = stream
        await liveRef.current.play().catch(() => {})
      }
      setPhase("preview")
    } catch (error) {
      setPhase(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "denied"
          : "idle"
      )
      setProblem(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Camera and microphone access was blocked. Allow access in your browser, then try again."
          : "The camera could not be started. Check that nothing else is using it, then try again."
      )
    }
  }

  const finishRecording = () => {
    clearTimers()
    try {
      if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop()
    } catch {
      setPhase("preview")
    }
  }

  const startRecording = () => {
    const stream = streamRef.current
    if (!stream) return
    chunksRef.current = []
    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeRef.current,
        videoBitsPerSecond: 2_500_000,
      })
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeRef.current })
        chunksRef.current = []
        if (blob.size === 0) {
          setProblem("Nothing was captured. Try recording again.")
          setPhase("preview")
          return
        }
        takeRef.current = blob
        setPreviewUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous)
          return URL.createObjectURL(blob)
        })
        setPhase("recorded")
      }
      recorder.onerror = () => {
        setProblem("Recording was interrupted. Try again.")
        setPhase("preview")
      }
      startedAtRef.current = Date.now()
      setElapsed(0)
      recorder.start(250)
      setPhase("recording")
      tickRef.current = window.setInterval(
        () => setElapsed(Date.now() - startedAtRef.current),
        500
      )
      stopTimerRef.current = window.setTimeout(
        finishRecording,
        maxDurationSeconds * 1000
      )
    } catch {
      setProblem("Recording could not start on this device. Try uploading instead.")
    }
  }

  const retake = () => {
    takeRef.current = null
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    setElapsed(0)
    setPhase(streamRef.current ? "preview" : "idle")
  }

  const useTake = () => {
    const blob = takeRef.current
    if (!blob || blob.size === 0) {
      setProblem("This recording could not be attached. Try again.")
      return
    }
    const extension = (blob.type || mimeRef.current).includes("mp4")
      ? "mp4"
      : "webm"
    const stamp = new Date().toISOString().replace(/[:.]/g, "-")
    onUse(
      new File([blob], `recording-${stamp}.${extension}`, {
        type: blob.type || mimeRef.current,
      })
    )
  }

  const remaining = Math.max(0, maxDurationSeconds * 1000 - elapsed)
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      {phase === "unsupported" ? (
        <Alert variant="warning">
          In-app recording is not supported in this browser. Upload a video
          file instead.
        </Alert>
      ) : (
        <>
          {(phase === "preview" || phase === "recording") && (
            <div className="relative aspect-video overflow-hidden rounded-md bg-black">
              <video
                ref={liveRef}
                muted
                playsInline
                aria-label="Camera preview"
                className="h-full w-full object-cover"
              />
              {phase === "recording" && (
                <p
                  role="timer"
                  aria-live="off"
                  className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white tabular-nums"
                >
                  <span
                    aria-hidden
                    className="size-2 animate-pulse rounded-full bg-red-500"
                  />
                  {formatRemaining(remaining)} left
                </p>
              )}
            </div>
          )}
          {phase === "recorded" && previewUrl && (
            <div className="space-y-2">
              <video
                src={previewUrl}
                controls
                playsInline
                aria-label="Recorded video preview"
                className="aspect-video w-full rounded-md bg-black"
              />
            </div>
          )}
          {problem && <Alert variant="warning">{problem}</Alert>}
          <div className="flex flex-wrap gap-3">
            {phase === "idle" || phase === "denied" ? (
              <div className="flex w-full items-center justify-center rounded-lg border border-dashed border-border/70 px-6 py-10">
                <EmptyState
                  icon={VideoCameraIcon}
                  title="Record your answer"
                  description={
                    phase === "denied"
                      ? "Camera access was blocked. Allow it in your browser, then enable the camera to record up to the maximum length."
                      : `Record up to ${formatDuration(maxDurationSeconds)} with your camera and microphone, then submit it as your answer.`
                  }
                  action={
                    <Button
                      type="button"
                      disabled={disabled}
                      onClick={() => void startCamera()}
                    >
                      <VideoCameraIcon aria-hidden />
                      Enable camera
                    </Button>
                  }
                />
              </div>
            ) : phase === "preview" ? (
              <>
                <Button
                  type="button"
                  disabled={disabled}
                  onClick={startRecording}
                  className="w-full"
                >
                  <VideoCameraIcon aria-hidden />
                  Start recording
                </Button>
                <p className="flex w-full items-center justify-center">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          aria-label={`Recording stops automatically at ${formatDuration(maxDurationSeconds)}`}
                          className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      }
                    >
                      <InfoIcon aria-hidden className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Recording stops automatically at{" "}
                      {formatDuration(maxDurationSeconds)}.
                    </TooltipContent>
                  </Tooltip>
                </p>
              </>
            ) : phase === "recording" ? (
              <Button
                type="button"
                variant="destructive"
                onClick={finishRecording}
                className="w-full bg-destructive text-white hover:bg-destructive/90 hover:text-white dark:bg-destructive dark:hover:bg-destructive/90"
              >
                <StopIcon aria-hidden weight="fill" />
                Stop recording
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  disabled={disabled}
                  onClick={useTake}
                  className="w-full"
                >
                  <UploadSimpleIcon aria-hidden />
                  Use this recording
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  onClick={retake}
                  className="w-full"
                >
                  Retake
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
