import { useId, useState, type ReactNode } from "react"
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour"
import { TableIcon } from "@phosphor-icons/react/dist/csr/Table"
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise"
import { CaretDoubleLeftIcon } from "@phosphor-icons/react/dist/csr/CaretDoubleLeft"
import { CaretDoubleRightIcon } from "@phosphor-icons/react/dist/csr/CaretDoubleRight"
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft"
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Skeleton } from "./skeleton"
import { SelectInput } from "./select"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

export interface DataTableColumn<TRow> {
  id: string
  header: ReactNode
  cell: (row: TRow) => ReactNode
  className?: string
}

export type DataTableView = "table" | "grid"
export type DataTableLayout<TRow> =
  | { mode: "table" }
  | { mode: "grid"; renderCard: (row: TRow) => ReactNode }
  | ({ mode: "toggle"; renderCard: (row: TRow) => ReactNode } & (
      | {
          view: DataTableView
          onViewChange: (view: DataTableView) => void
          defaultView?: never
        }
      | {
          view?: never
          defaultView?: DataTableView
          onViewChange?: (view: DataTableView) => void
        }
    ))

export interface DataTableProps<TRow> {
  rows: TRow[]
  columns: DataTableColumn<TRow>[]
  getRowId: (row: TRow) => string
  ariaLabel: string
  search: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
  }
  filters?: ReactNode
  onRefresh: () => void
  pagination: {
    pageIndex: number
    pageSize: number
    totalCount: number
    onPageChange: (pageIndex: number) => void
    onPageSizeChange: (size: number) => void
    pageSizeOptions?: readonly number[]
  }
  isLoading?: boolean
  isFetching?: boolean
  emptyState?: ReactNode
  errorState?: ReactNode
  className?: string
  /** Omit for the standard table; grid and toggle modes require a card renderer. */
  layout?: DataTableLayout<TRow>
  /** Responsive card columns and gaps; applied to both cards and their loading placeholders. */
  gridClassName?: string
}

export function DataTable<TRow>({
  rows,
  columns,
  getRowId,
  ariaLabel,
  search,
  filters,
  onRefresh,
  pagination,
  isLoading = false,
  isFetching = false,
  emptyState = "No results found.",
  errorState,
  className,
  layout = { mode: "table" },
  gridClassName = "grid-cols-1 gap-4 @xl/data-table:grid-cols-2 @4xl/data-table:grid-cols-3 @6xl/data-table:grid-cols-4",
}: DataTableProps<TRow>) {
  const id = useId()
  const [localView, setLocalView] = useState<DataTableView>(
    layout.mode === "toggle" ? (layout.defaultView ?? "table") : "table"
  )
  const view =
    layout.mode === "grid"
      ? "grid"
      : layout.mode === "toggle"
        ? (layout.view ?? localView)
        : "table"
  const changeView = (next: DataTableView) => {
    if (layout.mode !== "toggle") return
    if (layout.view === undefined) setLocalView(next)
    layout.onViewChange?.(next)
  }
  const {
    pageIndex,
    pageSize,
    totalCount,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
  } = pagination
  const hasError = errorState != null && errorState !== false
  const unavailable = hasError || isLoading
  const disabled = unavailable || isFetching || totalCount === 0
  const lastPage = Math.max(0, Math.ceil(totalCount / pageSize) - 1)
  const start = rows.length === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min(pageIndex * pageSize + rows.length, totalCount)
  const pageSizes = Array.from(new Set([...pageSizeOptions, pageSize]))
  const atFirst = pageIndex <= 0
  const atLast = pageIndex >= lastPage
  const navigation = [
    ["First page", CaretDoubleLeftIcon, 0, atFirst],
    ["Previous page", CaretLeftIcon, pageIndex - 1, atFirst],
    ["Next page", CaretRightIcon, pageIndex + 1, atLast],
    ["Last page", CaretDoubleRightIcon, lastPage, atLast],
  ] as const

  return (
    <div
      data-slot="data-table"
      className={cn(
        "@container/data-table flex min-h-0 w-full min-w-0 flex-1 flex-col text-sm text-foreground",
        className
      )}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-4">
        <div className="relative w-full sm:w-72">
          <label htmlFor={`${id}-search`} className="sr-only">
            {search.label ?? "Search"}
          </label>
          <MagnifyingGlassIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={`${id}-search`}
            type="search"
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder ?? "Search…"}
            className="pl-9"
          />
        </div>
        <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2">
          {filters}
          {layout.mode === "toggle" && (
            <div
              role="group"
              aria-label={`${ariaLabel} layout`}
              className="flex items-center gap-1 rounded-md border border-border p-1"
            >
              {(
                [
                  ["table", TableIcon, "Table view"],
                  ["grid", SquaresFourIcon, "Grid view"],
                ] as const
              ).map(([value, Icon, label]) => (
                <Tooltip key={value}>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant={view === value ? "secondary" : "ghost"}
                        size="icon-sm"
                        aria-label={label}
                        aria-pressed={view === value}
                        onClick={() => changeView(value)}
                      />
                    }
                  >
                    <Icon aria-hidden className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Refresh ${ariaLabel}`}
                  disabled={isLoading || isFetching}
                  onClick={onRefresh}
                />
              }
            >
              <ArrowClockwiseIcon aria-hidden className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Refresh {ariaLabel}</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div
        role="region"
        aria-label={`${ariaLabel} ${view} scroll area`}
        tabIndex={0}
        className="min-h-0 min-w-0 flex-1 overflow-auto outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
      >
        {view === "grid" && layout.mode !== "table" ? (
          hasError ? (
            <div className="flex min-h-full items-center justify-center px-4 py-12 text-center text-muted-foreground">
              {errorState}
            </div>
          ) : isLoading ? (
            <div role="status">
              <span className="sr-only">Loading {ariaLabel}</span>
              <ul aria-hidden className={cn("grid", gridClassName)}>
                {Array.from({ length: Math.min(pageSize, 6) }, (_, index) => (
                  <li
                    key={index}
                    data-slot="data-table-loading-card"
                    className="overflow-hidden rounded-lg border border-border"
                  >
                    <Skeleton className="aspect-video w-full rounded-none motion-reduce:animate-none" />
                    <div className="space-y-3 p-3">
                      <Skeleton className="h-5 w-3/4 motion-reduce:animate-none" />
                      <Skeleton className="h-12 w-full motion-reduce:animate-none" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : rows.length === 0 ? (
            <div
              role="status"
              className="flex min-h-full items-center justify-center px-4 py-12 text-center text-muted-foreground"
            >
              {emptyState}
            </div>
          ) : (
            <ul
              aria-label={ariaLabel}
              aria-busy={isFetching}
              className={cn("grid pb-1", gridClassName)}
            >
              {rows.map((row) => (
                <li key={getRowId(row)} className="min-w-0">
                  {layout.renderCard(row)}
                </li>
              ))}
            </ul>
          )
        ) : (
          <table
            className={cn(
              "w-full min-w-max border-separate border-spacing-0 text-left",
              (hasError || (!isLoading && rows.length === 0)) && "h-full"
            )}
            aria-busy={!hasError && (isLoading || isFetching)}
          >
            <caption className="sr-only">{ariaLabel}</caption>
            <thead className="sticky top-0 z-10 h-9 text-muted-foreground">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className={cn(
                      "bg-muted px-3 py-2 font-medium whitespace-nowrap first:rounded-l-md last:rounded-r-md",
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!hasError && isLoading ? (
                Array.from({ length: Math.min(pageSize, 6) }, (_, index) => (
                  <tr
                    key={index}
                    data-slot="data-table-loading-row"
                    className="even:bg-muted/60"
                  >
                    {columns.map((column, columnIndex) => (
                      <td
                        key={column.id}
                        className={cn("px-3 py-3.5", column.className)}
                      >
                        {index === 0 && columnIndex === 0 && (
                          <span role="status" className="sr-only">
                            Loading {ariaLabel}
                          </span>
                        )}
                        <Skeleton
                          aria-hidden
                          className="h-5 w-full motion-reduce:animate-none"
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : hasError || rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center align-middle text-muted-foreground"
                  >
                    {hasError ? (
                      <div className="flex w-full items-center justify-center">
                        {errorState}
                      </div>
                    ) : (
                      <div
                        role="status"
                        className="flex w-full items-center justify-center"
                      >
                        {emptyState}
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={getRowId(row)}
                    className="even:bg-muted/60 hover:bg-muted/80"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          "px-3 py-2.5 whitespace-nowrap",
                          column.className
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      <footer className="sticky bottom-0 z-10 grid w-full shrink-0 grid-cols-2 items-center gap-3 bg-background py-4 @4xl/data-table:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <p
          aria-live="polite"
          className="col-start-1 row-start-1 min-w-0 text-sm text-muted-foreground"
        >
          {hasError
            ? "Unable to load results"
            : isLoading
              ? "Loading results…"
              : `Showing ${start} to ${rows.length === 0 ? 0 : end} out of ${totalCount}`}
        </p>
        <nav
          aria-label={`${ariaLabel} pagination`}
          className="col-span-2 row-start-2 grid w-full max-w-md grid-cols-4 gap-2 justify-self-center @4xl/data-table:col-span-1 @4xl/data-table:col-start-2 @4xl/data-table:row-start-1 @4xl/data-table:w-[28rem]"
        >
          {navigation.map(([label, Icon, page, boundary]) => (
            <Button
              key={label}
              type="button"
              variant="outline"
              className="h-8 w-full gap-1 px-2 shadow-none disabled:border-transparent disabled:bg-muted disabled:text-muted-foreground"
              aria-label={label}
              title={label}
              disabled={disabled || boundary}
              onClick={() => onPageChange(page)}
            >
              {label !== "Next page" && (
                <Icon aria-hidden className="size-3.5" />
              )}
              {label === "Previous page" && (
                <span className="hidden @sm/data-table:inline">Previous</span>
              )}
              {label === "Next page" && (
                <>
                  <span className="hidden @sm/data-table:inline">Next</span>
                  <Icon aria-hidden className="size-3.5" />
                </>
              )}
            </Button>
          ))}
        </nav>
        <div className="col-start-2 row-start-1 justify-self-end @4xl/data-table:col-start-3">
          <label htmlFor={`${id}-page-size`} className="sr-only">
            Rows per page
          </label>
          <SelectInput
            id={`${id}-page-size`}
            value={pageSize}
            onValueChange={onPageSizeChange}
            disabled={unavailable || isFetching}
            options={pageSizes.map((size) => ({
              value: size,
              label: `${size} / page`,
            }))}
            className="h-8 min-w-24 px-2"
          />
        </div>
      </footer>
    </div>
  )
}
