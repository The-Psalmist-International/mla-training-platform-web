import { Link } from "@tanstack/react-router"
import { UserAvatar } from "@workspace/ui/components/user-avatar"
import {
  DataTable,
  type DataTableColumn,
} from "@workspace/ui/components/data-table"
import {
  ChartPanel,
  ChartEmpty,
  DonutChart,
  AxisChart,
  ScatterChart,
  ChartData,
  percentage,
  count,
} from "./AnalyticsCharts"
import type { AnalyticsData } from "../../workspace/analytics/analytics"

export type FollowUpRow = AnalyticsData["followUps"][number]

const followUpColumns: DataTableColumn<FollowUpRow>[] = [
  {
    id: "learner",
    header: "Learner",
    className: "min-w-56",
    cell: (entry) => (
      <span className="flex items-center gap-2">
        <UserAvatar
          name={entry.learnerName}
          email={entry.learnerEmail}
          avatarUrl={entry.learnerAvatarUrl}
          className="shrink-0"
        />
        <span className="min-w-0">
          {entry.learnerName}
          <span className="block text-xs break-words text-muted-foreground">
            {entry.learnerEmail}
          </span>
        </span>
      </span>
    ),
  },
  {
    id: "course",
    header: "Course",
    className: "min-w-48",
    cell: (entry) => <span className="line-clamp-2">{entry.courseTitle}</span>,
  },
  {
    id: "signal",
    header: "Support signal",
    className: "min-w-40",
    cell: (entry) => entry.reason,
  },
  {
    id: "actions",
    header: "Actions",
    className: "w-32 text-right",
    cell: (entry) => (
      <Link
        className="rounded text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        to="/workspace/enrollments"
        search={{ course: entry.courseId }}
      >
        View enrollments
      </Link>
    ),
  },
]

export function AnalyticsDashboard({
  data,
  courseId,
  role,
  page,
  onCourse,
  onPage,
  onRefresh,
  fetching = false,
}: {
  data: AnalyticsData
  courseId?: string
  role: string
  page: number
  onCourse: (id: string) => void
  onPage: (page: number) => void
  onRefresh?: () => void
  fetching?: boolean
}) {
  const course = data.courses.find((entry) => entry.id === courseId)
  const points = data.coursePerformance
    .filter((entry) => entry.completionRate !== null && entry.passRate !== null)
    .map((entry) => ({
      ...entry,
      completionRate: entry.completionRate!,
      passRate: entry.passRate!,
    }))
  return (
    <div className="space-y-8">
      <div className="grid items-stretch gap-8 lg:grid-cols-5">
        <ChartPanel
          title="Training progress"
          description="Current progress of enrollments created in the selected period. Each enrollment is counted once."
          className="lg:col-span-2"
        >
          <DonutChart
            title="Training progress"
            centerLabel="Enrollments"
            values={[
              { label: "Completed", value: data.completed },
              { label: "In progress", value: data.inProgress },
              { label: "Not started", value: data.notStarted },
            ]}
          />
        </ChartPanel>
        <ChartPanel
          title="Learning over time"
          description="Daily enrollments and completions recorded in the selected period, including completions from earlier enrollments. Dates use UTC."
          className="lg:col-span-3"
        >
          <AxisChart
            title="Enrollments and completions over time"
            labels={data.trend.map((entry) => entry.date.slice(5))}
            series={[
              {
                label: "Completed",
                values: data.trend.map((entry) => entry.completed),
              },
              {
                label: "Enrolled",
                values: data.trend.map((entry) => entry.enrolled),
              },
            ]}
          />
        </ChartPanel>
      </div>
      <div className="grid items-stretch gap-8 xl:grid-cols-2">
        <ChartPanel
          title={
            course ? "Assessment understanding" : "Completion & understanding"
          }
          description="Course completion for the enrollment cohort versus pass rates for first attempts graded in the period. Hover a point to see sample sizes."
        >
          <ScatterChart points={points} />
        </ChartPanel>
        <ChartPanel
          title="Assessment score distribution"
          description={`Normalized scores for ${count(data.gradedAttempts)} attempts graded in the selected period. Includes repeat attempts.`}
        >
          <AxisChart
            title="Assessment score distribution"
            kind="columns"
            labels={data.scoreDistribution.map((entry) => entry.label)}
            series={[
              {
                label: "Graded attempts",
                values: data.scoreDistribution.map((entry) => entry.count),
              },
            ]}
          />
        </ChartPanel>
      </div>
      <ChartPanel
        title="Course completion"
        description="Courses ranked by cohort completion rate. Select a course to explore its lessons and assessments; percentages always show their denominator."
      >
        {!data.coursePerformance.some((entry) => entry.enrolled > 0) ? (
          <ChartEmpty
            title="No enrollments in this period"
            description="Choose a different date range or enroll learners in a course."
          />
        ) : (
          <>
            <div className="space-y-4">
              {data.coursePerformance
                .filter((entry) => entry.enrolled > 0)
                .slice(0, 8)
                .map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onCourse(entry.id)}
                    className="group grid w-full gap-2 rounded-md p-2 text-left outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_6rem] sm:items-center"
                  >
                    <span className="truncate text-sm" title={entry.title}>
                      {entry.title}
                    </span>
                    <span className="h-2 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${entry.completionRate ?? 0}%` }}
                      />
                    </span>
                    <span className="text-right text-xs tabular-nums">
                      {percentage(entry.completionRate)}{" "}
                      <span className="text-muted-foreground">
                        ({entry.completed}/{entry.enrolled})
                      </span>
                    </span>
                  </button>
                ))}
            </div>
            <ChartData
              headers={[
                "Course",
                "Completed / enrolled",
                "Completion",
                "Passed / first attempts",
                "Pass rate",
              ]}
              rows={data.coursePerformance.map((entry) => [
                <button
                  type="button"
                  className="rounded text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => onCourse(entry.id)}
                >
                  {entry.title}
                </button>,
                `${entry.completed}/${entry.enrolled}`,
                percentage(entry.completionRate),
                `${entry.passed}/${entry.firstAttempts}`,
                percentage(entry.passRate),
              ])}
            />
          </>
        )}
      </ChartPanel>
      {course ? (
        <div className="grid items-stretch gap-8 xl:grid-cols-2">
          <ChartPanel
            title="Lesson progress"
            description={`Completion for ${course.title}, in curriculum order. Includes lessons, assessments, and submission activities.`}
          >
            <AxisChart
              title="Lesson completion in curriculum order"
              kind="columns"
              percent
              hasData={data.enrolled > 0}
              labels={data.lessons.map((_, index) => String(index + 1))}
              series={[
                {
                  label: "Completion rate",
                  values: data.lessons.map(
                    (entry) => entry.completionRate ?? 0
                  ),
                },
              ]}
              table={{
                headers: [
                  "Order",
                  "Lesson / activity",
                  "Completed / enrolled",
                  "First-attempt pass rate",
                  "First attempts",
                ],
                rows: data.lessons.map((entry, index) => [
                  index + 1,
                  entry.title,
                  `${entry.completed}/${entry.enrolled}`,
                  percentage(entry.passRate),
                  entry.firstAttempts,
                ]),
              }}
            />
          </ChartPanel>
          <ChartPanel
            title="Question difficulty"
            description="Heatmap of answers below full credit by question version and attempt number. Includes partial credit; up to 100 combinations with the highest rates."
          >
            <QuestionHeatmap questions={data.questions} />
          </ChartPanel>
        </div>
      ) : (
        <div className="rounded-lg bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
          Select a course above to explore lesson progress and difficult
          assessment questions.
        </div>
      )}
      <div className="grid items-stretch gap-8 lg:grid-cols-2">
        <ChartPanel
          title="Success across retries"
          description={`Cumulative pass rate for ${count(data.firstAttempts)} assessment/enrollment pairs whose first attempt was graded in the selected period, followed through subsequent attempts (up to attempt 10).`}
          className="lg:col-span-2"
        >
          <AxisChart
            title="Cumulative assessment pass rate by attempt"
            percent
            hasData={data.firstAttempts > 0}
            labels={data.retries.map(
              (entry) => `Attempt ${entry.attemptNumber}`
            )}
            series={[
              {
                label: "Passed by this attempt",
                values: data.retries.map((entry) => entry.passRate),
              },
            ]}
          />
        </ChartPanel>
        <ChartPanel
          title="Reviews awaiting a decision"
          description="Current queue for this course scope, regardless of the selected date range. Only ready videos are included."
        >
          <DonutChart
            title="Pending reviews by type"
            centerLabel="Reviews"
            values={[
              { label: "Assessments", value: data.pendingAssessments },
              { label: "Videos", value: data.pendingVideos },
            ]}
          />
        </ChartPanel>
        <ChartPanel
          title="Assessment review age"
          description="Current assessment queue, measured from submission. Video review age is excluded because its ready-for-review timestamp is not recorded."
        >
          <AxisChart
            title="Pending assessments by waiting time"
            kind="columns"
            labels={data.reviewAge.map((entry) => entry.label)}
            series={[
              {
                label: "Pending assessments",
                values: data.reviewAge.map((entry) => entry.count),
              },
            ]}
          />
        </ChartPanel>
      </div>
      <ChartPanel
        title="Learners needing follow-up"
        description={`${role === "instructor" ? "Your courses" : "Workspace courses"} · selected enrollment cohort. These are support signals, not overdue or inactivity claims.`}
      >
        {!data.followUpCount ? (
          <ChartEmpty
            title="No follow-up needed"
            description="There are no not-started enrollments, outstanding reviews, or assessment/revision support signals in this cohort."
          />
        ) : (
          <DataTable
            rows={data.followUps}
            columns={followUpColumns}
            getRowId={(entry) => entry.id}
            ariaLabel="Learners needing follow-up"
            onRefresh={() => onRefresh?.()}
            pagination={{
              pageIndex: page - 1,
              pageSize: 10,
              pageSizeOptions: [10],
              totalCount: data.followUpCount,
              onPageChange: (index) => onPage(index + 1),
              onPageSizeChange: () => {},
            }}
            isFetching={fetching}
            emptyState="No learners on this page. Go back to a previous page."
          />
        )}
      </ChartPanel>
    </div>
  )
}
function QuestionHeatmap({
  questions,
}: {
  questions: AnalyticsData["questions"]
}) {
  if (!questions.length)
    return (
      <ChartEmpty
        title="No question results yet"
        description="Graded assessment answers will reveal which questions need attention."
      />
    )
  const rows = [
    ...new Map(
      questions.map((entry) => [`${entry.id}-${entry.assessmentTitle}`, entry])
    ).values(),
  ].slice(0, 12)
  const attempts = [
    ...new Set(questions.map((entry) => entry.attemptNumber)),
  ].sort((a, b) => a - b)
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th
                scope="col"
                className="p-2 text-left font-medium text-muted-foreground"
              >
                Question / version
              </th>
              {attempts.map((attempt) => (
                <th
                  key={attempt}
                  scope="col"
                  className="p-2 font-medium text-muted-foreground"
                >
                  #{attempt}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((entry) => (
              <tr key={`${entry.id}-${entry.assessmentTitle}`}>
                <th scope="row" className="max-w-48 p-2 text-left font-normal">
                  <span className="line-clamp-2" title={entry.title}>
                    {entry.title}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    {entry.assessmentTitle} · {entry.id.slice(0, 6)}
                  </span>
                </th>
                {attempts.map((attempt) => {
                  const cell = questions.find(
                    (question) =>
                      question.id === entry.id &&
                      question.assessmentTitle === entry.assessmentTitle &&
                      question.attemptNumber === attempt
                  )
                  return (
                    <td key={attempt} className="p-1">
                      <span
                        className="flex min-h-9 min-w-12 items-center justify-center rounded-sm font-medium tabular-nums"
                        style={
                          cell
                            ? {
                                background: `color-mix(in oklch, var(--primary) ${Math.max(8, cell.difficultyRate * 0.3)}%, var(--background))`,
                              }
                            : {}
                        }
                        title={
                          cell
                            ? `${cell.belowFullCredit}/${cell.answers} answers below full credit`
                            : "No graded answers in the displayed results"
                        }
                      >
                        {cell ? percentage(cell.difficultyRate) : "—"}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Darker blue = more answers below full credit. Showing up to 12 question
        versions.
      </p>
      <ChartData
        headers={[
          "Question",
          "Assessment",
          "Version",
          "Attempt",
          "Below full credit / answers",
          "Rate",
        ]}
        rows={questions.map((entry) => [
          entry.title,
          entry.assessmentTitle,
          entry.id.slice(0, 6),
          entry.attemptNumber,
          `${entry.belowFullCredit}/${entry.answers}`,
          percentage(entry.difficultyRate),
        ])}
      />
    </>
  )
}
