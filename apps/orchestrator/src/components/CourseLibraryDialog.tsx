import { useEffect, useId, useRef, useState } from "react"
import { useBlocker, useRouter } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Form, FormikProvider, useFormik } from "formik"
import { useToast } from "@workspace/ui/components/toaster"
import type { CourseDetailsQuery, CurrentUser } from "@workspace/data"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star"
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { FormFeedback, FormInput } from "@workspace/ui/components/form-input"
import { FileInput } from "@workspace/ui/components/file-input"
import {
  uploadCourseThumbnail,
  validateThumbnailFile,
  ThumbnailUploadError,
} from "../workspace/course-thumbnail"
import { CourseThumbnail } from "./CourseThumbnail"
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
  const { dataClients, auth } = useRouter().options.context
  const { toast } = useToast()
  const id = useId(),
    pending = useRef(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailError, setThumbnailError] = useState<string | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview(null)
      return
    }
    const url = URL.createObjectURL(thumbnailFile)
    setThumbnailPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [thumbnailFile])
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
      thumbnailUrl: course?.thumbnailUrl ?? "",
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
          let thumbnailUrl = values.thumbnailUrl
          if (thumbnailFile) {
            setUploadingThumbnail(true)
            setThumbnailError(null)
            thumbnailUrl = await uploadCourseThumbnail(thumbnailFile)
            // Keep a successful upload on a failed metadata save, so retry does not upload twice.
            await helpers.setFieldValue("thumbnailUrl", thumbnailUrl, false)
            setThumbnailFile(null)
            setUploadingThumbnail(false)
          }
          const result = await saveCourse(
            dataClients,
            user,
            { ...values, thumbnailUrl },
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
          if (!course) {
            helpers.setStatus(
              "This course is no longer available. Close the dialog and refresh the library."
            )
            return
          }
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
        const description =
          error instanceof ThumbnailUploadError
            ? error.message
            : libraryActionError(error)
        if (error instanceof ThumbnailUploadError)
          setThumbnailError(description)
        helpers.setStatus(description)
        if (auth.getUser() === user)
          toast({
            title:
              modal === "publish"
                ? "Course could not be published"
                : "Course could not be updated",
            description,
            status: "error",
          })
      } finally {
        setUploadingThumbnail(false)
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
              : modal === "edit"
                ? "Update the draft course details."
                : modal === "details"
                  ? "Review the course details and its sections."
                  : modal === "publish"
                    ? "Publish the selected draft course."
                    : modal === "unpublish"
                      ? "Return the selected course to draft."
                      : "Archive the selected course."}
          </DialogDescription>
        </DialogHeader>
        <FormikProvider value={form}>
          <Form className="flex min-h-0 flex-1 flex-col" noValidate>
            <DialogBody className="space-y-4">
              {course && <h3 className="font-medium">{course.title}</h3>}
              {!available ? (
                <Alert variant="warning">
                  This action is not available for the course's current status
                  or your account. Close the dialog and refresh the library.
                </Alert>
              ) : editing ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor={`${id}-thumbnail`} className="font-medium">
                      Thumbnail
                    </label>
                    <FileInput
                      id={`${id}-thumbnail`}
                      file={thumbnailFile}
                      previewUrl={thumbnailPreview ?? form.values.thumbnailUrl}
                      removeLabel="Remove thumbnail"
                      onRemove={() => {
                        setThumbnailFile(null)
                        setThumbnailError(null)
                        void form.setFieldValue("thumbnailUrl", "", false)
                      }}
                      accept="image/jpeg,image/png,image/webp"
                      disabled={form.isSubmitting}
                      emptyText={
                        form.values.thumbnailUrl
                          ? "Choose a replacement thumbnail"
                          : "Choose a course thumbnail"
                      }
                      helperText="JPEG, PNG, or WebP, up to 5 MiB. A 16:9 image works best."
                      aria-invalid={!!thumbnailError}
                      aria-describedby={
                        thumbnailError ? `${id}-thumbnail-error` : undefined
                      }
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0]
                        event.currentTarget.value = ""
                        if (!file) return
                        try {
                          validateThumbnailFile(file)
                          setThumbnailFile(file)
                          setThumbnailError(null)
                        } catch (error) {
                          setThumbnailError(
                            error instanceof Error
                              ? error.message
                              : "Choose a valid image."
                          )
                        }
                      }}
                    />
                    {thumbnailError && (
                      <p
                        id={`${id}-thumbnail-error`}
                        className="text-sm text-destructive"
                      >
                        {thumbnailError}
                      </p>
                    )}
                  </div>
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
                  <CourseThumbnail
                    title={course.title}
                    thumbnailUrl={course.thumbnailUrl}
                    className="max-w-sm"
                  />
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
                    <h3 className="font-medium">Lessons</h3>
                    {course.modules.length ? (
                      <ul className="space-y-4">
                        {course.modules.map((module, moduleIndex) => (
                          <li
                            key={module.id}
                            className="rounded-lg border border-border bg-card"
                          >
                            <div className="flex items-center gap-3 rounded-t-lg bg-muted/30 px-3 py-3">
                              <CaretDownIcon
                                aria-hidden
                                className="size-4 shrink-0 text-muted-foreground"
                              />
                              <span className="min-w-0">
                                <span className="block font-semibold">
                                  {moduleIndex + 1}. {module.title}
                                </span>
                                <span className="mt-1 block text-xs text-muted-foreground">
                                  {module.items.length} lessons
                                </span>
                              </span>
                            </div>
                            <ul className="divide-y divide-border border-t border-border">
                              {module.items.map((item, itemIndex) => (
                                <li
                                  key={item.id}
                                  className="flex items-center gap-3 px-5 py-3"
                                >
                                  <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                                      <span className="min-w-0 truncate">
                                        {itemIndex + 1}. {item.title}
                                      </span>
                                      <StatusBadge>
                                        {item.type.replaceAll("_", " ")}
                                      </StatusBadge>
                                      {item.required && (
                                        <StarIcon
                                          aria-label="Required"
                                          weight="fill"
                                          className="size-3.5 shrink-0 text-yellow-500"
                                        />
                                      )}
                                    </span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {!module.items.length && (
                              <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                                No lessons yet.
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No lessons have been added yet.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <Alert
                  variant={
                    modal === "archive" ||
                    (modal === "publish" &&
                      !course?.modules.some((module) => module.items.length))
                      ? "warning"
                      : "info"
                  }
                >
                  {modal === "publish"
                    ? course?.modules.some((module) => module.items.length)
                      ? "Publish this course for learners. Every section still needs complete lesson content or publishing will be rejected."
                      : "Add at least one section with a lesson before publishing. A title and description are not enough."
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
                  disabled={
                    form.isSubmitting ||
                    (modal === "publish" &&
                      !course?.modules.some((module) => module.items.length))
                  }
                >
                  {uploadingThumbnail
                    ? "Uploading thumbnail..."
                    : form.isSubmitting
                      ? "Saving..."
                      : titles[modal]}
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
