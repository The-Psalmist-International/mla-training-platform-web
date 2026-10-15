import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { QueryClient } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import {
  createDataClients,
  type CurrentUser,
  type EmailDeliveryListItem,
} from "@workspace/data"
import {
  emailDeliveryTableOptions,
  emailDeliveryDetailOptions,
  emailDeliveryErrorMessage,
  emailOutcomeAt,
  emailStatusDescriptions,
  validEmailRecipient,
} from "./email-delivery"
import {
  emailDeliveryParamsFromSearch,
  validateEmailDeliverySearch,
  updateEmailDeliverySearch,
} from "./email-delivery-search"
import { EmailDeliveryDetails } from "../../components/emails/EmailDeliveryDetailsDialog"

const admin: CurrentUser = {
  id: "admin",
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
}
const message: EmailDeliveryListItem = {
  id: "12345678-1234-4123-8123-123456789abc",
  recipient: "ada@example.com",
  purpose: "invitation",
  status: "bounced",
  notificationId: null,
  providerMessageId: "provider-id",
  failureCode: "RESEND_BOUNCED",
  createdAt: "2026-10-12T00:00:00Z",
  sentAt: "2026-10-12T00:01:00Z",
  deliveredAt: "2026-10-12T00:02:00Z",
  bouncedAt: "2026-10-12T00:03:00Z",
  complainedAt: null,
}
const params = {
  recipient: "ada@example.com",
  status: "bounced" as const,
  purpose: "invitation" as const,
  pageIndex: 2,
  pageSize: 20,
}
function fixture(data: object) {
  const request = vi.fn<typeof fetch>().mockImplementation(
    async () =>
      new Response(JSON.stringify({ data }), {
        headers: { "content-type": "application/json" },
      })
  )
  return {
    request,
    clients: createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    }),
    cache: new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    }),
  }
}
describe("email delivery data integration", () => {
  it("requests exact normalized recipient, filters, pagination, and matching totals", async () => {
    const { clients, request, cache } = fixture({
      adminEmailMessagesPage: { items: [message], totalCount: 42 },
    })
    expect(
      await cache.fetchQuery(
        emailDeliveryTableOptions(clients, admin, {
          ...params,
          recipient: " ADA@EXAMPLE.COM ",
        })
      )
    ).toEqual({ items: [message], totalCount: 42 })
    const body = JSON.parse(String(request.mock.calls[0]?.[1]?.body))
    expect(body.operationName).toBe("AdminEmailMessagesPage")
    expect(body.variables).toEqual({
      recipient: "ada@example.com",
      status: "bounced",
      purpose: "invitation",
      limit: 20,
      offset: 40,
    })
    cache.clear()
  })
  it("omits unset filters and keeps page sizes isolated in cache keys", async () => {
    const { clients, request, cache } = fixture({
      adminEmailMessagesPage: { items: [], totalCount: 0 },
    })
    const unfiltered = {
      ...params,
      recipient: "",
      status: "all" as const,
      purpose: "all" as const,
      pageIndex: 0,
    }
    await cache.fetchQuery(
      emailDeliveryTableOptions(clients, admin, unfiltered)
    )
    expect(
      JSON.parse(String(request.mock.calls[0]?.[1]?.body)).variables
    ).toEqual({ limit: 20, offset: 0 })
    expect(
      emailDeliveryTableOptions(clients, admin, unfiltered).queryKey
    ).not.toEqual(
      emailDeliveryTableOptions(clients, admin, { ...unfiltered, pageSize: 50 })
        .queryKey
    )
    cache.clear()
  })
  it("loads details by ID independently of table filters and pagination", async () => {
    const { clients, request, cache } = fixture({ adminEmailMessage: message })
    expect(
      await cache.fetchQuery(
        emailDeliveryDetailOptions(clients, admin, message.id)
      )
    ).toEqual(message)
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body))).toMatchObject({
      operationName: "AdminEmailMessage",
      variables: { id: message.id },
    })
    cache.clear()
  })
  it.each(["instructor", "learner"] as const)(
    "prevents list and detail requests for %s",
    async (role) => {
      const { clients, request, cache } = fixture({})
      await expect(
        cache.fetchQuery(
          emailDeliveryTableOptions(clients, { ...admin, role }, params)
        )
      ).rejects.toThrow("Admin access required")
      await expect(
        cache.fetchQuery(
          emailDeliveryDetailOptions(clients, { ...admin, role }, message.id)
        )
      ).rejects.toThrow("Admin access required")
      expect(request).not.toHaveBeenCalled()
      cache.clear()
    }
  )
  it("keeps incomplete recipient lookup local instead of issuing invalid requests", async () => {
    const { clients, request, cache } = fixture({})
    await expect(
      cache.fetchQuery(
        emailDeliveryTableOptions(clients, admin, {
          ...params,
          recipient: "ada",
        })
      )
    ).rejects.toThrow("complete recipient")
    expect(request).not.toHaveBeenCalled()
    expect(validEmailRecipient("")).toBe(true)
    expect(validEmailRecipient("ADA+test@example.com")).toBe(true)
    expect(validEmailRecipient("%")).toBe(false)
    cache.clear()
  })
  it("explains missing detail records without exposing provider error messages", () => {
    const error = new CombinedGraphQLErrors({
      errors: [
        { message: "internal detail", extensions: { code: "NOT_FOUND" } },
      ],
    })
    expect(emailDeliveryErrorMessage(error)).toContain("no longer exists")
    expect(emailDeliveryErrorMessage(error)).not.toContain("internal detail")
  })
})
describe("email delivery URL state", () => {
  it("restores filters, pagination, and details, including defaults and invalid values", () => {
    const state = validateEmailDeliverySearch({
      recipient: " ADA@EXAMPLE.COM ",
      purpose: "invitation",
      status: "failed",
      page: "3",
      pageSize: "50",
      modal: "details",
      message: message.id,
    })
    expect(emailDeliveryParamsFromSearch(state)).toEqual({
      recipient: "ada@example.com",
      purpose: "invitation",
      status: "failed",
      pageIndex: 2,
      pageSize: 50,
    })
    expect(state).toMatchObject({ modal: "details", message: message.id })
    expect(
      emailDeliveryParamsFromSearch(
        validateEmailDeliverySearch({
          page: -1,
          pageSize: 99,
          status: "accepted",
          purpose: "unknown",
        })
      )
    ).toEqual({
      recipient: "",
      status: "all",
      purpose: "all",
      pageIndex: 0,
      pageSize: 20,
    })
    expect(
      validateEmailDeliverySearch({ modal: "details", message: "invalid-id" })
        .modal
    ).toBeUndefined()
    expect(
      updateEmailDeliverySearch(state, { modal: undefined, message: undefined })
    ).toMatchObject({
      page: 3,
      pageSize: 50,
      recipient: "ada@example.com",
      status: "failed",
    })
  })
  it("restores details and table pagination through Back and Forward", async () => {
    const root = createRootRoute()
    const route = createRoute({
      getParentRoute: () => root,
      path: "/workspace/email-delivery",
      validateSearch: validateEmailDeliverySearch,
    })
    const history = createMemoryHistory({
      initialEntries: [
        "/workspace/email-delivery?page=3&pageSize=50&status=failed",
      ],
    })
    const router = createRouter({
      routeTree: root.addChildren([route]),
      history,
    })
    await router.load()
    const selected = router.buildLocation({
      to: "/workspace/email-delivery",
      search: (previous) =>
        updateEmailDeliverySearch(validateEmailDeliverySearch(previous), {
          modal: "details",
          message: message.id,
        }),
    })
    history.push(selected.href)
    await router.load()
    expect(router.state.location.search).toMatchObject({
      page: 3,
      pageSize: 50,
      status: "failed",
      message: message.id,
    })
    history.back()
    await router.load()
    expect(router.state.location.search).toMatchObject({
      page: 3,
      pageSize: 50,
      status: "failed",
    })
    expect(router.state.location.search.modal).toBeUndefined()
    history.forward()
    await router.load()
    expect(router.state.location.search.message).toBe(message.id)
  })
})
describe("email delivery diagnostics", () => {
  it("retains delivery timestamps under a later bounce and distinguishes sending from delivery", () => {
    const html = renderToStaticMarkup(
      createElement(EmailDeliveryDetails, { email: message })
    )
    expect(html).toContain("RESEND_BOUNCED")
    expect(html).toContain("provider-id")
    expect(html).toContain(`dateTime="${message.deliveredAt}"`)
    expect(html).toContain(`dateTime="${message.bouncedAt}"`)
    expect(html).toContain("N/A")
    expect(emailOutcomeAt(message)).toBe(message.bouncedAt)
    expect(emailOutcomeAt({ ...message, status: "failed" })).toBeNull()
    expect(
      emailOutcomeAt({
        ...message,
        status: "complained",
        complainedAt: "2026-10-12T00:04:00Z",
      })
    ).toBe("2026-10-12T00:04:00Z")
    expect(emailStatusDescriptions.sent).toContain("not been confirmed")
    expect(emailStatusDescriptions.delivered).toContain("does not confirm")
  })
})
