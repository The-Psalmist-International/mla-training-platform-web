import { useState } from "react"
import { Spinner } from "@workspace/ui/components/spinner"
import { VideoThumbnail } from "./VideoThumbnail"

export function VideoPlayer({
  src,
  thumbnailUrl,
  title,
}: {
  src?: string
  thumbnailUrl?: string | null
  title: string
}) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const loading = !src || loadedUrl !== src
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-md bg-muted"
      aria-busy={loading}
    >
      {src && (
        <iframe
          key={src}
          src={src}
          title={title}
          className={`absolute inset-0 size-full border-0 ${loading ? "invisible" : ""}`}
          allow="accelerometer; autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          onLoad={() => setLoadedUrl(src)}
        />
      )}
      {loading && (
        <div className="absolute inset-0">
          <VideoThumbnail
            thumbnailUrl={thumbnailUrl}
            loading="eager"
            className="size-full rounded-none"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <div className="flex size-12 items-center justify-center rounded-full bg-background/95 shadow-sm">
              <Spinner label="Loading video" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
