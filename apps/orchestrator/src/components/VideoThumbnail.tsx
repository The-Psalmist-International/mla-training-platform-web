import { useState } from "react"
import { FilmStripIcon } from "@phosphor-icons/react/dist/csr/FilmStrip"

export function VideoThumbnail({
  thumbnailUrl,
  className = "",
  compact = false,
  loading = "lazy",
}: {
  thumbnailUrl?: string | null
  className?: string
  compact?: boolean
  loading?: "lazy" | "eager"
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  let src: string | undefined
  try {
    const url = new URL(thumbnailUrl ?? "")
    if (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      thumbnailUrl !== failedUrl
    )
      src = url.href
  } catch {
    /* Missing or invalid images use the video placeholder. */
  }
  return (
    <div
      className={`relative flex aspect-video shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground outline -outline-offset-1 outline-black/10 dark:outline-white/10 ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading={loading}
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(thumbnailUrl ?? null)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <>
          <FilmStripIcon
            aria-hidden
            className={compact ? "size-5" : "size-10"}
          />
          <span className="sr-only">Video thumbnail unavailable</span>
        </>
      )}
    </div>
  )
}
