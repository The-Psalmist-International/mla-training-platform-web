# Martyrs platform web

Two TanStack Start apps with shared shadcn UI (preset `b7nwSN6jVA`), Phosphor icons, Apollo GraphQL and TanStack Query. The sibling `mla-platform-core` backend is unchanged.

## Development

Use Node 22.15+ or Node 24 LTS and npm 11.12.1. From this folder:

```sh
npm install
npm run dev
```

- Orchestrator: http://localhost:3000 (`npm run dev:orchestrator`)
- Learner: http://localhost:5173 (`npm run dev:learner`)

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

Apollo handles GraphQL; Query handles REST and other non-GraphQL data. Both use request-scoped caches and TanStack Start SSR integrations. This is a scaffold, not completed dashboards or authentication.

## Checks and components

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx shadcn@latest add button -c apps/orchestrator
```

Components added from either app are routed to the shared UI workspace. See [frontend setup](docs/frontend-setup.md) for data ownership, SSR, session boundaries, and next steps.
