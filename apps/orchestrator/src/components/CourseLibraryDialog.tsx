import { useId, useRef } from "react"
import { useBlocker, useRouter } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Form, FormikProvider, useFormik } from "formik"
import type { CourseDetailsQuery, CurrentUser } from "@workspace/data"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { FormFeedback, FormInput } from "@workspace/ui/components/form-input"
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
  courseDetailsOptions,
  courseFormSchema,
  saveCourse,
  changeCourseStatus,
  libraryActionError,
  type CourseFormValues,
  type CourseAction,
} from "../workspace/library-actions"

type CourseModal = "create" | "edit" | "details" | CourseAction
type Course = CourseDetailsQuery["course"]
const titles: Record<CourseModal, string> = {
  create: "Create course",
  edit: "Edit course",
  details: "Course details",
  publish: "Publish course",
  unpublish: "Return course to draft",
  archive: "Archive course",
}
export function CourseLibraryDialog({
  modal,
  id,
  user,
  onClose,
  onChanged,
}: {
  modal: CourseModal
  id?: string
  user: CurrentUser
  onClose: () => void
  onChanged: (message: string) => void
}) {
  const { dataClients } = useRouter().options.context
  const query = useQuery({
    ...courseDetailsOptions(dataClients, user, id ?? ""),
    enabled: modal !== "create" && !!id,
  })
  if (modal === "create" || (query.data && !query.isError))
    return (
      <CourseActionDialog
        key={`${modal}-${id ?? "new"}`}
        modal={modal}
        course={query.data}
        user={user}
        onClose={onClose}
        onChanged={onChanged}
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
          <DialogTitle>{titles[modal]}</DialogTitle>
          <DialogDescription>
            Load the selected course before continuing.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {query.isPending ? (
            <div role="status" className="space-y-3">
              <span className="sr-only">Loading course details</span>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <Alert variant="warning">{libraryActionError(query.error)}</Alert>
          )}
        </DialogBody>
        <DialogFooter>
          {query.isError && (
            <Button
              variant="outline"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
function CourseActionDialog({
  modal,
  course,
  user,
  onClose,
  onChanged,
}: {
  modal: CourseModal
  course?: Course
  user: CurrentUser
  onClose: () => void
  onChanged: (message: string) => void
}) {
  const { dataClients } = useRouter().options.context
  const id = useId(),
    pending = useRef(false)
  const editing = modal === "create" || modal === "edit"
  const owns = !course || user.role === "admin" || course.ownerId === user.id
  const available =
    modal === "details" ||
    (owns &&
      (modal === "create" ||
        (modal === "edit" || modal === "publish"
          ? course?.status === "draft"
          : modal === "unpublish"
            ? course?.status === "published"
            : course?.status !== "archived")))
  const form = useFormik<CourseFormValues>({
    initialValues: {
      title: course?.title ?? "",
      description: course?.description ?? "",
      certificateEnabled: course?.certificateEnabled ?? false,
    },
    validationSchema: editing ? courseFormSchema : undefined,
    onSubmit: async (values, helpers) => {
      if (pending.current || !available || modal === "details") return
      pending.current = true
      helpers.setStatus(undefined)
      try {
        if (editing) {
          const result = await saveCourse(
            dataClients,
            user,
            values,
            modal === "edit" ? course?.id : undefined
          )
          pending.current = false
          helpers.setSubmitting(false)
          onChanged(
            modal === "create"
              ? `${result.title} created as a draft.`
              : `${result.title} updated.`
          )
        } else {
          if (!course) return
          const result = await changeCourseStatus(
            dataClients,
            user,
            course.id,
            modal
          )
          pending.current = false
          helpers.setSubmitting(false)
          onChanged(
            `${result.title} ${modal === "publish" ? "published" : modal === "unpublish" ? "returned to draft" : "archived"}.`
          )
        }
        onClose()
      } catch (error) {
        helpers.setStatus(libraryActionError(error))
      } finally {
        pending.current = false
      }
    },
  })
  useBlocker({
    shouldBlockFn: () => pending.current,
    enableBeforeUnload: () => pending.current,
  })
  const close = () => {
    if (!pending.current) onClose()
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
          <DialogTitle>{titles[modal]}</DialogTitle>
          <DialogDescription>
            {modal === "create"
              ? "Start a draft course with its title and description."
              : course?.title}
          </DialogDescription>
        </DialogHeader>
        <FormikProvider value={form}>
          <Form className="flex min-h-0 flex-1 flex-col" noValidate>
            <DialogBody className="space-y-4">
              {!available ? (
                <Alert variant="warning">
                  This action is not available for the course's current status
                  or your account. Close the dialog and refresh the library.
                </Alert>
              ) : editing ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor={`${id}-title`} className="font-medium">
                      Title
                    </label>
                    <FormInput
                      id={`${id}-title`}
                      name="title"
                      required
                      maxLength={200}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor={`${id}-description`}
                      className="font-medium"
                    >
                      Description
                    </label>
                    <textarea
                      id={`${id}-description`}
                      name="description"
                      value={form.values.description}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      disabled={form.isSubmitting}
                      rows={5}
                      maxLength={10000}
                      className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-invalid={
                        !!(form.touched.description && form.errors.description)
                      }
                      aria-describedby={
                        form.touched.description && form.errors.description
                          ? `${id}-description-error`
                          : undefined
                      }
                    />
                    {form.touched.description && form.errors.description && (
                      <p
                        id={`${id}-description-error`}
                        className="text-sm text-destructive"
                      >
                        {form.errors.description}
                      </p>
                    )}
                  </div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="certificateEnabled"
                      checked={form.values.certificateEnabled}
                      onChange={form.handleChange}
                      disabled={form.isSubmitting}
                      className="size-4 accent-primary"
                    />
                    <span>Issue a certificate on completion</span>
                  </label>
                  {modal === "create" && (
                    <Alert>
                      The course starts as a draft. Publishing requires complete
                      sections and valid lesson content.
                    </Alert>
                  )}
                </>
              ) : modal === "details" && course ? (
                <>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">Status</dt>
                      <dd className="mt-1 font-medium capitalize">
                        {course.status}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Certificate
                      </dt>
                      <dd className="mt-1 font-medium">
                        {course.certificateEnabled ? "Enabled" : "Not enabled"}
                      </dd>
                    </div>
                  </dl>
                  <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                    {course.description || "No description yet."}
                  </p>
                  <div className="space-y-3">
                    <h3 className="font-medium">Sections</h3>
                    {course.modules.length ? (
                      <ul className="space-y-3">
                        {course.modules.map((module) => (
                          <li
                            key={module.id}
                            className="rounded-md border border-border p-3"
                          >
                            <p className="font-medium">{module.title}</p>
                            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                              {module.items.map((item) => (
                                <li key={item.id}>
                                  {item.title} ·{" "}
                                  {item.type.replaceAll("_", " ")}
                                  {item.required ? " · Required" : ""}
                                </li>
                              ))}
                            </ul>
                            {!module.items.length && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                No lessons yet.
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No sections have been added yet.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <Alert variant={modal === "archive" ? "warning" : "info"}>
                  {modal === "publish"
                    ? "Publish this course for learners. The backend will validate every section and item before it becomes available."
                    : modal === "unpublish"
                      ? "Return this course to draft so its content can be edited. It will no longer be available as a published course."
                      : "Archive this course. It will leave the default course list, while its historical records are retained."}
                </Alert>
              )}
              <FormFeedback />
            </DialogBody>
            <DialogFooter>
              {modal !== "details" && available && (
                <Button
                  type="submit"
                  variant={modal === "archive" ? "destructive" : "default"}
                  disabled={form.isSubmitting}
                >
                  {form.isSubmitting ? "Saving..." : titles[modal]}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={form.isSubmitting}
                onClick={close}
              >
                {modal === "details" || !available ? "Close" : "Cancel"}
              </Button>
            </DialogFooter>
          </Form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  )
}
