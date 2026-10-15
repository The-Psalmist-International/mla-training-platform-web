import { useState } from "react"
import { BrandLoader } from "@workspace/ui/components/brand-loader"
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
            <BrandLoader label="Loading video" className="py-0 text-white [&_span:last-child]:text-white/80" />
          </div>
        </div>
      )}
    </div>
  )
}
