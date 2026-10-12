import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { Alert } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@workspace/ui/components/dialog"

describe("modal layout and notices", () => {
  it("keeps outline actions border-only without shadows", () => {
    const html = renderToStaticMarkup(
      createElement(Button, { variant: "outline" }, "Cancel")
    )
    expect(html).toContain("border-border")
    expect(html).not.toContain("shadow")
  })
  it("uses a non-scrolling header and footer with a scrollable body", () => {
    const html = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(DialogHeader, null, "Heading"),
        createElement(DialogBody, null, "Content"),
        createElement(DialogFooter, null, "Actions")
      )
    )
    const classes = (slot: string) =>
      html.match(new RegExp(`data-slot="${slot}" class="([^"]*)"`))?.[1]
    expect(classes("dialog-header")).toContain("shrink-0")
    expect(classes("dialog-header")).toContain("border-b")
    expect(classes("dialog-footer")).toContain("shrink-0")
    expect(classes("dialog-footer")).toContain("border-t")
    expect(classes("dialog-body")).toContain("min-h-0")
    expect(classes("dialog-body")).toContain("overflow-y-auto")
    expect(classes("dialog-header")).not.toContain("overflow-y-auto")
    expect(classes("dialog-footer")).not.toContain("overflow-y-auto")
  })

  it("renders information with an icon and semantic theme colors", () => {
    const html = renderToStaticMarkup(
      createElement(Alert, null, "Sessions will end.")
    )
    expect(html).toContain('role="note"')
    expect(html).toContain('data-variant="info"')
    expect(html).toContain("border-ring/25")
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/)
    expect(html).toContain("Sessions will end.")
  })

  it("renders an access warning with an icon and alert semantics", () => {
    const html = renderToStaticMarkup(
      createElement(Alert, { variant: "warning" }, "You may lose access.")
    )
    expect(html).toContain('role="alert"')
    expect(html).toContain('data-variant="warning"')
    expect(html).toContain("border-destructive/25")
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/)
    expect(html).toContain("You may lose access.")
  })
})
