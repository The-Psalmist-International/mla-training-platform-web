import { createElement, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient } from "@tanstack/react-query"
import type * as ReactQueryModule from "@tanstack/react-query"
import { createDataClients, type CurrentUser } from "@workspace/data"
import {
  analyticsInput,
  analyticsOptions,
  validateAnalyticsSearch,
  type AnalyticsData,
} from "./analytics"
import { AnalyticsPage } from "../../pages/AnalyticsPage"
import { AnalyticsDashboard } from "../../components/analytics/AnalyticsDashboard"
import {
  AxisChart,
  DonutChart,
  ChartData,
  ChartDataTable,
  ChartPanel,
  chartColors,
} from "../../components/analytics/AnalyticsCharts"
import {
  calendarDate,
  calendarDay,
  dateRangePresets,
} from "@workspace/ui/components/date-range-picker"

const state = vi.hoisted<{
  data: AnalyticsData | null
  navigate: ReturnType<typeof vi.fn>
}>(() => ({ data: null, navigate: vi.fn() }))
const user: CurrentUser = {
  id: "author",
  role: "instructor",
  name: "Author",
  email: "author@example.test",
}
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    search,
    children,
    ...props
  }: {
    to: string
    search?: Record<string, string>
    children: ReactNode
  }) =>
    createElement(
      "a",
      {
        ...props,
        href: to + (search ? `?${new URLSearchParams(search)}` : ""),
      },
      children
    ),
  useRouter: () => ({
    options: {
      context: {
        auth: { subscribe: () => () => {}, getUser: () => user },
        dataClients: { graphqlUrl: "http://localhost:4000/graphql" },
      },
    },
  }),
  useNavigate: () => state.navigate,
  useSearch: () => ({}),
}))
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof ReactQueryModule>()),
  useQuery: () => ({
    data: state.data,
    isPending: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

const courseId = "11111111-1111-4111-8111-111111111111"
const empty: AnalyticsData = {
  from: "2026-10-01",
  to: "2026-10-14",
  generatedAt: "2026-10-14T12:00:00Z",
  enrolled: 0,
  learners: 0,
  notStarted: 0,
  inProgress: 0,
  completed: 0,
  firstAttempts: 0,
  passed: 0,
  gradedAttempts: 0,
  pendingAssessments: 0,
  pendingVideos: 0,
  courses: [{ id: courseId, title: "Safety training" }],
  coursePerformance: [],
  trend: [],
  scoreDistribution: [],
  retries: [],
  reviewAge: [],
  lessons: [],
  questions: [],
  followUps: [],
  followUpCount: 0,
}
beforeEach(() => {
  state.data = empty
  vi.clearAllMocks()
})
describe("analytics URL, data, and presentation", () => {
  it("opens chart data in a dialog instead of rendering long tables inside cards", () => {
    const rows = Array.from({ length: 100 }, (_, index) => [
      index + 1,
      `Lesson ${index + 1}`,
      "1/4",
    ])
    const closed = renderToStaticMarkup(
      createElement(ChartData, {
        headers: ["Order", "Lesson", "Completed / enrolled"],
        rows,
      })
    )
    expect(closed).toContain('aria-haspopup="dialog"')
    expect(closed).toContain("View chart data")
    expect(closed).not.toContain("<details")
    expect(closed).not.toContain("<table")
    const table = renderToStaticMarkup(
      createElement(ChartDataTable, {
        title: "Lesson progress",
        headers: ["Order", "Lesson", "Completed / enrolled"],
        rows,
      })
    )
    expect(table).toContain("sticky top-0")
    expect(table).toContain("Lesson 100")
    expect(table).toContain('scope="col"')
    expect(table).toContain("max-h-[60dvh]")
  })
  it("keeps chart explanations in heading tooltips with full-width legends and blue charts", () => {
    const panel = renderToStaticMarkup(
      createElement(ChartPanel, {
        title: "Completion trend",
        description: "Daily completions for the selected period.",
        children: createElement(DonutChart, {
          title: "Completion trend",
          centerLabel: "Learners",
          values: [
            { label: "Completed", value: 3 },
            { label: "In progress", value: 2 },
          ],
        }),
      })
    )
    expect(panel).toContain("aria-label=\"About Completion trend\"")
    expect(panel).not.toContain("mt-1 text-xs leading-5")
    expect(panel).toContain("w-full")
    expect(panel).toContain("View chart data")
    for (const color of chartColors) {
      expect(color).not.toContain("var(--border)")
      expect(color).toContain("var(--primary)")
    }
    const axis = renderToStaticMarkup(
      createElement(AxisChart, {
        title: "Trend",
        labels: ["Oct 1", "Oct 2"],
        series: [{ label: "Completed", values: [1, 2] }],
      })
    )
    expect(axis).toContain("w-full")
    expect(axis).toContain("View chart data")
  })
  it("preserves valid custom filters and deep pagination, rejecting malformed date ranges", () => {
    expect(
      validateAnalyticsSearch({
        range: "custom",
        from: "2026-10-01",
        to: "2026-10-14",
        courseId,
        page: "42",
      })
    ).toEqual({
      range: "custom",
      from: "2026-10-01",
      to: "2026-10-14",
      courseId,
      page: 42,
    })
    for (const patch of [
      { from: "2026-02-30" },
      { to: "2026-09-30" },
      { from: "2024-01-01" },
    ])
      expect(
        validateAnalyticsSearch({
          range: "custom",
          from: "2026-10-01",
          to: "2026-10-14",
          ...patch,
        }).range
      ).toBe("90")
    expect(validateAnalyticsSearch({ courseId: "invalid", page: -1 })).toEqual({
      range: "90",
      page: 1,
    })
  })
  it("uses inclusive UTC days for presets and calendar round-trips", () => {
    const now = new Date("2026-10-14T12:00:00Z")
    expect(analyticsInput({ range: "7", page: 2, courseId }, now)).toEqual({
      from: "2026-10-08",
      to: "2026-10-14",
      courseId,
      page: 2,
    })
    expect(dateRangePresets("2026-10-14")[1]).toEqual({
      label: "Last 7 days",
      from: "2026-10-08",
      to: "2026-10-14",
    })
    expect(calendarDay(calendarDate("2026-03-08"))).toBe("2026-03-08")
    expect(calendarDay(calendarDate("2026-11-01"))).toBe("2026-11-01")
  })
  it("requests actual analytics with filters and isolates role and user caches", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ data: { workspaceAnalytics: empty } }))
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    })
    const cache = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    const input = { from: empty.from, to: empty.to, page: 1, courseId }
    expect(
      await cache.fetchQuery(analyticsOptions(clients, user, input))
    ).toEqual(empty)
    const operation = JSON.parse(String(request.mock.calls[0]?.[1]?.body))
    expect(operation.operationName).toBe("WorkspaceAnalytics")
    expect(operation.variables).toEqual({ input })
    expect(
      analyticsOptions(clients, { ...user, role: "admin" }, input).queryKey
    ).not.toEqual(analyticsOptions(clients, user, input).queryKey)
    await expect(
      cache.fetchQuery(
        analyticsOptions(clients, { ...user, role: "learner" }, input)
      )
    ).rejects.toThrow("Workspace access required")
    expect(request).toHaveBeenCalledTimes(1)
    cache.clear()
  })
  it("renders the calendar filter without the removed heading or explanatory note", () => {
    const html = renderToStaticMarkup(createElement(AnalyticsPage))
    expect(html).toContain('id="analytics-range"')
    expect(html).toContain("Date range:")
    expect(html).not.toContain("Training outcomes")
    expect(html).not.toContain("Learners in enrollment cohort")
    expect(html).not.toContain("completion, understanding, and learners")
    expect(html).not.toContain("UTC · Progress")
    expect(html).not.toContain('type="date"')
    expect(html).toContain("space-y-10")
  })
  it("uses shared empty states instead of fabricated percentages or trends", () => {
    const html = renderToStaticMarkup(
      createElement(AnalyticsDashboard, {
        data: empty,
        role: "instructor",
        page: 1,
        onCourse: vi.fn(),
        onPage: vi.fn(),
      })
    )
    expect(html).toContain('data-slot="empty-state"')
    expect(html).toContain("No enrollments in this period")
    expect(html).toContain("No follow-up needed")
    expect(html).not.toContain("NaN")
    expect(html).not.toContain("Invitation")
  })
  it("distinguishes a genuine zero pass rate from missing results", () => {
    const chart = renderToStaticMarkup(
      createElement(AxisChart, {
        title: "Pass rate",
        labels: ["Attempt 1"],
        series: [{ label: "Passed", values: [0] }],
        percent: true,
        hasData: true,
      })
    )
    expect(chart).toContain("<svg")
    expect(chart).toContain("View chart data")
    expect(chart).not.toContain("No results yet")
    const noData = renderToStaticMarkup(
      createElement(DonutChart, {
        title: "Progress",
        centerLabel: "Enrollments",
        values: [{ label: "Completed", value: 0 }],
      })
    )
    expect(noData).toContain("Nothing to show yet")
    expect(noData).not.toContain("<circle")
  })
  it("renders chart variation, course drill-downs, and exact denominators", () => {
    const data: AnalyticsData = {
      ...empty,
      enrolled: 4,
      learners: 4,
      completed: 1,
      inProgress: 2,
      notStarted: 1,
      firstAttempts: 2,
      passed: 1,
      gradedAttempts: 3,
      coursePerformance: [
        {
          id: courseId,
          title: "Safety training",
          enrolled: 4,
          completed: 1,
          completionRate: 25,
          firstAttempts: 2,
          passed: 1,
          passRate: 50,
        },
      ],
      trend: [{ date: "2026-10-01", enrolled: 4, completed: 1 }],
      scoreDistribution: [
        { label: "0–19%", count: 1 },
        { label: "80–100%", count: 2 },
      ],
      retries: [{ attemptNumber: 1, passed: 1, total: 2, passRate: 50 }],
      lessons: [
        {
          id: "lesson",
          title: "Introduction",
          courseTitle: "Safety training",
          enrolled: 4,
          completed: 1,
          completionRate: 25,
          firstAttempts: 0,
          passRate: null,
        },
      ],
      questions: [
        {
          id: "version",
          title: "Which step comes first?",
          assessmentTitle: "Safety assessment",
          attemptNumber: 1,
          answers: 2,
          belowFullCredit: 1,
          difficultyRate: 50,
        },
      ],
    }
    const html = renderToStaticMarkup(
      createElement(AnalyticsDashboard, {
        data,
        courseId,
        role: "admin",
        page: 1,
        onCourse: vi.fn(),
        onPage: vi.fn(),
      })
    )
    for (const text of [
      "Training progress",
      "Learning over time",
      "Assessment score distribution",
      "Question difficulty",
      "25%",
      "50%",
      "View chart data",
    ])
      expect(html).toContain(text)
    expect(html).toContain("<circle")
    expect(html).toContain("<polyline")
    expect(html).toContain("<rect")
    expect(html).toContain("Darker blue")
  })
})
