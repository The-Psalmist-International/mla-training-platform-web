# Application versions and release notes

Learner and Orchestrator are versioned independently. Their first explicitly tracked release is `0.1.0`. Earlier deployments are not assigned invented versions or release dates. History accumulates from this baseline.

## Publishing a release

1. Bump `version` in the relevant app's `package.json` using `MAJOR.MINOR.PATCH` (no prerelease suffix). Use patch for fixes, minor for compatible features, and major for breaking product changes.
2. Update the matching workspace version in the root `package-lock.json` (or regenerate the lockfile with npm).
3. Prepend an entry in `apps/learner/src/releases.json` or `apps/orchestrator/src/releases.json`. The first entry's version must equal the app package version. Use a `YYYY-MM-DD` release date, a short title, a summary and user-facing changes tagged `new`, `improved` or `fixed`.
4. Keep prior entries unchanged. Do not replace the history with only the latest notes. Each app may ship independently, with its own release content and version.
5. Run `npm run test:tooling`, app tests, typechecking and build. Tooling tests in the existing CI test stage check manifest/package/lockfile agreement, unique numeric versions, descending version/date order, and nonempty release content.
6. Merge and deploy through the existing develop/staging and main/production workflow. Both version and release history are bundled into the app, so a failed deployment cannot advertise an unreleased remote version.

## Automatic GitHub Releases

After both production app deployments from `main` succeed, the separate **GitHub Releases** workflow publishes `learner-v<VERSION>` and `orchestrator-v<VERSION>` tags/releases against that deployed commit. Titles and notes are generated from the same app manifests used by the in-app timeline. Staging/develop and pull requests never publish releases.

The release job alone receives `contents: write`; deployment and validation jobs remain read-only. The built-in Actions token is used; no additional release secret is required. An unchanged existing release is skipped on reruns. Published notes cannot be silently rewritten: change the version for new notes. A conflicting pre-existing tag causes the job to fail instead of pointing release notes at another commit. With two apps in one repository, neither release is forced into GitHub's single repository-wide "latest" slot.

Release publication has its own job/status. A failed release job can be rerun after fixing repository permissions or a tag conflict without deliberately bypassing deployment gates. A failed production deployment cannot publish its release. No existing GitHub release is edited or deleted by this workflow.

## User experience

- A signed-in user sees **What's new** automatically on their next visit/reload into a newer app version, including this first tracked version. An already open app is not force-refreshed or interrupted at deployment time; reload to load the new bundle.
- Orchestrator displays its current version beside its name in the sidebar header (and in the overview link's accessible label/tooltip when collapsed). Learner displays its version on the header history button on larger screens. Both apps have an accessible history action at all sizes, which reopens the complete newest-first timeline at any time.
- Close, Escape, outside click, and **Got it** all acknowledge the displayed version. Opening alone does not acknowledge it. Older entries remain readable, including when users skip releases.
- Automatic display waits for any existing dialog to close. Its body scrolls while the title, close control and footer stay available.
- Acknowledgement is stored per app and user in browser localStorage. Origins naturally separate staging from production. Another browser/device or cleared site storage may show the release again; there is no server-side read receipt.
- Blocked storage falls back to memory for the current page session. Older tabs and rollback deployments cannot overwrite acknowledgement of a newer version or prompt for an older release.
- Only version strings and user-scoped keys are stored; credentials and tokens are not stored here.
