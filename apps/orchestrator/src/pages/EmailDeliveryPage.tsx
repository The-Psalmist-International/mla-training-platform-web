import {
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { CurrentUser, EmailDeliveryListItem } from "@workspace/data"
import {
  DataTable,
  type DataTableColumn,
} from "@workspace/ui/components/data-table"
import { Button } from "@workspace/ui/components/button"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { ErrorState } from "@workspace/ui/components/error-state"
import { SelectInput } from "@workspace/ui/components/select"
import { WorkspacePageFrame } from "../components/layout/WorkspacePageFrame"
import { workspaceIcons } from "../workspace/icons"
import {
  emailDeliveryTableOptions,
  emailDeliveryTone,
  emailPurposeLabel,
  emailOutcomeAt,
  emailStatusOptions,
  emailPurposeOptions,
  validEmailRecipient,
} from "../workspace/emails/email-delivery"
import { formatPeopleCreatedAt } from "../workspace/people/people"
import { EmailDeliveryDetailsDialog } from "../components/emails/EmailDeliveryDetailsDialog"
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye"
import { TableRowActions } from "@workspace/ui/components/table-row-actions"
import {
  emailDeliveryParamsFromSearch,
  updateEmailDeliverySearch,
  type EmailDeliverySearchState,
} from "../workspace/emails/email-delivery-search"

const columns: DataTableColumn<EmailDeliveryListItem>[] = [
  {
    id: "recipient",
    header: "Recipient",
    className: "min-w-64",
    cell: (email) => <p className="font-medium break-all">{email.recipient}</p>,
  },
  {
    id: "purpose",
    header: "Purpose",
    className: "min-w-40",
    cell: (email) => emailPurposeLabel(email.purpose),
  },
  {
    id: "status",
    header: "Status",
    cell: (email) => (
      <StatusBadge tone={emailDeliveryTone(email.status)}>
        {email.status}
      </StatusBadge>
    ),
  },
  {
    id: "failure",
    header: "Failure code",
    cell: (email) => (
      <span className="text-xs break-all">{email.failureCode ?? "—"}</span>
    ),
  },
  {
    id: "createdAt",
    header: "Created at",
    className: "whitespace-nowrap",
    cell: (email) => (
      <time dateTime={email.createdAt} title="Date and time in UTC">
        {formatPeopleCreatedAt(email.createdAt)}
      </time>
    ),
  },
  {
    id: "outcomeAt",
    header: "Outcome at",
    className: "whitespace-nowrap",
    cell: (email) => {
      const at = emailOutcomeAt(email)
      return at ? (
        <time dateTime={at} title="Date and time in UTC">
          {formatPeopleCreatedAt(at)}
        </time>
      ) : (
        "—"
      )
    },
  },
]

export function EmailDeliveryPage() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  if (!user) return null
  return <EmailDeliveryTable key={user.id} user={user} />
}

function EmailDeliveryTable({ user }: { user: CurrentUser }) {
  const { dataClients, auth } = useRouter().options.context
  const id = useId()
  const urlState = useSearch({ from: "/workspace/email-delivery" })
  const navigate = useNavigate({ from: "/workspace/email-delivery" })
  const params = emailDeliveryParamsFromSearch(urlState)
  const [search, setSearch] = useState(params.recipient)
  const updateSearch = useCallback(
    (patch: Partial<EmailDeliverySearchState>, replace = false) => {
      void navigate({
        search: (previous) => updateEmailDeliverySearch(previous, patch),
        replace,
        resetScroll: false,
      })
    },
    [navigate]
  )
  useEffect(() => {
    setSearch(urlState.recipient ?? "")
  }, [urlState.recipient])
  useEffect(() => {
    if (search.trim().toLowerCase() === params.recipient) return
    const timeout = setTimeout(() => {
      updateSearch({ recipient: search.trim(), page: undefined }, true)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, params.recipient, updateSearch])
  const closeAction = () => {
    if (auth.getUser() === user)
      updateSearch({ modal: undefined, message: undefined }, true)
  }
  const validRecipient = validEmailRecipient(params.recipient)
  const query = useQuery({
    ...emailDeliveryTableOptions(dataClients, user, params),
    enabled: validRecipient,
  })
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
    !!search.trim() || params.purpose !== "all" || params.status !== "all"
  const clearFilters = () => {
    setSearch("")
    updateSearch({
      recipient: undefined,
      purpose: undefined,
      status: undefined,
      page: undefined,
    })
  }
  return (
    <WorkspacePageFrame view="delivery">
      <DataTable
        ariaLabel="Email delivery"
        rows={query.data?.items ?? []}
        columns={[
          ...columns,
          {
            id: "actions",
            header: "Actions",
            className: "w-20 text-right",
            cell: (email) => (
              <TableRowActions
                subject={email.recipient}
                primary={[
                  {
                    label: "View delivery details",
                    icon: <EyeIcon aria-hidden />,
                    onSelect: () =>
                      updateSearch({ modal: "details", message: email.id }),
                  },
                ]}
              />
            ),
          },
        ]}
        getRowId={(person) => person.id}
        onRefresh={() => void query.refetch()}
        search={{
          value: search,
          onChange: (value) => setSearch(value.slice(0, 254)),
          placeholder: "Exact recipient email...",
          label: "Find emails by exact recipient address",
        }}
        filters={
          <>
            <label htmlFor={`${id}-purpose`} className="sr-only">
              Filter by purpose
            </label>
            <SelectInput
              id={`${id}-purpose`}
              value={params.purpose}
              className="min-w-40"
              onValueChange={(purpose) =>
                updateSearch({
                  recipient: search.trim(),
                  purpose: purpose === "all" ? undefined : purpose,
                  page: undefined,
                })
              }
              options={[
                { value: "all", label: "All purposes" },
                ...emailPurposeOptions,
              ]}
            />
            <label htmlFor={`${id}-status`} className="sr-only">
              Filter by delivery status
            </label>
            <SelectInput
              id={`${id}-status`}
              value={params.status}
              className="min-w-32"
              onValueChange={(status) =>
                updateSearch({
                  recipient: search.trim(),
                  status: status === "all" ? undefined : status,
                  page: undefined,
                })
              }
              options={[
                { value: "all", label: "All statuses" },
                ...emailStatusOptions,
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
        isLoading={validRecipient && query.isPending}
        isFetching={
          query.isFetching ||
          (validRecipient && search.trim().toLowerCase() !== params.recipient)
        }
        emptyState={
          <div className="flex justify-center">
            <EmptyState
              icon={workspaceIcons.delivery}
              title={
                hasFilters
                  ? "No matching emails"
                  : "No email delivery records yet"
              }
              description={
                hasFilters
                  ? "Try another recipient address or clear your filters."
                  : "Invitation, password reset, and learning notification emails will appear here."
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
                ) : undefined
              }
            />
          </div>
        }
        errorState={
          !validRecipient ? (
            <div className="flex justify-center">
              <ErrorState
                title="Enter a complete recipient email address"
                description="Recipient lookup matches the full email address. Clear the field to see all email records."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                }
              />
            </div>
          ) : query.isError ? (
            <div className="flex justify-center">
              <ErrorState
                title="We couldn't load email delivery records"
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
      {urlState.modal === "details" && urlState.message && (
        <EmailDeliveryDetailsDialog
          key={urlState.message}
          id={urlState.message}
          user={user}
          onClose={closeAction}
        />
      )}
    </WorkspacePageFrame>
  )
}
