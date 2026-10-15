import { useQuery } from "@tanstack/react-query"
import { Link, useRouter } from "@tanstack/react-router"
import type { CurrentUser, EmailDeliveryListItem } from "@workspace/data"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { BrandLoader } from "@workspace/ui/components/brand-loader"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import {
  emailDeliveryDetailOptions,
  emailDeliveryErrorMessage,
  emailDeliveryTone,
  emailPurposeLabel,
  emailStatusDescriptions,
} from "../../workspace/emails/email-delivery"
import { formatPeopleCreatedAt } from "../../workspace/people/people"

export function EmailDeliveryDetails({
  email,
}: {
  email: EmailDeliveryListItem
}) {
  const timeline = [
    { label: "Created", at: email.createdAt },
    { label: "Sent", at: email.sentAt },
    { label: "Delivered", at: email.deliveredAt },
    { label: "Bounced", at: email.bouncedAt },
    { label: "Complained", at: email.complainedAt },
  ]
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-medium break-all">{email.recipient}</p>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={emailDeliveryTone(email.status)}>
            {email.status}
          </StatusBadge>
          <span className="text-xs text-muted-foreground">
            {emailPurposeLabel(email.purpose)}
          </span>
        </div>
      </div>
      <Alert
        variant={
          emailDeliveryTone(email.status) === "destructive" ? "warning" : "info"
        }
      >
        {emailStatusDescriptions[email.status]}
      </Alert>
      <dl className="grid gap-4 text-sm">
        {[
          ["Failure code", email.failureCode],
          ["Message ID", email.id],
          ["Provider message ID", email.providerMessageId],
          ["Notification ID", email.notificationId],
        ].map(([label, value]) => (
          <div key={label} className="space-y-1">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-medium break-all">{value ?? "Not recorded"}</dd>
          </div>
        ))}
      </dl>
      <div className="space-y-3">
        <h3 className="font-medium">
          Delivery timestamps{" "}
          <span className="font-normal text-muted-foreground">(UTC)</span>
        </h3>
        <dl className="space-y-3">
          {timeline.map(({ label, at }) => (
            <div
              key={label}
              className="flex flex-wrap justify-between gap-2 text-sm"
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd>
                {at ? (
                  <time dateTime={at}>{formatPeopleCreatedAt(at)}</time>
                ) : (
                  "Not recorded"
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-xs leading-5 text-muted-foreground">
          Delivery timestamps are retained even when a later bounce or complaint
          changes the final status.
        </p>
      </div>
    </div>
  )
}

export function EmailDeliveryDetailsDialog({
  id,
  user,
  onClose,
}: {
  id: string
  user: CurrentUser
  onClose: () => void
}) {
  const { dataClients } = useRouter().options.context
  const query = useQuery(emailDeliveryDetailOptions(dataClients, user, id))
  const email = query.data
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email delivery details</DialogTitle>
          <DialogDescription>
            Inspect the recorded delivery outcome for this email.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {query.isPending ? (
            <BrandLoader label="Loading email delivery details" className="py-6" />
          ) : query.isError ? (
            <Alert variant="warning">
              {emailDeliveryErrorMessage(query.error)}
            </Alert>
          ) : email ? (
            <EmailDeliveryDetails email={email} />
          ) : null}
        </DialogBody>
        <DialogFooter>
          {query.isError ? (
            <Button
              type="button"
              variant="outline"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              {query.isFetching ? "Trying again..." : "Try again"}
            </Button>
          ) : email ? (
            <>
              {email.purpose === "invitation" &&
                ["failed", "bounced", "skipped"].includes(email.status) && (
                  <Button
                    render={
                      <Link
                        to="/workspace/invitations"
                        search={{ q: email.recipient }}
                      />
                    }
                  >
                    Manage invitations
                  </Button>
                )}
              <Button
                type="button"
                variant="outline"
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
              >
                {query.isFetching ? "Refreshing..." : "Refresh details"}
              </Button>
            </>
          ) : null}
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
