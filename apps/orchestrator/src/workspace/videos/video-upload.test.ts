import { beforeEach, describe, expect, it, vi, type Mock } from "vitest"
import {
  uploadLessonFile,
  uploadFingerprint,
  videoUploadSchema,
  videoMimeType,
  UploadPausedError,
} from "./video-upload"

type Options = {
  metadata: Record<string, string>
  fingerprint: () => Promise<string>
  onBeforeRequest: (request: {
    getURL: () => string
    setHeader: (name: string, value: string) => void
  }) => Promise<void>
  onProgress: (uploaded: number, total: number) => void
  onSuccess: () => void
  onError: (error: Error) => void
}
type StubState = {
  options: Options | null
  headers: Record<string, string>
  hold: boolean
  requestUrl: string
  resumed: Mock<(value: unknown) => void>
  abort: Mock<(terminate: boolean) => void>
  started: boolean
}
const stub = vi.hoisted((): StubState => ({
  options: null,
  headers: {},
  hold: false,
  requestUrl: "https://video.bunnycdn.com/tusupload/previous",
  resumed: vi.fn(),
  abort: vi.fn(),
  started: false,
}))
vi.mock("tus-js-client", () => ({
  Upload: class {
    constructor(
      _file: File,
      public options: Options
    ) {
      stub.options = options
    }
    async findPreviousUploads() {
      return [{ uploadUrl: "https://video.bunnycdn.com/tusupload/previous" }]
    }
    resumeFromPreviousUpload(value: unknown) {
      stub.resumed(value)
    }
    start() {
      stub.started = true
      void this.options
        .onBeforeRequest({
          getURL: () => stub.requestUrl,
          setHeader: (name, value) => {
            stub.headers[name] = value
          },
        })
        .then(
          () => {
            if (!stub.hold) {
              this.options.onProgress(1, 2)
              this.options.onSuccess()
            }
          },
          (error: Error) => this.options.onError(error)
        )
    }
    async abort(terminate: boolean) {
      stub.abort(terminate)
    }
  },
}))
const file = new File(["video bytes"], "lesson.mp4", {
  type: "video/mp4",
  lastModified: 123,
})
const target = {
  endpoint: "https://video.bunnycdn.com/tusupload",
  videoId: "video-id",
  libraryId: "123",
  signature: "signed-value",
  expires: 2147483647,
}
beforeEach(() => {
  stub.options = null
  stub.headers = {}
  stub.hold = false
  stub.started = false
  stub.requestUrl = "https://video.bunnycdn.com/tusupload/previous"
  stub.resumed.mockClear()
  stub.abort.mockClear()
})
describe("signed resumable video transfers", () => {
  it("sends signed headers, correct metadata and resumes the same asset fingerprint", async () => {
    const progress = vi.fn()
    await uploadLessonFile({
      file,
      title: "Lesson",
      userId: "author",
      assetId: "asset",
      target,
      renew: vi.fn(),
      signal: new AbortController().signal,
      onProgress: progress,
    })
    expect(stub.headers).toEqual({
      AuthorizationSignature: "signed-value",
      AuthorizationExpire: "2147483647",
      LibraryId: "123",
      VideoId: "video-id",
    })
    expect(stub.options?.metadata).toEqual({
      filetype: "video/mp4",
      title: "Lesson",
    })
    expect(await stub.options?.fingerprint()).toBe(
      uploadFingerprint("author", "asset", file)
    )
    expect(stub.resumed).toHaveBeenCalledOnce()
    expect(progress).toHaveBeenCalledWith(50)
    expect(uploadFingerprint("other", "asset", file)).not.toBe(
      uploadFingerprint("author", "asset", file)
    )
    expect(uploadFingerprint("author", "different", file)).not.toBe(
      uploadFingerprint("author", "asset", file)
    )
  })
  it("renews expiring credentials for the same target before sending bytes", async () => {
    const renew = vi
      .fn()
      .mockResolvedValue({ ...target, signature: "renewed-value" })
    await uploadLessonFile({
      file,
      title: "Lesson",
      userId: "author",
      assetId: "asset",
      target: { ...target, expires: 1 },
      renew,
      signal: new AbortController().signal,
      onProgress: vi.fn(),
    })
    expect(renew).toHaveBeenCalledOnce()
    expect(stub.headers.AuthorizationSignature).toBe("renewed-value")
  })
  it("pauses without terminating the provider upload", async () => {
    stub.hold = true
    const controller = new AbortController()
    const transfer = uploadLessonFile({
      file,
      title: "Lesson",
      userId: "author",
      assetId: "asset",
      target,
      renew: vi.fn(),
      signal: controller.signal,
      onProgress: vi.fn(),
    })
    const rejected = expect(transfer).rejects.toBeInstanceOf(UploadPausedError)
    await vi.waitFor(() => expect(stub.started).toBe(true))
    controller.abort()
    await rejected
    expect(stub.abort).toHaveBeenCalledWith(false)
  })
  it("rejects an unexpected upload endpoint before starting transfer", async () => {
    await expect(
      uploadLessonFile({
        file,
        title: "Lesson",
        userId: "author",
        assetId: "asset",
        target: { ...target, endpoint: "https://untrusted.example/upload" },
        renew: vi.fn(),
        signal: new AbortController().signal,
        onProgress: vi.fn(),
      })
    ).rejects.toThrow("Invalid upload endpoint")
    expect(stub.started).toBe(false)
  })
  it("rejects a tampered saved upload URL before attaching signatures", async () => {
    stub.requestUrl = "https://untrusted.example/upload"
    await expect(
      uploadLessonFile({
        file,
        title: "Lesson",
        userId: "author",
        assetId: "asset",
        target,
        renew: vi.fn(),
        signal: new AbortController().signal,
        onProgress: vi.fn(),
      })
    ).rejects.toThrow("Video transfer failed")
    expect(stub.headers).toEqual({})
  })
  it("validates file types and rejects empty files before reservation", async () => {
    expect(videoMimeType({ name: "video.MOV", type: "" })).toBe(
      "video/quicktime"
    )
    expect(
      videoMimeType({ name: "photo.mp4", type: "image/png" })
    ).toBeUndefined()
    expect(await videoUploadSchema.isValid({ title: "Lesson", file })).toBe(
      true
    )
    expect(
      await videoUploadSchema.isValid({
        title: "Lesson",
        file: new File([], "empty.mp4", { type: "video/mp4" }),
      })
    ).toBe(false)
    expect(
      await videoUploadSchema.isValid({ title: "Lesson", file: null })
    ).toBe(false)
  })
})
