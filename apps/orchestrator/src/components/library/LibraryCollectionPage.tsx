import {
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@workspace/ui/components/toaster"
import type { ToastStatus } from "@workspace/ui/lib/toast"
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
import { WorkspacePageFrame } from "../layout/WorkspacePageFrame"
import { WorkspacePageAction } from "../layout/WorkspacePageAction"
import { LibraryRowActions } from "./LibraryRowActions"
import { CourseLibraryDialog } from "../course/CourseLibraryDialog"
import { CourseThumbnail } from "../course/CourseThumbnail"
import { VideoThumbnail } from "../videos/VideoThumbnail"
import { VideoUploadDialog } from "../videos/VideoUploadDialog"
import { VideoLibraryDialog } from "../videos/VideoLibraryDialog"
import { formatPeopleCreatedAt } from "../../workspace/people/people"
import {
  libraryTableOptions,
  formatVideoDuration,
  formatVideoSize,
  type LibraryItem,
} from "../../workspace/library/library"
import {
  validateLibrarySearch,
  courseStatusOptions,
  videoStatusOptions,
  type LibraryView,
  type LibrarySearchState,
} from "../../workspace/library/library-search"

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
  actions,
  onOpen,
}: {
  item: LibraryItem
  view: LibraryView
  actions?: ReactNode
  onOpen?: () => void
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      {view === "courses" ? (
        <CourseThumbnail
          title={item.title}
          thumbnailUrl={item.thumbnailUrl}
          className="rounded-none"
        />
      ) : (
        <VideoThumbnail
          thumbnailUrl={item.thumbnailUrl}
          className="rounded-none"
        />
      )}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 leading-5 font-semibold" title={item.title}>
          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              className="text-left hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {item.title}
            </button>
          ) : (
            item.title
          )}
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
          {actions}
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
  const { dataClients, auth } = useRouter().options.context
  const queryClient = useQueryClient()
  const { toast } = useToast()
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
  const openAction = (
    modal: NonNullable<LibrarySearchState["modal"]>,
    item: string
  ) => updateSearch({ modal, item })
  const expandCourse = (courseId: string) => {
    void navigate({
      to: "/workspace/courses/$courseId",
      params: { courseId },
      search: { ...urlState, modal: undefined, item: undefined },
    })
  }
  const closeAction = () => {
    if (auth.getUser() === user)
      updateSearch({ modal: undefined, item: undefined }, true)
  }
  const changed = (message?: string, status: ToastStatus = "success") => {
    if (message && auth.getUser() === user)
      toast({
        title: view === "courses" ? "Course updated" : "Video library updated",
        description: message,
        status,
      })
    void queryClient
      .invalidateQueries({
        queryKey: [
          "workspace",
          dataClients.graphqlUrl,
          user.id,
          "library-table",
        ],
      })
      .catch(() => {})
    void queryClient
      .invalidateQueries({
        queryKey: [
          "workspace",
          dataClients.graphqlUrl,
          user.id,
          view === "courses" ? "course-details" : "video-details",
        ],
      })
      .catch(() => {})
  }
  const columns: DataTableColumn<LibraryItem>[] = [
    {
      id: "title",
      header: "Title",
      className: "min-w-64",
      cell: (item) => (
        <div className="flex items-center gap-3">
          {view === "courses" ? (
            <CourseThumbnail
              title={item.title}
              thumbnailUrl={item.thumbnailUrl}
              compact
              className="w-16"
            />
          ) : (
            <VideoThumbnail
              thumbnailUrl={item.thumbnailUrl}
              compact
              className="w-16"
            />
          )}
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => openAction("details", item.id)}
              className="text-left font-medium hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {item.title}
            </button>
          </div>
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
    {
      id: "actions",
      header: "Actions",
      className: "w-40 whitespace-nowrap text-right",
      cell: (item) => (
        <LibraryRowActions
          item={item}
          view={view}
          user={user}
          onSelect={openAction}
          onExpand={
            view === "courses" ? () => expandCourse(item.id) : undefined
          }
        />
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
          renderCard: (item) => (
            <LibraryCard
              item={item}
              view={view}
              onOpen={() => openAction("details", item.id)}
              actions={
                <LibraryRowActions
                  item={item}
                  view={view}
                  user={user}
                  onSelect={openAction}
                  onExpand={
                    view === "courses" ? () => expandCourse(item.id) : undefined
                  }
                />
              }
            />
          ),
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
                  onValueChange={(nextScope) =>
                    updateSearch({
                      q: search.trim(),
                      scope: nextScope,
                      page: undefined,
                    })
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
          onPageSizeChange: (nextPageSize) =>
            updateSearch({ pageSize: nextPageSize, page: undefined }),
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
      {view === "courses" &&
        urlState.modal &&
        urlState.modal !== "upload" &&
        urlState.modal !== "resume" &&
        urlState.modal !== "preview" && (
          <CourseLibraryDialog
            key={`${urlState.modal}-${urlState.item ?? "new"}`}
            modal={urlState.modal}
            id={urlState.item}
            user={user}
            onClose={closeAction}
            onChanged={changed}
          />
        )}
      {view === "videos" &&
        (urlState.modal === "upload" || urlState.modal === "resume") && (
          <VideoUploadDialog
            key={`${urlState.modal}-${urlState.item ?? "new"}`}
            assetId={urlState.modal === "resume" ? urlState.item : undefined}
            user={user}
            onClose={closeAction}
            onChanged={changed}
          />
        )}
      {view === "videos" &&
        (urlState.modal === "details" || urlState.modal === "preview") &&
        urlState.item && (
          <VideoLibraryDialog
            key={`${urlState.modal}-${urlState.item}`}
            id={urlState.item}
            preview={urlState.modal === "preview"}
            user={user}
            onClose={closeAction}
            onChanged={changed}
          />
        )}
    </WorkspacePageFrame>
  )
}
