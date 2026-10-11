import type { ReactNode } from "react"
import { ChalkboardTeacherIcon } from "@phosphor-icons/react/dist/csr/ChalkboardTeacher"
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
    <main className="auth-surface relative flex min-h-svh items-center justify-center bg-background px-6 py-20 text-foreground">
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>
      <section className="w-full max-w-96" aria-labelledby="auth-title">
        <header className="mb-7">
          <div className="mb-3 flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground ring-1 ring-primary/25 ring-offset-2 ring-offset-background">
            <ChalkboardTeacherIcon size={22} weight="fill" aria-hidden />
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
  )
}
