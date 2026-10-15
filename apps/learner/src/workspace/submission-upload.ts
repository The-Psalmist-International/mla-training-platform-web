import type { StartLearnerSubmissionMutation } from "@workspace/data/apollo/learner-course/query"
export type SubmissionTarget =
  StartLearnerSubmissionMutation["startVideoSubmission"]["upload"]
export function submissionMimeType(file: Pick<File, "type" | "name">) {
  const allowed = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ]
  if (allowed.includes(file.type)) return file.type
  if (file.type) return undefined
  return (
    {
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      mkv: "video/x-matroska",
    } as Record<string, string>
  )[file.name.split(".").at(-1)?.toLowerCase() ?? ""]
}
export async function transferSubmission({
  file,
  userId,
  submissionId,
  target,
  renew,
  signal,
  onProgress,
}: {
  file: File
  userId: string
  submissionId: string
  target: SubmissionTarget
  renew: () => Promise<SubmissionTarget>
  signal: AbortSignal
  onProgress: (percentage: number) => void
}) {
  if (target.endpoint !== "https://video.bunnycdn.com/tusupload")
    throw new Error("Invalid upload destination")
  const { Upload } = await import("tus-js-client")
  if (signal.aborted)
    throw new Error("Upload paused. Select the same video to resume.")
  let credentials = target
  return new Promise<void>((resolve, reject) => {
    let settled = false
    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      signal.removeEventListener("abort", pause)
      if (error) reject(error)
      else resolve()
    }
    const upload = new Upload(file, {
      endpoint: target.endpoint,
      fingerprint: async () =>
        JSON.stringify([
          "mla-learner-submission",
          userId,
          submissionId,
          file.name,
          file.size,
          file.lastModified,
          file.type,
        ]),
      removeFingerprintOnSuccess: true,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filetype: submissionMimeType(file) ?? file.type,
        title: file.name,
      },
      onBeforeRequest: async (request) => {
        if (signal.aborted) throw new Error("Upload paused")
        const destination = new URL(request.getURL(), target.endpoint)
        if (
          destination.origin !== "https://video.bunnycdn.com" ||
          !destination.pathname.startsWith("/tusupload")
        )
          throw new Error("Invalid saved upload destination")
        if (credentials.expires <= Date.now() / 1000 + 30)
          credentials = await renew()
        if (
          signal.aborted ||
          credentials.endpoint !== target.endpoint ||
          credentials.videoId !== target.videoId ||
          credentials.libraryId !== target.libraryId
        )
          throw new Error("Upload destination changed")
        request.setHeader("AuthorizationSignature", credentials.signature)
        request.setHeader("AuthorizationExpire", String(credentials.expires))
        request.setHeader("LibraryId", credentials.libraryId)
        request.setHeader("VideoId", credentials.videoId)
      },
      onProgress: (sent, total) => {
        if (!signal.aborted && total > 0)
          onProgress(Math.min(100, Math.round((sent / total) * 100)))
      },
      onError: () =>
        finish(
          new Error(
            signal.aborted
              ? "Upload paused. Select the same video to resume."
              : "Upload interrupted. Try again with the same video to resume."
          )
        ),
      onSuccess: () => finish(),
    })
    function pause() {
      void upload.abort(false).then(
        () =>
          finish(new Error("Upload paused. Select the same video to resume.")),
        () =>
          finish(new Error("Upload paused. Select the same video to resume."))
      )
    }
    signal.addEventListener("abort", pause, { once: true })
    void upload
      .findPreviousUploads()
      .catch(() => [])
      .then((previous) => {
        if (signal.aborted || settled) return
        if (previous.at(0)) upload.resumeFromPreviousUpload(previous[0]!)
        upload.start()
      })
      .catch(() =>
        finish(
          new Error("Upload could not start. Try again with the same video.")
        )
      )
  })
}
