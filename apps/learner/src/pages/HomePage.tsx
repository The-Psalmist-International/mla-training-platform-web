import { useRouter } from "@tanstack/react-router"
import { FoundationScreen } from "@workspace/ui/components/foundation-screen"
import { ThemeToggle } from "@workspace/ui/components/theme-toggle"

export function HomePage() {
  const { graphqlUrl } = useRouter().options.context
  return (
    <>
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <FoundationScreen app="learner" graphqlUrl={graphqlUrl} />
    </>
  )
}
