# Shared data

GraphQL operations live in `apollo/<feature>/query.graphql`, with public typed
documents and compatibility type aliases reexported by `query.ts`. Features:
`course`, `media`, `enrollment`, `assessment`, `submission`, `people`,
`invitation`, `certificate`, `email-delivery`, `auth`, and `platform` (health only).
Shared course/media fragments can be referenced across feature documents.

Import from `@workspace/data` or `@workspace/data/apollo/<feature>/query`.
The root keeps existing operation, item, result, and variables export names;
these types derive from generated operations, not handwritten interfaces.
The platform subpath now exports only `HEALTH_QUERY`; use feature subpaths for
workspace queries. Existing auth mutations are preserved; no new action operations
are included.

## Code generation

Keep the sibling `../mla-platform-core/schema.graphql` available and up to date
using the backend's codegen workflow. No running backend or live endpoint is used.
Frontend `codegen.ts` resolves inputs/output relative to itself, independent of cwd.

From the frontend root **or** `packages/data`:

```sh
npm run codegen
npm run codegen:check
```

Edit feature documents, regenerate, and commit `src/generated/graphql.ts` with
those edits. Do not hand-edit or reformat generated output. `codegen:check`
validates documents against the schema and fails on stale output without writing;
it is an optional CI check, not a prerequisite that runs on every typecheck.
Generated typed documents import their type from `@apollo/client`. Schema and
operations plugins use compatible v5 majors; review them together when upgrading.

From the frontend root:

```sh
npm run typecheck --workspace=@workspace/data
npm run test --workspace=@workspace/data
npm run lint --workspace=@workspace/data
```

Generated types reflect SDL: nullable optional inputs (including course `mine`)
permit null, and email `purpose`/`EmailDeliveryPurpose` are strings. Backend
validation may be stricter; omit unset filters rather than sending null.
Pagination remains non-null when supplied, with existing document defaults.
