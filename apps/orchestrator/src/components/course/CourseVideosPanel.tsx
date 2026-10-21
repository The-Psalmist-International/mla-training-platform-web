import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  CourseLessonPlaybackDocument,
  AddVideoLessonDocument,
  CourseManagementDocument,
} from "@workspace/data"
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye"
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple"
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise"
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive"
import { Button } from "@workspace/ui/components/button"
import { ErrorState } from "@workspace/ui/components/error-state"
import { DataTable } from "@workspace/ui/components/data-table"
import { TableRowActions } from "@workspace/ui/components/table-row-actions"
import { SelectInput } from "@workspace/ui/components/select"
import { StatusBadge } from "@workspace/ui/components/status-badge"
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
import { syncVideo } from "../../workspace/library/library-actions"
import { formatVideoDuration } from "../../workspace/library/library"
import { VideoUploadDialog } from "../videos/VideoUploadDialog"
import { VideoThumbnail } from "../videos/VideoThumbnail"
import { VideoPlayer } from "../videos/VideoPlayer"
import {
  useCourseTask,
  useCourseTableSearch,
  type CourseWorkspace,
} from "./course-workspace"

function mediaKind(type: string) {
  return type === "audio_lesson" ? "audio" : "video"
}

function mediaCompletionUnit(type: string) {
  return type === "audio_lesson" ? "listened" : "watched"
}

export function CourseVideosPanel({
  workspace,
}: {
  workspace: CourseWorkspace
}) {
  const { course, search, editable } = workspace
  const tableSearch = useCourseTableSearch(workspace)
  const { busy, run } = useCourseTask(workspace)
  const size = search.coursePageSize ?? 20,
    page = (search.coursePage ?? 1) - 1
  const all = course.modules.flatMap((module) =>
    module.items
      .filter((lesson) =>
        ["video_lesson", "audio_lesson"].includes(lesson.type)
      )
      .map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
      }))
  )
  const rows = all.filter(
    (lesson) =>
      (!search.module || lesson.moduleId === search.module) &&
      (!search.courseQ ||
        `${lesson.title} ${lesson.moduleTitle}`
          .toLowerCase()
          .includes(search.courseQ.toLowerCase()))
  )
  useEffect(() => {
    const last = Math.max(1, Math.ceil(rows.length / size))
    if (page + 1 > last) workspace.update({ coursePage: last }, true)
  }, [rows.length, size, page, workspace])
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Course media</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Video and audio lessons attached to this course, with their module
            placement.
          </p>
        </div>
        {editable && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!course.modules.length}
              onClick={() =>
                workspace.open("add-lesson", {
                  moduleId: search.module ?? course.modules[0]?.id,
                })
              }
            >
              Add media lesson
            </Button>
            <Button
              disabled={!course.modules.length}
              onClick={() =>
                workspace.open("upload-video", {
                  moduleId: search.module ?? course.modules[0]?.id,
                })
              }
            >
              Upload video
            </Button>
          </div>
        )}
      </div>
      <DataTable
        rows={rows.slice(page * size, (page + 1) * size)}
        getRowId={(lesson) => lesson.id}
        ariaLabel="Course media"
        search={{
          value: tableSearch.value,
          onChange: tableSearch.onChange,
          placeholder: "Search lessons or modules",
        }}
        filters={
          <SelectInput
            aria-label="Filter media by module"
            value={search.module ?? "all"}
            onValueChange={(module) =>
              workspace.update({
                module: module === "all" ? undefined : module,
                coursePage: undefined,
              })
            }
            options={[
              { value: "all", label: "All modules" },
              ...course.modules.map((module) => ({
                value: module.id,
                label: module.title,
              })),
            ]}
          />
        }
        onRefresh={() => void workspace.refresh()}
        isFetching={tableSearch.isTyping}
        pagination={{
          pageIndex: page,
          pageSize: size,
          totalCount: rows.length,
          onPageChange: (index) => workspace.update({ coursePage: index + 1 }),
          onPageSizeChange: (coursePageSize) =>
            workspace.update({ coursePageSize, coursePage: undefined }),
        }}
        emptyState="No video or audio lessons match this view. Add a media lesson to a module."
        columns={[
          {
            id: "title",
            header: "Lesson",
            cell: (lesson) => (
              <div className="flex items-center gap-3">
                <VideoThumbnail
                  thumbnailUrl={lesson.videoLesson?.videoAsset?.thumbnailUrl}
                  compact
                  className="w-16"
                />
                <span className="font-medium">{lesson.title}</span>
              </div>
            ),
          },
          {
            id: "module",
            header: "Module",
            cell: (lesson) => lesson.moduleTitle,
          },
          {
            id: "status",
            header: "Status",
            cell: (lesson) => (
              <StatusBadge
                tone={
                  lesson.videoLesson?.videoAsset?.status === "ready"
                    ? "success"
                    : lesson.videoLesson?.videoAsset?.status === "failed"
                      ? "destructive"
                      : "neutral"
                }
              >
                {lesson.videoLesson?.videoAsset?.status.replaceAll("_", " ") ??
                  `No ${mediaKind(lesson.type)} attached`}
              </StatusBadge>
            ),
          },
          {
            id: "duration",
            header: "Duration",
            cell: (lesson) =>
              formatVideoDuration(
                lesson.videoLesson?.videoAsset?.durationSeconds
              ),
          },
          {
            id: "completion",
            header: "Completion",
            cell: (lesson) =>
              `${lesson.videoLesson?.completionThreshold ?? 90}% ${mediaCompletionUnit(lesson.type)}`,
          },
          {
            id: "actions",
            header: "Actions",
            className: "w-32 text-right",
            cell: (lesson) => (
              <TableRowActions
                subject={lesson.title}
                primary={[
                  {
                    label: `Preview ${mediaKind(lesson.type)}`,
                    icon: <EyeIcon aria-hidden />,
                    disabled:
                      lesson.videoLesson?.videoAsset?.status !== "ready",
                    onSelect: () =>
                      workspace.open("video-preview", {
                        moduleId: lesson.moduleId,
                        lessonId: lesson.id,
                      }),
                  },
                  ...(editable
                    ? [
                        {
                          label: `Edit ${mediaKind(lesson.type)} lesson`,
                          icon: <PencilSimpleIcon aria-hidden />,
                          onSelect: () =>
                            workspace.open("edit-lesson", {
                              moduleId: lesson.moduleId,
                              lessonId: lesson.id,
                            }),
                        },
                      ]
                    : []),
                ]}
                secondary={
                  workspace.owns
                    ? [
                        {
                          label: "Check processing status",
                          icon: <ArrowClockwiseIcon aria-hidden />,
                          disabled: busy || !lesson.videoLesson?.videoAssetId,
                          onSelect: () =>
                            void run(
                              () =>
                                syncVideo(
                                  workspace.clients,
                                  workspace.user,
                                  lesson.videoLesson!.videoAssetId!
                                ),
                              "Video status refreshed."
                            ),
                        },
                        ...(editable
                          ? [
                              {
                                label: "Archive lesson",
                                icon: <ArchiveIcon aria-hidden />,
                                destructive: true,
                                onSelect: () =>
                                  workspace.open("archive-lesson", {
                                    moduleId: lesson.moduleId,
                                    lessonId: lesson.id,
                                  }),
                              },
                            ]
                          : []),
                      ]
                    : []
                }
              />
            ),
          },
        ]}
      />
    </div>
  )
}

export function CourseVideoPreviewDialog({
  workspace,
}: {
  workspace: CourseWorkspace
}) {
  const module = workspace.course.modules.find(
    (entry) => entry.id === workspace.search.moduleId
  )
  const lesson = module?.items.find(
    (entry) =>
      entry.id === workspace.search.lessonId &&
      ["video_lesson", "audio_lesson"].includes(entry.type)
  )
  const query = useQuery({
    ...courseResourceOptions(
      workspace.clients,
      workspace.user,
      "lesson-playback",
      CourseLessonPlaybackDocument,
      {
        courseId: workspace.course.id,
        moduleId: module?.id ?? "",
        itemId: lesson?.id ?? "",
      }
    ),
    enabled: !!lesson,
    gcTime: 0,
    staleTime: 0,
  })
  let url: string | undefined
  try {
    const parsed = new URL(query.data?.lessonPlayback.url ?? "")
    if (
      parsed.protocol === "https:" &&
      parsed.hostname === "player.mediadelivery.net" &&
      parsed.pathname.startsWith("/embed/")
    )
      url = parsed.href
  } catch {
    /* Invalid provider URLs are not embedded. */
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) workspace.close()
      }}
    >
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{lesson?.title ?? "Media preview"}</DialogTitle>
          <DialogDescription>
            {module?.title ?? "Course media"}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {query.isPending && lesson ? (
            <VideoPlayer
              title={`Preview ${lesson.title}`}
              thumbnailUrl={lesson.videoLesson?.videoAsset?.thumbnailUrl}
            />
          ) : url ? (
            <VideoPlayer
              src={url}
              title={`Preview ${lesson?.title}`}
              thumbnailUrl={lesson?.videoLesson?.videoAsset?.thumbnailUrl}
            />
          ) : (
            <div className="flex justify-center py-8">
              <ErrorState
                title={`This ${mediaKind(lesson?.type ?? "video_lesson")} could not be loaded`}
                description="Check its processing status and try again."
                action={
                  <Button
                    variant="outline"
                    onClick={() => void query.refetch()}
                  >
                    Try again
                  </Button>
                }
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={workspace.close}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CourseVideoUploadDialog({
  workspace,
}: {
  workspace: CourseWorkspace
}) {
  const { toast } = useToast()
  if (!workspace.editable || !workspace.course.modules.length)
    return (
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) workspace.close()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload video</DialogTitle>
            <DialogDescription>
              Add a module to your draft course before uploading a lesson video.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={workspace.close}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  return (
    <VideoUploadDialog
      user={workspace.user}
      onClose={workspace.close}
      onChanged={(message) => {
        if (message)
          toast({
            title: "Course video uploaded",
            description: message,
            status: "success",
          })
        void workspace.refresh()
      }}
      placement={{
        modules: workspace.course.modules,
        moduleId: workspace.search.moduleId,
        onUploaded: async (assetId, title, moduleId) => {
          // Reuse a successful placement if retry follows a lost mutation response.
          const current = await workspace.clients.apolloClient.query({
            query: CourseManagementDocument,
            variables: { id: workspace.course.id },
            fetchPolicy: "network-only",
            context: { toast: false },
          })
          if (
            current.data?.course.modules
              .find((module) => module.id === moduleId)
              ?.items.some(
                (lesson) => lesson.videoLesson?.videoAssetId === assetId
              )
          )
            return
          await courseMutation(workspace.clients, AddVideoLessonDocument, {
            courseId: workspace.course.id,
            moduleId,
            input: {
              title,
              videoAssetId: assetId,
              required: true,
              completionThreshold: 90,
            },
          })
        },
      }}
    />
  )
}
