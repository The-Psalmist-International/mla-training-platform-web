import { useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { Markdown } from "@workspace/ui/components/markdown"
import { Alert } from "@workspace/ui/components/alert"
import { MarkLearnerTextReadDocument } from "@workspace/data/apollo/learner-course/query"
import {
  learnerCourseError,
  learnerMutation,
  type CourseLesson,
} from "../../workspace/course"

export function TextLesson({
  lesson,
  enrollmentId,
  completed,
  refresh,
}: {
  lesson: CourseLesson
  enrollmentId: string
  completed: boolean
  refresh: () => Promise<void>
}) {
  const { dataClients } = useRouter().options.context
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(completed)
  const [error, setError] = useState("")
  const markRead = async () => {
    if (busy || saved || completed) return
    // Optimistic: flip the switch immediately, roll back only on failure.
    setSaved(true)
    setBusy(true)
    setError("")
    try {
      await learnerMutation(dataClients, MarkLearnerTextReadDocument, {
        enrollmentId,
        itemId: lesson.id,
      })
      await refresh()
    } catch (failure) {
      setSaved(false)
      setError(learnerCourseError(failure))
      await refresh()
    } finally {
      setBusy(false)
    }
  }
  return (
    <div>
      <div className="py-6">
        {lesson.body ? (
          <Markdown value={lesson.body} />
        ) : (
          <p className="text-muted-foreground">
            There is no reading content for this lesson yet.
          </p>
        )}
      </div>
      {error && (
        <Alert variant="warning" className="mb-4">
          {error}
        </Alert>
      )}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <label
          className="inline-flex min-h-11 items-center gap-3 text-sm font-medium"
          title="Mark this lesson after reading."
        >
          <input
            type="checkbox"
            role="switch"
            aria-label="Mark as read"
            className="peer sr-only"
            checked={saved || completed}
            disabled={busy || saved || completed}
            onChange={() => void markRead()}
          />
          <span
            aria-hidden
            className="relative h-5 w-9 shrink-0 rounded-full bg-muted-foreground/30 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:opacity-70 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-background after:transition-transform peer-checked:after:translate-x-4"
          />
          Mark as read
        </label>
      </div>
    </div>
  )
}
