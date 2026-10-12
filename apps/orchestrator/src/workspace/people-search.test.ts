import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { describe, expect, it } from "vitest"
import {
  peopleParamsFromSearch,
  updatePeopleSearch,
  validatePeopleSearch,
} from "./people-search"

describe("People URL state", () => {
  it("restores search, filters, pagination, and modal selection", () => {
    const state = validatePeopleSearch({
      q: " Ada ",
      role: "instructor",
      status: "disabled",
      page: "3",
      pageSize: "50",
      modal: "role",
      person: "ada",
    })
    expect(state).toMatchObject({
      q: "Ada",
      role: "instructor",
      status: "disabled",
      page: 3,
      pageSize: 50,
      modal: "role",
      person: "ada",
    })
    expect(peopleParamsFromSearch(state)).toEqual({
      search: "Ada",
      role: "instructor",
      status: "disabled",
      pageIndex: 2,
      pageSize: 50,
    })
  })

  it.each([
    { page: -1, pageSize: 0 },
    { page: "NaN", pageSize: "500" },
    { page: 1.5, pageSize: 15 },
    { page: true, pageSize: [] },
    { page: 1_000_001, pageSize: "20" },
  ])("falls back safely for malformed pagination: %j", (value) => {
    expect(peopleParamsFromSearch(validatePeopleSearch(value))).toMatchObject({
      pageIndex: 0,
      pageSize: 20,
    })
  })

  it("omits defaults and rejects unsupported filters and incomplete modal state", () => {
    expect(
      validatePeopleSearch({
        q: [],
        role: "owner",
        status: "banned",
        page: 1,
        pageSize: 20,
        modal: "delete",
        person: "ada",
      })
    ).toEqual({
      q: undefined,
      role: undefined,
      status: undefined,
      page: undefined,
      pageSize: undefined,
      modal: undefined,
      person: undefined,
    })
    expect(validatePeopleSearch({ modal: "role" }).modal).toBeUndefined()
    expect(validatePeopleSearch({ person: "ada" }).person).toBeUndefined()
    expect(
      validatePeopleSearch({ modal: "status", person: " ".repeat(129) }).modal
    ).toBeUndefined()
    expect(validatePeopleSearch({ q: "a".repeat(500) }).q).toHaveLength(200)
  })

  it("preserves unrelated table settings when opening/closing a modal or changing page", () => {
    const table = validatePeopleSearch({
      q: "Ada",
      role: "learner",
      page: 3,
      pageSize: 50,
    })
    const modal = updatePeopleSearch(table, { modal: "status", person: "ada" })
    expect(
      updatePeopleSearch(modal, { modal: undefined, person: undefined })
    ).toEqual(table)
    expect(updatePeopleSearch(modal, { page: 4 })).toMatchObject({
      q: "Ada",
      role: "learner",
      page: 4,
      pageSize: 50,
      modal: "status",
      person: "ada",
    })
    expect(
      updatePeopleSearch(table, { role: "admin", page: undefined })
    ).toMatchObject({ q: "Ada", role: "admin", page: undefined, pageSize: 50 })
  })

  it("tracks modal and pagination changes through Back/Forward without resetting table state", async () => {
    const root = createRootRoute()
    const route = createRoute({
      getParentRoute: () => root,
      path: "/workspace/people",
      validateSearch: validatePeopleSearch,
    })
    const history = createMemoryHistory({
      initialEntries: ["/workspace/people?q=Ada&page=3&pageSize=50"],
    })
    const router = createRouter({
      routeTree: root.addChildren([route]),
      history,
    })
    await router.load()
    await router.navigate({
      to: "/workspace/people",
      search: (previous) =>
        updatePeopleSearch(previous, { modal: "role", person: "ada" }),
    })
    expect(router.state.location.search).toMatchObject({
      q: "Ada",
      page: 3,
      pageSize: 50,
      modal: "role",
      person: "ada",
    })
    history.back()
    await router.load()
    expect(router.state.location.search).toMatchObject({
      q: "Ada",
      page: 3,
      pageSize: 50,
    })
    expect(router.state.location.search.modal).toBeUndefined()
    history.forward()
    await router.load()
    expect(router.state.location.search.modal).toBe("role")
    await router.navigate({
      to: "/workspace/people",
      search: (previous) =>
        updatePeopleSearch(previous, { modal: undefined, person: undefined }),
      replace: true,
    })
    expect(router.state.location.search.person).toBeUndefined()
    expect(router.state.location.search.page).toBe(3)
  })
})
