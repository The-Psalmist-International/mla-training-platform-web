import { Link } from "@tanstack/react-router"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle"
import { PlayCircleIcon } from "@phosphor-icons/react/dist/csr/PlayCircle"
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText"
import { ExamIcon } from "@phosphor-icons/react/dist/csr/Exam"
import { VideoCameraIcon } from "@phosphor-icons/react/dist/csr/VideoCamera"
import { MusicNotesIcon } from "@phosphor-icons/react/dist/csr/MusicNotes"
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey"
import {
  orderedCourseLessons,
  type CourseOutline,
  type CourseEnrollment,
  type LearnerCourseSearch,
} from "../../workspace/course"

export function CourseSidebar({
  course,
  enrollment,
  fileAssetIds,
  currentId,
  nextId,
  search,
  onSelect,
}: {
  course: CourseOutline
  enrollment: CourseEnrollment | null
  fileAssetIds: Map<string, string | undefined>
  currentId?: string
  nextId?: string
  search: LearnerCourseSearch
  onSelect?: () => void
}) {
  const completed = new Set(
    enrollment?.progress
      .filter((row) => row.status === "completed" && (!fileAssetIds.has(row.itemId) || (!!fileAssetIds.get(row.itemId) && row.fileAssetId === fileAssetIds.get(row.itemId))))
      .map((row) => row.itemId)
  )
  const lessons = orderedCourseLessons(course)
  const summary = enrollment?.learningProgress
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border/70 px-5 py-5">
        <p className="text-xs text-muted-foreground">Your course</p>
        <h2 className="mt-2 text-base leading-6 font-semibold">
          {course.title}
        </h2>
        {summary && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between gap-3 text-xs text-muted-foreground">
              <span>
                {summary.completedRequiredItems} of {summary.totalRequiredItems}{" "}
                required lessons
              </span>
              <span className="font-medium text-foreground tabular-nums">
                {summary.percentage}%
              </span>
            </div>
            <progress
              aria-label="Course completion"
              value={summary.percentage}
              max={100}
              className="block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-muted [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary"
            />
          </div>
        )}
      </div>
      <nav
        aria-label="Course lessons"
        className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
      >
        {[...course.modules]
          .sort((a, b) => a.position - b.position)
          .map((module) => (
            <section key={module.id} className="mb-5">
              <h3 className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                {module.title}
              </h3>
              <ol className="space-y-1">
                {lessons
                  .filter((item) => item.moduleId === module.id)
                  .map((item) => {
                    const done = !item.isLocked && completed.has(item.id)
                    const Icon = item.isLocked
                      ? LockKeyIcon
                      : done
                        ? CheckCircleIcon
                        : item.type === "text" || item.type === "file_lesson"
                          ? FileTextIcon
                          : item.type === "video_lesson"
                            ? PlayCircleIcon
                            : item.type === "audio_lesson"
                              ? MusicNotesIcon
                            : item.type === "assessment"
                              ? ExamIcon
                              : VideoCameraIcon
                    return (
                      <li key={item.id}>
                        <Link
                          to="/courses/$courseId"
                          params={{ courseId: course.id }}
                          search={{ ...search, lesson: item.id }}
                          onClick={onSelect}
                          aria-current={
                            item.id === currentId ? "page" : undefined
                          }
                          className={`flex min-h-12 items-start gap-3 rounded-md px-3 py-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${item.id === currentId ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                        >
                          <Icon
                            aria-hidden
                            weight={done ? "fill" : "regular"}
                            className={`mt-0.5 size-5 shrink-0 ${done ? "text-success-foreground" : ""}`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block leading-5 font-medium">
                              {item.title}
                            </span>
                            <span className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
                              <span>
                                {item.isLocked
                                  ? "Private — access required"
                                  : done
                                    ? "Completed"
                                    : item.type === "text" || item.type === "file_lesson"
                                      ? "Reading"
                                      : item.type === "video_lesson"
                                        ? "Video"
                                        : item.type === "audio_lesson"
                                          ? "Audio"
                                        : item.type === "assessment"
                                          ? "Assessment"
                                          : "Video assignment"}
                              </span>
                              {!item.required && <span>Optional</span>}
                              {item.id === nextId && (
                                <span className="font-medium text-primary">
                                  Up next
                                </span>
                              )}
                            </span>
                          </span>
                        </Link>
                      </li>
                    )
                  })}
              </ol>
            </section>
          ))}
      </nav>
    </div>
  )
}
