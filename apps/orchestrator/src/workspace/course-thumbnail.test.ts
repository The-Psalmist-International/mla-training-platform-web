import { afterEach, describe, expect, it, vi } from "vitest"
import {
  uploadCourseThumbnail,
  validateThumbnailFile,
} from "./course-thumbnail"

afterEach(() => vi.unstubAllGlobals())
const image = () => new File(["image"], "course.png", { type: "image/png" })

describe("course thumbnail uploads", () => {
  it("uploads multipart data with the POS preset and returns the hosted image", async () => {
    const url =
      "https://res.cloudinary.com/dviigplcx/image/upload/v1/course.png"
    const request = vi
      .fn()
      .mockResolvedValue(Response.json({ secure_url: url }))
    vi.stubGlobal("fetch", request)
    const file = image()
    expect(await uploadCourseThumbnail(file)).toBe(url)
    const [endpoint, options] = request.mock.calls[0]
    expect(endpoint).toBe(
      "https://api.cloudinary.com/v1_1/dviigplcx/image/upload"
    )
    expect(options.body.get("file").name).toBe(file.name)
    expect(options.body.get("upload_preset")).toBe("domus-console")
    expect(options.headers).toBeUndefined()
  })

  it("rejects invalid, empty, or oversized files before uploading", async () => {
    const request = vi.fn()
    vi.stubGlobal("fetch", request)
    for (const file of [
      new File(["svg"], "cover.svg", { type: "image/svg+xml" }),
      new File([], "empty.png", { type: "image/png" }),
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", {
        type: "image/png",
      }),
    ]) {
      await expect(uploadCourseThumbnail(file)).rejects.toThrow()
    }
    expect(request).not.toHaveBeenCalled()
    expect(() =>
      validateThumbnailFile(
        new File(["webp"], "cover.webp", { type: "image/webp" })
      )
    ).not.toThrow()
  })

  it("does not accept failed uploads or URLs from another cloud or resource type", async () => {
    const request = vi.fn()
    vi.stubGlobal("fetch", request)
    for (const response of [
      new Response("error", { status: 400 }),
      Response.json({}),
      Response.json({ secure_url: "https://example.com/cover.png" }),
      Response.json({
        secure_url: "https://res.cloudinary.com/other/image/upload/cover.png",
      }),
      Response.json({
        secure_url:
          "https://res.cloudinary.com/dviigplcx/raw/upload/cover.html",
      }),
    ]) {
      request.mockResolvedValueOnce(response)
      await expect(uploadCourseThumbnail(image())).rejects.toThrow(
        "thumbnail upload failed"
      )
    }
    request.mockRejectedValueOnce(new Error("Network error"))
    await expect(uploadCourseThumbnail(image())).rejects.toThrow(
      "thumbnail upload failed"
    )
  })
})
