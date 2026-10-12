import { createElement } from "react"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { renderToStaticMarkup } from "react-dom/server"
import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"
import {
  createDataClients,
  type CurrentUser,
  type UserListItem,
} from "@workspace/data"
import { PeopleRowActions } from "../components/PeopleRowActions"
import {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
} from "@workspace/ui/components/data-table"
import {
  peopleTableOptions,
  updatePeopleAccess,
  peopleAccessErrorMessage,
  formatPeopleCreatedAt,
  type PeopleTableParams,
} from "./people"

const admin: CurrentUser = {
  id: "admin",
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
}
const params: PeopleTableParams = {
  search: "Ada",
  role: "learner",
  status: "active",
  pageIndex: 2,
  pageSize: 20,
}

describe("People table queries", () => {
  it("sends server-side search, filters, and pagination and preserves matching totals", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            usersPage: { __typename: "UserPage", items: [], totalCount: 42 },
          },
        }),
        { headers: { "content-type": "application/json" } }
      )
    )
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    })
    const cache = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    expect(
      await cache.fetchQuery(peopleTableOptions(clients, admin, params))
    ).toMatchObject({ items: [], totalCount: 42 })
    const body = JSON.parse(String(request.mock.calls[0]?.[1]?.body))
    expect(body.operationName).toBe("UsersPage")
    expect(body.variables).toEqual({
      search: "Ada",
      role: "learner",
      disabled: false,
      limit: 20,
      offset: 40,
    })
  })

  it("does not issue an admin-only query for instructors", async () => {
    const request = vi.fn<typeof fetch>()
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    })
    const cache = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    await expect(
      cache.fetchQuery(
        peopleTableOptions(clients, { ...admin, role: "instructor" }, params)
      )
    ).rejects.toThrow("Admin access required")
    expect(request).not.toHaveBeenCalled()
  })
})

const person: UserListItem = {
  id: "person",
  name: "Ada",
  email: "ada@example.com",
  role: "learner",
  disabledAt: null,
  emailVerifiedAt: null,
  createdAt: "2026-10-12T14:35:00Z",
  updatedAt: "2026-10-12T14:35:00Z",
}

describe("People access actions", () => {
  it.each([
    {
      change: { type: "role", role: "instructor" } as const,
      operation: "SetUserRole",
      field: "setUserRole",
      variables: { id: person.id, role: "instructor" },
    },
    {
      change: { type: "status", disabled: true } as const,
      operation: "SetUserDisabled",
      field: "setUserDisabled",
      variables: { id: person.id, disabled: true },
    },
    {
      change: { type: "status", disabled: false } as const,
      operation: "SetUserDisabled",
      field: "setUserDisabled",
      variables: { id: person.id, disabled: false },
    },
  ])(
    "sends $operation with the intended access change",
    async ({ change, operation, field, variables }) => {
      const request = vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: { [field]: { __typename: "User", ...person } },
          }),
          { headers: { "content-type": "application/json" } }
        )
      )
      const clients = createDataClients({
        graphqlUrl: "http://localhost:4000/graphql",
        fetch: request,
      })
      expect(
        await updatePeopleAccess(clients, admin, person.id, change)
      ).toMatchObject(person)
      const body = JSON.parse(String(request.mock.calls[0]?.[1]?.body))
      expect(body.operationName).toBe(operation)
      expect(body.variables).toEqual(variables)
    }
  )

  it("rejects non-admin changes before making a request", async () => {
    const request = vi.fn<typeof fetch>()
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    })
    await expect(
      updatePeopleAccess(clients, { ...admin, role: "learner" }, person.id, {
        type: "status",
        disabled: true,
      })
    ).rejects.toThrow("Admin access required")
    expect(request).not.toHaveBeenCalled()
  })

  it("explains the backend's last-administrator safeguard and request failures", () => {
    const error = new CombinedGraphQLErrors({
      errors: [
        {
          message: "Keep at least one active admin.",
          extensions: { code: "LAST_ADMIN" },
        },
      ],
    })
    expect(peopleAccessErrorMessage(error)).toContain(
      "Enable or promote another administrator first"
    )
    expect(
      peopleAccessErrorMessage(new TypeError("Failed to fetch"))
    ).toContain("Please try again")
  })

  it("labels icon actions and only offers the applicable account action", () => {
    const active = renderToStaticMarkup(
      createElement(PeopleRowActions, { person, onSelect: () => {} })
    )
    expect(active).toContain('aria-label="Change role for Ada"')
    expect(active).toContain('aria-label="Disable account for Ada"')
    expect(active).not.toContain("Enable account for Ada")
    const disabled = renderToStaticMarkup(
      createElement(PeopleRowActions, {
        person: { ...person, disabledAt: person.createdAt },
        onSelect: () => {},
      })
    )
    expect(disabled).toContain('aria-label="Enable account for Ada"')
    expect(disabled).not.toContain("Disable account for Ada")
    expect(active).not.toContain("Delete")
  })
})

describe("People creation timestamps", () => {
  it("shows date and time in UTC, including when the timestamp has an offset", () => {
    const formatted = formatPeopleCreatedAt("2026-10-12T16:35:00+02:00")
    expect(formatted).toContain("Oct 12, 2026")
    expect(formatted).toMatch(/02:35.*PM/)
    expect(formatted).toBe(formatPeopleCreatedAt("2026-10-12T14:35:00Z"))
  })
  it("keeps the fallback for invalid dates", () => {
    expect(formatPeopleCreatedAt("not-a-date")).toBe("—")
  })
})

type Person = { id: string; name: string }
const PersonTable = DataTable<Person>
const columns: DataTableColumn<Person>[] = [
  { id: "name", header: "Name", cell: (row) => row.name },
]
function renderTable(
  pageIndex: number,
  totalCount: number,
  loading = false,
  overrides: Partial<DataTableProps<Person>> = {}
) {
  return renderToStaticMarkup(
    createElement(PersonTable, {
      rows: loading ? [] : [{ id: "1", name: "Ada" }],
      columns,
      getRowId: (row) => row.id,
      ariaLabel: "People",
      search: { value: "", onChange: () => {}, label: "Search people" },
      filters: createElement("span", null, "Role filter"),
      onRefresh: () => {},
      pagination: {
        pageIndex,
        pageSize: 20,
        totalCount,
        onPageChange: () => {},
        onPageSizeChange: () => {},
      },
      isLoading: loading,
      ...overrides,
    })
  )
}

describe("shared DataTable layout", () => {
  it("places search, filters, and refresh before the native table and pagination after it", () => {
    const html = renderTable(0, 1)
    expect(html.indexOf("Search people")).toBeLessThan(
      html.indexOf("Role filter")
    )
    expect(html).toMatch(
      /Role filter<\/span><button[^>]*aria-label="Refresh People"/
    )
    expect(html.indexOf('aria-label="Refresh People"')).toBeLessThan(
      html.indexOf("<table")
    )
    expect(html.indexOf("</table>")).toBeLessThan(html.indexOf("<footer"))
    expect(html).toContain("sticky bottom-0")
    expect(html).toContain("justify-self-center")
    expect(html).toContain("justify-self-end")
    expect(html).toContain('data-slot="select-trigger"')
    expect(
      html.match(/data-slot="data-table"[^>]*class="([^"]*)"/)?.[1]
    ).toContain("flex-1")
    expect(
      html.match(/data-slot="data-table"[^>]*class="([^"]*)"/)?.[1]
    ).not.toContain("max-h-")
    expect(html.indexOf('aria-label="People pagination"')).toBeLessThan(
      html.indexOf("Rows per page")
    )
    expect(html).toContain('scope="col"')
    expect(html).toContain("Showing 1 to 1 out of 1")
    expect(html).toContain("Previous</span>")
    expect(html).toContain("Next</span>")
    expect(html).toContain("20 / page")
    expect(html).not.toContain("divide-y")
    expect(html.match(/<footer[^>]*class="([^"]*)"/)?.[1]).not.toContain(
      "border"
    )
  })

  it.each([{}, { rows: [] }, { errorState: "Unable to load people" }])(
    "keeps refresh visible and enabled without filters: %j",
    (overrides) => {
      const html = renderTable(0, 0, false, {
        ...overrides,
        filters: undefined,
      })
      const button = html.match(
        /<button[^>]*aria-label="Refresh People"[^>]*>/
      )?.[0]
      expect(button).toBeDefined()
      expect(button).toContain('data-slot="tooltip-trigger"')
      expect(button).not.toContain('disabled=""')
      expect(html).not.toContain("Role filter")
      expect(html.indexOf("Search people")).toBeLessThan(
        html.indexOf('aria-label="Refresh People"')
      )
      expect(html.indexOf('aria-label="Refresh People"')).toBeLessThan(
        html.indexOf("<table")
      )
      expect(html).not.toContain("animate-spin")
    }
  )

  it.each([
    { isLoading: true, isFetching: false },
    { isLoading: false, isFetching: true },
    { isLoading: true, isFetching: true },
  ])("disables refresh while busy: %j", (busy) => {
    const html = renderTable(0, 1, false, busy)
    expect(
      html.match(/<button[^>]*aria-label="Refresh People"[^>]*>/)?.[0]
    ).toContain('disabled=""')
    if (busy.isFetching) {
      expect(html).toContain("animate-spin motion-reduce:animate-none")
    } else {
      expect(html).not.toContain("animate-spin")
    }
  })

  it("disables pagination at dataset boundaries and hides totals while loading", () => {
    const html = renderTable(0, 1)
    for (const label of [
      "First page",
      "Previous page",
      "Next page",
      "Last page",
    ]) {
      expect(
        html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0]
      ).toContain("disabled")
    }
    const loading = renderTable(0, 0, true)
    expect(loading).toContain("Loading results…")
    expect(loading).not.toContain("of 0")
  })
})
