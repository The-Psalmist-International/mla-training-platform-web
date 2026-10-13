import { describe, expect, it, vi } from "vitest"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { QueryClient } from "@tanstack/react-query"
import { createDataClients, type CurrentUser } from "@workspace/data"
import {
  saveCourse,
  addCourseModule,
  changeCourseStatus,
  courseDetailsOptions,
  videoDetailsOptions,
  videoPreviewOptions,
  createVideoUpload,
  refreshVideoUpload,
  syncVideo,
  courseFormSchema,
  libraryActionError,
} from "./library-actions"
import { validateCoursesSearch, validateVideosSearch } from "./library-search"

const user: CurrentUser = {
  id: "author",
  role: "instructor",
  name: "Author",
  email: "author@example.com",
}
const id = "12345678-1234-4123-8123-123456789abc"
const course = {
  id,
  ownerId: user.id,
  title: "Leadership",
  description: "Foundations",
  status: "draft",
  certificateEnabled: false,
  publishedAt: null,
  createdAt: "2026-10-12T00:00:00Z",
  updatedAt: "2026-10-12T00:00:00Z",
  modules: [],
}
const asset = {
  __typename: "VideoAsset",
  id,
  title: "Introduction",
  mimeType: "video/mp4",
  status: "pending_upload",
  durationSeconds: null,
  sizeBytes: null,
  createdAt: course.createdAt,
  updatedAt: course.updatedAt,
}
const upload = {
  asset,
  upload: {
    endpoint: "https://video.bunnycdn.com/tusupload",
    videoId: id,
    libraryId: "123",
    signature: "temporary-signature",
    expires: 2147483647,
  },
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
const cache = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
describe("course and video writes", () => {
  it("saves and clears a thumbnail through course metadata updates", async () => {
    const { clients, request } = fixture({
      updateCourse: { ...course, thumbnailUrl: null },
    })
    const values = {
      title: course.title,
      description: course.description,
      certificateEnabled: false,
    }
    await saveCourse(
      clients,
      user,
      { ...values, thumbnailUrl: " https://images.example.com/course.jpg " },
      id
    )
    await saveCourse(clients, user, { ...values, thumbnailUrl: " " }, id)
    const inputs = request.mock.calls.map(
      (call) => JSON.parse(String(call[1]?.body)).variables.input
    )
    expect(inputs[0].thumbnailUrl).toBe("https://images.example.com/course.jpg")
    expect(inputs[1].thumbnailUrl).toBeNull()
    expect(
      await courseFormSchema.isValid({
        ...values,
        thumbnailUrl: "http://example.com/image.jpg",
      })
    ).toBe(false)
    expect(
      await courseFormSchema.isValid({ ...values, thumbnailUrl: "" })
    ).toBe(true)
  })
  it("creates/updates trimmed course metadata through the generated mutations", async () => {
    const { clients, request } = fixture({
      createCourse: { ...course, __typename: "Course" },
      updateCourse: course,
    })
    const values = {
      title: " Leadership ",
      description: " Foundations ",
      certificateEnabled: false,
    }
    await saveCourse(clients, user, values)
    await saveCourse(clients, user, values, id)
    const requests = request.mock.calls.map((call) =>
      JSON.parse(String(call[1]?.body))
    )
    expect(requests[0]).toMatchObject({
      operationName: "CreateCourse",
      variables: {
        input: {
          title: "Leadership",
          description: "Foundations",
          certificateEnabled: false,
        },
      },
    })
    expect(requests[1]).toMatchObject({
      operationName: "UpdateCourse",
      variables: { id },
    })
  })
  it("adds a trimmed section through createCourseModule", async () => {
    const { clients, request } = fixture({
      createCourseModule: {
        id,
        modules: [{ id, title: "Foundations", position: 0 }],
      },
    })
    await addCourseModule(clients, user, id, " Foundations ")
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body))).toMatchObject({
      operationName: "CreateCourseModule",
      variables: { courseId: id, input: { title: "Foundations" } },
    })
  })
  it.each(["publish", "unpublish", "archive"] as const)(
    "calls the %s mutation for the selected course",
    async (action) => {
      const field =
        action === "publish"
          ? "publishCourse"
          : action === "unpublish"
            ? "unpublishCourse"
            : "archiveCourse"
      const { clients, request } = fixture({
        [field]: {
          id,
          title: course.title,
          status:
            action === "publish"
              ? "published"
              : action === "unpublish"
                ? "draft"
                : "archived",
        },
      })
      await changeCourseStatus(clients, user, id, action)
      expect(
        JSON.parse(String(request.mock.calls[0]?.[1]?.body)).variables
      ).toEqual({ id })
    }
  )
  it("creates one signed upload reservation and renews/syncs that same asset ID", async () => {
    const { clients, request } = fixture({
      createLessonVideoUpload: upload,
      refreshLessonVideoUpload: upload,
      syncLessonVideoAsset: asset,
    })
    await createVideoUpload(clients, user, {
      title: asset.title,
      mimeType: asset.mimeType,
      requestKey: id,
    })
    await refreshVideoUpload(clients, user, id)
    await syncVideo(clients, user, id)
    const requests = request.mock.calls.map((call) =>
      JSON.parse(String(call[1]?.body))
    )
    expect(requests[0]).toMatchObject({
      operationName: "CreateLessonVideoUpload",
      variables: { input: { requestKey: id } },
    })
    expect(requests[1]).toMatchObject({
      operationName: "RefreshLessonVideoUpload",
      variables: { id },
    })
    expect(requests[2]).toMatchObject({
      operationName: "SyncLessonVideoAsset",
      variables: { id },
    })
  })
  it("rejects learner writes before making requests", async () => {
    const { clients, request } = fixture({})
    const learner = { ...user, role: "learner" as const }
    await expect(
      saveCourse(clients, learner, {
        title: "Title",
        description: "",
        certificateEnabled: false,
      })
    ).rejects.toThrow("Workspace access required")
    await expect(
      changeCourseStatus(clients, learner, id, "publish")
    ).rejects.toThrow("Workspace access required")
    await expect(
      addCourseModule(clients, learner, id, "Section")
    ).rejects.toThrow("Workspace access required")
    await expect(
      createVideoUpload(clients, learner, {
        title: "Video",
        mimeType: "video/mp4",
        requestKey: id,
      })
    ).rejects.toThrow("Workspace access required")
    await expect(refreshVideoUpload(clients, learner, id)).rejects.toThrow(
      "Workspace access required"
    )
    await expect(syncVideo(clients, learner, id)).rejects.toThrow(
      "Workspace access required"
    )
    expect(request).not.toHaveBeenCalled()
  })
  it("validates metadata and masks provider/auth diagnostic messages", async () => {
    expect(
      await courseFormSchema.isValid({
        title: " ",
        description: "",
        certificateEnabled: false,
      })
    ).toBe(false)
    expect(
      await courseFormSchema.isValid({
        title: "a".repeat(201),
        description: "",
        certificateEnabled: false,
      })
    ).toBe(false)
    const error = new CombinedGraphQLErrors({
      errors: [
        {
          message: "secret provider details",
          extensions: { code: "COURSE_NOT_READY" },
        },
      ],
    })
    expect(libraryActionError(error)).toContain("Complete every section")
    expect(libraryActionError(error)).not.toContain("secret")
  })
})
describe("library details and URL recovery", () => {
  it("loads selected course/video records independently of list pagination", async () => {
    const { clients, request } = fixture({ course, videoAsset: asset })
    const queries = cache()
    expect(
      await queries.fetchQuery(courseDetailsOptions(clients, user, id))
    ).toMatchObject({ id, modules: [] })
    expect(
      await queries.fetchQuery(videoDetailsOptions(clients, user, id))
    ).toMatchObject({ id, status: "pending_upload" })
    expect(
      request.mock.calls.map(
        (call) => JSON.parse(String(call[1]?.body)).variables
      )
    ).toEqual([{ id }, { id }])
    queries.clear()
  })
  it("accepts only the signed provider embed host for previews", async () => {
    const { clients } = fixture({
      previewLessonVideo: {
        url: "https://untrusted.example/embed/video?token=secret",
        expires: 2147483647,
      },
    })
    const queries = cache()
    await expect(
      queries.fetchQuery(videoPreviewOptions(clients, user, id))
    ).rejects.toThrow("Invalid video preview URL")
    queries.clear()
  })
  it("restores valid action dialogs and drops tokens/unsupported actions without losing table state", () => {
    const state = {
      q: "Lead",
      page: 3,
      pageSize: 50,
      layout: "grid",
      modal: "edit",
      item: id,
      token: "secret",
      file: "private.mp4",
    }
    expect(validateCoursesSearch(state)).toEqual({
      q: "Lead",
      status: undefined,
      scope: undefined,
      page: 3,
      pageSize: 50,
      layout: "grid",
      modal: "edit",
      item: id,
    })
    expect(validateVideosSearch({ ...state, modal: "resume" })).toMatchObject({
      modal: "resume",
      item: id,
      page: 3,
      layout: "grid",
    })
    expect(
      validateVideosSearch({ ...state, modal: "publish" }).modal
    ).toBeUndefined()
    expect(
      validateCoursesSearch({ ...state, item: "invalid" }).modal
    ).toBeUndefined()
    expect(validateCoursesSearch({ ...state, modal: "create" })).toMatchObject({
      modal: "create",
      item: undefined,
    })
    expect(validateVideosSearch({ modal: "upload" })).toMatchObject({
      modal: "upload",
      item: undefined,
    })
  })
})
