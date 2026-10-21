import { useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
import { LessonDocumentPreviewDocument, MarkLearnerFileReadDocument } from "@workspace/data/apollo/documents/query"
import { DocumentReader } from "@workspace/ui/components/document-reader"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { learnerResource, learnerMutation, learnerCourseError, type CourseLesson, type CourseEnrollment } from "../../workspace/course"

export function FileLesson({ lesson, courseId, enrollment, user, refresh }: { lesson: CourseLesson; courseId: string; enrollment: CourseEnrollment; user: CurrentUser; refresh: () => Promise<void> }) {
  const { dataClients } = useRouter().options.context
  const [busy, setBusy] = useState(false), [optimistic, setOptimistic] = useState(false), [error, setError] = useState("")
  const asset = lesson.fileLesson?.fileAsset
  const progress = enrollment.progress.find(row => row.itemId === lesson.id)
  const completed = optimistic || (progress?.status === "completed" && progress.fileAssetId === asset?.id)
  const preview = useQuery({ ...learnerResource(dataClients, user, "document-preview", LessonDocumentPreviewDocument, { courseId, moduleId: lesson.moduleId, itemId: lesson.id }), enabled: asset?.status === "ready", staleTime: 0, refetchOnWindowFocus: false })
  const markRead = async () => {
    if (busy || completed || asset?.status !== "ready") return
    setBusy(true); setOptimistic(true); setError("")
    try { await learnerMutation(dataClients, MarkLearnerFileReadDocument, { enrollmentId: enrollment.id, itemId: lesson.id }); await refresh() }
    catch (failure) { setOptimistic(false); setError(learnerCourseError(failure)); void refresh() }
    finally { setBusy(false) }
  }
  const previewUrl = preview.data?.lessonFilePreview.url
  let safeUrl: string | undefined
  try {
    if (previewUrl) { const url = new URL(previewUrl); const api = new URL(dataClients.graphqlUrl); if (url.origin === api.origin && url.pathname === `/lesson-files/${asset?.id}/preview`) safeUrl = url.href }
  } catch { /* Never render a foreign or malformed preview URL. */ }
  return <div className="space-y-5">
    <p className="text-sm text-muted-foreground">{asset?.filename ?? "Lesson document"}</p>
    {asset?.status !== "ready" ? <p role="status" className="text-sm text-muted-foreground">This document preview is not ready yet. Try again shortly.</p>
      : preview.isError || (preview.data && !safeUrl) ? <Alert variant="warning">The secure preview could not be loaded. <Button variant="ghost" onClick={() => void preview.refetch()}>Try again</Button></Alert>
      : safeUrl ? <DocumentReader key={`${safeUrl}:${preview.dataUpdatedAt}`} url={safeUrl} title={lesson.title} onRetry={() => void preview.refetch()} />
      : <p role="status">Loading secure document…</p>}
    {error && <Alert variant="warning">{error}</Alert>}
    <Button type="button" variant={completed ? "outline" : "default"} disabled={busy || completed || asset?.status !== "ready"} aria-busy={busy} onClick={() => void markRead()}>{completed ? "Marked as read" : busy ? "Saving…" : "Mark as read"}</Button>
  </div>
}
