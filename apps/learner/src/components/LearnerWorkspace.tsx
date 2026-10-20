import { useEffect, type ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { BoulesIcon } from "@phosphor-icons/react/dist/csr/Boules"
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut"
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle"
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown"
import { Button } from "@workspace/ui/components/button"
import { UserAvatar } from "@workspace/ui/components/user-avatar"
import { LearnerNotifications } from "./LearnerNotifications"
import { LearnerThemeMenuItem } from "./LearnerThemeMenuItem"
import { ReleaseNotes } from "@workspace/ui/components/release-notes"
import { learnerRelease } from "../release"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu"
import type { CurrentUser } from "@workspace/data"
import { learnerTabs, type LearnerTab } from "../workspace/navigation"

export function LearnerWorkspace({
  user,
  tab,
  signingOut,
  onSignOut,
  onAccountClick,
  children,
  courseMode = false,
}: {
  user: CurrentUser
  tab: LearnerTab
  signingOut: boolean
  onSignOut: () => void
  onAccountClick: () => void
  children: ReactNode
  courseMode?: boolean
}) {
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      document.getElementById("learner-heading")?.focus({ preventScroll: true })
    )
    return () => cancelAnimationFrame(frame)
  }, [tab])
  return (
    <div
      className={`flex min-h-svh min-w-0 flex-col bg-background ${courseMode ? "h-svh overflow-hidden" : ""}`}
    >
      <a
        href="#learner-content"
        className="sr-only fixed top-4 left-4 z-50 rounded-md bg-background p-3 text-sm focus:not-sr-only focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <header className="shrink-0 border-b border-border/70 bg-background">
        <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
          <Link
            to="/"
            search={{ tab: "overview", page: 1 }}
            className="flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="MLA Learners overview"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BoulesIcon aria-hidden className="size-6" />
            </span>
            <span className="truncate text-sm font-semibold tracking-tight">
              MLA Learners
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <ReleaseNotes
              key={user.id}
              config={learnerRelease}
              userId={user.id}
            />
            <LearnerNotifications key={user.id} user={user} tab={tab} />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="h-11 gap-2 px-1.5 sm:px-2"
                    aria-label={`Account menu for ${user.name}`}
                  />
                }
              >
                <UserAvatar
                  name={user.name}
                  email={user.email}
                  avatarUrl={user.avatarUrl}
                />
                <span className="hidden max-w-40 truncate text-sm sm:block">
                  {user.name}
                </span>
                <CaretDownIcon
                  aria-hidden
                  className="size-3.5 text-muted-foreground"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2">
                    <UserAvatar
                      name={user.name}
                      email={user.email}
                      avatarUrl={user.avatarUrl}
                      className="shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">
                        {user.name}
                      </span>
                      <span className="mt-1 block truncate text-xs font-normal">
                        {user.email}
                      </span>
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onAccountClick}
                  className="min-h-11 px-3"
                >
                  <UserCircleIcon aria-hidden />
                  My account
                </DropdownMenuItem>
                <LearnerThemeMenuItem />
                <DropdownMenuItem
                  disabled={signingOut}
                  onClick={onSignOut}
                  className="min-h-11 px-3"
                >
                  <SignOutIcon aria-hidden />
                  {signingOut ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {!courseMode && (
          <nav
            aria-label="Learner workspace"
            className="overflow-x-auto px-4 sm:px-8 lg:px-12"
          >
            <div className="flex w-max min-w-full gap-6 sm:gap-8">
              {learnerTabs.map((item) => (
                <Link
                  key={item.id}
                  to="/"
                  search={{ tab: item.id, page: 1 }}
                  aria-current={item.id === tab ? "page" : undefined}
                  className={`flex min-h-12 shrink-0 items-center border-b-2 px-1 text-sm transition-colors duration-150 outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${item.id === tab ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
      <main
        id="learner-content"
        tabIndex={-1}
        className={
          courseMode
            ? "flex min-h-0 flex-1 flex-col outline-none"
            : "flex flex-1 flex-col px-4 py-8 outline-none sm:px-8 lg:px-12 lg:py-10"
        }
      >
        {children}
      </main>
    </div>
  )
}
