import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createDataClients, type CurrentUser } from "@workspace/data"
import {
  notificationsOptions,
  markNotification,
  markAllNotifications,
} from "@workspace/ui/lib/notifications"
import { LearnerNotifications } from "../components/LearnerNotifications"
import { LearnerThemeMenuItem } from "../components/LearnerThemeMenuItem"

const state = vi.hoisted(() => ({ theme: "light", toggleTheme: vi.fn() }))
const clients = createDataClients({
  graphqlUrl: "http://localhost:4000/graphql",
})
const user: CurrentUser = {
  id: "learner-1",
  name: "Alex Learner",
  email: "alex@example.test",
  role: "learner",
}
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ options: { context: { dataClients: clients } } }),
}))
vi.mock("@workspace/ui/components/theme-provider", () => ({
  useTheme: () => state,
}))
vi.mock("@workspace/ui/components/dropdown-menu", () => ({
  DropdownMenuItem: (props: object) => createElement("button", props),
  DropdownMenuCheckboxItem: (props: object) => createElement("button", props),
}))

describe("learner header controls", () => {
  it("renders an accessible bell with the real cached unread count", () => {
    const cache = new QueryClient()
    cache.setQueryData(
      notificationsOptions(clients, user, false, 1, 1).queryKey,
      { unreadCount: 3, totalCount: 3, items: [] }
    )
    const html = renderToStaticMarkup(
      createElement(QueryClientProvider, {
        client: cache,
        children: createElement(LearnerNotifications, {
          user,
          tab: "overview",
        }),
      })
    )
    expect(html).toContain('aria-label="Notifications, 3 unread"')
    expect(html).toContain("bg-destructive")
    expect(html).not.toContain("Switch to dark theme")
    cache.clear()
  })

  it("offers the theme toggle inside the profile menu item", () => {
    state.theme = "light"
    expect(renderToStaticMarkup(createElement(LearnerThemeMenuItem))).toContain(
      "Dark mode"
    )
    state.theme = "dark"
    expect(renderToStaticMarkup(createElement(LearnerThemeMenuItem))).toContain(
      "Dark mode"
    )
    state.theme = "light"
  })

  it("uses authenticated notification operations and isolates cache keys per learner", async () => {
    const requests: Array<{
      operationName: string
      variables: Record<string, unknown>
    }> = []
    const request = vi.fn<typeof fetch>(async (_url, init) => {
      const operation = JSON.parse(String(init?.body))
      requests.push(operation)
      expect(init?.credentials).toBe("include")
      const data =
        operation.operationName === "MyNotificationsPage"
          ? {
              myNotificationsPage: { totalCount: 0, unreadCount: 0, items: [] },
            }
          : operation.operationName === "MarkNotificationRead"
            ? {
                markNotificationRead: {
                  id: "notice-1",
                  type: "course_completed",
                  entityId: "course-1",
                  createdAt: "2026-10-15T00:00:00Z",
                  readAt: "2026-10-15T01:00:00Z",
                },
              }
            : { markAllNotificationsRead: 1 }
      return new Response(JSON.stringify({ data }), {
        headers: { "content-type": "application/json" },
      })
    })
    const dataClients = createDataClients({
      graphqlUrl: "http://localhost:4000/graphql",
      fetch: request,
    })
    const cache = new QueryClient()
    try {
      await cache.fetchQuery(notificationsOptions(dataClients, user, true, 2))
      await markNotification(dataClients, "notice-1")
      await markAllNotifications(dataClients)
      expect(requests.map((item) => item.operationName)).toEqual([
        "MyNotificationsPage",
        "MarkNotificationRead",
        "MarkAllNotificationsRead",
      ])
      expect(requests[0]?.variables).toEqual({
        unreadOnly: true,
        limit: 20,
        offset: 20,
      })
      expect(requests[1]?.variables).toEqual({ id: "notice-1" })
      expect(
        notificationsOptions(dataClients, { ...user, id: "learner-2" }).queryKey
      ).not.toEqual(notificationsOptions(dataClients, user).queryKey)
    } finally {
      cache.clear()
    }
  })
})
