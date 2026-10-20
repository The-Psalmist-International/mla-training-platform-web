"use client"

import { useEffect, useState } from "react"
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise"
import { Button } from "./button"
import { StatusBadge } from "./status-badge"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./dialog"
import {
  acknowledgeRelease,
  hasUnseenRelease,
  releaseDate,
  releaseNotesKey,
  scheduleReleaseAnnouncement,
  type ReleaseNote,
  type ReleaseNotesConfig,
} from "../lib/release-notes"

function browserStorage() {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

const changeTag = {
  new: { label: "New", className: "bg-success text-success-foreground" },
  improved: { label: "Improved", className: "bg-ring/10 text-ring" },
  fixed: { label: "Fixed", className: "bg-warning/10 text-warning" },
}

export function ReleaseTimeline({
  releases,
}: {
  releases: readonly ReleaseNote[]
}) {
  return (
    <ol aria-label="Release history" className="space-y-12">
      {releases.map((release, index) => (
        <li key={release.version}>
          <article aria-label={`Version ${release.version}`}>
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <h3 className="font-heading text-3xl leading-10 font-semibold tracking-tight tabular-nums">
                v{release.version}
              </h3>
              {index === 0 && (
                <StatusBadge
                  tone="success"
                  className="h-7 text-xs normal-case [&>span]:animate-pulse motion-reduce:[&>span]:animate-none"
                >
                  Latest release
                </StatusBadge>
              )}
            </div>
            <ol
              aria-label={`Changes in version ${release.version}`}
              className="ml-1 border-l border-border"
            >
              <li className="relative pb-1 pl-7 sm:pl-8">
                <span
                  aria-hidden
                  className="absolute top-2 -left-[5px] size-[9px] rounded-full bg-muted-foreground/60 ring-4 ring-popover"
                />
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <h4 className="font-heading text-base leading-6 font-semibold text-balance">
                    {release.title}
                  </h4>
                  <time
                    dateTime={release.date}
                    className="shrink-0 text-xs leading-6 text-muted-foreground"
                  >
                    {releaseDate(release.date)}
                  </time>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {release.summary}
                </p>
                <ul className="mt-5 space-y-3">
                  {release.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="text-sm leading-7">
                      {change.text}{" "}
                      <span
                        data-change-type={change.type}
                        className={`ml-1 inline-block rounded px-1.5 py-0.5 align-baseline text-[0.6875rem] leading-4 font-medium whitespace-nowrap ${changeTag[change.type].className}`}
                      >
                        {changeTag[change.type].label}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            </ol>
          </article>
        </li>
      ))}
    </ol>
  )
}

export function ReleaseNotes({
  config,
  userId,
  showVersion = true,
}: {
  config: ReleaseNotesConfig
  userId: string
  showVersion?: boolean
}) {
  const [open, setOpen] = useState(false)
  const key = releaseNotesKey(config.appId, userId)
  useEffect(() => {
    return scheduleReleaseAnnouncement({
      isUnseen: () => hasUnseenRelease(key, config.version, browserStorage()),
      isBlocked: () =>
        Boolean(
          document.querySelector('[role="dialog"], [role="alertdialog"]')
        ),
      show: () => setOpen(true),
    })
  }, [key, config.version])

  const changeOpen = (next: boolean) => {
    if (!next) acknowledgeRelease(key, config.version, browserStorage())
    setOpen(next)
  }
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="h-11 gap-2 px-2 text-muted-foreground"
            aria-label={`What's new in ${config.appName}, version ${config.version}`}
            title={`What's new · v${config.version}`}
          />
        }
      >
        <ClockCounterClockwiseIcon aria-hidden className="size-5" />
        <span className="hidden text-sm xl:inline">What’s new</span>
        {showVersion && (
          <span className="hidden text-xs tabular-nums lg:inline">
            v{config.version}
          </span>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="gap-1 border-b-0 py-5">
          <DialogTitle className="text-lg leading-6">What’s new</DialogTitle>
          <DialogDescription className="leading-5">
            Updates and improvements to {config.appName}.
          </DialogDescription>
        </DialogHeader>
        <DialogBody
          tabIndex={0}
          role="region"
          aria-label="Release history content"
          className="px-6 py-8 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-12"
        >
          <ReleaseTimeline releases={config.releases} />
        </DialogBody>
        <DialogFooter className="border-t-0 sm:items-center sm:justify-between">
          <DialogClose render={<Button className="h-10" />}>Got it</DialogClose>
          <p className="text-xs leading-5 text-muted-foreground">
            You can revisit this history from “What’s new”.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
