import {
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { CurrentUser, InvitationListItem } from "@workspace/data"
import {
  DataTable,
  type DataTableColumn,
} from "@workspace/ui/components/data-table"
import { Button } from "@workspace/ui/components/button"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { ErrorState } from "@workspace/ui/components/error-state"
import { SelectInput } from "@workspace/ui/components/select"
import { WorkspacePageFrame } from "../components/WorkspacePageFrame"
import { WorkspacePageAction } from "../components/WorkspacePageAction"
import { workspaceIcons } from "../workspace/icons"
import {
  invitationsTableOptions,
  getInvitationStatus,
} from "../workspace/invitations"
import { formatPeopleCreatedAt as formatInvitationsCreatedAt } from "../workspace/people"
import {
  InvitationRowActions,
  InvitationDialog,
} from "../components/InvitationDialogs"

import {
  invitationsParamsFromSearch,
  updateInvitationsSearch,
  type InvitationsSearchState,
} from "../workspace/invitations-search"

const columns: DataTableColumn<InvitationListItem>[] = [
  {
    id: "email",
    header: "Email",
    cell: (invitation) => (
      <p className="font-medium break-all">{invitation.email}</p>
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
      <StatusBadge
        tone={getInvitationStatus(user) === "accepted" ? "success" : "neutral"}
      >
        {getInvitationStatus(user)}
      </StatusBadge>
    ),
  },
  {
    id: "expiresAt",
    header: "Expires at",
    className: "whitespace-nowrap",
    cell: (invitation) => (
      <time dateTime={invitation.expiresAt} title="Date and time in UTC">
        {formatInvitationsCreatedAt(invitation.expiresAt)}
      </time>
    ),
  },
  {
    id: "createdAt",
    header: "Created at",
    className: "whitespace-nowrap",
    cell: (user) => {
      const createdAt = formatInvitationsCreatedAt(user.createdAt)
      return (
        <time dateTime={user.createdAt} title="Date and time in UTC">
          {createdAt}
        </time>
      )
    },
  },
]

export function InvitationsPage() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  if (!user) return null
  return <InvitationsTable key={user.id} user={user} />
}

function InvitationsTable({ user }: { user: CurrentUser }) {
  const { dataClients, auth } = useRouter().options.context
  const id = useId()
  const queryClient = useQueryClient()
  const urlState = useSearch({ from: "/workspace/invitations" })
  const navigate = useNavigate({ from: "/workspace/invitations" })
  const params = invitationsParamsFromSearch(urlState)
  const [feedback, setFeedback] = useState("")
  const [search, setSearch] = useState(params.search)
  const updateSearch = useCallback(
    (patch: Partial<InvitationsSearchState>, replace = false) => {
      void navigate({
        search: (previous) => updateInvitationsSearch(previous, patch),
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
  const openAction = (action: {
    type: "resend" | "revoke"
    invitation: InvitationListItem
  }) => updateSearch({ modal: action.type, invitation: action.invitation.id })
  const closeAction = () => {
    if (auth.getUser() === user)
      updateSearch({ modal: undefined, invitation: undefined }, true)
  }
  const query = useQuery(invitationsTableOptions(dataClients, user, params))
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
    <WorkspacePageFrame view="invitations">
      <p
        role="status"
        className={feedback ? "text-sm text-muted-foreground" : "sr-only"}
      >
        {feedback}
      </p>
      <DataTable
        ariaLabel="Invitations"
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
                    <InvitationRowActions
                      invitation={person}
                      onSelect={openAction}
                    />
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
          placeholder: "Search invitations by email...",
          label: "Search invitations",
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
              Filter by invitation status
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
                { value: "pending", label: "Pending" },
                { value: "accepted", label: "Accepted" },
                { value: "revoked", label: "Revoked" },
                { value: "expired", label: "Expired" },
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
              icon={workspaceIcons.invitations}
              title={hasFilters ? "No invitations found" : "No invitations yet"}
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
                  <WorkspacePageAction view="invitations" role={user.role} />
                )
              }
            />
          </div>
        }
        errorState={
          query.isError ? (
            <div className="flex justify-center">
              <ErrorState
                title="We couldn't load invitations"
                action={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={query.isFetching}
                    onClick={() => void query.refetch()}
                  >
                    {query.isFetching ? "Trying again..." : "Try again"}
                  </Button>
                }
              />
            </div>
          ) : undefined
        }
      />
      {urlState.modal && (
        <InvitationDialog
          key={`${urlState.invitation ?? "new"}-${urlState.modal}`}
          modal={urlState.modal}
          invitation={query.data?.items.find(
            (item) => item.id === urlState.invitation
          )}
          isLoading={query.isPending || query.isFetching}
          isError={query.isError}
          onRetry={() => void query.refetch()}
          actor={user}
          onClose={closeAction}
          onPartialSuccess={() =>
            void queryClient
              .invalidateQueries({
                queryKey: [
                  "workspace",
                  dataClients.graphqlUrl,
                  user.id,
                  "invitations-table",
                ],
              })
              .catch(() => {})
          }
          onSuccess={({ kind, email }) => {
            setFeedback(
              kind === "revoke"
                ? `Invitation revoked for ${email}.`
                : `Invitation email queued for ${email}.`
            )
            void queryClient
              .invalidateQueries({
                queryKey: [
                  "workspace",
                  dataClients.graphqlUrl,
                  user.id,
                  "invitations-table",
                ],
              })
              .catch(() => {})
          }}
        />
      )}
    </WorkspacePageFrame>
  )
}
