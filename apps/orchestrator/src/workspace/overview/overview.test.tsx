import { createElement, type ReactNode } from "react"
import { mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { QueryClient } from "@tanstack/react-query"
import { createDataClients, type CurrentUser } from "@workspace/data"
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    params,
    search,
    children,
    ...props
  }: {
    to: string
    params?: Record<string, string>
    search?: object
    children?: ReactNode
  }) => {
    const path = Object.entries(params ?? {}).reduce(
      (url, [name, value]) => url.replace(`$${name}`, value),
      to
    )
    const values =
      typeof search === "function"
        ? (search as (previous: object) => object)({})
        : search
    const query =
      values && typeof values === "object"
        ? new URLSearchParams(
            Object.entries(values).filter(
              ([, value]) => value !== undefined
            ) as [string, string][]
          ).toString()
        : ""
    return createElement(
      "a",
      { ...props, href: `${path}${query ? `?${query}` : ""}` },
      children
    )
  },
  useRouter: vi.fn(),
}))
import {
  OverviewDashboard,
  OverviewGreeting,
} from "../../components/overview/WorkspaceOverview"
import { overviewOptions, type OverviewData } from "./overview"
const user: CurrentUser = {
  id: "author",
  name: "Author",
  email: "author@example.com",
  role: "instructor",
}
const empty: OverviewData = {
  publishedCourses: 0,
  draftCourses: 0,
  activeLearners: 0,
  totalEnrollments: 0,
  completedEnrollments: 0,
  pendingReviews: 0,
  pendingAssessments: 0,
  pendingVideoReviews: 0,
  failedVideos: 0,
  incompleteDrafts: 0,
  pendingInvitations: null,
  emailIssues: null,
  generatedAt: "2026-10-14T00:00:00Z",
  recentCourses: [],
  draftsNeedingWork: [],
  assessmentReviews: [],
  videoReviews: [],
  failedVideoItems: [],
}
describe("workspace overview", () => {
  it("uses real query results and rejects learner access", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ data: { workspaceOverview: empty } }))
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    })
    const cache = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    expect(await cache.fetchQuery(overviewOptions(clients, user))).toEqual(
      empty
    )
    expect(
      JSON.parse(String(request.mock.calls[0]?.[1]?.body)).operationName
    ).toBe("WorkspaceOverview")
    await expect(
      cache.fetchQuery(
        overviewOptions(clients, { ...user, id: "learner", role: "learner" })
      )
    ).rejects.toThrow("Workspace access required")
    expect(request).toHaveBeenCalledTimes(1)
    cache.clear()
  })
  it("shows an actionable empty state without administration actions for instructors", () => {
    const html = renderToStaticMarkup(
      createElement(OverviewDashboard, { data: empty, role: "instructor" })
    )
    expect(html).toContain("You’re all caught up")
    expect(html).toContain("Your first course starts here")
    expect(html).toContain("Learning progress")
    expect(html).toContain("No enrollments yet")
    expect(html).toContain('data-slot="empty-state"')
    expect(html).not.toContain("Invite people")
    expect(html).toContain("scope=mine")
    expect(html).not.toContain("Pending invitations")
  })
  it("links review work to the correct course and shows admin diagnostics", () => {
    const html = renderToStaticMarkup(
      createElement(OverviewDashboard, {
        role: "admin",
        data: {
          ...empty,
          pendingReviews: 2,
          pendingVideoReviews: 2,
          videoReviews: [
            { courseId: "course-a", title: "Foundations", totalCount: 2 },
          ],
          pendingInvitations: 3,
          emailIssues: 1,
        },
      })
    )
    expect(html).toContain("course-a?tab=reviews&amp;reviewType=video")
    expect(html).toContain("Review videos")
    expect(html).toContain("Learning progress")
    expect(html).toContain("Email delivery issues")
    expect(html).toContain("scope=all")
    expect(html).not.toContain("You’re all caught up")
  })
  it("shows completion per enrollment without treating empty data as zero-percent performance", () => {
    const html = renderToStaticMarkup(
      createElement(OverviewDashboard, {
        role: "admin",
        data: { ...empty, totalEnrollments: 50, completedEnrollments: 20 },
      })
    )
    expect(html).toContain("40%")
    expect(html).toContain('aria-valuenow="40"')
    expect(html).toContain("Still learning")
    expect(html).toContain(">30</dd>")
    expect(html).not.toContain("Quick actions")
    expect(html).not.toContain("Upload video")
  })
  it("renders an optional visual fixture using the real overview component", () => {
    const output = process.env.OVERVIEW_PREVIEW_DIR
    if (!output) return
    const course = {
      id: "course-a",
      title: "Foundations of Christian Leadership",
      thumbnailUrl: null,
      status: "published" as const,
      updatedAt: "2026-10-14T00:00:00Z",
    }
    const data: OverviewData = {
      ...empty,
      publishedCourses: 8,
      draftCourses: 3,
      activeLearners: 124,
      totalEnrollments: 160,
      completedEnrollments: 36,
      pendingReviews: 7,
      pendingAssessments: 5,
      pendingVideoReviews: 2,
      failedVideos: 1,
      incompleteDrafts: 2,
      pendingInvitations: 4,
      emailIssues: 1,
      assessmentReviews: [
        { courseId: course.id, title: course.title, totalCount: 5 },
      ],
      videoReviews: [
        { courseId: course.id, title: "Living the Gospel", totalCount: 2 },
      ],
      failedVideoItems: [
        { id: "video-a", title: "Introduction to the Epistles" },
      ],
      draftsNeedingWork: [
        {
          ...course,
          id: "course-b",
          title: "Serving Your Community",
          status: "draft",
        },
      ],
      recentCourses: [
        course,
        {
          ...course,
          id: "course-b",
          title: "Serving Your Community",
          status: "draft",
        },
        { ...course, id: "course-c", title: "Living the Gospel" },
      ],
    }
    const assets = resolve("dist/client/assets")
    const css = readdirSync(assets)
      .filter((file) => file.endsWith(".css"))
      .map(
        (file) =>
          `<link rel="stylesheet" href="${pathToFileURL(resolve(assets, file)).href}">`
      )
      .join("")
    const markup = renderToStaticMarkup(
      createElement(OverviewDashboard, { data, role: "admin" })
    )
    const font = pathToFileURL(
      resolve("public/SeasonCollectionVF-TRIAL.ttf")
    ).href
    mkdirSync(output, { recursive: true })
    const greeting = renderToStaticMarkup(
      createElement(OverviewGreeting, { name: "Alex" })
    )
    const body = `<main class="mx-auto w-full max-w-7xl space-y-6 p-6"><header><p class="mb-2 text-xs text-muted-foreground">VISUAL TEST DATA</p>${greeting}</header>${markup}</main>`
    for (const theme of ["light", "dark"])
      writeFileSync(
        resolve(output, `${theme}.html`),
        `<!doctype html><html class="${theme === "dark" ? "dark" : ""}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${css}<style>@font-face{font-family:'Season Collection';src:url('${font}') format('truetype');font-weight:300 900}body{font-family:'Season Collection',sans-serif}</style></head><body class="bg-background text-foreground">${body}</body></html>`
      )
    expect(markup).toContain("Review assessments")
  })
})
