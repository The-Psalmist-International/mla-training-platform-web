import { useEffect, useId, useRef, useState } from "react"
import { useBlocker, useRouter } from "@tanstack/react-router"
import { Form, FormikProvider, useFormik } from "formik"
import type { CurrentUser } from "@workspace/data"
import { useQuery } from "@tanstack/react-query"
import { FileInput } from "@workspace/ui/components/file-input"
import { Spinner } from "@workspace/ui/components/spinner"
import { SelectInput } from "@workspace/ui/components/select"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { FormInput, FormFeedback } from "@workspace/ui/components/form-input"
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
  createVideoUpload,
  refreshVideoUpload,
  syncVideo,
  videoDetailsOptions,
  libraryActionError,
  libraryErrorCode,
  type LessonUpload,
} from "../../workspace/library/library-actions"
import {
  videoUploadSchema,
  videoMimeType,
  uploadLessonFile,
  UploadPausedError,
  VideoTransferError,
} from "../../workspace/videos/video-upload"

export function VideoUploadDialog({
  assetId,
  user,
  onClose,
  onChanged,
  placement,
}: {
  assetId?: string
  user: CurrentUser
  onClose: () => void
  onChanged: (message?: string) => void
  placement?: {
    modules: { id: string; title: string }[]
    moduleId?: string
    onUploaded: (
      assetId: string,
      title: string,
      moduleId: string
    ) => Promise<void>
  }
}) {
  const { dataClients } = useRouter().options.context
  const id = useId(),
    pending = useRef(false),
    controller = useRef<AbortController | null>(null),
    reservation = useRef<LessonUpload | null>(null),
    requestKey = useRef<string | null>(null)
  const [progress, setProgress] = useState(0),
    [phase, setPhase] = useState<
      "idle" | "preparing" | "uploading" | "checking"
    >("idle")
  const details = useQuery({
    ...videoDetailsOptions(dataClients, user, assetId ?? ""),
    enabled: !!assetId,
  })
  const selected = details.data
  const available =
    !assetId ||
    (!!selected && !details.isError && selected.status === "pending_upload")
  const form = useFormik<{
    title: string
    file: File | null
    moduleId: string
  }>({
    initialValues: {
      title: "",
      file: null,
      moduleId: placement?.moduleId ?? placement?.modules[0]?.id ?? "",
    },
    validationSchema: videoUploadSchema,
    onSubmit: async (values, helpers) => {
      if (pending.current || !available || !values.file) return
      const file = values.file,
        mimeType = videoMimeType(file)
      if (!mimeType) return
      pending.current = true
      helpers.setStatus(undefined)
      setPhase("preparing")
      controller.current = new AbortController()
      try {
        let upload: LessonUpload
        if (assetId || reservation.current)
          upload = await refreshVideoUpload(
            dataClients,
            user,
            assetId ?? reservation.current!.asset.id
          )
        else {
          requestKey.current ??= crypto.randomUUID()
          upload = await createVideoUpload(dataClients, user, {
            title: values.title.trim(),
            mimeType,
            requestKey: requestKey.current,
          })
        }
        if (upload.asset.mimeType !== mimeType)
          throw new VideoTransferError(
            "Choose the original file type for this video record."
          )
        reservation.current = upload
        onChanged()
        if (controller.current.signal.aborted) throw new UploadPausedError()
        setPhase("uploading")
        await uploadLessonFile({
          file,
          title: upload.asset.title,
          userId: user.id,
          assetId: upload.asset.id,
          target: upload.upload,
          renew: async () =>
            (await refreshVideoUpload(dataClients, user, upload.asset.id))
              .upload,
          signal: controller.current.signal,
          onProgress: setProgress,
        })
        setPhase("checking")
        let message = `${upload.asset.title}: file uploaded. Check status before previewing.`
        try {
          const updated = await syncVideo(dataClients, user, upload.asset.id)
          message =
            updated.status === "ready"
              ? `${updated.title}: video ready to preview.`
              : updated.status === "failed"
                ? `${updated.title}: file uploaded, but video processing failed. Check its details.`
                : `${updated.title}: file uploaded. Video status: ${updated.status.replaceAll("_", " ")}.`
        } catch {
          message = `${upload.asset.title}: file uploaded, but its status could not be refreshed. Check status from the video details.`
        }
        if (placement) {
          if (
            !placement.modules.some((module) => module.id === values.moduleId)
          )
            throw new VideoTransferError(
              "Choose a course module for this video."
            )
          try {
            await placement.onUploaded(
              upload.asset.id,
              upload.asset.title,
              values.moduleId
            )
          } catch {
            throw new VideoTransferError(
              "The video was uploaded but could not be attached to the course. Retry with this file, or attach it from the video library."
            )
          }
        }
        pending.current = false
        helpers.setSubmitting(false)
        onChanged(message)
        onClose()
      } catch (error) {
        if (
          [
            "MEDIA_PROVIDER_UNAVAILABLE",
            "MEDIA_NOT_CONFIGURED",
            "BAD_USER_INPUT",
            "FORBIDDEN",
            "UNAUTHENTICATED",
          ].includes(String(libraryErrorCode(error))) &&
          !reservation.current
        )
          requestKey.current = null
        helpers.setStatus(
          error instanceof UploadPausedError
            ? error.message
            : error instanceof VideoTransferError
              ? error.message
              : libraryActionError(error)
        )
        onChanged()
      } finally {
        pending.current = false
        setPhase("idle")
      }
    },
  })
  useEffect(() => {
    if (selected && !form.values.title)
      void form.setFieldValue("title", selected.title)
  }, [selected, form.values.title, form.setFieldValue])
  useEffect(
    () => () => {
      controller.current?.abort()
    },
    []
  )
  useBlocker({
    shouldBlockFn: () => pending.current,
    enableBeforeUnload: () => pending.current,
  })
  const locked =
    form.isSubmitting || !!reservation.current || !!requestKey.current
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
          <DialogTitle>
            {assetId ? "Resume video upload" : "Upload video"}
          </DialogTitle>
          <DialogDescription>
            Upload a lesson video directly to the configured video library.
          </DialogDescription>
        </DialogHeader>
        <FormikProvider value={form}>
          <Form noValidate className="flex min-h-0 flex-1 flex-col">
            <DialogBody className="space-y-4">
              {details.isPending && assetId ? (
                <div className="flex min-h-32 items-center justify-center">
                  <Spinner label="Loading video" />
                </div>
              ) : !available ? (
                <Alert variant="warning">
                  {details.isError
                    ? libraryActionError(details.error)
                    : "This video is no longer awaiting upload. Close the dialog and check its status."}
                </Alert>
              ) : (
                <>
                  {placement && (
                    <label className="block space-y-2">
                      <span className="font-medium">Course module</span>
                      <SelectInput
                        value={form.values.moduleId}
                        onValueChange={(moduleId) =>
                          void form.setFieldValue("moduleId", moduleId)
                        }
                        disabled={locked}
                        className="w-full"
                        options={placement.modules.map((module) => ({
                          value: module.id,
                          label: module.title,
                        }))}
                      />
                    </label>
                  )}
                  <div className="space-y-2">
                    <label htmlFor={`${id}-title`} className="font-medium">
                      Title
                    </label>
                    <FormInput
                      id={`${id}-title`}
                      name="title"
                      required
                      maxLength={200}
                      disabled={locked || !!assetId}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`${id}-file`} className="font-medium">
                      Video file
                    </label>
                    <FileInput
                      id={`${id}-file`}
                      name="file"
                      file={form.values.file}
                      helperText="Click to select a video file."
                      accept=".mp4,.webm,.mov,.avi,.mkv"
                      disabled={locked}
                      onChange={(event) => {
                        void form.setFieldValue(
                          "file",
                          event.target.files?.[0] ?? null
                        )
                        void form.setFieldTouched("file", true, false)
                      }}
                      aria-describedby={`${id}-file-help${form.touched.file && form.errors.file ? ` ${id}-file-error` : ""}`}
                      aria-invalid={!!(form.touched.file && form.errors.file)}
                    />
                    <p
                      id={`${id}-file-help`}
                      className="text-xs leading-5 text-muted-foreground"
                    >
                      MP4, WebM, MOV, AVI, or MKV. To resume, choose the
                      original file. Recovery continues from this browser's
                      saved upload when available.
                    </p>
                    {form.touched.file && form.errors.file && (
                      <p
                        id={`${id}-file-error`}
                        className="text-sm text-destructive"
                      >
                        {form.errors.file}
                      </p>
                    )}
                  </div>
                  <Alert>
                    Keep this page open during transfer. After upload, the video
                    may need time to finish encoding before it can be played.
                  </Alert>
                  {(form.isSubmitting || progress > 0) && (
                    <div className="space-y-2" role="status">
                      <label
                        htmlFor={`${id}-progress`}
                        className="text-xs text-muted-foreground"
                      >
                        {phase === "preparing"
                          ? "Preparing upload..."
                          : `${progress}% transferred`}
                      </label>
                      <progress
                        id={`${id}-progress`}
                        value={progress}
                        max={100}
                        className="h-2 w-full accent-primary"
                      />
                    </div>
                  )}
                </>
              )}
              <FormFeedback />
            </DialogBody>
            <DialogFooter>
              {available && (
                <Button type="submit" disabled={form.isSubmitting}>
                  {form.isSubmitting
                    ? phase === "preparing"
                      ? "Preparing..."
                      : phase === "checking"
                        ? "Checking status..."
                        : "Uploading..."
                    : reservation.current || assetId
                      ? "Continue upload"
                      : "Upload video"}
                </Button>
              )}
              {phase === "uploading" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => controller.current?.abort()}
                >
                  Pause upload
                </Button>
              )}
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
