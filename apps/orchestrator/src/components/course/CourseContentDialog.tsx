import { useId, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import MDEditor from "@uiw/react-md-editor"
import "@uiw/react-md-editor/markdown-editor.css"
import { Form, FormikProvider, useFormik } from "formik"
import * as yup from "yup"
import {
  CreateCourseModuleDocument,
  ManageModuleDocument,
  ArchiveModuleDocument,
  ArchiveLessonDocument,
  MoveLessonDocument,
  AddTextLessonDocument,
  EditTextLessonDocument,
  AddVideoLessonDocument,
  EditVideoLessonDocument,
  AddAssessmentDocument,
  EditAssessmentDocument,
  AddVideoPromptDocument,
  EditVideoPromptDocument,
  MY_VIDEO_ASSETS_PAGE_QUERY,
  CourseLessonPlaybackDocument,
} from "@workspace/data"
import { Button } from "@workspace/ui/components/button"
import { ConfirmationDialog } from "@workspace/ui/components/confirmation-dialog"
import { Markdown } from "@workspace/ui/components/markdown"
import { VideoPlayer } from "../videos/VideoPlayer"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { ErrorState } from "@workspace/ui/components/error-state"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus"
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star"
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks"
import { ArticleIcon } from "@phosphor-icons/react/dist/csr/Article"
import { FileInput } from "@workspace/ui/components/file-input"
import { FormInput, FormFeedback } from "@workspace/ui/components/form-input"
import { Combobox } from "@workspace/ui/components/combobox"
import { SelectInput } from "@workspace/ui/components/select"
import { Alert } from "@workspace/ui/components/alert"
import { useToast } from "@workspace/ui/components/toaster"
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
  courseMutation,
  courseResourceOptions,
} from "../../workspace/course/course-management"
import {
  createVideoUpload,
  refreshVideoUpload,
  syncVideo,
  libraryActionError,
} from "../../workspace/library/library-actions"
import {
  videoMimeType,
  uploadLessonFile,
  UploadPausedError,
  VideoTransferError,
} from "../../workspace/videos/video-upload"
import { useCourseTask, type CourseWorkspace } from "./course-workspace"
import { AddFileLessonDocument, EditFileLessonDocument, AddAudioLessonDocument, EditAudioLessonDocument, LessonDocumentPreviewDocument } from "@workspace/data/apollo/documents/query"
import { LessonFileUpload } from "./LessonFileUpload"
import { DocumentReader } from "@workspace/ui/components/document-reader"
import { audioMimeType } from "../../workspace/videos/video-upload"
import { checkLessonVideoFile } from "../../workspace/videos/media-duration"

export function CourseContentDialog({
  workspace,
}: {
  workspace: CourseWorkspace
}) {
  const { course, search, editable } = workspace
  const action = search.action!
  const module = course.modules.find((entry) => entry.id === search.moduleId)
  const lesson = module?.items.find((entry) => entry.id === search.lessonId)
  const isModule = action.endsWith("module")
  const archive = action.startsWith("archive-")
  const moving = action === "move-lesson"
  const viewing = action === "view-lesson"
  const adding = action.startsWith("add-")
  const available = viewing
    ? !!lesson
    : editable && (adding || (isModule ? !!module : !!lesson))
  const title = action
    .replaceAll("-", " ")
    .replace(/^./, (letter) => letter.toUpperCase())
  const id = useId()
  const { busy, run } = useCourseTask(workspace)
  const { toast } = useToast()
  const [videoSearch, setVideoSearch] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [mediaInputVersion, setMediaInputVersion] = useState(0)
  const uploadController = useRef<AbortController | null>(null)
  const form = useFormik({
    initialValues: {
      title: (isModule ? module?.title : lesson?.title) ?? "",
      moduleId: module?.id ?? course.modules.at(0)?.id ?? "",
      type: lesson?.type ?? (search.tab === "videos" ? "video_lesson" : "text"),
      required: lesson?.required ?? true,
      body: lesson?.body ?? "",
      videoAssetId: lesson?.videoLesson?.videoAssetId ?? "",
      fileAssetId: lesson?.fileLesson?.fileAssetId ?? "",
      completionThreshold: lesson?.videoLesson?.completionThreshold ?? 90,
      passMark: lesson?.assessment?.passMark ?? 70,
      attemptLimit: lesson?.assessment?.attemptLimit?.toString() ?? "",
      timeLimitSeconds: lesson?.assessment?.timeLimitSeconds?.toString() ?? "",
      instructions: lesson?.videoPrompt?.instructions ?? "",
      maxDurationSeconds: lesson?.videoPrompt?.maxDurationSeconds ?? 120,
      requiresReview: lesson?.videoPrompt?.requiresReview ?? true,
      targetModuleId:
        course.modules.find((entry) => entry.id !== module?.id)?.id ?? "",
    },
    validationSchema:
      archive || viewing
        ? undefined
        : moving
          ? yup.object({
              targetModuleId: yup.string().required("Choose a module."),
            })
          : yup.object({
              title: yup.string().trim().required("Enter a title.").max(200),
              moduleId: isModule
                ? yup.string()
                : yup.string().required("Choose a module."),
              body: yup.string().max(100000),
              instructions: yup.string().max(100000),
              completionThreshold: yup.mixed().when("type", {
                is: (type: string) => ["video_lesson", "audio_lesson"].includes(type),
                then: () => yup.number().integer().min(1).max(100).required(),
              }),
              passMark: yup.mixed().when("type", {
                is: "assessment",
                then: () => yup.number().integer().min(0).max(100).required(),
              }),
              attemptLimit: yup
                .string()
                .test(
                  "limit",
                  "Enter a whole number from 1 to 100, or leave blank.",
                  (value) =>
                    !value ||
                    (/^\d+$/.test(value) &&
                      Number(value) >= 1 &&
                      Number(value) <= 100)
                ),
              timeLimitSeconds: yup
                .string()
                .test(
                  "time",
                  "Enter a whole number from 1 to 86,400, or leave blank.",
                  (value) =>
                    !value ||
                    (/^\d+$/.test(value) &&
                      Number(value) >= 1 &&
                      Number(value) <= 86400)
                ),
              maxDurationSeconds: yup.mixed().when("type", {
                is: "video_prompt",
                then: () => yup.number().integer().min(1).max(3600).required(),
              }),
            }),
    onSubmit: async (values) => {
      if (!available || viewing) return
      const base = {
        courseId: course.id,
        moduleId: module?.id ?? values.moduleId,
      }
      await run(
        async () => {
          if (action === "add-module")
            return courseMutation(
              workspace.clients,
              CreateCourseModuleDocument,
              { courseId: course.id, input: { title: values.title.trim() } }
            )
          if (action === "edit-module")
            return courseMutation(workspace.clients, ManageModuleDocument, {
              ...base,
              input: { title: values.title.trim() },
            })
          if (action === "archive-module")
            return courseMutation(
              workspace.clients,
              ArchiveModuleDocument,
              base
            )
          if (action === "archive-lesson")
            return courseMutation(workspace.clients, ArchiveLessonDocument, {
              ...base,
              itemId: lesson!.id,
            })
          if (moving)
            return courseMutation(workspace.clients, MoveLessonDocument, {
              ...base,
              itemId: lesson!.id,
              targetModuleId: values.targetModuleId,
              position:
                course.modules.find(
                  (entry) => entry.id === values.targetModuleId
                )?.items.length ?? 0,
            })
          const common = {
            title: values.title.trim(),
            required: values.required,
          }
          if (values.type === "text")
            return adding
              ? courseMutation(workspace.clients, AddTextLessonDocument, {
                  ...base,
                  input: { ...common, body: values.body },
                })
              : courseMutation(workspace.clients, EditTextLessonDocument, {
                  ...base,
                  itemId: lesson!.id,
                  input: { ...common, body: values.body },
                })
          if (values.type === "file_lesson") {
            const input = { ...common, fileAssetId: values.fileAssetId || null }
            return adding ? courseMutation(workspace.clients, AddFileLessonDocument, { ...base, input })
              : courseMutation(workspace.clients, EditFileLessonDocument, { ...base, itemId: lesson!.id, input })
          }
          if (values.type === "video_lesson" || values.type === "audio_lesson") {
            const input = {
              ...common,
              videoAssetId: values.videoAssetId || null,
              completionThreshold: Number(values.completionThreshold),
            }
            if (adding) return values.type === "audio_lesson"
              ? courseMutation(workspace.clients, AddAudioLessonDocument, { ...base, input })
              : courseMutation(workspace.clients, AddVideoLessonDocument, { ...base, input })
            return values.type === "audio_lesson"
              ? courseMutation(workspace.clients, EditAudioLessonDocument, { ...base, itemId: lesson!.id, input })
              : courseMutation(workspace.clients, EditVideoLessonDocument, { ...base, itemId: lesson!.id, input })
          }
          if (values.type === "assessment") {
            const input = {
              ...common,
              passMark: Number(values.passMark),
              attemptLimit: values.attemptLimit
                ? Number(values.attemptLimit)
                : null,
              timeLimitSeconds: values.timeLimitSeconds
                ? Number(values.timeLimitSeconds)
                : null,
            }
            return adding
              ? courseMutation(workspace.clients, AddAssessmentDocument, {
                  ...base,
                  input,
                })
              : courseMutation(workspace.clients, EditAssessmentDocument, {
                  ...base,
                  itemId: lesson!.id,
                  input,
                })
          }
          const input = {
            ...common,
            instructions: values.instructions,
            maxDurationSeconds: Number(values.maxDurationSeconds),
            requiresReview: values.requiresReview,
          }
          return adding
            ? courseMutation(workspace.clients, AddVideoPromptDocument, {
                ...base,
                input,
              })
            : courseMutation(workspace.clients, EditVideoPromptDocument, {
                ...base,
                itemId: lesson!.id,
                input,
              })
        },
        archive
          ? "Content archived; learning history retained."
          : moving
            ? "Lesson moved."
            : "Course content saved.",
        true
      )
    },
  })
  const videos = useQuery({
    ...courseResourceOptions(
      workspace.clients,
      workspace.user,
      "video-picker",
      MY_VIDEO_ASSETS_PAGE_QUERY,
      { limit: 20, offset: 0, search: videoSearch.trim() || undefined }
    ),
    enabled:
      available &&
      !viewing &&
      !isModule &&
      !archive &&
      !moving &&
      ["video_lesson", "audio_lesson"].includes(form.values.type),
  })
  const resetMediaInput = () => {
    setUploadFile(null)
    setUploadProgress(0)
    setMediaInputVersion((value) => value + 1)
  }
  const mediaUploadFailed = (description: string) => {
    resetMediaInput()
    toast({
      title: `${form.values.type === "audio_lesson" ? "Audio" : "Video"} upload failed`,
      description,
      status: "error",
    })
  }
  const uploadVideo = async (selectedFile: File) => {
    if (uploading) return
    const mimeType =
      form.values.type === "audio_lesson"
        ? audioMimeType(selectedFile)
        : videoMimeType(selectedFile)
    if (!mimeType) {
      mediaUploadFailed(
        form.values.type === "audio_lesson"
          ? "Choose an MP3, WAV, or OGG file."
          : "Choose an MP4, WebM, MOV, AVI, or MKV video."
      )
      return
    }
    if (selectedFile.size === 0) {
      mediaUploadFailed("Choose a non-empty media file.")
      return
    }
    const title =
      form.values.title.trim() ||
      selectedFile.name.replace(/\.[^.]+$/, "").slice(0, 200) ||
      (form.values.type === "audio_lesson" ? "Untitled audio" : "Untitled video")
    setUploading(true)
    setUploadProgress(0)
    uploadController.current = new AbortController()
    let succeeded = false
    try {
      try {
        await checkLessonVideoFile(
          selectedFile,
          uploadController.current.signal,
          form.values.type === "audio_lesson" ? "audio" : "video"
        )
      } catch (failure) {
        throw new VideoTransferError(
          failure instanceof Error
            ? failure.message
            : "Cannot inspect this media file."
        )
      }
      const created = await createVideoUpload(
        workspace.clients,
        workspace.user,
        {
          title,
          mimeType,
          requestKey: crypto.randomUUID(),
        }
      )
      await uploadLessonFile({
        file: selectedFile,
        title: created.asset.title,
        userId: workspace.user.id,
        assetId: created.asset.id,
        target: created.upload,
        renew: async () =>
          (
            await refreshVideoUpload(
              workspace.clients,
              workspace.user,
              created.asset.id
            )
          ).upload,
        signal: uploadController.current.signal,
        onProgress: setUploadProgress,
      })
      await syncVideo(
        workspace.clients,
        workspace.user,
        created.asset.id
      ).catch(() => undefined)
      await form.setFieldValue("videoAssetId", created.asset.id)
      setVideoSearch("")
      await videos.refetch()
      succeeded = true
    } catch (error) {
      mediaUploadFailed(
        error instanceof UploadPausedError ||
          error instanceof VideoTransferError
          ? error.message
          : libraryActionError(error)
      )
    } finally {
      setUploading(false)
      if (succeeded) resetMediaInput()
    }
  }
  const field = (
    name:
      | "title"
      | "completionThreshold"
      | "passMark"
      | "attemptLimit"
      | "timeLimitSeconds"
      | "maxDurationSeconds",
    label: string,
    type = "text"
  ) => (
    <div className="space-y-2">
      <label htmlFor={`${id}-${name}`} className="font-medium">
        {label}
      </label>
      <FormInput
        id={`${id}-${name}`}
        name={name}
        type={type}
        disabled={busy || viewing}
      />
    </div>
  )
  const text = (name: "body" | "instructions", label: string) => {
    if (name === "body") {
      if (viewing) {
        return (
          <div className="space-y-2">
            <p className="font-medium">{label}</p>
            {form.values[name] ? (
              <Markdown value={form.values[name]} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No lesson content yet.
              </p>
            )}
          </div>
        )
      }
      return (
        <LessonMarkdownField
          id={`${id}-${name}`}
          label={label}
          value={form.values[name]}
          disabled={busy}
          onChange={(value) => void form.setFieldValue(name, value)}
          onBlur={() => void form.setFieldTouched(name, true)}
        />
      )
    }
    return (
      <div className="space-y-2">
        <label htmlFor={`${id}-${name}`} className="font-medium">
          {label}
        </label>
        <textarea
          id={`${id}-${name}`}
          name={name}
          value={form.values[name]}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          disabled={busy || viewing}
          rows={8}
          maxLength={100000}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
        />
      </div>
    )
  }
  if (archive)
    return (
      <ConfirmationDialog
        title={title}
        variant="warning"
        busy={busy || form.isSubmitting}
        onClose={workspace.close}
        description={
          available ? (
            <>
              Archive “{isModule ? module?.title : lesson?.title}”?{" "}
              {isModule && "Its lessons will also be archived. "}Historical
              learner records will be retained.
            </>
          ) : (
            "This content or action is no longer available. Close the dialog and refresh the course."
          )
        }
        actions={
          <>
            <Button
              variant="outline"
              disabled={busy || form.isSubmitting}
              onClick={workspace.close}
            >
              {available ? "Cancel" : "Close"}
            </Button>
            {available && (
              <Button
                variant="destructive"
                disabled={busy || form.isSubmitting}
                onClick={() => void form.submitForm()}
              >
                {busy || form.isSubmitting ? "Archiving..." : "Archive"}
              </Button>
            )}
          </>
        }
      />
    )
  if (viewing && lesson && !isModule)
    return (
      <LessonReader
        workspace={workspace}
        moduleId={module?.id ?? ""}
        lessonId={lesson.id}
      />
    )
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy && !uploading) workspace.close()
      }}
    >
      <DialogContent showCloseButton={!busy && !uploading}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {archive
              ? "Archive content while retaining historical learner records."
              : "Manage this course's module and lesson content."}
          </DialogDescription>
        </DialogHeader>
        <FormikProvider value={form}>
          <Form noValidate className="flex min-h-0 flex-1 flex-col">
            <DialogBody className="space-y-4">
              {!available ? (
                <Alert variant="warning">
                  This content or action is no longer available. Close the
                  dialog and refresh the course.
                </Alert>
              ) : archive ? (
                <Alert variant="warning">
                  Archive “{isModule ? module?.title : lesson?.title}”?
                  {isModule && " Its lessons will also be archived."}
                </Alert>
              ) : moving ? (
                <label className="block space-y-2">
                  <span className="font-medium">Destination module</span>
                  <SelectInput
                    value={form.values.targetModuleId}
                    onValueChange={(value) =>
                      void form.setFieldValue("targetModuleId", value)
                    }
                    className="w-full"
                    disabled={busy}
                    options={course.modules
                      .filter((entry) => entry.id !== module?.id)
                      .map((entry) => ({
                        value: entry.id,
                        label: entry.title,
                      }))}
                  />
                </label>
              ) : (
                <>
                  {field("title", "Title")}
                  {!isModule && (
                    <>
                      {adding && (
                        <label className="block space-y-2">
                          <span className="font-medium">Module</span>
                          <SelectInput
                            value={form.values.moduleId}
                            onValueChange={(value) =>
                              void form.setFieldValue("moduleId", value)
                            }
                            disabled={busy}
                            className="w-full"
                            options={course.modules.map((entry) => ({
                              value: entry.id,
                              label: entry.title,
                            }))}
                          />
                        </label>
                      )}
                      <label className="block space-y-2">
                        <span className="font-medium">Lesson type</span>
                        <SelectInput
                          value={form.values.type}
                          onValueChange={(value) =>
                            void form.setFieldValue("type", value)
                          }
                          disabled={!adding || busy}
                          className="w-full"
                          options={[
                            { value: "text", label: "Text lesson" },
                            { value: "video_lesson", label: "Video lesson" },
                            { value: "audio_lesson", label: "Audio lesson" },
                            { value: "file_lesson", label: "File lesson (PDF, Word or PowerPoint)" },
                            { value: "assessment", label: "Assessment" },
                            {
                              value: "video_prompt",
                              label: "Video submission prompt",
                            },
                          ]}
                        />
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="required"
                          checked={form.values.required}
                          onChange={form.handleChange}
                          disabled={busy || viewing}
                          className="size-4 accent-primary"
                        />
                        Required for completion
                      </label>
                      {form.values.type === "text" &&
                        text("body", "Lesson content")}
                      {form.values.type === "file_lesson" && (
                        <LessonFileUpload
                          clients={workspace.clients}
                          user={workspace.user}
                          assetId={form.values.fileAssetId}
                          onChange={(value) =>
                            void form.setFieldValue("fileAssetId", value)
                          }
                          disabled={busy || viewing}
                          onBusyChange={setUploading}
                        />
                      )}
                      {["video_lesson", "audio_lesson"].includes(
                        form.values.type
                      ) && (
                        <>
                          {!viewing && (
                            <>
                              <div className="space-y-2">
                                <label
                                  htmlFor={`${id}-video`}
                                  className="font-medium"
                                >
                                  {form.values.type === "audio_lesson"
                                    ? "Audio"
                                    : "Video"}
                                </label>
                                <Combobox
                                  id={`${id}-video`}
                                  value={form.values.videoAssetId}
                                  selectedLabel={`Current attached ${form.values.type === "audio_lesson" ? "audio" : "video"}`}
                                  placeholder={`Search and select library ${form.values.type === "audio_lesson" ? "audio" : "video"}`}
                                  onSearchChange={setVideoSearch}
                                  loading={videos.isFetching}
                                  error={
                                    videos.isError
                                      ? "Media could not be loaded."
                                      : undefined
                                  }
                                  onRetry={() => void videos.refetch()}
                                  onValueChange={(value) =>
                                    void form.setFieldValue(
                                      "videoAssetId",
                                      value
                                    )
                                  }
                                  className="w-full"
                                  disabled={busy}
                                  options={[
                                    ...(
                                      videos.data?.myVideoAssetsPage.items ?? []
                                    )
                                      .filter(
                                        (asset) =>
                                          asset.mimeType.startsWith("audio/") ===
                                          (form.values.type ===
                                            "audio_lesson")
                                      )
                                      .map((asset) => ({
                                        value: asset.id,
                                        label: asset.title,
                                        description: asset.status.replaceAll(
                                          "_",
                                          " "
                                        ),
                                      })),
                                  ]}
                                />
                              </div>
                              <div className="space-y-2">
                                <span className="font-medium">
                                  {form.values.type === "audio_lesson"
                                    ? "Or upload audio (30 minutes maximum)"
                                    : "Or upload a video (15 minutes maximum)"}
                                </span>
                                <FileInput
                                  key={mediaInputVersion}
                                  id={`${id}-video-file`}
                                  name="lesson-video-file"
                                  file={uploadFile}
                                  progress={
                                    uploading ? uploadProgress : undefined
                                  }
                                  helperText={
                                    form.values.type === "audio_lesson"
                                      ? "MP3, WAV or OGG · 30 minutes maximum."
                                      : "MP4, WebM, MOV, AVI or MKV · 15 minutes maximum."
                                  }
                                  accept={
                                    form.values.type === "audio_lesson"
                                      ? ".mp3,.wav,.ogg"
                                      : ".mp4,.webm,.mov,.avi,.mkv"
                                  }
                                  disabled={busy || uploading}
                                  onChange={(event) => {
                                    const selectedFile =
                                      event.target.files?.[0] ?? null
                                    setUploadFile(selectedFile)
                                    if (selectedFile)
                                      void uploadVideo(selectedFile)
                                  }}
                                  onRemove={() => {
                                    uploadController.current?.abort()
                                    resetMediaInput()
                                  }}
                                />
                                {(uploading || uploadProgress > 0) && (
                                  <p
                                    className="text-xs text-muted-foreground"
                                    role="status"
                                  >
                                    {uploading
                                      ? `${uploadProgress}% transferred`
                                      : `Upload complete. Select the ${form.values.type === "audio_lesson" ? "audio" : "video"} above.`}
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                          {field(
                            "completionThreshold",
                            "Completion threshold (%)",
                            "number"
                          )}
                        </>
                      )}
                      {form.values.type === "assessment" && (
                        <>
                          {field("passMark", "Pass mark (%)", "number")}
                          {field(
                            "attemptLimit",
                            "Attempt limit (blank for unlimited)",
                            "number"
                          )}
                          {field(
                            "timeLimitSeconds",
                            "Time limit in seconds (blank for none)",
                            "number"
                          )}
                          <Alert>
                            Manage questions from the lesson's actions after
                            saving.
                          </Alert>
                        </>
                      )}
                      {form.values.type === "video_prompt" && (
                        <>
                          {text("instructions", "Submission instructions")}
                          {field(
                            "maxDurationSeconds",
                            "Maximum duration (seconds)",
                            "number"
                          )}
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              name="requiresReview"
                              checked={form.values.requiresReview}
                              onChange={form.handleChange}
                              disabled={busy || viewing}
                              className="size-4 accent-primary"
                            />
                            Require instructor review
                          </label>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
              <FormFeedback />
            </DialogBody>
            <DialogFooter>
              {available && !viewing && (
                <Button
                  type="submit"
                  variant={archive ? "destructive" : "default"}
                  disabled={busy || uploading || form.isSubmitting}
                >
                  {busy ? "Saving..." : archive ? "Archive" : "Save"}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={busy || uploading}
                onClick={workspace.close}
              >
                {viewing || !available ? "Close" : "Cancel"}
              </Button>
            </DialogFooter>
          </Form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  )
}

function LessonReader({
  workspace,
  moduleId,
  lessonId,
}: {
  workspace: CourseWorkspace
  moduleId: string
  lessonId: string
}) {
  const module = workspace.course.modules.find((entry) => entry.id === moduleId)
  const lesson = module?.items.find((entry) => entry.id === lessonId)
  const playback = useQuery({
    ...courseResourceOptions(
      workspace.clients,
      workspace.user,
      "lesson-playback",
      CourseLessonPlaybackDocument,
      {
        courseId: workspace.course.id,
        moduleId,
        itemId: lessonId,
      }
    ),
    enabled: !!lesson && ["video_lesson", "audio_lesson"].includes(lesson.type),
    gcTime: 0,
    staleTime: 0,
  })
  let playbackUrl: string | undefined
  try {
    const parsed = new URL(playback.data?.lessonPlayback.url ?? "")
    if (
      parsed.protocol === "https:" &&
      parsed.hostname === "player.mediadelivery.net" &&
      parsed.pathname.startsWith("/embed/")
    )
      playbackUrl = parsed.href
  } catch {
    playbackUrl = undefined
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) workspace.close()
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-2xl">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Minimize"
          title="Minimize"
          onClick={workspace.close}
          className="absolute top-4 right-4"
        >
          <MinusIcon aria-hidden />
        </Button>
        {!lesson ? (
          <DialogBody>
            <Alert variant="warning">
              This lesson is no longer available. Close the dialog and refresh
              the course.
            </Alert>
          </DialogBody>
        ) : (
          <DialogBody className="px-8 py-8 sm:px-12">
            <article className="mx-auto max-w-xl space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {module?.title ?? "Course lesson"}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h2 className="cn-font-heading text-2xl leading-8 font-semibold text-balance">
                    {lesson.title}
                  </h2>
                  <StatusBadge>{lesson.type.replaceAll("_", " ")}</StatusBadge>
                  {lesson.required && (
                    <StarIcon
                      aria-label="Required"
                      weight="fill"
                      className="size-4 shrink-0 text-yellow-500"
                    />
                  )}
                </div>
              </div>
              <div className="pt-1 text-[0.9375rem] leading-7">
                {lesson.type === "text" ? (
                  lesson.body ? (
                    <Markdown value={lesson.body} />
                  ) : (
                    <div className="flex justify-center py-8">
                      <EmptyState
                        icon={ArticleIcon}
                        title="No lesson content yet"
                        description="Edit this lesson to add its content."
                      />
                    </div>
                  )
                ) : lesson.type === "file_lesson" ? (
                  <ManagedDocumentPreview
                    workspace={workspace}
                    moduleId={moduleId}
                    lessonId={lessonId}
                    title={lesson.title}
                    ready={lesson.fileLesson?.fileAsset?.status === "ready"}
                  />
                ) : ["video_lesson", "audio_lesson"].includes(lesson.type) ? (
                  <div className="space-y-3">
                    {playback.isPending ? (
                      <VideoPlayer
                        title={`Preview ${lesson.title}`}
                        thumbnailUrl={
                          lesson.videoLesson?.videoAsset?.thumbnailUrl
                        }
                      />
                    ) : playbackUrl ? (
                      <VideoPlayer
                        src={playbackUrl}
                        title={`Preview ${lesson.title}`}
                        thumbnailUrl={
                          lesson.videoLesson?.videoAsset?.thumbnailUrl
                        }
                      />
                    ) : (
                      <div className="flex justify-center py-8">
                        <ErrorState
                          title={`This ${lesson.type === "audio_lesson" ? "audio" : "video"} could not be loaded`}
                          description="Check its processing status and try again."
                          action={
                            <Button
                              variant="outline"
                              onClick={() => void playback.refetch()}
                            >
                              Try again
                            </Button>
                          }
                        />
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Completion:{" "}
                      {lesson.videoLesson?.completionThreshold ?? 90}%{" "}
                      {lesson.type === "audio_lesson" ? "listened" : "watched"}
                    </p>
                  </div>
                ) : lesson.type === "assessment" ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Pass mark: {lesson.assessment?.passMark ?? 70}% ·
                      Attempts: {lesson.assessment?.attemptLimit ?? "Unlimited"}
                    </p>
                    {lesson.assessment?.questions?.length ? (
                      <ol className="space-y-4">
                        {lesson.assessment.questions.map((question, index) => (
                          <li
                            key={question.id}
                            className="rounded-lg border border-border p-4"
                          >
                            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                              <span>
                                {index + 1}. {question.prompt}
                              </span>
                              <StatusBadge>
                                {question.type.replaceAll("_", " ")}
                              </StatusBadge>
                              <span className="text-xs font-normal text-muted-foreground">
                                {question.points}{" "}
                                {question.points === 1 ? "point" : "points"}
                              </span>
                            </p>
                            {question.type === "short_answer" ? (
                              <p className="mt-2 text-sm text-muted-foreground">
                                Reference answer:{" "}
                                {question.referenceAnswer || "Not set"}
                              </p>
                            ) : (
                              <ul className="mt-2 space-y-1.5">
                                {question.options.map((option) => (
                                  <li
                                    key={option.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <input
                                      type={
                                        question.type === "true_false"
                                          ? "radio"
                                          : "checkbox"
                                      }
                                      checked={option.isCorrect}
                                      readOnly
                                      disabled
                                      aria-label={option.label}
                                      className="size-4 accent-primary"
                                    />
                                    <span
                                      className={
                                        option.isCorrect
                                          ? "font-medium"
                                          : "text-muted-foreground"
                                      }
                                    >
                                      {option.label}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {question.explanation && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {question.explanation}
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div className="flex justify-center py-8">
                        <EmptyState
                          icon={ListChecksIcon}
                          title="No questions yet"
                          description="Add questions before publishing this assessment."
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap">
                      {lesson.videoPrompt?.instructions ||
                        "No submission instructions yet."}
                    </p>
                    <p className="text-muted-foreground">
                      Maximum duration:{" "}
                      {lesson.videoPrompt?.maxDurationSeconds ?? 120} seconds ·{" "}
                      {lesson.videoPrompt?.requiresReview
                        ? "Instructor review required"
                        : "Automatic approval"}
                    </p>
                  </div>
                )}
              </div>
            </article>
          </DialogBody>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ManagedDocumentPreview({ workspace, moduleId, lessonId, title, ready }: { workspace: CourseWorkspace; moduleId: string; lessonId: string; title: string; ready: boolean }) {
  const preview = useQuery({
    ...courseResourceOptions(workspace.clients, workspace.user, "document-preview", LessonDocumentPreviewDocument, { courseId: workspace.course.id, moduleId, itemId: lessonId }),
    enabled: ready,
    staleTime: 0,
    gcTime: 0,
  })
  if (!ready) return <p role="status" className="text-sm text-muted-foreground">Upload a lesson file and wait for its preview to be ready.</p>
  const raw = preview.data?.lessonFilePreview.url
  let safeUrl: string | undefined
  try {
    if (raw) {
      const url = new URL(raw), api = new URL(workspace.clients.graphqlUrl)
      if (url.origin === api.origin && /^\/lesson-files\/[0-9a-f-]+\/preview$/i.test(url.pathname)) safeUrl = url.href
    }
  } catch { /* Invalid or foreign preview URL. */ }
  if (preview.isError || (raw && !safeUrl)) return <Alert variant="warning">The secure preview could not be loaded. <Button type="button" variant="ghost" onClick={() => void preview.refetch()}>Try again</Button></Alert>
  if (!safeUrl) return <p role="status" className="text-sm text-muted-foreground">Loading secure document…</p>
  return <DocumentReader key={`${safeUrl}:${preview.dataUpdatedAt}`} url={safeUrl} title={title} onRetry={() => void preview.refetch()} />
}

function LessonMarkdownField({
  id,
  label,
  value,
  disabled,
  onChange,
  onBlur,
}: {
  id: string
  label: string
  value: string
  disabled: boolean
  onChange: (value: string) => void
  onBlur: () => void
}) {
  const [mode, setMode] = useState<"write" | "preview">("write")
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <div
          role="tablist"
          aria-label="Lesson content view"
          className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-xs font-medium"
        >
          {(["write", "preview"] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              role="tab"
              aria-selected={mode === entry}
              disabled={disabled}
              onClick={() => setMode(entry)}
              className={`rounded px-2.5 py-1 capitalize transition-colors ${
                mode === entry
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {entry}
            </button>
          ))}
        </div>
      </div>
      {mode === "write" ? (
        <div data-color-mode="light">
          <MDEditor
            id={id}
            value={value}
            preview="edit"
            height={320}
            visibleDragbar={false}
            textareaProps={{
              maxLength: 100000,
              disabled,
              onBlur,
              "aria-label": label,
            }}
            onChange={(next) => onChange(next ?? "")}
          />
        </div>
      ) : (
        <div className="min-h-40 rounded-md border border-border bg-muted/15 px-3 py-2">
          {value.trim() ? (
            <Markdown value={value} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing to preview yet.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
