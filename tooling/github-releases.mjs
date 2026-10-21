import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"

export function releaseSpec(app, pkg, history) {
  if (!["learner", "orchestrator"].includes(app)) throw new Error("Unknown app")
  if (
    !/^\d+\.\d+\.\d+$/.test(pkg.version) ||
    history[0]?.version !== pkg.version
  )
    throw new Error(
      `${app}: package version must match the latest release notes`
    )
  const release = history[0]
  const body = [
    `# ${release.title}`,
    "",
    release.summary,
    "",
    `Release date: ${release.date}`,
    "",
    ...release.changes.map((change) => `- **${change.type}:** ${change.text}`),
  ].join("\n")
  return {
    tag_name: `${app}-v${release.version}`,
    name: `${app === "learner" ? "Learner" : "Orchestrator"} v${release.version}`,
    body,
    draft: false,
    prerelease: false,
    make_latest: "false",
  }
}

export async function publishRelease({
  spec,
  repository,
  sha,
  token,
  request = fetch,
}) {
  if (
    !/^[\w.-]+\/[\w.-]+$/.test(repository) ||
    !/^[a-f0-9]{40}$/.test(sha) ||
    !token
  )
    throw new Error(
      "Valid repository, commit SHA and release token are required"
    )
  const base = `https://api.github.com/repos/${repository}`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  const call = (path, options = {}) =>
    request(`${base}${path}`, {
      headers,
      redirect: "error",
      signal: AbortSignal.timeout(30000),
      ...options,
    })
  const existing = await call(
    `/releases/tags/${encodeURIComponent(spec.tag_name)}`
  )
  if (existing.ok) {
    const released = await existing.json()
    if (
      released.body !== spec.body ||
      released.name !== spec.name ||
      released.draft ||
      released.prerelease
    )
      throw new Error(
        `${spec.tag_name}: published version differs from its changelog; bump the version instead of rewriting history`
      )
    return "exists"
  }
  if (existing.status !== 404)
    throw new Error(`Cannot check release: HTTP ${existing.status}`)
  // A previous partial attempt may have created a tag. Never attach notes to the wrong commit.
  const tag = await call(`/git/ref/tags/${encodeURIComponent(spec.tag_name)}`)
  if (tag.ok) {
    const ref = await tag.json()
    if (ref.object?.type !== "commit" || ref.object?.sha !== sha)
      throw new Error(
        `${spec.tag_name}: existing tag does not identify this deployment`
      )
  } else if (tag.status !== 404)
    throw new Error(`Cannot check release tag: HTTP ${tag.status}`)
  const result = await call("/releases", {
    method: "POST",
    body: JSON.stringify({ ...spec, target_commitish: sha }),
  })
  if (!result.ok)
    throw new Error(`Cannot publish ${spec.tag_name}: HTTP ${result.status}`)
  return "created"
}

export async function main() {
  if (process.env.GITHUB_REF !== "refs/heads/main")
    throw new Error("Only production/main may publish releases")
  for (const app of ["learner", "orchestrator"]) {
    const read = (path) =>
      JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"))
    const spec = releaseSpec(
      app,
      read(`../apps/${app}/package.json`),
      read(`../apps/${app}/src/releases.json`)
    )
    const status = await publishRelease({
      spec,
      repository: process.env.GITHUB_REPOSITORY,
      sha: process.env.GITHUB_SHA,
      token: process.env.GH_TOKEN,
    })
    console.log(`${spec.tag_name}: ${status}`)
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await main()
