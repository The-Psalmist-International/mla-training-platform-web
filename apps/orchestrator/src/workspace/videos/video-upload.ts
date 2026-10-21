import type { LessonUpload } from "../library/library-actions"
import * as yup from "yup"

const mimeTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
]
const extensions: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
}
const audioExtensions: Record<string, string> = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg" }
export function audioMimeType(file: Pick<File, "name" | "type">) {
  return audioExtensions[file.name.split(".").at(-1)?.toLowerCase() ?? ""]
}
export function videoMimeType(file: Pick<File, "name" | "type">) {
  return mimeTypes.includes(file.type)
    ? file.type
    : !file.type
      ? extensions[file.name.split(".").at(-1)?.toLowerCase() ?? ""]
      : undefined
}
export const videoUploadSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Enter a video title.")
    .max(200, "Title must be 200 characters or fewer."),
  file: yup
    .mixed<File>()
    .required("Choose a video file.")
    .test({
      name: "video",
      message: "Choose an MP4, WebM, MOV, AVI, or MKV video.",
      skipAbsent: true,
      test: (file) => !!videoMimeType(file),
    })
    .test({
      name: "nonempty",
      message: "Choose a non-empty video file.",
      skipAbsent: true,
      test: (file) => file.size > 0,
    }),
})
export class UploadPausedError extends Error {
  constructor() {
    super("Upload paused. You can continue with the same file.")
  }
}
export class VideoTransferError extends Error {}
function checkAbort(signal: AbortSignal) {
  if (signal.aborted) throw new UploadPausedError()
}
export function uploadFingerprint(
  userId: string,
  assetId: string,
  file: Pick<File, "name" | "size" | "lastModified" | "type">
) {
  return JSON.stringify([
    "martyrs-lesson-upload",
    userId,
    assetId,
    file.name,
    file.size,
    file.lastModified,
    file.type,
  ])
}
export async function uploadLessonFile({
  file,
  title,
  userId,
  assetId,
  target,
  renew,
  signal,
  onProgress,
}: {
  file: File
  title: string
  userId: string
  assetId: string
  target: LessonUpload["upload"]
  renew: () => Promise<LessonUpload["upload"]>
  signal: AbortSignal
  onProgress: (percentage: number) => void
}) {
  const { Upload } = await import("tus-js-client")
  if (signal.aborted) throw new UploadPausedError()
  let credentials = target
  if (credentials.endpoint !== "https://video.bunnycdn.com/tusupload")
    throw new Error("Invalid upload endpoint")
  await new Promise<void>((resolve, reject) => {
    let settled = false
    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      signal.removeEventListener("abort", pause)
      if (error) reject(error)
      else resolve()
    }
    const upload = new Upload(file, {
      endpoint: credentials.endpoint,
      fingerprint: async () => uploadFingerprint(userId, assetId, file),
      removeFingerprintOnSuccess: true,
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
      metadata: { filetype: videoMimeType(file) ?? audioMimeType(file) ?? file.type, title },
      onBeforeRequest: async (request) => {
        checkAbort(signal)
        const requestUrl = new URL(request.getURL(), target.endpoint)
        if (
          requestUrl.origin !== "https://video.bunnycdn.com" ||
          !requestUrl.pathname.startsWith("/tusupload")
        )
          throw new VideoTransferError(
            "The saved upload destination is invalid. Close this dialog and resume from the library."
          )
        if (credentials.expires <= Math.floor(Date.now() / 1000) + 30)
          credentials = await renew()
        checkAbort(signal)
        if (
          credentials.endpoint !== target.endpoint ||
          credentials.videoId !== target.videoId ||
          credentials.libraryId !== target.libraryId
        )
          throw new Error("Upload target changed")
        request.setHeader("AuthorizationSignature", credentials.signature)
        request.setHeader("AuthorizationExpire", String(credentials.expires))
        request.setHeader("LibraryId", credentials.libraryId)
        request.setHeader("VideoId", credentials.videoId)
      },
      onProgress: (uploaded, total) => {
        if (!signal.aborted && total > 0)
          onProgress(Math.min(100, Math.round((uploaded / total) * 100)))
      },
      onError: () =>
        finish(
          signal.aborted
            ? new UploadPausedError()
            : new VideoTransferError(
                "Video transfer failed. Retry with the same file to resume."
              )
        ),
      onSuccess: () => finish(),
    })
    function pause() {
      void upload.abort(false).then(
        () => finish(new UploadPausedError()),
        () => finish(new UploadPausedError())
      )
    }
    signal.addEventListener("abort", pause, { once: true })
    void upload
      .findPreviousUploads()
      .catch(() => [])
      .then((previous) => {
        if (signal.aborted || settled) return
        if (previous[0]) upload.resumeFromPreviousUpload(previous[0])
        upload.start()
      })
      .catch(() =>
        finish(
          new VideoTransferError(
            "Could not start the video transfer. Retry with the same file."
          )
        )
      )
  })
}
