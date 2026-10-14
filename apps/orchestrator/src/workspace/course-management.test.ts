import { describe, expect, it, vi } from "vitest"
import {
  createDataClients,
  AddVideoLessonDocument,
  CourseLearnersDocument,
  SetCourseOwnerDocument,
  type CurrentUser,
} from "@workspace/data"
import { QueryClient } from "@tanstack/react-query"
import {
  courseMutation,
  courseResourceOptions,
  reorderIds,
  reorderTo,
} from "./course-management"
import { questionsSchema } from "../components/course/CourseQuestionsDialog"

const user: CurrentUser = {
  id: "author",
  name: "Author",
  email: "author@example.com",
  role: "instructor",
}
function fixture(data: object) {
  const request = vi
    .fn<typeof fetch>()
    .mockImplementation(async () => Response.json({ data }))
  return {
    request,
    clients: createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    }),
  }
}
describe("course management operations", () => {
  it("attaches uploaded video IDs to the selected module instead of saving them as course-level media", async () => {
    const { clients, request } = fixture({
      createVideoLesson: { id: "course" },
    })
    await courseMutation(clients, AddVideoLessonDocument, {
      courseId: "course",
      moduleId: "module",
      input: {
        title: "Introduction",
        videoAssetId: "video",
        required: true,
        completionThreshold: 90,
      },
    })
    expect(JSON.parse(String(request.mock.calls[0][1]?.body))).toMatchObject({
      operationName: "AddVideoLesson",
      variables: {
        courseId: "course",
        moduleId: "module",
        input: { videoAssetId: "video" },
      },
    })
  })
  it("uses selected course and URL page values for enrollment reads, with authoritative totals", async () => {
    const { clients, request } = fixture({
      courseEnrollmentsPage: { items: [], totalCount: 42 },
    })
    const cache = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    const result = await cache.fetchQuery(
      courseResourceOptions(clients, user, "learners", CourseLearnersDocument, {
        courseId: "course",
        limit: 10,
        offset: 20,
        search: "Ada",
      })
    )
    expect(result.courseEnrollmentsPage.totalCount).toBe(42)
    expect(
      JSON.parse(String(request.mock.calls[0][1]?.body)).variables
    ).toEqual({ courseId: "course", limit: 10, offset: 20, search: "Ada" })
    cache.clear()
  })
  it("does not send course queries for learner accounts and surfaces failed mutations", async () => {
    const { clients, request } = fixture({})
    const cache = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    await expect(
      cache.fetchQuery(
        courseResourceOptions(
          clients,
          { ...user, role: "learner" },
          "learners",
          CourseLearnersDocument,
          { courseId: "course", limit: 20, offset: 0 }
        )
      )
    ).rejects.toThrow("Workspace access required")
    expect(request).not.toHaveBeenCalled()
    await expect(
      courseMutation(clients, SetCourseOwnerDocument, {
        id: "course",
        ownerId: "new-owner",
      })
    ).rejects.toThrow("Missing course update response")
    cache.clear()
  })
  it("preserves exact sibling membership when reordering", () => {
    expect(reorderIds(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"])
    expect(reorderIds(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"])
    expect(reorderIds(["a", "b"], 0, -1)).toEqual(["a", "b"])
  })
  it("moves dragged siblings without mutating the source or accepting unknown targets", () => {
    const ids = ["a", "b", "c"]
    expect(reorderTo(ids, "a", "c")).toEqual(["b", "c", "a"])
    expect(reorderTo(ids, "c", "a")).toEqual(["c", "a", "b"])
    expect(ids).toEqual(["a", "b", "c"])
    expect(reorderTo(ids, "a", "a")).toBe(ids)
    expect(reorderTo(ids, "missing", "a")).toBe(ids)
    expect(reorderTo(ids, "a", "missing")).toBe(ids)
  })
  it("validates choice questions and short-answer reference answers before mutation", async () => {
    const question = {
      type: "mcq",
      prompt: "Question",
      points: 1,
      explanation: "",
      referenceAnswer: "",
      options: [
        { label: "A", isCorrect: true },
        { label: "B", isCorrect: false },
      ],
    }
    expect(await questionsSchema.isValid({ questions: [question] })).toBe(true)
    expect(
      await questionsSchema.isValid({
        questions: [
          {
            ...question,
            options: [
              { label: "A", isCorrect: true },
              { label: "a", isCorrect: false },
            ],
          },
        ],
      })
    ).toBe(false)
    expect(
      await questionsSchema.isValid({
        questions: [{ ...question, type: "short_answer", options: [] }],
      })
    ).toBe(false)
    expect(
      await questionsSchema.isValid({
        questions: [
          {
            ...question,
            type: "short_answer",
            options: [],
            referenceAnswer: "Reference",
          },
        ],
      })
    ).toBe(true)
  })
})
