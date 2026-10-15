import { useEffect, useId, useRef, useState } from "react"
import { useRouter, useBlocker } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { FileInput } from "@workspace/ui/components/file-input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import {
  videoDetailsOptions,
  videoPreviewOptions,
  syncVideo,
  libraryActionError,
  saveVideoThumbnail,
} from "../../workspace/library/library-actions"
import {
  uploadCourseThumbnail,
  validateThumbnailFile,
  ThumbnailUploadError,
} from "../../workspace/course/course-thumbnail"
import { VideoPlayer } from "./VideoPlayer"
import { formatVideoDuration, formatVideoSize } from "../../workspace/library/library"

export function VideoLibraryDialog({
  id,
  preview,
  user,
  onClose,
  onChanged,
}: {
  id: string
  preview: boolean
  user: CurrentUser
  onClose: () => void
  onChanged: (message?: string) => void
}) {
  const { dataClients } = useRouter().options.context
  const queryClient = useQueryClient()
  const inputId = useId()
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailOverride, setThumbnailOverride] = useState<
    string | null | undefined
  >(undefined)
  const [thumbnailError, setThumbnailError] = useState("")
  const [savingThumbnail, setSavingThumbnail] = useState(false)
  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview(null)
      return
    }
    const url = URL.createObjectURL(thumbnailFile)
    setThumbnailPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [thumbnailFile])
  const query = useQuery(videoDetailsOptions(dataClients, user, id))
  const playback = useQuery({
    ...videoPreviewOptions(dataClients, user, id),
    enabled: preview && query.data?.status === "ready" && !query.isError,
  })
  const pending = useRef(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [expired, setExpired] = useState(false)
  useEffect(() => {
    setExpired(false)
    if (!playback.data) return
    const timeout = setTimeout(
      () => setExpired(true),
      Math.max(0, playback.data.expires * 1000 - Date.now())
    )
    return () => clearTimeout(timeout)
  }, [playback.data])
  useBlocker({
    shouldBlockFn: () => pending.current,
    enableBeforeUnload: () => pending.current,
  })
  const close = () => {
    if (!pending.current) onClose()
  }
  const sync = async () => {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError("")
    try {
      const video = await syncVideo(dataClients, user, id)
      onChanged(`${video.title}: ${video.status.replaceAll("_", " ")}.`)
      await query.refetch()
    } catch (failure) {
      setError(libraryActionError(failure))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }
  const video = query.data
  const saveThumbnail = async () => {
    if (pending.current || !video || thumbnailError) return
    pending.current = true
    setBusy(true)
    setSavingThumbnail(true)
    setError("")
    try {
      let url =
        thumbnailOverride !== undefined
          ? thumbnailOverride
          : (video.thumbnailUrl ?? null)
      if (thumbnailFile) {
        url = await uploadCourseThumbnail(thumbnailFile)
        // Keep the uploaded URL for a retry if saving the metadata fails.
        setThumbnailOverride(url)
        setThumbnailFile(null)
      }
      const saved = await saveVideoThumbnail(dataClients, user, id, url)
      queryClient.setQueryData(
        videoDetailsOptions(dataClients, user, id).queryKey,
        saved
      )
      void queryClient
        .invalidateQueries({
          queryKey: [
            "workspace",
            dataClients.graphqlUrl,
            user.id,
            "course-management",
          ],
        })
        .catch(() => {})
      setThumbnailOverride(undefined)
      onChanged(url ? "Video thumbnail saved." : "Video thumbnail removed.")
    } catch (failure) {
      setError(
        failure instanceof ThumbnailUploadError
          ? failure.message
          : libraryActionError(failure)
      )
    } finally {
      pending.current = false
      setBusy(false)
      setSavingThumbnail(false)
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        className={preview ? "max-w-3xl" : undefined}
        showCloseButton={!busy}
      >
        <DialogHeader>
          <DialogTitle>
            {preview ? "Video preview" : "Video details"}
          </DialogTitle>
          <DialogDescription>
            {preview
              ? "Preview the selected video."
              : "Review the details of the video."}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {query.isPending ? (
            <div role="status">
              <span className="sr-only">Loading video details</span>
              <Skeleton className="aspect-video w-full" />
            </div>
          ) : query.isError ? (
            <Alert variant="warning">{libraryActionError(query.error)}</Alert>
          ) : video ? (
            <>
              {!preview && (
                <div className="space-y-2">
                  <label
                    htmlFor={`${inputId}-thumbnail`}
                    className="font-medium"
                  >
                    Thumbnail
                  </label>
                  <FileInput
                    id={`${inputId}-thumbnail`}
                    file={thumbnailFile}
                    previewUrl={
                      thumbnailPreview ??
                      (thumbnailOverride !== undefined
                        ? thumbnailOverride
                        : video.thumbnailUrl)
                    }
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy}
                    emptyText="Choose a video thumbnail"
                    helperText="JPEG, PNG, or WebP, up to 5 MiB. A 16:9 image works best."
                    removeLabel="Remove thumbnail"
                    onRemove={() => {
                      setThumbnailFile(null)
                      setThumbnailOverride(null)
                      setThumbnailError("")
                    }}
                    aria-invalid={!!thumbnailError}
                    aria-describedby={
                      thumbnailError ? `${inputId}-thumbnail-error` : undefined
                    }
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0]
                      event.currentTarget.value = ""
                      if (!file) return
                      try {
                        validateThumbnailFile(file)
                        setThumbnailFile(file)
                        setThumbnailError("")
                      } catch (failure) {
                        setThumbnailError(
                          failure instanceof Error
                            ? failure.message
                            : "Choose a valid image."
                        )
                      }
                    }}
                  />
                  {thumbnailError && (
                    <p
                      id={`${inputId}-thumbnail-error`}
                      role="alert"
                      className="text-sm text-destructive"
                    >
                      {thumbnailError}
                    </p>
                  )}
                  <Button
                    onClick={() => void saveThumbnail()}
                    disabled={
                      busy ||
                      !!thumbnailError ||
                      (!thumbnailFile && thumbnailOverride === undefined)
                    }
                  >
                    {savingThumbnail ? "Saving thumbnail..." : "Save thumbnail"}
                  </Button>
                </div>
              )}
              {preview &&
                (video.status !== "ready" ? (
                  <Alert>
                    This video is {video.status.replaceAll("_", " ")}. Check its
                    status before previewing.
                  </Alert>
                ) : playback.isPending ? (
                  <VideoPlayer
                    title={`Preview: ${video.title}`}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                ) : playback.isError ? (
                  <Alert variant="warning">
                    {libraryActionError(playback.error)}
                  </Alert>
                ) : expired ? (
                  <Alert>
                    The preview link expired. Refresh the preview to continue.
                  </Alert>
                ) : (
                  <VideoPlayer
                    title={`Preview: ${video.title}`}
                    src={playback.data.url}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                ))}
              <dl className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Name</dt>
                  <dd className="mt-1 font-medium">{video.title}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd className="mt-1 font-medium capitalize">
                    {video.status.replaceAll("_", " ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Duration</dt>
                  <dd className="mt-1">
                    {formatVideoDuration(video.durationSeconds)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">File size</dt>
                  <dd className="mt-1">{formatVideoSize(video.sizeBytes)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">File type</dt>
                  <dd className="mt-1 break-all">{video.mimeType}</dd>
                </div>
              </dl>
              {video.status === "pending_upload" && (
                <Alert>
                  Upload the original video file through Resume upload. A video
                  record alone does not mean its file has been transferred.
                </Alert>
              )}
            </>
          ) : null}
          {error && <Alert variant="warning">{error}</Alert>}
        </DialogBody>
        <DialogFooter>
          {query.isError ? (
            <Button
              variant="outline"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
            >
              Try again
            </Button>
          ) : (
            video && (
              <Button
                variant="outline"
                onClick={() => void sync()}
                disabled={busy || query.isFetching}
              >
                {busy ? "Checking..." : "Check status"}
              </Button>
            )
          )}
          {preview && video?.status === "ready" && (
            <Button
              variant="outline"
              onClick={() => void playback.refetch()}
              disabled={playback.isFetching}
            >
              {playback.isFetching ? "Refreshing..." : "Refresh preview"}
            </Button>
          )}
          <Button variant="outline" onClick={close} disabled={busy}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
