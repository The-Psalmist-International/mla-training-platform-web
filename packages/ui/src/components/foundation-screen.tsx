import { useLazyQuery } from "@apollo/client/react"
import { useQuery } from "@tanstack/react-query"
import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen"
import { ChalkboardTeacherIcon } from "@phosphor-icons/react/dist/csr/ChalkboardTeacher"
import { PlugsConnectedIcon } from "@phosphor-icons/react/dist/csr/PlugsConnected"
import { HEALTH_QUERY, backendHealthOptions } from "@workspace/data"
import { Button } from "@workspace/ui/components/button"

export function FoundationScreen({
  app,
  graphqlUrl,
}: {
  app: "orchestrator" | "learner"
  graphqlUrl: string
}) {
  const [checkGraphql, graphql] = useLazyQuery(HEALTH_QUERY, {
    fetchPolicy: "network-only",
  })
  const http = useQuery({
    ...backendHealthOptions(graphqlUrl),
    enabled: false,
    retry: false,
  })
  const checking = graphql.loading || http.isFetching
  const AppIcon = app === "orchestrator" ? ChalkboardTeacherIcon : BookOpenIcon

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-8 px-6 py-12 sm:px-10">
      <header className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Martyrs Leadership Academy / Web foundation
        </p>
        <AppIcon size={32} className="text-primary" aria-hidden="true" />
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {app === "orchestrator" ? "Orchestrator" : "Learner"}
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          {app === "orchestrator"
            ? "The foundation for course authoring, learner review, and platform administration."
            : "The foundation for courses, assessments, learning progress, and certificates."}
        </p>
        <p className="text-sm text-muted-foreground">
          Scaffold only. Product screens and sign-in are next.
        </p>
      </header>
      <section
        className="flex flex-col gap-5 rounded-lg border border-border p-6"
        aria-labelledby="connection-title"
      >
        <div className="flex flex-col gap-2">
          <h2 id="connection-title" className="text-lg font-medium">
            Backend connection
          </h2>
          <p className="font-mono text-xs break-all text-muted-foreground">
            {graphqlUrl}
          </p>
        </div>
        <dl
          className="grid gap-3 text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="font-medium">Apollo / GraphQL</dt>
            <dd className="text-muted-foreground">
              {graphql.loading
                ? "Checking..."
                : graphql.error
                  ? "Unavailable"
                  : !graphql.called
                    ? "Not checked"
                    : graphql.data?.health === "ok"
                      ? "Connected"
                      : "Unexpected response"}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="font-medium">TanStack Query / HTTP</dt>
            <dd className="text-muted-foreground">
              {http.isFetching
                ? "Checking..."
                : http.isError
                  ? "Unavailable"
                  : http.data?.status === "ok"
                    ? "Connected"
                    : "Not checked"}
            </dd>
          </div>
          {(graphql.error || http.error) && (
            <div className="flex flex-col gap-1 text-destructive">
              <dt className="font-medium">Connection failed</dt>
              <dd>
                Start mla-platform-core and check the endpoint and allowed CORS
                origins, then retry.
              </dd>
            </div>
          )}
        </dl>
        <Button
          size="lg"
          className="self-start"
          disabled={checking}
          onClick={() => {
            void checkGraphql().catch(() => undefined)
            void http.refetch()
          }}
        >
          <PlugsConnectedIcon aria-hidden="true" data-icon="inline-start" />
          {checking ? "Checking connection..." : "Check connection"}
        </Button>
      </section>
      <footer className="text-xs leading-relaxed text-muted-foreground">
        TanStack Start / shared shadcn UI / Phosphor / Apollo / TanStack Query
      </footer>
    </main>
  )
}
