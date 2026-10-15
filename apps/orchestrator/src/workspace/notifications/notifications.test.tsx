import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import {
  createDataClients,
  type CurrentUser,
  type NotificationFieldsFragment,
} from "@workspace/data"
import { QueryClient } from "@tanstack/react-query"
import { NotificationRow } from "../../components/notifications/NotificationInbox"
import {
  notificationsOptions,
  markNotification,
  markAllNotifications,
  notificationTime,
} from "./notifications"
import { validateNotificationsSearch } from "./notifications-search"
const user: CurrentUser = {
  id: "owner",
  name: "Author",
  email: "author@example.com",
  role: "instructor",
}
const notification: NotificationFieldsFragment = {
  id: "notification",
  type: "grading_pending",
  entityId: "attempt",
  createdAt: "2026-10-14T12:00:00Z",
  readAt: null,
}
describe("notification UI and data", () => {
  it("queries server unread filtering, totals, and pagination", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({
          data: {
            myNotificationsPage: {
              items: [notification],
              totalCount: 42,
              unreadCount: 7,
            },
          },
        })
      )
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    })
    const cache = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    expect(
      await cache.fetchQuery(notificationsOptions(clients, user, true, 3))
    ).toMatchObject({ totalCount: 42, unreadCount: 7 })
    expect(
      JSON.parse(String(request.mock.calls[0]?.[1]?.body)).variables
    ).toEqual({ limit: 20, offset: 40, unreadOnly: true })
    cache.clear()
  })
  it("uses the dedicated individual and all-read mutations", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockImplementation(async (_url, init) => {
        const operation = JSON.parse(String(init?.body)).operationName
        return Response.json({
          data:
            operation === "MarkNotificationRead"
              ? {
                  markNotificationRead: {
                    __typename: "Notification",
                    ...notification,
                    readAt: notification.createdAt,
                  },
                }
              : { markAllNotificationsRead: 7 },
        })
      })
    const clients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    })
    expect((await markNotification(clients, notification.id)).readAt).toBe(
      notification.createdAt
    )
    expect(await markAllNotifications(clients)).toBe(7)
    expect(
      JSON.parse(String(request.mock.calls[0]?.[1]?.body)).variables
    ).toEqual({ id: notification.id })
  })
  it("renders unread actions and removes them for read rows", () => {
    const render = (readAt: string | null) =>
      renderToStaticMarkup(
        createElement(NotificationRow, {
          notification: { ...notification, readAt },
          disabled: false,
          pending: false,
          onRead: () => {},
        })
      )
    expect(render(null)).toContain("Assessment ready for review")
    expect(render(null)).toContain(
      'aria-label="Mark assessment ready for review as read"'
    )
    expect(render(notification.createdAt)).not.toContain(
      "Mark assessment ready for review as read"
    )
  })
  it("keeps inbox filters in the URL and handles relative timestamps", () => {
    expect(validateNotificationsSearch({ tab: "unread", page: "3" })).toEqual({
      tab: "unread",
      page: 3,
    })
    expect(validateNotificationsSearch({ tab: "following", page: -1 })).toEqual(
      { tab: undefined, page: undefined }
    )
    expect(
      notificationTime(
        notification.createdAt,
        new Date(notification.createdAt).getTime() + 120000
      )
    ).toBe("2 minutes ago")
  })
})
