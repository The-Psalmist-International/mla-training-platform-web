import {
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@workspace/ui/components/toaster"
import type { CurrentUser, UserListItem } from "@workspace/data"
import {
  DataTable,
  type DataTableColumn,
} from "@workspace/ui/components/data-table"
import { Button } from "@workspace/ui/components/button"
import { UserAvatar } from "@workspace/ui/components/user-avatar"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { ErrorState } from "@workspace/ui/components/error-state"
import { SelectInput } from "@workspace/ui/components/select"
import { WorkspacePageFrame } from "../components/layout/WorkspacePageFrame"
import { WorkspacePageAction } from "../components/layout/WorkspacePageAction"
import { workspaceIcons } from "../workspace/icons"
import { peopleTableOptions, formatPeopleCreatedAt } from "../workspace/people/people"
import {
  PeopleRowActions,
  PeopleSelectionDialog,
  type PeopleAction,
} from "../components/people/PeopleRowActions"

import {
  peopleParamsFromSearch,
  updatePeopleSearch,
  type PeopleSearchState,
} from "../workspace/people/people-search"

const columns: DataTableColumn<UserListItem>[] = [
  {
    id: "name",
    header: "Name",
    cell: (user) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
          size="lg"
        />
        <div className="min-w-0">
          <p className="font-medium">{user.name}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
    ),
    className: "min-w-64",
  },
  {
    id: "role",
    header: "Role",
    cell: (user) => (
      <span className="inline-flex rounded-full bg-muted px-2 py-1 text-xs capitalize">
        {user.role === "admin" ? "Administrator" : user.role}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (user) => (
      <StatusBadge tone={user.disabledAt ? "neutral" : "success"}>
        {user.disabledAt ? "Disabled" : "Active"}
      </StatusBadge>
    ),
  },
  {
    id: "createdAt",
    header: "Created at",
    className: "whitespace-nowrap",
    cell: (user) => {
      const createdAt = formatPeopleCreatedAt(user.createdAt)
      return createdAt === "—" ? (
        "—"
      ) : (
        <time dateTime={user.createdAt} title="Date and time in UTC">
          {createdAt}
        </time>
      )
    },
  },
]

export function PeoplePage() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  if (!user) return null
  return <PeopleTable key={user.id} user={user} />
}

function PeopleTable({ user }: { user: CurrentUser }) {
  const { dataClients, auth } = useRouter().options.context
  const id = useId()
  const queryClient = useQueryClient()
  const urlState = useSearch({ from: "/workspace/people" })
  const navigate = useNavigate({ from: "/workspace/people" })
  const params = peopleParamsFromSearch(urlState)
  const { toast } = useToast()
  const [search, setSearch] = useState(params.search)
  const updateSearch = useCallback(
    (patch: Partial<PeopleSearchState>, replace = false) => {
      void navigate({
        search: (previous) => updatePeopleSearch(previous, patch),
        replace,
        resetScroll: false,
      })
    },
    [navigate]
  )
  useEffect(() => {
    setSearch(urlState.q ?? "")
  }, [urlState.q])
  useEffect(() => {
    if (search.trim() === params.search) return
    const timeout = setTimeout(() => {
      updateSearch({ q: search.trim(), page: undefined }, true)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, params.search, updateSearch])
  const openAction = (action: PeopleAction) =>
    updateSearch({ modal: action.type, person: action.person.id })
  const closeAction = () => {
    if (auth.getUser() === user)
      updateSearch({ modal: undefined, person: undefined }, true)
  }
  const query = useQuery(peopleTableOptions(dataClients, user, params))
  const totalCount = query.data?.totalCount ?? 0
  useEffect(() => {
    if (!query.data) return
    const lastPage = Math.max(
      0,
      Math.ceil(query.data.totalCount / params.pageSize) - 1
    )
    if (params.pageIndex > lastPage) updateSearch({ page: lastPage + 1 }, true)
  }, [query.data, params.pageSize, params.pageIndex, updateSearch])
  const hasFilters =
    !!search.trim() || params.role !== "all" || params.status !== "all"
  const clearFilters = () => {
    setSearch("")
    updateSearch({
      q: undefined,
      role: undefined,
      status: undefined,
      page: undefined,
    })
  }
  return (
    <WorkspacePageFrame view="people">
      <DataTable
        ariaLabel="People"
        rows={query.data?.items ?? []}
        columns={
          user.role === "admin"
            ? [
                ...columns,
                {
                  id: "actions",
                  header: "Actions",
                  className: "w-24 text-right",
                  cell: (person) => (
                    <PeopleRowActions person={person} onSelect={openAction} />
                  ),
                },
              ]
            : columns
        }
        getRowId={(person) => person.id}
        onRefresh={() => void query.refetch()}
        search={{
          value: search,
          onChange: (value) => setSearch(value.slice(0, 200)),
          placeholder: "Search people by name or email…",
          label: "Search people",
        }}
        filters={
          <>
            <label htmlFor={`${id}-role`} className="sr-only">
              Filter by role
            </label>
            <SelectInput
              id={`${id}-role`}
              value={params.role}
              className="min-w-36"
              onValueChange={(role) =>
                updateSearch({
                  q: search.trim(),
                  role: role === "all" ? undefined : role,
                  page: undefined,
                })
              }
              options={[
                { value: "all", label: "All roles" },
                { value: "admin", label: "Administrators" },
                { value: "instructor", label: "Instructors" },
                { value: "learner", label: "Learners" },
              ]}
            />
            <label htmlFor={`${id}-status`} className="sr-only">
              Filter by account status
            </label>
            <SelectInput
              id={`${id}-status`}
              value={params.status}
              className="min-w-32"
              onValueChange={(status) =>
                updateSearch({
                  q: search.trim(),
                  status: status === "all" ? undefined : status,
                  page: undefined,
                })
              }
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "disabled", label: "Disabled" },
              ]}
            />
            {hasFilters && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </>
        }
        pagination={{
          pageIndex: params.pageIndex,
          pageSize: params.pageSize,
          totalCount,
          onPageChange: (pageIndex) => updateSearch({ page: pageIndex + 1 }),
          onPageSizeChange: (pageSize) =>
            updateSearch({ pageSize, page: undefined }),
        }}
        isLoading={query.isPending}
        isFetching={query.isFetching || search.trim() !== params.search}
        emptyState={
          <div className="flex justify-center">
            <EmptyState
              icon={workspaceIcons.people}
              title={hasFilters ? "No people found" : "No people yet"}
              description={
                hasFilters
                  ? "Try a different search or clear your filters."
                  : "Invite people to join the academy and get started."
              }
              action={
                hasFilters ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <WorkspacePageAction view="people" role={user.role} />
                )
              }
            />
          </div>
        }
        errorState={
          query.isError ? (
            <div className="flex justify-center">
              <ErrorState
                title="We couldn't load people"
                action={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={query.isFetching}
                    onClick={() => void query.refetch()}
                  >
                    {query.isFetching ? "Trying again…" : "Try again"}
                  </Button>
                }
              />
            </div>
          ) : undefined
        }
      />
      {urlState.modal && urlState.person && (
        <PeopleSelectionDialog
          key={`${urlState.person}-${urlState.modal}`}
          type={urlState.modal}
          person={query.data?.items.find(
            (person) => person.id === urlState.person
          )}
          isLoading={query.isPending || query.isFetching}
          isError={query.isError}
          onRetry={() => void query.refetch()}
          actor={user}
          onClose={closeAction}
          onSuccess={(person) => {
            toast({ title: "Access updated", description: `Access updated for ${person.name}.`, status: "success" })
            // Refresh failures belong to the table, not the completed mutation.
            void queryClient
              .invalidateQueries({
                queryKey: [
                  "workspace",
                  dataClients.graphqlUrl,
                  user.id,
                  "people-table",
                ],
              })
              .catch(() => {})
          }}
        />
      )}
    </WorkspacePageFrame>
  )
}
