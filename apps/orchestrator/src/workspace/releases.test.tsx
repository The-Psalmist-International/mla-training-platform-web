import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import {
  ReleaseNotes,
  ReleaseTimeline,
} from "@workspace/ui/components/release-notes"
import { orchestratorRelease } from "../release"

describe("orchestrator release notes", () => {
  it("exposes the staff app version without opening a dialog during SSR", () => {
    const html = renderToStaticMarkup(
      <ReleaseNotes config={orchestratorRelease} userId="staff" />
    )
    expect(html).toContain(
      `What&#x27;s new in MLA Orchestrator, version ${orchestratorRelease.version}`
    )
    expect(html).toContain(`v${orchestratorRelease.version}`)
    expect(html).not.toContain('role="dialog"')
  })
  it("renders staff-specific notes and historical releases", () => {
    const latest = orchestratorRelease.releases[0]!
    const older = {
      ...latest,
      version: "0.0.1",
      date: "2026-10-19",
      title: "Previous staff release",
    }
    const html = renderToStaticMarkup(
      <ReleaseTimeline releases={[latest, older]} />
    )
    expect(html).toContain('aria-label="Release history"')
    expect(html).toContain("Previous staff release")
    expect(html.indexOf(latest.title)).toBeLessThan(html.indexOf(older.title))
    expect(html.match(/Latest release/g)).toHaveLength(1)
    expect(html.indexOf(`v${latest.version}</h3>`)).toBeLessThan(
      html.indexOf(`Changes in version ${latest.version}`)
    )
    expect(html.indexOf(latest.title)).toBeLessThan(
      html.indexOf('dateTime="2026-10-20"')
    )
    expect(html).toContain("bg-success text-success-foreground")
    expect(html.indexOf(latest.changes[0]!.text)).toBeLessThan(
      html.indexOf('data-change-type="new"')
    )
    for (const change of latest.changes) expect(html).toContain(change.text)
  })
})
