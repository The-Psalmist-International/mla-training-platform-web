import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { cn } from "@workspace/ui/lib/utils"

export function userInitials(name: string, fallback: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || fallback.toUpperCase()
  )
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = "default",
  className,
}: {
  name: string
  email?: string
  avatarUrl?: string | null
  size?: "sm" | "default" | "lg"
  className?: string
}) {
  return (
    <Avatar
      size={size}
      aria-hidden
      className={cn("after:border-0", className)}
    >
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback>
        {userInitials(name, email?.charAt(0) ?? "?")}
      </AvatarFallback>
    </Avatar>
  )
}
