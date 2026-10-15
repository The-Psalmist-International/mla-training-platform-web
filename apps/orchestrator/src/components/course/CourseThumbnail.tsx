import { useState } from "react"
import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen"

const covers = [
  "from-blue-100 to-indigo-200 text-blue-800 dark:from-blue-950 dark:to-indigo-900 dark:text-blue-200",
  "from-emerald-100 to-teal-200 text-emerald-800 dark:from-emerald-950 dark:to-teal-900 dark:text-emerald-200",
  "from-amber-100 to-orange-200 text-amber-800 dark:from-amber-950 dark:to-orange-900 dark:text-amber-200",
  "from-violet-100 to-purple-200 text-violet-800 dark:from-violet-950 dark:to-purple-900 dark:text-violet-200",
]

export function CourseThumbnail({
  title,
  thumbnailUrl,
  className,
  compact = false,
  showPlaceholder = true,
}: {
  title: string
  thumbnailUrl?: string | null
  className?: string
  compact?: boolean
  showPlaceholder?: boolean
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const color =
    Array.from(title).reduce(
      (sum, character) => sum + character.charCodeAt(0),
      0
    ) % covers.length
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
    /* Courses without an image use their generated cover. */
  }
  if (!src && !showPlaceholder) return null
  return (
    <div
      className={`relative flex aspect-video shrink-0 items-center justify-center overflow-hidden ${className?.includes("rounded-none") ? "" : "rounded-md"} bg-linear-to-br outline -outline-offset-1 outline-black/10 dark:outline-white/10 ${covers[color]} ${className ?? ""}`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(thumbnailUrl ?? null)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className={`flex items-center gap-3 ${compact ? "px-2" : "px-5"}`}
        >
          <BookOpenIcon className={compact ? "size-5" : "size-9 shrink-0"} />
          {!compact && (
            <span className="line-clamp-3 max-w-60 text-lg leading-snug font-semibold">
              {title || "New course"}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
