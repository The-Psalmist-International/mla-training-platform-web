import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle"
import type { VideoSubmissionListItem } from "@workspace/data"

type Submission = VideoSubmissionListItem

export function VideoSubmissionConfirmation({
  status,
  feedback,
  failureCode,
}: Pick<Submission, "status"> &
  Partial<Pick<Submission, "feedback" | "failureCode">>) {
  if (status === "uploading") return null
  const needsAction = status === "failed" || status === "needs_revision"
  const Icon = needsAction ? WarningCircleIcon : CheckCircleIcon
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border border-border/70 px-4 py-4"
    >
      <Icon
        aria-hidden
        className={`mt-0.5 size-5 shrink-0 ${needsAction ? "text-destructive" : "text-primary"}`}
      />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium">
          {status === "failed"
            ? "Please upload your video again"
            : status === "needs_revision"
              ? "Your instructor requested an update"
              : "Video uploaded"}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {status === "failed"
            ? failureCode === "VIDEO_DURATION_EXCEEDED"
              ? "Your video exceeds the maximum length. Upload a shorter video to continue."
              : "We couldn’t prepare your video. Please try uploading it again."
            : status === "needs_revision"
              ? "Review the feedback below and submit a new video."
              : "Your response has been received. You can continue learning."}
        </p>
        {feedback && <p className="pt-2 text-sm leading-6">{feedback}</p>}
      </div>
    </div>
  )
}
