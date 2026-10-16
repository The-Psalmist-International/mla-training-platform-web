import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { VideoSubmissionConfirmation } from "./VideoSubmissionConfirmation"

describe("video submission confirmation", () => {
  it.each(["processing", "pending_review", "approved"] as const)(
    "confirms an uploaded response without exposing %s",
    (status) => {
      const html = renderToStaticMarkup(
        createElement(VideoSubmissionConfirmation, { status })
      )
      expect(html).toContain("Video uploaded")
      expect(html).toContain("You can continue learning")
      expect(html).not.toMatch(
        /processing|Checking|Check now|<ol|Instructor review/
      )
    }
  )
  it("never confirms an incomplete transfer", () => {
    expect(
      renderToStaticMarkup(
        createElement(VideoSubmissionConfirmation, { status: "uploading" })
      )
    ).toBe("")
  })
  it("offers a useful recovery message for failed videos", () => {
    const html = renderToStaticMarkup(
      createElement(VideoSubmissionConfirmation, {
        status: "failed",
        failureCode: "VIDEO_DURATION_EXCEEDED",
      })
    )
    expect(html).toContain("Please upload your video again")
    expect(html).toContain("Upload a shorter video")
    expect(html).not.toContain("Video uploaded")
  })
  it("retains instructor feedback when a revision is requested", () => {
    const html = renderToStaticMarkup(
      createElement(VideoSubmissionConfirmation, {
        status: "needs_revision",
        feedback: "Please explain your example.",
      })
    )
    expect(html).toContain("Your instructor requested an update")
    expect(html).toContain("Please explain your example.")
  })
})
