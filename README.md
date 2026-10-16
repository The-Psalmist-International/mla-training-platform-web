# Martyrs platform web

Two TanStack Start apps with shared shadcn UI (preset `b7nwSN6jVA`), Phosphor icons, Apollo GraphQL and TanStack Query. The sibling `mla-platform-core` backend runs separately.

## Development

Use Node 22.15+ or Node 24 LTS and npm 11.12.1. From this folder:

```sh
npm install
npm run dev
```

- Orchestrator: http://localhost:5000 (`npm run dev:orchestrator`)
- Learner: http://localhost:5001 (`npm run dev:learner`)

Copy each app's `.env.example` to `.env.local` to override `VITE_GRAPHQL_URL`; the default is `http://localhost:4000/graphql`. Start the backend separately to use the connection check. No secrets belong in `VITE_*` variables.

## Workspaces

```text
apps/
  orchestrator/   # Admin/instructor app
  learner/        # Learner app
packages/
  ui/            # Preset theme, shared components, Phosphor defaults
  data/          # Apollo/Query clients, typed operations, focused tests
```

Apollo handles GraphQL; Query handles REST and other non-GraphQL data. Both use request-scoped caches and TanStack Start SSR integrations. Routes are declared programmatically in each app's `src/route-tree.tsx`; route views live in `src/pages`. Feature operations live in `packages/data/apollo/<feature>/query.ts`.

Orchestrator opens at `/sign-in`, with sign-in, forgot-password and reset-password screens connected to the backend's existing mutations. Light is the default; the theme switch persists a dark/light preference. Access tokens remain in memory. "Remember my email" saves only the email, not the session. Session restoration, Google callback handling, invitation acceptance and actual workspace screens remain follow-up work.

## Checks and components

See [CI and Vercel deployment](docs/deployment.md) for ordered workflows, backend schema access, and staging/production setup for both apps.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx shadcn@latest add button -c apps/orchestrator
```

Components added from either app are routed to the shared UI workspace. See [frontend setup](docs/frontend-setup.md) for data ownership, SSR, session boundaries, and next steps.
