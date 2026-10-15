import { useId, type ReactNode } from "react"
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap"
import { ThemeToggle } from "@workspace/ui/components/theme-toggle"

export function LearnerAuthLayout({
  title,
  description,
  children,
  topRight,
}: {
  title: string
  description: string
  children: ReactNode
  topRight?: ReactNode
}) {
  const id = useId()
  return (
    <div className="auth-surface relative isolate flex min-h-svh flex-col overflow-x-hidden bg-muted text-foreground">
      <img
        src="/images/learner-auth-background.png"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full min-h-svh w-full object-cover object-[65%_center]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/15" />
      {topRight && (
        <aside
          aria-label="Account help"
          className="relative z-10 flex justify-end px-3 pt-3 sm:px-5 sm:pt-5 lg:absolute lg:top-6 lg:right-6 lg:p-0"
        >
          {topRight}
        </aside>
      )}
      <main className="flex flex-1 items-stretch p-3 sm:p-5 lg:min-h-svh lg:p-6">
        <section
          aria-labelledby={id}
          className="flex w-full max-w-[560px] flex-col rounded-2xl border border-border/60 bg-background px-6 py-7 sm:px-10 sm:py-9 lg:px-12"
        >
          <div className="flex items-center justify-between gap-4">
            <a
              href="/sign-in"
              aria-label="MLA Learners sign in"
              className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCapIcon aria-hidden className="size-6" />
              </span>
              <span className="text-sm font-semibold tracking-tight">
                MLA Learners
              </span>
            </a>
            <ThemeToggle />
          </div>
          <div className="flex flex-1 flex-col justify-center py-12 sm:py-16">
            <header className="mb-8">
              <h1 id={id} className="text-2xl font-semibold tracking-tight">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </header>
            {children}
          </div>
          <footer className="text-xs leading-5 text-muted-foreground">
            Copyright 2026. Powered by the Mystic Engineering Team
          </footer>
        </section>
      </main>
    </div>
  )
}
