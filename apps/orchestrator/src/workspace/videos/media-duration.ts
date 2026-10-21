export const LESSON_VIDEO_MAX_SECONDS = 15 * 60

export function validateLessonVideoDuration(duration: number, media: "video" | "audio" = "video") {
  if (!Number.isFinite(duration) || duration <= 0)
    throw new Error("The video duration could not be verified.")
  if (duration > (media === "audio" ? 1800 : LESSON_VIDEO_MAX_SECONDS))
    throw new Error(media === "audio" ? "Lesson audio must be 30 minutes or shorter." : "Lesson videos must be 15 minutes or shorter.")
}

/** Best-effort early feedback. Bunny metadata remains the authoritative check. */
export async function checkLessonVideoFile(file: File, signal: AbortSignal, type: "video" | "audio" = "video") {
  if (signal.aborted) throw new DOMException("Upload cancelled", "AbortError")
  const duration = await new Promise<number | undefined>((resolve, reject) => {
    const media = document.createElement(type)
    const url = URL.createObjectURL(file)
    let timer: ReturnType<typeof setTimeout>
    const finish = (value?: number, aborted = false) => {
      clearTimeout(timer)
      signal.removeEventListener("abort", abort)
      media.onloadedmetadata = null
      media.onerror = null
      media.removeAttribute("src")
      media.load()
      URL.revokeObjectURL(url)
      if (aborted) reject(new DOMException("Upload cancelled", "AbortError"))
      else resolve(value)
    }
    const abort = () => finish(undefined, true)
    media.preload = "metadata"
    media.onloadedmetadata = () =>
      finish(Number.isFinite(media.duration) ? media.duration : undefined)
    media.onerror = () => finish()
    signal.addEventListener("abort", abort, { once: true })
    timer = setTimeout(() => finish(), 10000)
    media.src = url
  })
  if (duration !== undefined) validateLessonVideoDuration(duration, type)
}
