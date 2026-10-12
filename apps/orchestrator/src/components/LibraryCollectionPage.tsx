import {
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen"
import { FilmStripIcon } from "@phosphor-icons/react/dist/csr/FilmStrip"
import {
  DataTable,
  type DataTableColumn,
} from "@workspace/ui/components/data-table"
import { Button } from "@workspace/ui/components/button"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { SelectInput } from "@workspace/ui/components/select"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { ErrorState } from "@workspace/ui/components/error-state"
import { WorkspacePageFrame } from "./WorkspacePageFrame"
import { WorkspacePageAction } from "./WorkspacePageAction"
import { formatPeopleCreatedAt } from "../workspace/people"
import {
  libraryTableOptions,
  formatVideoDuration,
  formatVideoSize,
  type LibraryItem,
} from "../workspace/library"
import {
  validateLibrarySearch,
  courseStatusOptions,
  videoStatusOptions,
  type LibraryView,
  type LibrarySearchState,
} from "../workspace/library-search"

function LibraryStatus({ item }: { item: LibraryItem }) {
  const label =
    [...courseStatusOptions, ...videoStatusOptions].find(
      (option) => option.value === item.status
    )?.label ?? item.status
  return (
    <StatusBadge
      tone={
        item.status === "ready" || item.status === "published"
          ? "success"
          : item.status === "failed"
            ? "destructive"
            : "neutral"
      }
    >
      {label}
    </StatusBadge>
  )
}
export function LibraryCard({
  item,
  view,
}: {
  item: LibraryItem
  view: LibraryView
}) {
  const Icon = view === "courses" ? BookOpenIcon : FilmStripIcon
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
        <Icon aria-hidden className="size-10" />
        <span className="sr-only">
          {view === "courses"
            ? "Course cover unavailable"
            : "Video thumbnail unavailable"}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 leading-5 font-semibold" title={item.title}>
          {item.title}
        </h3>
        <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
          {view === "courses"
            ? item.description || "No course description yet."
            : `${formatVideoDuration(item.durationSeconds)} · ${formatVideoSize(item.sizeBytes)} · ${item.mimeType ?? "Video"}`}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <LibraryStatus item={item} />
          {view === "courses" && item.certificateEnabled && (
            <span className="text-xs text-muted-foreground">Certificate</span>
          )}
        </div>
      </div>
    </article>
  )
}
export function LibraryCollectionPage({ view }: { view: LibraryView }) {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  if (!user) return null
  return <LibraryTable key={`${user.id}-${view}`} view={view} user={user} />
}
function LibraryTable({
  view,
  user,
}: {
  view: LibraryView
  user: CurrentUser
}) {
  const { dataClients } = useRouter().options.context
  const urlState = validateLibrarySearch(view, useSearch({ strict: false }))
  const navigate = useNavigate()
  const id = useId()
  const [search, setSearch] = useState(urlState.q ?? "")
  const updateSearch = useCallback(
    (patch: Partial<LibrarySearchState>, replace = false) => {
      void navigate({
        to: ".",
        search: (previous) =>
          validateLibrarySearch(view, { ...previous, ...patch }),
        replace,
        resetScroll: false,
      })
    },
    [navigate, view]
  )
  useEffect(() => setSearch(urlState.q ?? ""), [urlState.q])
  useEffect(() => {
    if (search.trim() === (urlState.q ?? "")) return
    const timeout = setTimeout(
      () => updateSearch({ q: search.trim(), page: undefined }, true),
      300
    )
    return () => clearTimeout(timeout)
  }, [search, urlState.q, updateSearch])
  const query = useQuery(libraryTableOptions(dataClients, user, view, urlState))
  const pageSize = urlState.pageSize ?? 20,
    pageIndex = (urlState.page ?? 1) - 1
  useEffect(() => {
    if (!query.data) return
    const lastPage = Math.max(
      0,
      Math.ceil(query.data.totalCount / pageSize) - 1
    )
    if (pageIndex > lastPage) updateSearch({ page: lastPage + 1 }, true)
  }, [query.data, pageIndex, pageSize, updateSearch])
  const scope = urlState.scope ?? (user.role === "instructor" ? "mine" : "all")
  const hasFilters =
    !!search.trim() ||
    !!urlState.status ||
    (view === "courses" &&
      scope !== (user.role === "instructor" ? "mine" : "all"))
  const clearFilters = () => {
    setSearch("")
    updateSearch({
      q: undefined,
      status: undefined,
      scope: undefined,
      page: undefined,
    })
  }
  const label = view === "courses" ? "Courses" : "Video library"
  const columns: DataTableColumn<LibraryItem>[] = [
    {
      id: "title",
      header: "Title",
      className: "min-w-64",
      cell: (item) => (
        <div className="space-y-1">
          <p className="font-medium">{item.title}</p>
          {view === "courses" && (
            <p className="line-clamp-2 max-w-lg text-xs leading-5 text-muted-foreground">
              {item.description || "No course description yet."}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => <LibraryStatus item={item} />,
    },
    {
      id: "details",
      header: view === "courses" ? "Certificate" : "Duration / size",
      cell: (item) =>
        view === "courses" ? (
          item.certificateEnabled ? (
            "Enabled"
          ) : (
            "Not enabled"
          )
        ) : (
          <div className="space-y-1 whitespace-nowrap">
            <p>{formatVideoDuration(item.durationSeconds)}</p>
            <p className="text-xs text-muted-foreground">
              {formatVideoSize(item.sizeBytes)}
            </p>
          </div>
        ),
    },
    {
      id: "createdAt",
      header: "Created at",
      className: "whitespace-nowrap",
      cell: (item) => (
        <time dateTime={item.createdAt} title="Date and time in UTC">
          {formatPeopleCreatedAt(item.createdAt)}
        </time>
      ),
    },
  ]
  return (
    <WorkspacePageFrame view={view}>
      <DataTable
        rows={query.data?.items ?? []}
        columns={columns}
        getRowId={(item) => item.id}
        ariaLabel={label}
        layout={{
          mode: "toggle",
          view: urlState.layout ?? "table",
          onViewChange: (layout) =>
            updateSearch({ layout: layout === "grid" ? "grid" : undefined }),
          renderCard: (item) => <LibraryCard item={item} view={view} />,
        }}
        search={{
          value: search,
          onChange: (value) => setSearch(value.slice(0, 200)),
          label: `Search ${label}`,
          placeholder:
            view === "courses"
              ? "Search courses by title or description..."
              : "Search videos by title...",
        }}
        filters={
          <>
            {view === "courses" && (
              <>
                <label className="sr-only" htmlFor={`${id}-scope`}>
                  Course scope
                </label>
                <SelectInput
                  id={`${id}-scope`}
                  value={scope}
                  options={[
                    { value: "all", label: "All accessible courses" },
                    { value: "mine", label: "My courses" },
                  ]}
                  onValueChange={(scope) =>
                    updateSearch({ q: search.trim(), scope, page: undefined })
                  }
                  className="min-w-36"
                />
              </>
            )}
            <label className="sr-only" htmlFor={`${id}-status`}>
              Filter by status
            </label>
            <SelectInput
              id={`${id}-status`}
              value={urlState.status ?? "all"}
              options={[
                {
                  value: "all",
                  label:
                    view === "courses" ? "Draft & published" : "All statuses",
                },
                ...(view === "courses"
                  ? courseStatusOptions
                  : videoStatusOptions),
              ]}
              onValueChange={(status) =>
                updateSearch({
                  q: search.trim(),
                  status: status === "all" ? undefined : status,
                  page: undefined,
                })
              }
              className="min-w-36"
            />
            {hasFilters && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </>
        }
        onRefresh={() => void query.refetch()}
        pagination={{
          pageIndex,
          pageSize,
          totalCount: query.data?.totalCount ?? 0,
          onPageChange: (page) => updateSearch({ page: page + 1 }),
          onPageSizeChange: (pageSize) =>
            updateSearch({ pageSize, page: undefined }),
        }}
        isLoading={query.isPending}
        isFetching={query.isFetching || search.trim() !== (urlState.q ?? "")}
        emptyState={
          <EmptyState
            icon={view === "courses" ? BookOpenIcon : FilmStripIcon}
            title={
              hasFilters
                ? `No matching ${view === "courses" ? "courses" : "videos"}`
                : view === "courses"
                  ? "No courses yet"
                  : "No videos yet"
            }
            description={
              hasFilters
                ? "Try a different search or clear your filters."
                : view === "courses"
                  ? "Your courses will appear here as they are created."
                  : "Your lesson videos will appear here as they are uploaded."
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <WorkspacePageAction view={view} role={user.role} />
              )
            }
          />
        }
        errorState={
          query.isError ? (
            <ErrorState
              title={`We couldn't load ${label.toLowerCase()}`}
              action={
                <Button
                  variant="outline"
                  disabled={query.isFetching}
                  onClick={() => void query.refetch()}
                >
                  Try again
                </Button>
              }
            />
          ) : undefined
        }
      />
    </WorkspacePageFrame>
  )
}
