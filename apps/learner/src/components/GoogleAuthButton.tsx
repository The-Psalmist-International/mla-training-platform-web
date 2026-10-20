import { useRef } from "react"
import { Button } from "@workspace/ui/components/button"
import { useToast } from "@workspace/ui/components/toaster"
import { googleAuthorizationUrl } from "../auth/session"

export function GoogleAuthButton({
  graphqlUrl,
  disabled,
  pending,
  onPendingChange,
}: {
  graphqlUrl: string
  disabled: boolean
  pending: boolean
  onPendingChange: (pending: boolean) => void
}) {
  const { toast } = useToast()
  const starting = useRef(false)
  const google = async () => {
    if (disabled || pending || starting.current) return
    starting.current = true
    onPendingChange(true)
    try {
      window.location.assign(
        await googleAuthorizationUrl(graphqlUrl, window.location.origin)
      )
    } catch (error) {
      toast({
        title: "Google authentication unavailable",
        description:
          error instanceof Error ? error.message : "Please try again.",
        status: "error",
      })
      starting.current = false
      onPendingChange(false)
    }
  }
  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-3"
        disabled={disabled || pending}
        onClick={() => void google()}
        aria-busy={pending}
      >
        <img
          src="/images/google.png"
          alt=""
          aria-hidden
          className="size-5 object-contain"
        />
        {pending ? "Connecting to Google…" : "Continue with Google"}
      </Button>
      <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>or continue with email</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </>
  )
}
