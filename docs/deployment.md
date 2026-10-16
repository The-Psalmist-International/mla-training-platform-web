# CI and Vercel deployment

`ci.yml` orchestrates separate reusable workflows in order:

`codegen -> typecheck -> test -> build -> deploy`

Failures stop subsequent stages. Pull requests run through build. Pushes to `develop` deploy both apps as Vercel previews; pushes to `main` deploy both to production. The deployment matrix runs orchestrator then learner sequentially. Manual runs deploy only from those two branches. GitHub environments are named `staging` and `production`; configure production reviewers there if release approval is required.

This retains the original CI checks. `npm run lint` is not a release gate: the current checkout has existing lint failures in application source, duplicate imports, and generated build-output handling. Resolve those separately before adding lint to the pipeline.

## Schema access for CI

Code generation reads `../mla-platform-core/schema.graphql`. The codegen workflow checks out both repositories into that layout. In web repository **Settings > Secrets and variables > Actions**, add repository secret `CORE_REPO_READ_TOKEN`: a fine-grained GitHub token limited to **Contents: Read** on `The-Psalmist-International/mla-training-platform-core`, with organization approval if required. The workflow's default token cannot read a different private repository. This repository secret must be available before environment deployment stages. Fork pull requests cannot access it; run trusted changes from repository branches.

Optional repository variable `CORE_SCHEMA_REF` pins the backend schema to a commit/tag. Otherwise PRs use their base environment branch (`main` or `develop`), and branch runs use their corresponding backend branch. Backend contract changes must be merged there before dependent frontend validation. Keep generated operations committed and run `npm run codegen:check` after updating the backend schema.

## One-time Vercel setup

1. Create two Vercel projects using this repository. In each project's **Settings > Build and Deployment > Root Directory**, select `apps/orchestrator` or `apps/learner`, and enable access to source outside that directory for shared packages. Use the TanStack Start preset and Node 22. Configure each app's build command as `npm run build` from its app directory. CLI commands in Actions run from the repository root and use the linked project's root directory settings.
2. Under each Vercel project's **Settings > Environment Variables**, set `VITE_GRAPHQL_URL` for Production and Preview to the corresponding backend GraphQL endpoint. Orchestrator also needs `VITE_LEARNER_URL`; learner needs `VITE_WORKSPACE_URL`. Use reachable HTTPS URLs, with the backend's CORS/cookie/Google redirect settings matching those app origins. For stable staging origins, assign a domain to the `develop` preview branch. Public `VITE_*` variables must never contain secrets.
3. In GitHub **Settings > Environments**, create `staging` and `production`. In each add secrets `VERCEL_TOKEN` (Vercel **Account Settings > Tokens**), `VERCEL_ORG_ID`, `VERCEL_ORCHESTRATOR_PROJECT_ID`, and `VERCEL_LEARNER_PROJECT_ID`. Organization/team ID and project ID are available in Vercel team/project settings. Both GitHub environments may use the same project IDs because staging uses Preview and production uses Production.
4. Automatic Vercel Git deployments are disabled in each app's `vercel.json` so deployment follows CI. Apply these settings to existing projects before relying on this gate. Keep the Git connection for branch/domain metadata.

Deployment installs the pinned Vercel CLI, pulls the target project's settings/environment, builds using those values, then deploys the prebuilt output. CI's earlier build uses localhost placeholders solely to verify compilation; that artifact is not deployed. Real deployment values must therefore be configured in Vercel. A failed deploy fails the job. The pair is not atomic: orchestrator can succeed before learner fails.

There is no frontend database migration: PostgreSQL migrations run in the core repository before API/worker deployment. The repositories have independent release pipelines; release a required backend contract first, then the frontend.

References: [Vercel GitHub Actions guide](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel), [Vercel monorepos](https://vercel.com/docs/monorepos).
