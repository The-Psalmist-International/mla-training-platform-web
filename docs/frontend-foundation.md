# Frontend foundation

This repository contains two TanStack Start apps, not the API or worker:

- `apps/orchestrator`: the future admin/instructor surface, development port 3000.
- `apps/learner`: the future learner surface, development port 5173.
- `packages/ui`: shared shadcn components, preset theme, font and Phosphor icon defaults.
- `packages/data`: request-scoped Apollo/Query clients and typed starter operations.

The sibling `../mla-platform-core` backend remains independent. No product dashboards, login/refresh flow, route authorization, or GraphQL schema code generation are implemented in this scaffold.

## Design system

The repository was initialized with `shadcn init --preset b7nwSN6jVA --template start --monorepo --pointer`. Preserve the generated theme, font, component style and pointer-button rules. Phosphor replaces the preset's icon selection as explicitly requested. All three `components.json` files must keep matching style, icon library and base color.

Add shared components from either app using `npx shadcn@latest add <component>`. The monorepo aliases route shared components into `packages/ui`. Use semantic theme classes and `@workspace/ui/components/button`, not duplicate app-local button styles. Import application icons from `@phosphor-icons/react`; an `IconContext` provider establishes size 20 and regular weight in both apps.

## Data ownership and SSR

Apollo owns GraphQL operations, normalized entities, mutations and GraphQL cache updates. Use Apollo hooks from `@apollo/client/react`, or `context.preloadQuery` in loaders. The official `@apollo/client-integration-tanstack-start` adapter supplies streaming SSR hydration and its Apollo provider. Its current release is a release candidate, pinned in the lockfile; validate upgrades deliberately.

TanStack Query owns REST/non-GraphQL requests. Use `context.queryClient.ensureQueryData(...)` in loaders and `useQuery` in components. `@tanstack/react-router-ssr-query` handles streaming hydration and the Query provider. Do not wrap Apollo queries in a second Query cache for the same data.

`getRouter()` creates new clients on every invocation, avoiding process-wide caches during SSR. Both integrations preserve provider wrapping and router serialization hooks. The two apps have separate router instances and caches.

The public `VITE_GRAPHQL_URL` defaults to `http://localhost:4000/graphql`. Use an absolute HTTP(S) endpoint reachable by both the browser and the SSR server; it is compiled into the browser bundle, so it must not contain credentials or secrets. The REST health URL is derived from that origin at `/health`.

## Authentication boundary

The HTTP link sends `credentials: "include"` for backend cookie support and obtains bearer tokens dynamically. `setAccessToken(token)` changes the default in-memory token and clears both caches; call it when switching identity or logging out. Tokens are not persisted in local/session storage. The optional `getAccessToken` callback supports a future request-local SSR session implementation and takes precedence over the in-memory setter.

Authenticated SSR is **not yet implemented**. Do not forward arbitrary incoming cookies or tokens to an untrusted endpoint, put access tokens in router context dehydration, or create a process-global session. The backend refresh cookie is not an access token; protected resolvers still require a valid bearer JWT. Login, refresh coordination, role guards and unauthorized recovery belong to the next identity feature slice. Public health checks need no authentication.

For local development, the backend's existing example CORS origins already include ports 3000 and 5173. For deployments, explicitly configure both web origins in backend `CORS_ORIGINS`. Cookies do not isolate apps by port: same-host local apps share the backend cookie namespace. Choose a deliberate production session/domain strategy before implementing simultaneous admin and learner sessions.

## Verification and next steps

Each starter screen has a manually triggered connection check: GraphQL `health` through Apollo, and HTTP `/health` through Query. Nothing calls the backend automatically during SSR. A successful check proves only those public endpoints, not authenticated flows or production readiness. An unavailable backend produces an error state, never simulated success.

Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` from the root. The focused data tests cover cache isolation, bearer headers, credential inclusion, logout clearing and endpoint validation. Production output comes from TanStack Start's Vite build; use the appropriate server adapter/hosting setup before deployment.

Next feature: implement invitation/login/refresh and role-aware routes for each app against the backend contract, then build orchestrator authoring/review and learner course flows in scoped slices.

## Reference contracts

- [shadcn monorepo routing](https://ui.shadcn.com/docs/monorepo)
- [Apollo TanStack Start integration](https://www.apollographql.com/docs/react/integrations/tanstack-start)
- [TanStack Query SSR integration](https://tanstack.com/router/latest/docs/integrations/query)
- [Phosphor React](https://github.com/phosphor-icons/react)
- [Backend identity contract](../../mla-platform-core/docs/identity.md)
