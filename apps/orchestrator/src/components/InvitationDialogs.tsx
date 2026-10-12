import { useId, useRef } from "react"
import { useBlocker, useRouter } from "@tanstack/react-router"
import { Form, FormikProvider, useFormik } from "formik"
import type { CurrentUser, InvitationListItem, UserRole } from "@workspace/data"
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt"
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { FormFeedback, FormInput } from "@workspace/ui/components/form-input"
import { SelectInput } from "@workspace/ui/components/select"
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import {
  sendInvitation,
  revokeInvitation,
  invitationErrorMessage,
  isInvitationQueueError,
  getInvitationStatus,
} from "../workspace/invitations"
import {
  invitationSchema,
  normalizeInvitationEmail,
} from "../workspace/invitation-validation"

export function InvitationRowActions({
  invitation,
  onSelect,
}: {
  invitation: InvitationListItem
  onSelect: (action: {
    type: "resend" | "revoke"
    invitation: InvitationListItem
  }) => void
}) {
  const status = getInvitationStatus(invitation)
  if (status === "accepted") return null
  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Resend invitation for ${invitation.email}`}
              onClick={() => onSelect({ type: "resend", invitation })}
            />
          }
        >
          <PaperPlaneTiltIcon aria-hidden />
        </TooltipTrigger>
        <TooltipContent>Resend invitation</TooltipContent>
      </Tooltip>
      {status === "pending" && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                aria-label={`Revoke invitation for ${invitation.email}`}
                onClick={() => onSelect({ type: "revoke", invitation })}
              />
            }
          >
            <ProhibitIcon aria-hidden />
          </TooltipTrigger>
          <TooltipContent>Revoke invitation</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

type InvitationModal = "create" | "resend" | "revoke"

export interface InvitationDialogProps {
  modal: InvitationModal
  invitation?: InvitationListItem
  actor: CurrentUser
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onClose: () => void
  onSuccess: (result: { kind: InvitationModal; email: string }) => void
  onPartialSuccess: () => void
}

const roleOptions = [
  { value: "admin", label: "Administrator" },
  { value: "instructor", label: "Instructor" },
  { value: "learner", label: "Learner" },
] as const

export function InvitationDialog({
  modal,
  invitation,
  actor,
  isLoading,
  isError,
  onRetry,
  onClose,
  onSuccess,
  onPartialSuccess,
}: InvitationDialogProps) {
  const { dataClients } = useRouter().options.context
  const id = useId()
  const pending = useRef(false)
  const creating = modal === "create"
  const revoking = modal === "revoke"
  const title = creating
    ? "Send invitation"
    : revoking
      ? "Revoke invitation"
      : "Resend invitation"
  const status = invitation && getInvitationStatus(invitation)
  const available =
    creating ||
    (!!invitation &&
      !isLoading &&
      !isError &&
      status !== "accepted" &&
      (!revoking || status === "pending"))
  const form = useFormik<{ email: string; role: UserRole }>({
    initialValues: { email: "", role: "learner" },
    validationSchema: creating ? invitationSchema : undefined,
    onSubmit: async (values, helpers) => {
      if (pending.current || !available) return
      // Recheck expiration at submission, not just when the modal rendered.
      if (!creating) {
        if (!invitation) return
        const currentStatus = getInvitationStatus(invitation)
        if (
          currentStatus === "accepted" ||
          (revoking && currentStatus !== "pending")
        ) {
          helpers.setStatus(
            "This invitation can no longer be changed. Refresh the table."
          )
          return
        }
      }
      pending.current = true
      helpers.setStatus(undefined)
      const email = creating
        ? normalizeInvitationEmail(values.email)
        : invitation!.email
      try {
        if (revoking) {
          await revokeInvitation(dataClients, actor, invitation!.id)
        } else {
          await sendInvitation(dataClients, actor, {
            email,
            role: creating ? values.role : invitation!.role,
          })
        }
      } catch (error) {
        helpers.setStatus(invitationErrorMessage(error))
        pending.current = false
        if (!revoking && isInvitationQueueError(error)) onPartialSuccess()
        return
      }
      pending.current = false
      helpers.setSubmitting(false)
      onSuccess({ kind: modal, email })
      onClose()
    },
  })
  useBlocker({
    shouldBlockFn: () => pending.current || form.isSubmitting,
    enableBeforeUnload: () => pending.current || form.isSubmitting,
  })
  const close = () => {
    if (!pending.current && !form.isSubmitting) onClose()
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent showCloseButton={!form.isSubmitting}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {creating
              ? "Invite someone to join the workspace with a selected role."
              : revoking
                ? "Cancel access through the selected invitation link."
                : "Create a replacement invitation with the same email and role."}
          </DialogDescription>
        </DialogHeader>
        <FormikProvider value={form}>
          <Form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            noValidate
            onSubmit={(event) => {
              if (pending.current || form.isSubmitting || !available)
                event.preventDefault()
              else form.handleSubmit(event)
            }}
          >
            <DialogBody className="space-y-4">
              {!available ? (
                isLoading ? (
                  <div role="status" className="space-y-3">
                    <span className="sr-only">Loading selected invitation</span>
                    <Skeleton
                      aria-hidden
                      className="h-10 w-full motion-reduce:animate-none"
                    />
                    <Skeleton
                      aria-hidden
                      className="h-16 w-full motion-reduce:animate-none"
                    />
                  </div>
                ) : (
                  <Alert variant="warning">
                    {isError
                      ? "We couldn't load the selected invitation. Try refreshing the table."
                      : status === "accepted"
                        ? "This invitation has been accepted and can no longer be resent or revoked."
                        : revoking && invitation
                          ? "Only pending invitations can be revoked. This invitation has expired or already been revoked."
                          : "This invitation is not on the current page or no longer matches these filters. Close this modal and select it from the table again."}
                  </Alert>
                )
              ) : creating ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor={`${id}-email`} className="font-medium">
                      Email
                    </label>
                    <FormInput
                      id={`${id}-email`}
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`${id}-role`} className="font-medium">
                      Role
                    </label>
                    <SelectInput<UserRole>
                      id={`${id}-role`}
                      name="role"
                      value={form.values.role}
                      onValueChange={(role) =>
                        void form.setFieldValue("role", role)
                      }
                      disabled={form.isSubmitting}
                      required
                      className="w-full"
                      options={roleOptions}
                      aria-describedby={
                        form.touched.role && form.errors.role
                          ? `${id}-role-error`
                          : undefined
                      }
                    />
                    {form.touched.role && form.errors.role && (
                      <p
                        id={`${id}-role-error`}
                        className="text-sm text-destructive"
                      >
                        {form.errors.role}
                      </p>
                    )}
                  </div>
                </>
              ) : invitation ? (
                <div className="flex items-center gap-3">
                  <Avatar size="lg" aria-hidden className="after:border-0">
                    <AvatarFallback>
                      {invitation.email
                        .split("@")[0]
                        .split(/[._+-]+/)
                        .slice(0, 2)
                        .map((part) => part.charAt(0))
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium break-all">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {
                        roleOptions.find(
                          (option) => option.value === invitation.role
                        )?.label
                      }
                    </p>
                  </div>
                </div>
              ) : null}
              {available &&
                (revoking ? (
                  <Alert variant="warning">
                    Once revoked, the recipient can't use this invitation link
                    to join the workspace.
                  </Alert>
                ) : (
                  <Alert>
                    Invitation links expire after 7 days. A new invitation link
                    replaces any existing pending links for the same email. If
                    sending fails, you can retry manually to create a
                    replacement.
                  </Alert>
                ))}
              <FormFeedback />
            </DialogBody>
            <DialogFooter>
              {available ? (
                <Button
                  type="submit"
                  variant={revoking ? "destructive" : "default"}
                  disabled={form.isSubmitting}
                >
                  {form.isSubmitting
                    ? revoking
                      ? "Revoking…"
                      : "Sending…"
                    : title}
                </Button>
              ) : !isLoading ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={form.isSubmitting}
                  onClick={onRetry}
                >
                  Refresh table
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={form.isSubmitting}
                onClick={close}
              >
                {available ? "Cancel" : "Close"}
              </Button>
            </DialogFooter>
          </Form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  )
}
