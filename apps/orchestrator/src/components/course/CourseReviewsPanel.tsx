import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Form, FormikProvider, useFormik } from "formik"
import * as yup from "yup"
import {
  CourseAssessmentReviewsDocument,
  CourseVideoReviewsDocument,
  CourseAttemptReviewDocument,
  CourseSubmissionReviewDocument,
  GradeCourseAttemptDocument,
  ReviewCourseSubmissionDocument,
  type CourseAttemptReviewQuery,
  type CourseSubmissionReviewQuery,
} from "@workspace/data"
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye"
import { Button } from "@workspace/ui/components/button"
import { FormInput, FormFeedback } from "@workspace/ui/components/form-input"
import { SelectInput } from "@workspace/ui/components/select"
import { DataTable } from "@workspace/ui/components/data-table"
import { UserAvatar } from "@workspace/ui/components/user-avatar"
import { TableRowActions } from "@workspace/ui/components/table-row-actions"
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
import { formatPeopleCreatedAt } from "../../workspace/people/people"
import {
  courseMutation,
  courseResourceOptions,
} from "../../workspace/course/course-management"
import {
  useCourseTask,
  useCourseTableSearch,
  type CourseWorkspace,
} from "./course-workspace"

export function CourseReviewsPanel({
  workspace,
}: {
  workspace: CourseWorkspace
}) {
  const { course, search, owns } = workspace
  const tableSearch = useCourseTableSearch(workspace)
  const video = search.reviewType === "video"
  const size = search.coursePageSize ?? 20,
    page = (search.coursePage ?? 1) - 1
  const variables = {
    courseId: course.id,
    limit: size,
    offset: page * size,
    search: search.courseQ,
  }
  const assessments = useQuery({
    ...courseResourceOptions(
      workspace.clients,
      workspace.user,
      "assessment-reviews",
      CourseAssessmentReviewsDocument,
      variables
    ),
    enabled: owns && !video,
  })
  const submissions = useQuery({
    ...courseResourceOptions(
      workspace.clients,
      workspace.user,
      "video-reviews",
      CourseVideoReviewsDocument,
      variables
    ),
    enabled: owns && video,
  })
  const query = video ? submissions : assessments
  const rows: {
    id: string
    title: string
    date: string
    learnerName: string
    learnerAvatarUrl: string | null
    attemptNumber: number
  }[] = video
    ? (submissions.data?.videoSubmissionReviewQueuePage.items ?? []).map(
        (row) => ({ ...row, title: row.promptTitle, date: row.createdAt })
      )
    : (assessments.data?.assessmentReviewQueuePage.items ?? []).map((row) => ({
        ...row,
        title: row.assessmentTitle,
        date: row.submittedAt,
      }))
  const total = video
    ? (submissions.data?.videoSubmissionReviewQueuePage.totalCount ?? 0)
    : (assessments.data?.assessmentReviewQueuePage.totalCount ?? 0)
  useEffect(() => {
    if (!query.data) return
    const last = Math.max(1, Math.ceil(total / size))
    if (page + 1 > last) workspace.update({ coursePage: last }, true)
  }, [query.data, total, size, page, workspace])
  if (!owns)
    return (
      <Alert>
        Only this course's instructor or an administrator can review learner
        submissions.
      </Alert>
    )
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Reviews</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Grade pending short answers and review learner video submissions for
          this course.
        </p>
      </div>
      <DataTable
        rows={rows}
        getRowId={(row) => row.id}
        ariaLabel="Course review queue"
        search={{
          value: tableSearch.value,
          onChange: tableSearch.onChange,
          placeholder: "Search learners or lesson titles",
        }}
        filters={
          <SelectInput
            aria-label="Review type"
            value={video ? "video" : "assessment"}
            onValueChange={(reviewType) =>
              workspace.update({
                reviewType: reviewType === "video" ? "video" : undefined,
                coursePage: undefined,
                action: undefined,
                selection: undefined,
              })
            }
            options={[
              { value: "assessment", label: "Assessment answers" },
              { value: "video", label: "Video submissions" },
            ]}
          />
        }
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
        emptyState={
          video
            ? "No video submissions are waiting for review."
            : "No assessment answers are waiting for grading."
        }
        errorState={
          query.isError ? (
            <ErrorState
              title="Reviews could not be loaded"
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
            id: "learner",
            header: "Learner",
            cell: (row) => (
              <span className="flex items-center gap-3">
                <UserAvatar
                  name={row.learnerName}
                  avatarUrl={row.learnerAvatarUrl}
                />
                <span className="font-medium">{row.learnerName}</span>
              </span>
            ),
          },
          {
            id: "lesson",
            header: video ? "Prompt" : "Assessment",
            cell: (row) => row.title,
          },
          {
            id: "attempt",
            header: "Attempt",
            cell: (row) => row.attemptNumber,
          },
          {
            id: "submitted",
            header: "Submitted",
            cell: (row) => formatPeopleCreatedAt(row.date),
          },
          {
            id: "actions",
            header: "Actions",
            className: "w-20 text-right",
            cell: (row) => (
              <TableRowActions
                subject={`${row.learnerName} · ${row.title}`}
                primary={[
                  {
                    label: video
                      ? "Review video submission"
                      : "Review assessment answers",
                    icon: <EyeIcon aria-hidden />,
                    onSelect: () =>
                      workspace.open(
                        video ? "review-video" : "review-assessment",
                        { selection: row.id }
                      ),
                  },
                ]}
              />
            ),
          },
        ]}
      />
      {(search.action === "review-assessment" ||
        search.action === "review-video") && (
        <CourseReviewDialog
          key={search.selection}
          workspace={workspace}
          available={
            rows.some((row) => row.id === search.selection) &&
            (video
              ? search.action === "review-video"
              : search.action === "review-assessment")
          }
          video={video}
        />
      )}
    </div>
  )
}

function CourseReviewDialog({
  workspace,
  available,
  video,
}: {
  workspace: CourseWorkspace
  available: boolean
  video: boolean
}) {
  const task = useCourseTask(workspace)
  const variables = { id: workspace.search.selection ?? "" }
  const attempt = useQuery({
    ...courseResourceOptions(
      workspace.clients,
      workspace.user,
      "attempt-review",
      CourseAttemptReviewDocument,
      variables
    ),
    enabled: available && !video,
  })
  const submission = useQuery({
    ...courseResourceOptions(
      workspace.clients,
      workspace.user,
      "submission-review",
      CourseSubmissionReviewDocument,
      variables
    ),
    enabled: available && video,
    gcTime: 0,
    staleTime: 0,
  })
  const query = video ? submission : attempt
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !task.busy) workspace.close()
      }}
    >
      <DialogContent className="sm:max-w-3xl" showCloseButton={!task.busy}>
        <DialogHeader>
          <DialogTitle>
            {video ? "Review video submission" : "Grade assessment answers"}
          </DialogTitle>
          <DialogDescription>
            {video
              ? submission.data?.videoSubmission.promptTitle
              : attempt.data?.assessmentAttempt.assessmentTitle}
          </DialogDescription>
        </DialogHeader>
        {!available ? (
          <>
            <DialogBody>
              <Alert variant="warning">
                This review is no longer pending in the selected course page.
              </Alert>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={workspace.close}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : query.isPending ? (
          <DialogBody>
            <p role="status">Loading review...</p>
          </DialogBody>
        ) : query.isError ? (
          <>
            <DialogBody>
              <Alert variant="warning">
                The review could not be loaded.{" "}
                <Button variant="ghost" onClick={() => void query.refetch()}>
                  Try again
                </Button>
              </Alert>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={workspace.close}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : video && submission.data ? (
          <VideoReviewForm
            workspace={workspace}
            data={submission.data}
            task={task}
          />
        ) : attempt.data ? (
          <AssessmentReviewForm
            workspace={workspace}
            data={attempt.data}
            task={task}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function AssessmentReviewForm({
  workspace,
  data,
  task,
}: {
  workspace: CourseWorkspace
  data: CourseAttemptReviewQuery
  task: ReturnType<typeof useCourseTask>
}) {
  const attempt = data.assessmentAttempt
  const short = attempt.answers.filter(
    (answer) => answer.question.type === "short_answer"
  )
  const form = useFormik({
    initialValues: {
      grades: short.map((answer) => ({
        questionId: answer.question.id,
        awardedPoints: answer.awardedPoints?.toString() ?? "",
        feedback: answer.feedback ?? "",
        maxPoints: answer.question.points,
      })),
    },
    validationSchema: yup.object({
      grades: yup.array().of(
        yup.object({
          awardedPoints: yup
            .number()
            .typeError("Enter awarded points.")
            .min(0)
            .required()
            .test(
              "points",
              "Awarded points must not exceed the question's points and must use at most two decimal places.",
              function (value) {
                return (
                  value <= this.parent.maxPoints &&
                  Math.abs(value * 100 - Math.round(value * 100)) < 1e-7
                )
              }
            ),
          feedback: yup.string().max(10000),
        })
      ),
    }),
    onSubmit: async (values) => {
      if (attempt.status !== "needs_grading" || !workspace.owns) return
      await task.run(
        () =>
          courseMutation(workspace.clients, GradeCourseAttemptDocument, {
            input: {
              attemptId: attempt.id,
              grades: values.grades.map((grade) => ({
                questionId: grade.questionId,
                awardedPoints: Number(grade.awardedPoints),
                feedback: grade.feedback.trim(),
              })),
            },
          }),
        "Assessment graded.",
        true
      )
    },
  })
  return (
    <FormikProvider value={form}>
      <Form noValidate className="flex min-h-0 flex-1 flex-col">
        <DialogBody className="space-y-5">
          {attempt.answers.map((answer, index) => {
            const shortIndex = short.findIndex(
              (entry) => entry.question.id === answer.question.id
            )
            return (
              <section
                key={answer.question.id}
                className="space-y-3 rounded-lg border border-border p-4"
              >
                <h3 className="font-semibold">
                  {index + 1}. {answer.question.prompt}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {answer.question.points} points
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {answer.textAnswer ??
                    answer.question.options.find(
                      (option) => option.id === answer.selectedOptionId
                    )?.label ??
                    "No answer submitted"}
                </p>
                {answer.referenceAnswer && (
                  <p className="text-sm text-muted-foreground">
                    Reference answer: {answer.referenceAnswer}
                  </p>
                )}
                {shortIndex >= 0 ? (
                  <>
                    <label className="block space-y-2">
                      <span className="font-medium">Awarded points</span>
                      <FormInput
                        name={`grades.${shortIndex}.awardedPoints`}
                        type="number"
                        min={0}
                        max={answer.question.points}
                        step="0.01"
                        disabled={
                          task.busy || attempt.status !== "needs_grading"
                        }
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="font-medium">Feedback (optional)</span>
                      <FormInput
                        name={`grades.${shortIndex}.feedback`}
                        maxLength={10000}
                        disabled={
                          task.busy || attempt.status !== "needs_grading"
                        }
                      />
                    </label>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Automatically awarded {answer.awardedPoints ?? 0} points.
                  </p>
                )}
              </section>
            )
          })}
          <FormFeedback />
        </DialogBody>
        <DialogFooter>
          <Button
            type="submit"
            disabled={
              task.busy ||
              form.isSubmitting ||
              attempt.status !== "needs_grading" ||
              !short.length
            }
          >
            {task.busy ? "Saving..." : "Submit grades"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={task.busy}
            onClick={workspace.close}
          >
            Cancel
          </Button>
        </DialogFooter>
      </Form>
    </FormikProvider>
  )
}

function VideoReviewForm({
  workspace,
  data,
  task,
}: {
  workspace: CourseWorkspace
  data: CourseSubmissionReviewQuery
  task: ReturnType<typeof useCourseTask>
}) {
  const submission = data.videoSubmission
  let url: string | undefined
  try {
    const parsed = new URL(data.videoSubmissionPlayback.url)
    if (
      parsed.protocol === "https:" &&
      parsed.hostname === "player.mediadelivery.net" &&
      parsed.pathname.startsWith("/embed/")
    )
      url = parsed.href
  } catch {
    /* Do not embed invalid playback URLs. */
  }
  const form = useFormik<{
    decision: "approved" | "needs_revision"
    feedback: string
  }>({
    initialValues: {
      decision: "approved",
      feedback: submission.feedback,
    },
    validationSchema: yup.object({
      feedback: yup
        .string()
        .trim()
        .max(10000)
        .when("decision", {
          is: "needs_revision",
          then: (schema) =>
            schema.required("Explain what the learner should revise."),
        }),
    }),
    onSubmit: async (values) => {
      if (submission.status !== "pending_review" || !workspace.owns) return
      await task.run(
        () =>
          courseMutation(workspace.clients, ReviewCourseSubmissionDocument, {
            input: {
              submissionId: submission.id,
              decision: values.decision,
              feedback: values.feedback.trim(),
            },
          }),
        values.decision === "approved"
          ? "Video submission approved."
          : "Revision requested.",
        true
      )
    },
  })
  return (
    <FormikProvider value={form}>
      <Form noValidate className="flex min-h-0 flex-1 flex-col">
        <DialogBody className="space-y-4">
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
            {submission.instructions}
          </p>
          {url ? (
            <iframe
              src={url}
              title={`Submission for ${submission.promptTitle}`}
              className="aspect-video w-full rounded-md"
              allow="fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <Alert variant="warning">Video playback is unavailable.</Alert>
          )}
          <label className="block space-y-2">
            <span className="font-medium">Decision</span>
            <SelectInput
              value={form.values.decision}
              onValueChange={(decision) =>
                void form.setFieldValue("decision", decision)
              }
              disabled={task.busy}
              className="w-full"
              options={[
                { value: "approved", label: "Approve submission" },
                { value: "needs_revision", label: "Request revision" },
              ]}
            />
          </label>
          <label className="block space-y-2">
            <span className="font-medium">Feedback</span>
            <FormInput name="feedback" maxLength={10000} disabled={task.busy} />
          </label>
          <FormFeedback />
        </DialogBody>
        <DialogFooter>
          <Button
            type="submit"
            disabled={
              task.busy ||
              form.isSubmitting ||
              submission.status !== "pending_review" ||
              !url
            }
          >
            {task.busy ? "Saving..." : "Save review"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={task.busy}
            onClick={workspace.close}
          >
            Cancel
          </Button>
        </DialogFooter>
      </Form>
    </FormikProvider>
  )
}
