import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { FileInput } from "@workspace/ui/components/file-input"

describe("FileInput", () => {
  it("keeps a labeled native file control behind the custom empty state", () => {
    const markup = renderToStaticMarkup(
      <FileInput
        id="video-file"
        name="file"
        file={null}
        accept=".mp4"
        aria-label="Video file"
        aria-describedby="file-help"
      />
    )
    expect(markup).toContain('type="file"')
    expect(markup).toContain('name="file"')
    expect(markup).toContain('accept=".mp4"')
    expect(markup).toContain('aria-label="Video file"')
    expect(markup).toContain(
      'aria-describedby="video-file-selection file-help"'
    )
    expect(markup).toContain("No file selected")
    expect(markup).toContain("Click to select a file.")
  })

  it("shows selected file details and respects a locked upload", () => {
    const markup = renderToStaticMarkup(
      <FileInput
        file={new File([new Uint8Array(1024 * 1024)], "lesson.mp4")}
        disabled
        aria-invalid
        aria-describedby="file-error"
      />
    )
    expect(markup).toContain("lesson.mp4")
    expect(markup).toContain("1 MB")
    expect(markup).toContain('disabled=""')
    expect(markup).toContain('aria-invalid="true"')
    expect(markup).toContain("file-error")
    expect(markup).not.toContain("No file selected")
    expect(markup).not.toContain("choose another file")
  })
})
