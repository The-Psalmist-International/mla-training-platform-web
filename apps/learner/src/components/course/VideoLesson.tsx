import { useEffect, useRef, useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
import {
  LearnerLessonPlaybackDocument,
  StartLearnerVideoProgressDocument,
  ReportLearnerVideoProgressDocument,
} from "@workspace/data/apollo/learner-course/query"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { BrandLoader } from "@workspace/ui/components/brand-loader"
import {
  learnerResource,
  learnerMutation,
  learnerCourseError,
  type CourseLesson,
  type CourseEnrollment,
} from "../../workspace/course"
import {
  learnerPlaybackUrl,
  playerMessage,
  playerPosition,
} from "../../workspace/video-player"

export function VideoLesson({
  lesson,
  courseId,
  enrollment,
  user,
  refresh,
}: {
  lesson: CourseLesson
  courseId: string
  enrollment: CourseEnrollment
  user: CurrentUser
  refresh: () => Promise<void>
}) {
  const { dataClients, auth } = useRouter().options.context
  const [generation, setGeneration] = useState(0)
  const [error, setError] = useState("")
  const [ready, setReady] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)
  const command = useRef<(method: string, value?: unknown) => void>(() => {})
  const resume = useRef(
    enrollment.progress.find((entry) => entry.itemId === lesson.id)
      ?.resumePositionSeconds ?? 0
  )
  const query = useQuery({
    ...learnerResource(
      dataClients,
      user,
      "playback",
      LearnerLessonPlaybackDocument,
      { courseId, moduleId: lesson.moduleId, itemId: lesson.id }
    ),
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
  let url: string | undefined
  try {
    if (query.data) url = learnerPlaybackUrl(query.data.lessonPlayback.url)
  } catch {
    /* Invalid playback URLs are never embedded. */
  }
  useEffect(() => {
    if (!url) return
    let disposed = false,
      sessionId = "",
      sequence = 0,
      position = resume.current,
      playing = false
    const duration = lesson.videoLesson?.videoAsset?.durationSeconds ?? 0
    let chain = Promise.resolve()
    let failed = false
    const origin = new URL(url).origin
    const send = (method: string, value?: unknown) =>
      frame.current?.contentWindow?.postMessage(
        JSON.stringify({
          context: "player.js",
          version: "0.0.11",
          method,
          value,
          listener: "mla-learner",
        }),
        origin
      )
    command.current = send
    const report = () => {
      if (!sessionId || failed || auth.getUser()?.id !== user.id) return
      const input = {
        sessionId,
        sequence: ++sequence,
        positionSeconds: position,
        playing,
      }
      chain = chain
        .then(async () => {
          await learnerMutation(
            dataClients,
            ReportLearnerVideoProgressDocument,
            { input }
          )
        })
        .catch((failure: unknown) => {
          failed = true
          if (!disposed) setError(learnerCourseError(failure))
        })
    }
    const subscribe = () => {
      for (const event of ["timeupdate", "play", "pause", "ended", "error"])
        send("addEventListener", event)
    }
    const receive = (event: MessageEvent<unknown>) => {
      if (
        disposed ||
        event.origin !== origin ||
        event.source !== frame.current?.contentWindow
      )
        return
      const data = playerMessage(event.data)
      if (!data) return
      if (data.event === "ready") {
        subscribe()
        if (resume.current > 0)
          send("setCurrentTime", Math.min(resume.current, duration))
        setReady(true)
      } else if (data.event === "timeupdate") {
        const value = playerPosition(data.value, duration)
        if (value !== null) position = value
      } else if (data.event === "getCurrentTime") {
        const value = playerPosition(data.value, duration)
        if (value !== null) {
          position = value
          report()
        }
      } else if (data.event === "play") {
        playing = true
        send("getCurrentTime")
      } else if (data.event === "pause" || data.event === "ended") {
        playing = false
        send("getCurrentTime")
        void refresh()
      } else if (data.event === "error")
        setError(
          `The ${lesson.type === "audio_lesson" ? "audio" : "video"} could not be played. Reload the player to try again.`
        )
    }
    window.addEventListener("message", receive)
    subscribe()
    void learnerMutation(dataClients, StartLearnerVideoProgressDocument, {
      input: {
        enrollmentId: enrollment.id,
        itemId: lesson.id,
        positionSeconds: resume.current,
      },
    })
      .then((data) => {
        if (!disposed) {
          sessionId = data.startVideoProgress.sessionId
          report()
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) setError(learnerCourseError(failure))
      })
    const interval = setInterval(() => {
      if (playing) send("getCurrentTime")
    }, 10000)
    const visibility = () => {
      if (document.visibilityState === "hidden") report()
    }
    document.addEventListener("visibilitychange", visibility)
    const timeout = setTimeout(() => {
      if (!disposed) setReady(true)
    }, 15000)
    return () => {
      playing = false
      report()
      disposed = true
      clearInterval(interval)
      clearTimeout(timeout)
      window.removeEventListener("message", receive)
      document.removeEventListener("visibilitychange", visibility)
      for (const event of ["timeupdate", "play", "pause", "ended", "error"])
        send("removeEventListener", event)
      command.current = () => {}
    }
  }, [
    url,
    generation,
    lesson.id,
    lesson.videoLesson?.videoAsset?.durationSeconds,
    enrollment.id,
    user.id,
    dataClients,
    auth,
    refresh,
  ])
  return (
    <section className="space-y-4 pt-6">
      {query.isPending ? (
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
          <BrandLoader label={lesson.type === "audio_lesson" ? "Loading audio…" : "Loading video…"} className="py-6" />
        </div>
      ) : url ? (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <BrandLoader label={lesson.type === "audio_lesson" ? "Loading audio…" : "Loading video…"} className="py-6" />
            </div>
          )}
          <iframe
            key={`${url}:${generation}`}
            ref={frame}
            src={url}
            title={lesson.title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            className="relative h-full w-full border-0"
            onLoad={() => {
              for (const event of [
                "timeupdate",
                "play",
                "pause",
                "ended",
                "error",
              ])
                command.current("addEventListener", event)
            }}
          />
        </div>
      ) : (
        <Alert variant="warning">This lesson {lesson.type === "audio_lesson" ? "audio" : "video"} could not be loaded.</Alert>
      )}
      {(error || query.isError || (!query.isPending && !url)) && (
        <Alert variant="warning">
          {error || learnerCourseError(query.error)}
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => {
              setError("")
              setReady(false)
              setGeneration((value) => value + 1)
              void query.refetch()
            }}
          >
            Reload player
          </Button>
        </Alert>
      )}
    </section>
  )
}
