import { useEffect, useId, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  CourseLearnersDocument,
  CourseLearnerDetailsDocument,
  AssignCourseLearnerDocument,
  RevokeCourseCertificateDocument,
  USERS_PAGE_QUERY,
} from "@workspace/data"
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Combobox } from "@workspace/ui/components/combobox"
import { DataTable } from "@workspace/ui/components/data-table"
import { TableRowActions } from "@workspace/ui/components/table-row-actions"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { Alert } from "@workspace/ui/components/alert"
import { ErrorState } from "@workspace/ui/components/error-state"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { formatPeopleCreatedAt } from "../../workspace/people"
import {
  courseMutation,
  courseResourceOptions,
} from "../../workspace/course-management"
import {
  useCourseTask,
  useCourseTableSearch,
  type CourseWorkspace,
} from "./course-workspace"

export function CourseLearnersPanel({
  workspace,
}: {
  workspace: CourseWorkspace
}) {
  const { course, search, owns } = workspace
  const tableSearch = useCourseTableSearch(workspace)
  const size = search.coursePageSize ?? 20,
    page = (search.coursePage ?? 1) - 1
  const query = useQuery({
    ...courseResourceOptions(
      workspace.clients,
      workspace.user,
      "learners",
      CourseLearnersDocument,
      {
        courseId: course.id,
        limit: size,
        offset: page * size,
        search: search.courseQ,
      }
    ),
    enabled: owns,
  })
  const total = query.data?.courseEnrollmentsPage.totalCount ?? 0
  useEffect(() => {
    if (!query.data) return
    const last = Math.max(1, Math.ceil(total / size))
    if (page + 1 > last) workspace.update({ coursePage: last }, true)
  }, [query.data, total, size, page, workspace])
  if (!owns)
    return (
      <Alert>
        Only this course's instructor or an administrator can manage its
        learners.
      </Alert>
    )
  const rows = query.data?.courseEnrollmentsPage.items ?? []
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Learners</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enrollments, current lesson progress, completion, and certificates.
          </p>
        </div>
        {workspace.user.role === "admin" && (
          <Button
            disabled={course.status !== "published"}
            onClick={() => workspace.open("enroll")}
          >
            Assign learner
          </Button>
        )}
      </div>
      {workspace.user.role === "admin" && course.status !== "published" && (
        <Alert>Publish this course before assigning learners.</Alert>
      )}
      <DataTable
        rows={rows}
        getRowId={(row) => row.id}
        ariaLabel="Course learners"
        search={{
          value: tableSearch.value,
          onChange: tableSearch.onChange,
          placeholder: "Search learner names or emails",
        }}
        onRefresh={() => void query.refetch()}
        pagination={{
          pageIndex: page,
          pageSize: size,
          totalCount: total,
          onPageChange: (index) => workspace.update({ coursePage: index + 1 }),
          onPageSizeChange: (coursePageSize) =>
            workspace.update({ coursePageSize, coursePage: undefined }),
        }}
        isLoading={query.isPending}
        isFetching={query.isFetching || tableSearch.isTyping}
        emptyState="No learners match this view."
        errorState={
          query.isError ? (
            <ErrorState
              title="Learners could not be loaded"
              action={
                <Button variant="outline" onClick={() => void query.refetch()}>
                  Try again
                </Button>
              }
            />
          ) : undefined
        }
        columns={[
          {
            id: "name",
            header: "Learner",
            cell: (row) => (
              <span className="font-medium">{row.learnerName}</span>
            ),
          },
          {
            id: "enrolled",
            header: "Enrolled",
            cell: (row) => formatPeopleCreatedAt(row.createdAt),
          },
          {
            id: "status",
            header: "Completion",
            cell: (row) => (
              <StatusBadge tone={row.completedAt ? "success" : "neutral"}>
                {row.completedAt ? "Completed" : "In progress"}
              </StatusBadge>
            ),
          },
          {
            id: "completed",
            header: "Completed at",
            cell: (row) =>
              row.completedAt ? formatPeopleCreatedAt(row.completedAt) : "—",
          },
          {
            id: "actions",
            header: "Actions",
            className: "w-20 text-right",
            cell: (row) => (
              <TableRowActions
                subject={row.learnerName}
                primary={[
                  {
                    label: "View learner progress",
                    icon: <EyeIcon aria-hidden />,
                    onSelect: () =>
                      workspace.open("learner", { selection: row.id }),
                  },
                ]}
              />
            ),
          },
        ]}
      />
      {search.action === "enroll" && (
        <CourseEnrollmentDialog workspace={workspace} />
      )}
      {search.action === "learner" && (
        <CourseLearnerDialog
          workspace={workspace}
          available={rows.some((row) => row.id === search.selection)}
          learnerName={
            rows.find((row) => row.id === search.selection)?.learnerName ??
            "Learner"
          }
        />
      )}
    </div>
  )
}

function CourseEnrollmentDialog({ workspace }: { workspace: CourseWorkspace }) {
  const [search, setSearch] = useState("")
  const [learner, setLearner] = useState("")
  const { busy, run } = useCourseTask(workspace)
  const id = useId()
  const allowed =
    workspace.user.role === "admin" && workspace.course.status === "published"
  const query = useQuery({
    ...courseResourceOptions(
      workspace.clients,
      workspace.user,
      "learner-picker",
      USERS_PAGE_QUERY,
      {
        limit: 20,
        offset: 0,
        role: "learner",
        disabled: false,
        search: search.trim() || undefined,
      }
    ),
    enabled: allowed,
  })
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) workspace.close()
      }}
    >
      <DialogContent showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>Assign learner</DialogTitle>
          <DialogDescription>
            Assign an active learner to this published course.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!allowed ? (
            <Alert variant="warning">
              Only administrators can assign learners to a published course.
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor={`${id}-learner`} className="font-medium">
                  Learner
                </label>
                <Combobox
                  id={`${id}-learner`}
                  value={learner}
                  onValueChange={setLearner}
                  onSearchChange={setSearch}
                  placeholder="Search and select a learner"
                  loading={query.isFetching}
                  error={
                    query.isError ? "Learners could not be loaded." : undefined
                  }
                  onRetry={() => void query.refetch()}
                  disabled={busy}
                  className="w-full"
                  options={[
                    ...(query.data?.usersPage.items ?? []).map((person) => ({
                      value: person.id,
                      label: person.name,
                      description: person.email,
                    })),
                  ]}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Showing up to 20 matching learners. Refine the search to find a
                specific person.
              </p>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            disabled={!allowed || busy || !learner}
            onClick={() =>
              void run(
                () =>
                  courseMutation(
                    workspace.clients,
                    AssignCourseLearnerDocument,
                    { courseId: workspace.course.id, learnerId: learner }
                  ),
                "Learner assigned.",
                true
              )
            }
          >
            {busy ? "Assigning..." : "Assign learner"}
          </Button>
          <Button variant="outline" disabled={busy} onClick={workspace.close}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CourseLearnerDialog({
  workspace,
  available,
  learnerName,
}: {
  workspace: CourseWorkspace
  available: boolean
  learnerName: string
}) {
  const query = useQuery({
    ...courseResourceOptions(
      workspace.clients,
      workspace.user,
      "learner-details",
      CourseLearnerDetailsDocument,
      { id: workspace.search.selection ?? "" }
    ),
    enabled: available && workspace.owns,
  })
  const { busy, run } = useCourseTask(workspace)
  const [reason, setReason] = useState("")
  const data = query.data,
    certificate = data?.certificateForEnrollment
  const lessonRows = workspace.course.modules.flatMap((module) =>
    module.items.map((lesson) => ({ ...lesson, moduleTitle: module.title }))
  )
  const progress = new Map(
    data?.enrollment.progress.map((entry) => [entry.itemId, entry])
  )
  const safe = data?.enrollment.courseId === workspace.course.id
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) workspace.close()
      }}
    >
      <DialogContent className="sm:max-w-3xl" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>{learnerName}</DialogTitle>
          <DialogDescription>
            Current lesson progress and issued certificate.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {!available ? (
            <Alert variant="warning">
              This enrollment is not available in the selected course page.
            </Alert>
          ) : query.isPending ? (
            <p role="status">Loading learner progress...</p>
          ) : query.isError || !safe ? (
            <Alert variant="warning">
              Learner details could not be loaded.{" "}
              <Button variant="ghost" onClick={() => void query.refetch()}>
                Try again
              </Button>
            </Alert>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <StatusBadge
                  tone={data.enrollment.completedAt ? "success" : "neutral"}
                >
                  {data.enrollment.completedAt
                    ? "Course completed"
                    : "In progress"}
                </StatusBadge>
                <span className="text-sm text-muted-foreground">
                  {
                    lessonRows.filter(
                      (lesson) =>
                        lesson.required &&
                        progress.get(lesson.id)?.status === "completed"
                    ).length
                  }{" "}
                  of {lessonRows.filter((lesson) => lesson.required).length}{" "}
                  current required lessons completed
                </span>
              </div>
              <ul className="divide-y divide-border">
                {lessonRows.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lesson.moduleTitle}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">
                      {(
                        progress.get(lesson.id)?.status ?? "not_started"
                      ).replaceAll("_", " ")}
                      {lesson.type === "video_lesson"
                        ? ` · ${progress.get(lesson.id)?.watchedPercentage ?? 0}% watched`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <section className="space-y-3 border-t border-border pt-4">
                <h3 className="font-semibold">Certificate</h3>
                {certificate ? (
                  <>
                    <p className="text-sm">
                      {certificate.certificateNumber} · {certificate.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Issued {formatPeopleCreatedAt(certificate.issuedAt)}
                    </p>
                    <a
                      href={certificate.verificationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-primary underline"
                    >
                      View certificate verification
                    </a>
                    {workspace.user.role === "admin" &&
                      certificate.status === "valid" && (
                        <div className="space-y-3">
                          <label className="block space-y-2">
                            <span className="text-sm font-medium">
                              Reason for revocation
                            </span>
                            <Input
                              value={reason}
                              onChange={(event) =>
                                setReason(event.target.value)
                              }
                              disabled={busy}
                              maxLength={2000}
                            />
                          </label>
                          <Button
                            variant="destructive"
                            disabled={busy || !reason.trim()}
                            onClick={() =>
                              void run(async () => {
                                await courseMutation(
                                  workspace.clients,
                                  RevokeCourseCertificateDocument,
                                  {
                                    input: {
                                      id: certificate.id,
                                      reason: reason.trim(),
                                    },
                                  }
                                )
                                await query.refetch()
                              }, "Certificate revoked.")
                            }
                          >
                            Revoke certificate
                          </Button>
                        </div>
                      )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No certificate has been issued for this enrollment.
                  </p>
                )}
              </section>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={workspace.close}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
