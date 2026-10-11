import { createFileRoute } from "@tanstack/react-router"
import { FoundationScreen } from "@workspace/ui/components/foundation-screen"

export const Route = createFileRoute("/")({ component: App })

function App() {
  const { graphqlUrl } = Route.useRouteContext()
  return <FoundationScreen app="learner" graphqlUrl={graphqlUrl} />
}
