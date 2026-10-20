import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import {
  ReleaseNotes,
  ReleaseTimeline,
} from "@workspace/ui/components/release-notes"
import { learnerRelease } from "../release"

describe("learner release notes", () => {
  it("exposes the current app version through a named history trigger", () => {
    const html = renderToStaticMarkup(
      <ReleaseNotes config={learnerRelease} userId="learner" />
    )
    expect(html).toContain(
      `What&#x27;s new in MLA Learners, version ${learnerRelease.version}`
    )
    expect(html).toContain(`v${learnerRelease.version}`)
    expect(html).not.toContain('role="dialog"')
  })
  it("renders the current release and retained history in timeline order", () => {
    const latest = learnerRelease.releases[0]!
    const older = {
      ...latest,
      version: "0.0.1",
      date: "2026-10-19",
      title: "Previous learner release",
    }
    const html = renderToStaticMarkup(
      <ReleaseTimeline releases={[latest, older]} />
    )
    expect(html).toContain('aria-label="Release history"')
    expect(html).toContain('dateTime="2026-10-20"')
    expect(html).toContain("Previous learner release")
    expect(html.indexOf(latest.title)).toBeLessThan(html.indexOf(older.title))
    expect(html.match(/Latest release/g)).toHaveLength(1)
    expect(html).toContain("text-3xl")
    expect(html.indexOf(`v${latest.version}</h3>`)).toBeLessThan(
      html.indexOf(`Changes in version ${latest.version}`)
    )
    expect(html).toContain("animate-pulse")
    expect(html).toContain("motion-reduce:")
    expect(html).toContain("bg-success text-success-foreground")
    expect(html.indexOf(latest.title)).toBeLessThan(
      html.indexOf('dateTime="2026-10-20"')
    )
    expect(html.indexOf(latest.changes[0]!.text)).toBeLessThan(
      html.indexOf('data-change-type="new"')
    )
    for (const change of latest.changes) expect(html).toContain(change.text)
  })
  it("uses distinct trailing colors for new, improved and fixed changes", () => {
    const release = {
      ...learnerRelease.releases[0]!,
      changes: [
        { type: "new" as const, text: "A new capability" },
        { type: "improved" as const, text: "An improved experience" },
        { type: "fixed" as const, text: "A resolved issue" },
      ],
    }
    const html = renderToStaticMarkup(<ReleaseTimeline releases={[release]} />)
    expect(html).toContain("bg-success text-success-foreground")
    expect(html).toContain("bg-ring/10 text-ring")
    expect(html).toContain("bg-warning/10 text-warning")
    for (const change of release.changes)
      expect(html.indexOf(change.text)).toBeLessThan(
        html.indexOf(`data-change-type="${change.type}"`)
      )
  })
})
