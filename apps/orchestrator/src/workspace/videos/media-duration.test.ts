import { describe, expect, it, vi, afterEach } from "vitest"
import {
  checkLessonVideoFile,
  validateLessonVideoDuration,
} from "./media-duration"

afterEach(() => vi.restoreAllMocks())
describe("lesson duration preflight", () => {
  it("accepts exactly 15 minutes and rejects longer videos or invalid metadata", () => {
    expect(() => validateLessonVideoDuration(900)).not.toThrow()
    for (const duration of [900.01, 901, 1800, 0, -1, NaN, Infinity])
      expect(() => validateLessonVideoDuration(duration)).toThrow()
  })
  it("rejects cancelled preflight before allocating media resources", async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(
      checkLessonVideoFile({} as File, controller.signal)
    ).rejects.toMatchObject({ name: "AbortError" })
  })
  it("allows audio through 30 minutes and rejects longer recordings", () => {
    expect(() => validateLessonVideoDuration(1800, "audio")).not.toThrow()
    expect(() => validateLessonVideoDuration(1800.01, "audio")).toThrow()
  })
})
