// Bunny Stream implements the Player.js messaging protocol.
export function learnerPlaybackUrl(value: string) {
  const url = new URL(value)
  if (
    url.protocol !== "https:" ||
    url.hostname !== "player.mediadelivery.net" ||
    !url.pathname.startsWith("/embed/")
  )
    throw new Error("Invalid lesson player")
  url.searchParams.set("autoplay", "false")
  // Let the player remember the browser-local position (dashboard
  // "remember position" stays effective). The server-side resume seek on
  // "ready" remains authoritative whenever enrollment progress exists.
  url.searchParams.set("rememberPosition", "true")
  url.searchParams.delete("rememberSettings")
  return url.href
}
export function playerMessage(
  value: unknown
): { event: string; value?: unknown } | null {
  try {
    const data: unknown = typeof value === "string" ? JSON.parse(value) : value
    if (
      !data ||
      typeof data !== "object" ||
      !("context" in data) ||
      data.context !== "player.js" ||
      !("event" in data) ||
      typeof data.event !== "string"
    )
      return null
    return {
      event: data.event,
      value: "value" in data ? data.value : undefined,
    }
  } catch {
    return null
  }
}
export function playerPosition(value: unknown, duration: number) {
  let candidate = value
  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate) as unknown
    } catch {
      return null
    }
  }
  const position =
    typeof candidate === "object" &&
    candidate !== null &&
    "seconds" in candidate
      ? candidate.seconds
      : candidate
  return typeof position === "number" &&
    Number.isFinite(position) &&
    position >= 0 &&
    position <= duration
    ? position
    : null
}
