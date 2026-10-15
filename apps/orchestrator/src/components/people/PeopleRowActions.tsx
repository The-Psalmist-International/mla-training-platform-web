import { useId, useRef } from "react"
import { useBlocker, useRouter } from "@tanstack/react-router"
import { Form, FormikProvider, useFormik } from "formik"
import { useToast } from "@workspace/ui/components/toaster"
import * as yup from "yup"
import type { CurrentUser, UserListItem, UserRole } from "@workspace/data"
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple"
import { UserMinusIcon } from "@phosphor-icons/react/dist/csr/UserMinus"
import { UserCheckIcon } from "@phosphor-icons/react/dist/csr/UserCheck"
import { Button } from "@workspace/ui/components/button"
import { ConfirmationDialog } from "@workspace/ui/components/confirmation-dialog"
import { Alert } from "@workspace/ui/components/alert"
import { UserAvatar } from "@workspace/ui/components/user-avatar"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { FormFeedback } from "@workspace/ui/components/form-input"
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
import { TableRowActions } from "@workspace/ui/components/table-row-actions"
import {
  peopleAccessErrorMessage,
  updatePeopleAccess,
} from "../../workspace/people/people"

export type PeopleAction = {
  person: UserListItem
  type: "role" | "status"
}

export function PeopleRowActions({
  person,
  onSelect,
}: {
  person: UserListItem
  onSelect: (action: PeopleAction) => void
}) {
  const statusLabel = person.disabledAt ? "Enable account" : "Disable account"
  const StatusIcon = person.disabledAt ? UserCheckIcon : UserMinusIcon
  return (
    <TableRowActions
      subject={person.name}
      primary={[
        {
          label: "Change role",
          icon: <PencilSimpleIcon aria-hidden />,
          onSelect: () => onSelect({ person, type: "role" }),
        },
      ]}
      secondary={[
        {
          label: statusLabel,
          icon: <StatusIcon aria-hidden />,
          destructive: !person.disabledAt,
          onSelect: () => onSelect({ person, type: "status" }),
        },
      ]}
    />
  )
}

const roleSchema = yup.object({
  role: yup
    .mixed<UserRole>()
    .oneOf(["admin", "instructor", "learner"])
    .required(),
})

export function PeopleSelectionDialog({
  type,
  person,
  actor,
  isLoading,
  isError,
  onRetry,
  onClose,
  onSuccess,
}: {
  type: PeopleAction["type"]
  person?: UserListItem
  actor: CurrentUser
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onClose: () => void
  onSuccess: (person: UserListItem) => void
}) {
  if (person && !isError)
    return (
      <PeopleAccessDialog
        action={{ person, type }}
        actor={actor}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    )
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "role" ? "Change role" : "Account access"}
          </DialogTitle>
          <DialogDescription>
            {type === "role"
              ? "Select a new role for the selected user."
              : "Manage account access for the selected user."}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div role="status" className="space-y-3">
              <span className="sr-only">Loading selected person</span>
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
                ? "We couldn't load the selected person. Try refreshing the table."
                : "This person is not on the current page or no longer matches these filters. Close this modal and select them from the table again."}
            </Alert>
          )}
        </DialogBody>
        <DialogFooter>
          {!isLoading && (
            <Button type="button" variant="outline" onClick={onRetry}>
              Refresh table
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PeopleAccessDialog({
  action,
  actor,
  onClose,
  onSuccess,
}: {
  action: PeopleAction
  actor: CurrentUser
  onClose: () => void
  onSuccess: (person: UserListItem) => void
}) {
  const { auth, dataClients } = useRouter().options.context
  const { toast } = useToast()
  const id = useId()
  const pending = useRef(false)
  useBlocker({
    shouldBlockFn: () => pending.current,
    enableBeforeUnload: () => pending.current,
  })
  const { person, type } = action
  const disabling = !person.disabledAt
  const title =
    type === "role"
      ? "Change role"
      : disabling
        ? "Disable account"
        : "Enable account"
  const form = useFormik({
    initialValues: { role: person.role },
    validationSchema: roleSchema,
    onSubmit: async ({ role }, helpers) => {
      if (pending.current || (type === "role" && role === person.role)) return
      pending.current = true
      helpers.setStatus(undefined)
      let updated: UserListItem
      try {
        updated = await updatePeopleAccess(
          dataClients,
          actor,
          person.id,
          type === "role" ? { type, role } : { type, disabled: disabling }
        )
      } catch (error) {
        if (auth.getUser() === actor)
          toast({
            title: "Access could not be updated",
            description: peopleAccessErrorMessage(error),
            status: "error",
          })
        pending.current = false
        return
      }
      pending.current = false
      // Access mutations revoke all target sessions, including our own.
      if (person.id === actor.id && auth.getUser() === actor) {
        void auth.clearSession().catch(() => {})
      }
      onSuccess(updated)
      onClose()
    },
  })
  if (type === "status")
    return (
      <ConfirmationDialog
        title={title}
        variant={disabling || person.id === actor.id ? "warning" : "info"}
        busy={form.isSubmitting}
        onClose={onClose}
        description={
          person.id === actor.id ? (
            "You are changing your own access. You will be signed out and may lose access to this workspace."
          ) : (
            <>
              {disabling ? "Disable" : "Enable"} the account for{" "}
              <strong>{person.name || person.email}</strong>?{" "}
              {disabling
                ? "They will no longer be able to sign in."
                : "They will be able to sign in again with their existing role."}{" "}
              This change signs them out of all current sessions.
            </>
          )
        }
        actions={
          <>
            <Button
              variant="outline"
              disabled={form.isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant={disabling ? "destructive" : "default"}
              disabled={form.isSubmitting}
              onClick={() => void form.submitForm()}
            >
              {form.isSubmitting ? "Saving…" : title}
            </Button>
          </>
        }
      />
    )
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending.current) onClose()
      }}
    >
      <DialogContent showCloseButton={!form.isSubmitting}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {type === "role"
              ? "Select a new role for the selected user."
              : disabling
                ? "Disable sign-in for the selected user."
                : "Restore sign-in for the selected user."}
          </DialogDescription>
        </DialogHeader>
        <FormikProvider value={form}>
          <Form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            noValidate
            onSubmit={(event) => {
              if (pending.current) event.preventDefault()
              else form.handleSubmit(event)
            }}
          >
            <DialogBody className="space-y-4">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={person.name}
                  email={person.email}
                  avatarUrl={person.avatarUrl}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="font-medium">{person.name}</p>
                  <p className="text-xs break-all text-muted-foreground">
                    {person.email}
                  </p>
                </div>
              </div>
              {type === "role" ? (
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
                    className="w-full"
                    options={[
                      { value: "admin", label: "Administrator" },
                      { value: "instructor", label: "Instructor" },
                      { value: "learner", label: "Learner" },
                    ]}
                  />
                </div>
              ) : !disabling ? (
                <p>
                  This person will be able to sign in again with their existing
                  role.
                </p>
              ) : null}
              {person.id === actor.id ? (
                <Alert variant="warning">
                  You are changing your own access. You will be signed out and
                  may lose access to this workspace.
                </Alert>
              ) : (
                <Alert>
                  This change signs the person out of all current sessions.
                </Alert>
              )}
              <FormFeedback />
            </DialogBody>
            <DialogFooter>
              <Button
                type="submit"
                variant="default"
                disabled={
                  form.isSubmitting ||
                  (type === "role" && form.values.role === person.role)
                }
              >
                {form.isSubmitting
                  ? "Saving…"
                  : type === "role"
                    ? "Save role"
                    : title}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={form.isSubmitting}
                onClick={onClose}
              >
                Cancel
              </Button>
            </DialogFooter>
          </Form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  )
}
