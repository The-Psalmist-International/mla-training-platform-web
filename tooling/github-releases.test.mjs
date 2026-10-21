import assert from "node:assert/strict"
import { test } from "node:test"
import { publishRelease, releaseSpec } from "./github-releases.mjs"

const release = {
  version: "0.2.0",
  title: "Lessons",
  date: "2026-10-20",
  summary: "Learn in more formats.",
  changes: [{ type: "new", text: "Audio lessons." }],
}
const spec = releaseSpec("learner", { version: "0.2.0" }, [release])
const settings = {
  spec,
  repository: "example/web",
  sha: "a".repeat(40),
  token: "test-only-token",
}
test("GitHub release notes and app versions come from the same manifest", () => {
  assert.equal(spec.tag_name, "learner-v0.2.0")
  assert.ok(spec.body.includes(release.changes[0].text))
  assert.throws(() => releaseSpec("learner", { version: "0.1.0" }, [release]))
  assert.equal(
    releaseSpec("orchestrator", { version: "0.2.0" }, [release]).tag_name,
    "orchestrator-v0.2.0"
  )
})
test("publishes missing releases against the deployed SHA", async () => {
  const calls = []
  const request = async (url, options) => {
    calls.push({ url, options })
    return calls.length < 3
      ? new Response(null, { status: 404 })
      : Response.json({ id: 1 }, { status: 201 })
  }
  assert.equal(await publishRelease({ ...settings, request }), "created")
  assert.equal(JSON.parse(calls[2].options.body).target_commitish, settings.sha)
  assert.equal(calls[2].options.method, "POST")
  assert.equal(calls[2].options.redirect, "error")
})
test("reruns skip an identical release without publishing duplicates", async () => {
  let calls = 0
  assert.equal(
    await publishRelease({
      ...settings,
      request: async () => {
        calls++
        return Response.json(spec)
      },
    }),
    "exists"
  )
  assert.equal(calls, 1)
})
test("published notes are immutable and stale tags are never reused", async () => {
  await assert.rejects(
    publishRelease({
      ...settings,
      request: async () => Response.json({ ...spec, body: "changed" }),
    }),
    /bump the version/
  )
  let calls = 0
  await assert.rejects(
    publishRelease({
      ...settings,
      request: async () =>
        ++calls === 1
          ? new Response(null, { status: 404 })
          : Response.json({ object: { type: "commit", sha: "b".repeat(40) } }),
    }),
    /does not identify/
  )
})
test("permission and provider failures cannot silently mark releases successful", async () => {
  await assert.rejects(
    publishRelease({
      ...settings,
      request: async () => new Response(null, { status: 403 }),
    }),
    /HTTP 403/
  )
})
