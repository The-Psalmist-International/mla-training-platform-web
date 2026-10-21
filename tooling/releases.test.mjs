import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import {
  acknowledgeRelease,
  compareReleaseVersions,
  hasUnseenRelease,
  releaseDate,
  releaseNotesKey,
  scheduleReleaseAnnouncement,
} from "../packages/ui/src/lib/release-notes.ts"

const read = (path) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"))
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

for (const app of ["learner", "orchestrator"]) {
  test(`${app}: package version, lockfile and newest release agree`, () => {
    const pkg = read(`../apps/${app}/package.json`)
    const history = read(`../apps/${app}/src/releases.json`)
    const lock = read("../package-lock.json")
    assert.match(pkg.version, semver)
    assert.equal(history[0].version, pkg.version)
    assert.equal(lock.packages[`apps/${app}`].version, pkg.version)
  })
  test(`${app}: history is unique, newest-first and has publishable release notes`, () => {
    const history = read(`../apps/${app}/src/releases.json`)
    assert.ok(history.length > 0)
    assert.equal(
      new Set(history.map((release) => release.version)).size,
      history.length
    )
    history.forEach((release, index) => {
      assert.match(release.version, semver)
      assert.match(release.date, /^\d{4}-\d{2}-\d{2}$/)
      assert.equal(
        new Date(`${release.date}T00:00:00Z`).toISOString().slice(0, 10),
        release.date
      )
      for (const key of ["title", "summary"])
        assert.ok(release[key].trim().length > 0)
      assert.ok(release.changes.length > 0)
      release.changes.forEach((change) => {
        assert.ok(["new", "improved", "fixed"].includes(change.type))
        assert.ok(change.text.trim().length > 0)
      })
      if (index > 0) {
        assert.ok(
          compareReleaseVersions(history[index - 1].version, release.version) >
            0
        )
        assert.ok(history[index - 1].date >= release.date)
      }
    })
  })
}

function storage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

test("dismissed releases stay seen, upgrades prompt, and rollbacks do not prompt", () => {
  const saved = storage()
  const key = releaseNotesKey("learner", "upgrade-test")
  assert.equal(hasUnseenRelease(key, "0.1.0", saved), true)
  acknowledgeRelease(key, "0.1.0", saved)
  assert.equal(hasUnseenRelease(key, "0.1.0", saved), false)
  assert.equal(hasUnseenRelease(key, "0.2.0", saved), true)
  acknowledgeRelease(key, "0.2.0", saved)
  acknowledgeRelease(key, "0.1.0", saved)
  assert.equal(saved.getItem(key), "0.2.0")
  assert.equal(hasUnseenRelease(key, "0.1.0", saved), false)
  assert.equal(hasUnseenRelease(key, "0.2.0", saved), false)
})

test("acknowledgements are independent for each app and user", () => {
  const saved = storage()
  acknowledgeRelease(releaseNotesKey("learner", "one"), "0.1.0", saved)
  assert.equal(
    hasUnseenRelease(releaseNotesKey("learner", "two"), "0.1.0", saved),
    true
  )
  assert.equal(
    hasUnseenRelease(releaseNotesKey("orchestrator", "one"), "0.1.0", saved),
    true
  )
})

test("stored acknowledgements and other-tab updates are respected", () => {
  const saved = storage()
  const key = releaseNotesKey("learner", "stored-test")
  saved.setItem(key, "0.1.0")
  assert.equal(hasUnseenRelease(key, "0.1.0", saved), false)
  saved.setItem(key, "0.2.0")
  assert.equal(hasUnseenRelease(key, "0.2.0", saved), false)
  saved.setItem(key, "broken")
  assert.equal(hasUnseenRelease(key, "0.2.0", saved), true)
})

test("blocked storage falls back to memory without repeated route prompts", () => {
  const saved = {
    getItem() {
      throw new Error("blocked")
    },
    setItem() {
      throw new Error("blocked")
    },
  }
  const key = releaseNotesKey("learner", "blocked-test")
  assert.equal(hasUnseenRelease(key, "0.1.0", saved), true)
  assert.doesNotThrow(() => acknowledgeRelease(key, "0.1.0", saved))
  assert.equal(hasUnseenRelease(key, "0.1.0", saved), false)
  assert.equal(hasUnseenRelease(key, "0.2.0", saved), true)
})

test("version comparison is numeric and release dates are timezone-stable", () => {
  assert.equal(compareReleaseVersions("0.10.0", "0.9.9"), 1)
  assert.equal(compareReleaseVersions("1.0.0", "0.99.99"), 1)
  assert.equal(compareReleaseVersions("0.1.0", "0.1.0"), 0)
  assert.equal(releaseDate("2026-10-20"), "20 October 2026")
})

test("automatic announcement waits for an existing dialog and opens only once", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] })
  let blocked = true
  let opens = 0
  const cancel = scheduleReleaseAnnouncement({
    isUnseen: () => true,
    isBlocked: () => blocked,
    show: () => {
      opens++
    },
  })
  t.mock.timers.tick(350)
  assert.equal(opens, 0)
  blocked = false
  t.mock.timers.tick(1000)
  assert.equal(opens, 1)
  t.mock.timers.tick(5000)
  assert.equal(opens, 1)
  cancel()
})

test("pending prompts cancel on unmount and respect acknowledgement while waiting", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] })
  let opens = 0
  const cancel = scheduleReleaseAnnouncement({
    isUnseen: () => true,
    isBlocked: () => false,
    show: () => {
      opens++
    },
  })
  cancel()
  t.mock.timers.tick(350)
  assert.equal(opens, 0)
  let unseen = true
  const stop = scheduleReleaseAnnouncement({
    isUnseen: () => unseen,
    isBlocked: () => true,
    show: () => {
      opens++
    },
  })
  t.mock.timers.tick(350)
  unseen = false
  t.mock.timers.tick(1000)
  assert.equal(opens, 0)
  stop()
})
