import { useId } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  SetCoursePrivacyDocument,
  SetLessonPrivacyDocument,
  LessonAccessGrantsDocument,
  SetLessonAccessDocument,
  CourseLearnersDocument,
} from "@workspace/data/apollo/course-management/query"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { SelectInput } from "@workspace/ui/components/select"
import { DataTable } from "@workspace/ui/components/data-table"
import {
  courseMutation,
  courseResourceOptions,
} from "../../workspace/course/course-management"
import {
  useCourseTask,
  useCourseTableSearch,
  type CourseWorkspace,
} from "./course-workspace"

export function CourseAccessPanel({
  workspace,
}: {
  workspace: CourseWorkspace
}) {
  const { course, clients, user, search, owns } = workspace
  const id = useId()
  const { busy, run } = useCourseTask(workspace)
  const tableSearch = useCourseTableSearch(workspace)
  const lessons = course.modules.flatMap((module) =>
    module.items.map((item) => ({
      ...item,
      moduleId: module.id,
      section: module.title,
    }))
  )
  const lesson = lessons.find((item) => item.id === search.lessonId)
  const page = search.coursePage ?? 1,
    size = search.coursePageSize ?? 20
  const canEdit = owns && course.status !== "archived"
  const grants = useQuery({
    ...courseResourceOptions(
      clients,
      user,
      "lesson-grants",
      LessonAccessGrantsDocument,
      { courseId: course.id, itemId: lesson?.id ?? "" }
    ),
    enabled: owns && !!lesson?.isPrivate && !course.isPrivate,
  })
  const learners = useQuery({
    ...courseResourceOptions(
      clients,
      user,
      "lesson-access-learners",
      CourseLearnersDocument,
      {
        courseId: course.id,
        limit: size,
        offset: (page - 1) * size,
        search: search.courseQ,
      }
    ),
    enabled: owns && !!lesson?.isPrivate && !course.isPrivate,
  })
  const granted = new Set(
    grants.data?.lessonAccessGrants.map((grant) => grant.userId)
  )
  if (!owns) return null
  return (
    <section
      className="space-y-6 border-b border-border pb-8"
      aria-labelledby={`${id}-title`}
    >
      <div>
        <h2 id={`${id}-title`} className="text-lg font-semibold">
          Course and lesson access
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Public courses accept self-enrollment. Private courses are only
          visible to learners enrolled by staff. Making a course private does
          not grant access to existing self-enrolled learners; assign them in
          the Learners tab.
        </p>
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={course.isPrivate}
          disabled={!canEdit || busy}
          className="size-4 accent-primary"
          onChange={(event) => {
            const isPrivate = event.target.checked
            void run(
              () =>
                courseMutation(clients, SetCoursePrivacyDocument, {
                  id: course.id,
                  isPrivate,
                }),
              isPrivate ? "Course is now private." : "Course is now public."
            )
          }}
        />
        Private course — staff enrollment required
      </label>
      <div className="max-w-xl space-y-2">
        <label htmlFor={`${id}-lesson`} className="text-sm font-medium">
          Lesson access
        </label>
        <SelectInput
          id={`${id}-lesson`}
          value={lesson?.id ?? ""}
          className="w-full"
          disabled={busy}
          options={[
            { value: "", label: "Choose a lesson" },
            ...lessons.map((item) => ({
              value: item.id,
              label: `${item.section} / ${item.title}`,
            })),
          ]}
          onValueChange={(lessonId) =>
            workspace.update({
              lessonId: lessonId || undefined,
              coursePage: undefined,
            })
          }
        />
      </div>
      {lesson && (
        <div className="space-y-5">
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={lesson.isPrivate}
              disabled={!canEdit || busy}
              className="size-4 accent-primary"
              onChange={(event) => {
                const isPrivate = event.target.checked
                void run(
                  () =>
                    courseMutation(clients, SetLessonPrivacyDocument, {
                      courseId: course.id,
                      moduleId: lesson.moduleId,
                      itemId: lesson.id,
                      isPrivate,
                    }),
                  isPrivate
                    ? "Lesson is now private."
                    : "Lesson is available to all enrolled learners."
                )
              }}
            />
            Private lesson
          </label>
          {course.isPrivate ? (
            <Alert>
              All staff-enrolled learners can access lessons in this private
              course. Individual lesson grants apply when the course is public.
            </Alert>
          ) : lesson.isPrivate ? (
            <>
              <p className="text-sm leading-6 text-muted-foreground">
                Only learners with an individual grant can open this lesson.
                Required private lessons still count toward course completion.
                Enroll learners in the Learners tab before granting access here.
              </p>
              <DataTable
                rows={learners.data?.courseEnrollmentsPage.items ?? []}
                getRowId={(row) => row.userId}
                ariaLabel="Private lesson access"
                search={{
                  value: tableSearch.value,
                  onChange: tableSearch.onChange,
                  placeholder: "Search enrolled learners",
                }}
                isLoading={learners.isPending || grants.isPending}
                isFetching={
                  learners.isFetching ||
                  grants.isFetching ||
                  tableSearch.isTyping
                }
                emptyState="No enrolled learners match this view."
                errorState={
                  learners.isError || grants.isError ? (
                    <Alert variant="warning">
                      Access could not be loaded.{" "}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          void learners.refetch()
                          void grants.refetch()
                        }}
                      >
                        Try again
                      </Button>
                    </Alert>
                  ) : undefined
                }
                onRefresh={() => {
                  void learners.refetch()
                  void grants.refetch()
                }}
                pagination={{
                  pageIndex: page - 1,
                  pageSize: size,
                  totalCount:
                    learners.data?.courseEnrollmentsPage.totalCount ?? 0,
                  onPageChange: (index) =>
                    workspace.update({ coursePage: index + 1 }),
                  onPageSizeChange: (coursePageSize) =>
                    workspace.update({ coursePageSize, coursePage: undefined }),
                }}
                columns={[
                  {
                    id: "name",
                    header: "Learner",
                    cell: (row) => (
                      <div>
                        <p className="font-medium">{row.learnerName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.learnerEmail}
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: "access",
                    header: "Lesson access",
                    cell: (row) => (
                      <label className="flex min-h-11 items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={granted.has(row.userId)}
                          aria-label={`Allow ${row.learnerName} to access ${lesson.title}`}
                          disabled={
                            !canEdit ||
                            busy ||
                            grants.isPending ||
                            grants.isError
                          }
                          onChange={(event) => {
                            const allowed = event.target.checked
                            void run(
                              async () => {
                                await courseMutation(
                                  clients,
                                  SetLessonAccessDocument,
                                  {
                                    courseId: course.id,
                                    moduleId: lesson.moduleId,
                                    itemId: lesson.id,
                                    learnerId: row.userId,
                                    allowed,
                                  }
                                )
                                await grants.refetch()
                              },
                              allowed
                                ? "Lesson access granted."
                                : "Lesson access revoked."
                            )
                          }}
                        />
                        {granted.has(row.userId) ? "Granted" : "Not granted"}
                      </label>
                    ),
                  },
                ]}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              All enrolled learners can access this lesson.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
