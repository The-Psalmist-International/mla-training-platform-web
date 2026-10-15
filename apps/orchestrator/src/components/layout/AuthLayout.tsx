import type { ReactNode } from "react"
import { BoulesIcon } from "@phosphor-icons/react/dist/csr/Boules"
import { CopyrightIcon } from "@phosphor-icons/react/dist/csr/Copyright"
import { ThemeToggle } from "@workspace/ui/components/theme-toggle"

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="auth-surface relative flex min-h-svh flex-col bg-background text-foreground">
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <section className="w-full max-w-96" aria-labelledby="auth-title">
          <header className="mb-7">
            <div className="mb-3 flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground ring-1 ring-primary/25 ring-offset-2 ring-offset-background">
              <BoulesIcon size={22} weight="fill" aria-hidden />
            </div>
            <h1
              id="auth-title"
              className="font-heading text-xl font-semibold tracking-tight"
            >
              {title}
            </h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </header>
          {children}
        </section>
      </main>
      <footer className="shrink-0 px-6 pb-6 text-center text-xs leading-5 text-muted-foreground">
        <CopyrightIcon aria-hidden className="mr-1 inline size-3.5 align-[-2px]" />
        Copyright 2026. Powered by the Mystic Engineering Team
      </footer>
    </div>
  )
}
