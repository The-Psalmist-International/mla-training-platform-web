"use client"
import { useState } from "react"
import { DayPicker, type DateRange } from "react-day-picker"
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank"
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft"
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@workspace/ui/components/popover"

export type DateRangeValue = { from: string; to: string }
// Local calendar dates map to UTC date strings without serializing local midnight.
export const calendarDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day, 12)
}
export const calendarDay = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
export function dateRangePresets(
  today = new Date().toISOString().slice(0, 10)
) {
  const back = (days: number) =>
    new Date(Date.parse(today) - days * 86400000).toISOString().slice(0, 10)
  return [
    { label: "Today", from: today, to: today },
    { label: "Last 7 days", from: back(6), to: today },
    { label: "Last 30 days", from: back(29), to: today },
    { label: "Last 90 days", from: back(89), to: today },
    { label: "Last 12 months", from: back(364), to: today },
    { label: "Month to date", from: `${today.slice(0, 7)}-01`, to: today },
    { label: "Year to date", from: `${today.slice(0, 4)}-01-01`, to: today },
  ]
}
const displayDay = (value: Date) =>
  value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
export function DateRangePicker({
  value,
  onChange,
  id,
  className,
}: {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  id?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange>({
    from: calendarDate(value.from),
    to: calendarDate(value.to),
  })
  const [month, setMonth] = useState(calendarDate(value.from))
  const presets = dateRangePresets()
  const span =
    draft.from && draft.to
      ? Date.parse(calendarDay(draft.to)) - Date.parse(calendarDay(draft.from))
      : NaN
  const valid = Number.isFinite(span) && span >= 0 && span <= 365 * 86400000
  const draftLabel = draft.from
    ? `${displayDay(draft.from)}${draft.to ? ` – ${displayDay(draft.to)}` : " – Select end date"}`
    : "Select a date range"
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setDraft({
            from: calendarDate(value.from),
            to: calendarDate(value.to),
          })
          setMonth(calendarDate(value.from))
        }
        setOpen(next)
      }}
    >
      <PopoverTrigger
        render={
          <Button
            id={id}
            size="lg"
            variant="outline"
            className={className}
            aria-label={`Date range: ${value.from} to ${value.to}`}
          />
        }
      >
        <CalendarBlankIcon
          aria-hidden
          className="size-4 text-muted-foreground"
        />
        {displayDay(calendarDate(value.from))} –{" "}
        {displayDay(calendarDate(value.to))}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(632px,calc(100vw-36px))] overflow-y-auto rounded-xl p-0"
      >
        <PopoverTitle className="sr-only">Choose reporting dates</PopoverTitle>
        <div className="flex min-h-0 flex-col md:flex-row">
          <div className="shrink-0 border-b border-border/60 p-4 md:w-48 md:border-r md:border-b-0">
            <div
              className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible"
              aria-label="Date range shortcuts"
            >
              {presets.map((preset) => {
                const active =
                  !!draft.from &&
                  !!draft.to &&
                  calendarDay(draft.from) === preset.from &&
                  calendarDay(draft.to) === preset.to
                return (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    aria-pressed={active}
                    className={`h-9 justify-start px-3 text-sm ${active ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                    onClick={() => {
                      setDraft({
                        from: calendarDate(preset.from),
                        to: calendarDate(preset.to),
                      })
                      setMonth(calendarDate(preset.from))
                    }}
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <DayPicker
              mode="range"
              selected={draft}
              onSelect={(range) => setDraft(range ?? { from: undefined })}
              month={month}
              onMonthChange={setMonth}
              numberOfMonths={1}
              showOutsideDays={false}
              autoFocus
              max={365}
              disabled={{ after: calendarDate(presets[0].to) }}
              classNames={{
                root: "relative p-4 sm:p-5",
                months: "relative",
                month: "w-full",
                month_caption:
                  "mb-3 flex h-10 items-center justify-center rounded-lg bg-muted/40",
                caption_label: "text-sm font-medium",
                nav: "absolute top-0 left-0 flex h-10 w-full items-center justify-between px-1 pointer-events-none",
                button_previous:
                  "pointer-events-auto flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
                button_next:
                  "pointer-events-auto flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
                month_grid: "w-full border-collapse",
                weekdays: "grid grid-cols-7",
                weekday:
                  "flex h-9 items-center justify-center text-[11px] font-medium uppercase text-muted-foreground",
                week: "grid grid-cols-7 mt-1",
                day: "relative h-10 text-center",
                day_button:
                  "flex size-full items-center justify-center rounded-lg text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                range_start:
                  "rounded-l-lg bg-primary/10 [&_button]:bg-primary [&_button]:text-primary-foreground",
                range_end:
                  "rounded-r-lg bg-primary/10 [&_button]:bg-primary [&_button]:text-primary-foreground",
                range_middle:
                  "bg-primary/10 text-primary [&_button]:rounded-none",
                today: "font-semibold",
                outside: "text-muted-foreground",
                disabled: "opacity-30",
                hidden: "invisible",
              }}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <CaretLeftIcon aria-hidden className="size-4" />
                  ) : (
                    <CaretRightIcon aria-hidden className="size-4" />
                  ),
              }}
            />
            <div className="space-y-3 border-t border-border/60 p-4 sm:px-5">
              <p aria-live="polite" className="text-xs text-muted-foreground">
                {draftLabel}
              </p>
              {!valid && draft.to && (
                <p role="alert" className="text-xs text-destructive">
                  Select a range of up to 366 days.
                </p>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!valid}
                  onClick={() => {
                    if (valid && draft.from && draft.to) {
                      onChange({
                        from: calendarDay(draft.from),
                        to: calendarDay(draft.to),
                      })
                      setOpen(false)
                    }
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
