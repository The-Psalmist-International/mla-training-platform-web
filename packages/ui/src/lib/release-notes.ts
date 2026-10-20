export type ReleaseNote = {
  version: string
  date: string
  title: string
  summary: string
  changes: readonly { type: "new" | "improved" | "fixed"; text: string }[]
}

export type ReleaseNotesConfig = {
  appId: string
  appName: string
  version: string
  releases: readonly ReleaseNote[]
}

const sessionSeen = new Map<string, string>()

export function compareReleaseVersions(left: string, right: string) {
  const a = left.split(".").map(Number)
  const b = right.split(".").map(Number)
  for (let index = 0; index < 3; index++) {
    if (a[index] !== b[index]) return a[index]! > b[index]! ? 1 : -1
  }
  return 0
}

export function releaseNotesKey(appId: string, userId: string) {
  return `mla.release-notes.${encodeURIComponent(appId)}.${encodeURIComponent(userId)}`
}

type ReleaseStorage = Pick<Storage, "getItem" | "setItem">

function seenVersion(key: string, storage?: ReleaseStorage) {
  let saved: string | null | undefined
  try {
    saved = storage?.getItem(key)
  } catch {
    /* Storage may be blocked. */
  }
  const remembered = sessionSeen.get(key)
  const valid = (value: string | null | undefined): value is string =>
    typeof value === "string" &&
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)
  if (!valid(saved)) return remembered
  return remembered && compareReleaseVersions(remembered, saved) > 0
    ? remembered
    : saved
}

export function hasUnseenRelease(
  key: string,
  version: string,
  storage?: ReleaseStorage
) {
  const seen = seenVersion(key, storage)
  return !seen || compareReleaseVersions(version, seen) > 0
}

export function acknowledgeRelease(
  key: string,
  version: string,
  storage?: ReleaseStorage
) {
  const seen = seenVersion(key, storage)
  // A rollback or an older tab must not undo acknowledgement of a newer version.
  const latest =
    seen && compareReleaseVersions(seen, version) > 0 ? seen : version
  sessionSeen.set(key, latest)
  try {
    storage?.setItem(key, latest)
  } catch {
    /* Keep the in-memory fallback. */
  }
}

export function releaseDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}

/** Wait for route focus and existing dialogs without interrupting ongoing work. */
export function scheduleReleaseAnnouncement({
  isUnseen,
  isBlocked,
  show,
}: {
  isUnseen: () => boolean
  isBlocked: () => boolean
  show: () => void
}) {
  let timer: ReturnType<typeof setTimeout>
  const check = () => {
    if (!isUnseen()) return
    if (isBlocked()) {
      timer = setTimeout(check, 1000)
      return
    }
    show()
  }
  timer = setTimeout(check, 350)
  return () => clearTimeout(timer)
}
