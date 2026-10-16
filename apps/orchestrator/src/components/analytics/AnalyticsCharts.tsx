import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar"
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info"
import { TableIcon } from "@phosphor-icons/react/dist/csr/Table"
import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@workspace/ui/components/dialog"
import { EmptyState } from "@workspace/ui/components/empty-state"

const ChartTitleContext = createContext("Chart data")
export const chartColors = [
  "var(--primary)",
  "color-mix(in oklch, var(--primary) 68%, var(--background))",
  "color-mix(in oklch, var(--primary) 45%, var(--background))",
  "color-mix(in oklch, var(--primary) 28%, var(--background))",
]
export const percentage = (value: number | null) =>
  value === null
    ? "—"
    : `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
export const count = (value: number) => value.toLocaleString()
export function ChartPanel({
  title,
  description,
  children,
  className = "",
}: {
  title: string
  description: string
  children: ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className={`flex min-w-0 flex-col rounded-xl border border-border/70 bg-card p-6 sm:p-7 ${className}`}
    >
      <div className="flex items-center gap-2">
        <h2 id={id} className="min-w-0 flex-1 text-base font-medium">
          {title}
        </h2>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={`About ${title}`}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            <InfoIcon aria-hidden className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{description}</TooltipContent>
        </Tooltip>
      </div>
      <div className="mt-7 flex flex-1 flex-col">
        <ChartTitleContext.Provider value={title}>
          {children}
        </ChartTitleContext.Provider>
      </div>
    </section>
  )
}
export function ChartEmpty({
  title = "No results yet",
  description = "Results will appear when learners complete their training.",
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex min-h-56 items-center justify-center">
      <EmptyState icon={ChartBarIcon} title={title} description={description} />
    </div>
  )
}
export function ChartData({
  headers,
  rows,
}: {
  headers: string[]
  rows: ReactNode[][]
}) {
  const title = useContext(ChartTitleContext)
  return (
    <Dialog>
      <div className="mt-auto pt-5">
        <DialogTrigger
          render={
            <Button
              variant="outline"
              className="w-full"
              aria-label={`View chart data for ${title}`}
            />
          }
        >
          <TableIcon aria-hidden className="size-4" />
          View chart data
        </DialogTrigger>
      </div>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="gap-2 py-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {count(rows.length)} {rows.length === 1 ? "row" : "rows"} · Exact
            values for the selected chart.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="p-5 sm:p-6">
          <ChartDataTable title={title} headers={headers} rows={rows} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
export function ChartDataTable({
  title,
  headers,
  rows,
}: {
  title: string
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <div
      role="region"
      aria-label={`${title} table scroll area`}
      tabIndex={0}
      className="max-h-[60dvh] overflow-auto rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
    >
      <table className="w-full min-w-[480px] border-separate border-spacing-0 text-left text-sm">
        <caption className="sr-only">{title}</caption>
        <thead className="sticky top-0 z-10 text-xs text-muted-foreground">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="bg-muted px-4 py-3 font-medium first:rounded-l-md last:rounded-r-md"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={index} className="even:bg-muted/40 hover:bg-muted/60">
                {row.map((cell, column) => (
                  <td
                    key={column}
                    className="max-w-80 border-b border-border/40 px-4 py-3 align-top break-words tabular-nums"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-10 text-center text-muted-foreground"
              >
                No chart data for these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
export function DonutChart({
  title,
  values,
  centerLabel,
}: {
  title: string
  values: { label: string; value: number }[]
  centerLabel: string
}) {
  const total = values.reduce((sum, entry) => sum + entry.value, 0)
  if (!total)
    return (
      <ChartEmpty
        title="Nothing to show yet"
        description={`There are no ${centerLabel.toLowerCase()} in this scope.`}
      />
    )
  let offset = 0
  return (
    <>
      <div className="flex w-full flex-1 flex-col items-center gap-6">
        <svg
          role="img"
          aria-label={title}
          viewBox="0 0 200 200"
          className="size-48 shrink-0"
        >
          <title>
            {title}:{" "}
            {values.map((value) => `${value.label}: ${value.value}`).join(", ")}
          </title>
          {values.map((entry, index) => {
            const share = (entry.value / total) * 100,
              current = offset
            offset += share
            return entry.value > 0 ? (
              <circle
                key={entry.label}
                cx="100"
                cy="100"
                r="76"
                fill="none"
                stroke={chartColors[index % chartColors.length]}
                strokeWidth="22"
                pathLength="100"
                strokeDasharray={`${share} ${100 - share}`}
                strokeDashoffset={-current}
                transform="rotate(-90 100 100)"
              >
                <title>
                  {entry.label}: {count(entry.value)} ({percentage(share)})
                </title>
              </circle>
            ) : null
          })}
          <text
            x="100"
            y="99"
            textAnchor="middle"
            className="fill-foreground text-2xl font-semibold tabular-nums"
          >
            {count(total)}
          </text>
          <text
            x="100"
            y="121"
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            {centerLabel}
          </text>
        </svg>
        <ul className="w-full min-w-0 flex-1 divide-y divide-border/60">
          {values.map((entry, index) => (
            <li
              key={entry.label}
              className="flex w-full items-center gap-2 py-2 text-xs"
            >
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: chartColors[index % chartColors.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {entry.label}
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {count(entry.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <ChartData
        headers={["Status", "Count", "Share"]}
        rows={values.map((entry) => [
          entry.label,
          count(entry.value),
          percentage((entry.value / total) * 100),
        ])}
      />
    </>
  )
}
export type ChartSeries = { label: string; values: number[] }
// Sizing is measured in screen pixels (not a scaling viewBox) so axis
// labels stay the same size no matter how wide the panel gets.
function useChartWidth(fallback = 560) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return { ref, width: width > 0 ? width : fallback }
}
export function AxisChart({
  title,
  labels,
  series,
  kind = "line",
  percent = false,
  hasData,
  table,
}: {
  title: string
  labels: string[]
  series: ChartSeries[]
  kind?: "line" | "columns"
  percent?: boolean
  hasData?: boolean
  table?: { headers: string[]; rows: ReactNode[][] }
}) {
  if (
    !labels.length ||
    !(
      hasData ?? series.some((entry) => entry.values.some((value) => value > 0))
    )
  )
    return <ChartEmpty />
  const { ref, width } = useChartWidth()
  const height = 240,
    left = 38,
    right = 12,
    top = 12,
    bottom = 38
  const plotWidth = width - left - right,
    plotHeight = height - top - bottom
  const maximum = percent
    ? 100
    : Math.max(1, ...series.flatMap((entry) => entry.values))
  const x = (index: number) =>
    left + ((index + 0.5) / labels.length) * plotWidth
  const y = (value: number) => top + (1 - value / maximum) * plotHeight
  return (
    <>
      <div ref={ref} className="w-full">
      <svg
        role="img"
        aria-label={title}
        width={width}
        height={height}
        className="block max-w-full overflow-visible"
      >
        <title>{title}. Exact values are available in View chart data.</title>
        {[0, 0.5, 1].map((fraction) => (
          <g key={fraction}>
            <line
              x1={left}
              x2={width - right}
              y1={y(maximum * fraction)}
              y2={y(maximum * fraction)}
              stroke="var(--border)"
              strokeDasharray="3 4"
            />
            <text
              x={left - 7}
              y={y(maximum * fraction) + 4}
              textAnchor="end"
              className="fill-muted-foreground text-xs"
            >
              {Math.round(maximum * fraction)}
              {percent ? "%" : ""}
            </text>
          </g>
        ))}
        {series.map((entry, seriesIndex) => (
          <g key={entry.label}>
            {kind === "line" && (
              <polyline
                fill="none"
                stroke={chartColors[seriesIndex % chartColors.length]}
                strokeWidth="2.5"
                strokeLinejoin="round"
                points={entry.values
                  .map((value, index) => `${x(index)},${y(value)}`)
                  .join(" ")}
              />
            )}
            {entry.values.map((value, index) =>
              kind === "line" ? (
                <circle
                  key={index}
                  cx={x(index)}
                  cy={y(value)}
                  r={labels.length > 60 ? 1.5 : 3}
                  fill={chartColors[seriesIndex % chartColors.length]}
                >
                  <title>
                    {labels[index]} · {entry.label}: {count(value)}
                    {percent ? "%" : ""}
                  </title>
                </circle>
              ) : (
                <rect
                  key={index}
                  x={
                    x(index) -
                    (plotWidth / labels.length) * 0.32 +
                    (((seriesIndex * plotWidth) / labels.length) * 0.64) /
                      series.length
                  }
                  y={y(value)}
                  width={((plotWidth / labels.length) * 0.64) / series.length}
                  height={height - bottom - y(value)}
                  rx="2"
                  fill={chartColors[seriesIndex % chartColors.length]}
                >
                  <title>
                    {labels[index]} · {entry.label}: {count(value)}
                    {percent ? "%" : ""}
                  </title>
                </rect>
              )
            )}
          </g>
        ))}
        {labels.map((label, index) =>
          labels.length <= 8 ||
          index === 0 ||
          index === labels.length - 1 ||
          index === Math.floor(labels.length / 2) ? (
            <text
              key={index}
              x={x(index)}
              y={height - 15}
              textAnchor="middle"
              className="fill-muted-foreground text-xs"
            >
              {label.length > 13 ? `${label.slice(0, 11)}…` : label}
            </text>
          ) : null
        )}
      </svg>
      </div>
      <ul className="mt-3 grid w-full gap-0 text-xs text-muted-foreground">
        {series.map((entry, index) => (
          <li
            key={entry.label}
            className="flex w-full items-center gap-2 border-t border-border/40 py-2 first:border-t-0 first:pt-0 last:pb-0"
          >
            <span
              aria-hidden
              className="h-1 w-5 shrink-0 rounded-full"
              style={{ background: chartColors[index % chartColors.length] }}
            />
            <span className="min-w-0 flex-1 truncate">{entry.label}</span>
          </li>
        ))}
      </ul>
      <ChartData
        headers={
          table?.headers ?? [
            "Period / category",
            ...series.map((entry) => entry.label),
          ]
        }
        rows={
          table?.rows ??
          labels.map((label, index) => [
            label,
            ...series.map((entry) =>
              percent
                ? percentage(entry.values[index])
                : count(entry.values[index])
            ),
          ])
        }
      />
    </>
  )
}
export function ScatterChart({
  points,
}: {
  points: {
    title: string
    completionRate: number
    passRate: number
    enrolled: number
    firstAttempts: number
  }[]
}) {
  if (!points.length)
    return (
      <ChartEmpty
        title="More outcomes needed"
        description="Courses need both enrollments and graded first attempts to appear here."
      />
    )
  const { ref, width } = useChartWidth(560)
  const height = 250
  const plotLeft = 45,
    plotRight = Math.max(plotLeft + 40, Math.min(400, width - 20)),
    plotTop = 27,
    plotBottom = 207
  const px = (rate: number) =>
    plotLeft + (rate / 100) * (plotRight - plotLeft)
  const py = (rate: number) =>
    plotBottom - (rate / 100) * (plotBottom - plotTop)
  return (
    <>
      <div ref={ref} className="w-full">
      <svg
        role="img"
        aria-label="Course completion versus first-attempt pass rate"
        width={width}
        height={height}
        className="block max-w-full"
      >
        <title>
          Each point represents a course. Horizontal position is completion
          percentage; vertical position is first-attempt pass percentage.
        </title>
        {[0, 50, 100].map((value) => (
          <g key={value}>
            <line
              x1={plotLeft}
              x2={plotRight}
              y1={py(value)}
              y2={py(value)}
              stroke="var(--border)"
              strokeDasharray="3 4"
            />
            <line
              x1={px(value)}
              x2={px(value)}
              y1={plotTop}
              y2={plotBottom}
              stroke="var(--border)"
              strokeDasharray="3 4"
            />
            <text
              x={plotLeft - 7}
              y={py(value) + 4}
              textAnchor="end"
              className="fill-muted-foreground text-xs"
            >
              {value}%
            </text>
            <text
              x={px(value)}
              y="225"
              textAnchor="middle"
              className="fill-muted-foreground text-xs"
            >
              {value}%
            </text>
          </g>
        ))}
        <text x={plotLeft} y="15" className="fill-muted-foreground text-xs">
          First-attempt pass rate
        </text>
        <text
          x={(plotLeft + plotRight) / 2}
          y="247"
          textAnchor="middle"
          className="fill-muted-foreground text-xs"
        >
          Course completion rate
        </text>
        {points.map((point, index) => (
          <circle
            key={index}
            cx={px(point.completionRate)}
            cy={py(point.passRate)}
            r="6"
            fill="var(--primary)"
            fillOpacity=".7"
            stroke="var(--background)"
            strokeWidth="1.5"
          >
            <title>
              {point.title}: {percentage(point.completionRate)} completion (
              {point.enrolled} enrollments); {percentage(point.passRate)} passed
              ({point.firstAttempts} first attempts)
            </title>
          </circle>
        ))}
      </svg>
      </div>
      <ChartData
        headers={[
          "Course",
          "Completion",
          "Enrollments",
          "First-attempt pass rate",
          "First attempts",
        ]}
        rows={points.map((point) => [
          point.title,
          percentage(point.completionRate),
          point.enrolled,
          percentage(point.passRate),
          point.firstAttempts,
        ])}
      />
    </>
  )
}
