import { useEffect, useId, useState } from "react"
import { Form, FormikProvider, useFormik } from "formik"
import { FileInput } from "@workspace/ui/components/file-input"
import { FormInput } from "@workspace/ui/components/form-input"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { courseFormSchema, saveCourse } from "../../workspace/library-actions"
import {
  uploadCourseThumbnail,
  validateThumbnailFile,
  ThumbnailUploadError,
} from "../../workspace/course-thumbnail"
import { CourseThumbnail } from "../CourseThumbnail"
import { useCourseTask, type CourseWorkspace } from "./course-workspace"

export function CourseGeneralPanel({
  workspace,
}: {
  workspace: CourseWorkspace
}) {
  const { course, editable } = workspace
  const id = useId()
  const { busy, run } = useCourseTask(workspace)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  const form = useFormik({
    initialValues: {
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl ?? "",
      certificateEnabled: course.certificateEnabled,
    },
    validationSchema: courseFormSchema,
    onSubmit: async (values, helpers) => {
      if (!editable) return
      await run(async () => {
        let thumbnailUrl = values.thumbnailUrl
        if (file) {
          setFileError(null)
          setUploading(true)
          try {
            thumbnailUrl = await uploadCourseThumbnail(file)
          } catch (error) {
            if (error instanceof ThumbnailUploadError) {
              setFileError(error.message)
            }
            throw error
          } finally {
            setUploading(false)
          }
          await helpers.setFieldValue("thumbnailUrl", thumbnailUrl, false)
          setFile(null)
        }
        await saveCourse(
          workspace.clients,
          workspace.user,
          {
            ...values,
            thumbnailUrl,
            certificateEnabled: course.certificateEnabled,
          },
          course.id
        )
        helpers.resetForm({ values: { ...values, thumbnailUrl } })
      }, "Course details saved.")
    },
  })
  if (!editable)
    return (
      <div className="max-w-3xl space-y-6">
        <Alert>
          {course.status === "published" && workspace.owns
            ? "Return this course to draft in Settings to edit its details."
            : "Course details are read-only for this course."}
        </Alert>
        {course.thumbnailUrl && (
          <CourseThumbnail
            title={course.title}
            thumbnailUrl={course.thumbnailUrl}
            showPlaceholder={false}
            className="max-w-sm"
          />
        )}
        <h2 className="text-lg font-semibold">{course.title}</h2>
        <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
          {course.description || "No course description yet."}
        </p>
      </div>
    )
  return (
    <FormikProvider value={form}>
      <Form noValidate className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <label htmlFor={`${id}-thumbnail`} className="font-medium">
            Thumbnail
          </label>
          <FileInput
            id={`${id}-thumbnail`}
            file={file}
            previewUrl={preview ?? form.values.thumbnailUrl}
            accept="image/jpeg,image/png,image/webp"
            disabled={busy || form.isSubmitting}
            emptyText={
              form.values.thumbnailUrl
                ? "Choose a replacement thumbnail"
                : "Choose a course thumbnail"
            }
            helperText="JPEG, PNG, or WebP, up to 5 MiB. A 16:9 image works best."
            removeLabel="Remove thumbnail"
            onRemove={() => {
              setFile(null)
              setFileError(null)
              void form.setFieldValue("thumbnailUrl", "", false)
            }}
            aria-invalid={!!fileError}
            aria-describedby={fileError ? `${id}-file-error` : undefined}
            onChange={(event) => {
              const selected = event.currentTarget.files?.[0]
              event.currentTarget.value = ""
              if (!selected) return
              try {
                validateThumbnailFile(selected)
                setFile(selected)
                setFileError(null)
              } catch (error) {
                setFileError(
                  error instanceof Error
                    ? error.message
                    : "Choose a valid image."
                )
              }
            }}
          />
          {fileError && (
            <p id={`${id}-file-error`} className="text-sm text-destructive">
              {fileError}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-title`} className="font-medium">
            Title
          </label>
          <FormInput id={`${id}-title`} name="title" required maxLength={200} />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-description`} className="font-medium">
            Description
          </label>
          <textarea
            id={`${id}-description`}
            name="description"
            value={form.values.description}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            disabled={busy || form.isSubmitting}
            rows={7}
            maxLength={10000}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
            aria-invalid={
              !!(form.touched.description && form.errors.description)
            }
          />
          {form.touched.description && form.errors.description && (
            <p className="text-sm text-destructive">
              {form.errors.description}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={busy || form.isSubmitting || (!form.dirty && !file)}
        >
          {uploading
            ? "Uploading thumbnail..."
            : busy
              ? "Saving..."
              : "Save changes"}
        </Button>
      </Form>
    </FormikProvider>
  )
}
