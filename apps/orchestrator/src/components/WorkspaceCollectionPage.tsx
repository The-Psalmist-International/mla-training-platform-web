import { useId, useSyncExternalStore } from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
import { Button } from "@workspace/ui/components/button"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { ErrorState } from "@workspace/ui/components/error-state"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { workspaceIcons } from "../workspace/icons"
import {
  collectionEmptyStates,
  courseScopedViews,
  workspaceCoursesOptions,
  workspaceListOptions,
  type CollectionView,
} from "../workspace/lists"

import { WorkspacePageFrame } from "./WorkspacePageFrame"
import { WorkspacePageAction } from "./WorkspacePageAction"
import {
  validateCollectionSearch,
  type CollectionSearchState,
} from "../workspace/collection-search"

export function WorkspaceCollectionPage({ view }: { view: CollectionView }) {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  if (!user) return null
  return (
    <CollectionContent key={`${user.id}-${view}`} view={view} user={user} />
  )
}

function CollectionContent({
  view,
  user,
}: {
  view: CollectionView
  user: CurrentUser
}) {
  const { dataClients } = useRouter().options.context
  const selectorId = useId()
  const scoped = courseScopedViews.includes(view)
  const urlState = validateCollectionSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const pageSize = urlState.pageSize ?? 20
  const page = urlState.page ?? 1
  const offset = (page - 1) * pageSize
  const selectedCourse = urlState.course ?? ""
  const updateSearch = (patch: Partial<CollectionSearchState>) =>
    void navigate({
      to: ".",
      search: (previous) => validateCollectionSearch({ ...previous, ...patch }),
      resetScroll: false,
    })
  const coursesQuery = useInfiniteQuery({
    ...workspaceCoursesOptions(dataClients, user),
    enabled: scoped,
  })
  const courses = coursesQuery.data?.pages.flat() ?? []
  const courseId = courses.some((course) => course.id === selectedCourse)
    ? selectedCourse
    : (courses[0]?.id ?? "")
  const listQuery = useQuery({
    ...workspaceListOptions(
      dataClients,
      user,
      view,
      scoped ? courseId : "",
      offset,
      pageSize
    ),
    enabled: !scoped || (coursesQuery.isSuccess && !!courseId),
  })
  const noCourses = scoped && coursesQuery.isSuccess && !courses.length
  const error =
    scoped && coursesQuery.isError ? coursesQuery.error : listQuery.error
  const loading = scoped
    ? coursesQuery.isPending || (!noCourses && listQuery.isPending)
    : listQuery.isPending
  const items = listQuery.data?.items ?? []
  const copy = collectionEmptyStates[view]

  const toolbar =
    scoped && courses.length > 0 ? (
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs space-y-2">
          <label htmlFor={selectorId} className="text-sm font-medium">
            Course
          </label>
          <select
            id={selectorId}
            value={courseId}
            onChange={(event) => {
              updateSearch({ course: event.target.value, page: undefined })
            }}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        {coursesQuery.hasNextPage && (
          <Button
            variant="outline"
            disabled={coursesQuery.isFetchingNextPage}
            onClick={() => void coursesQuery.fetchNextPage()}
          >
            {coursesQuery.isFetchingNextPage
              ? "Loading courses…"
              : "Load more courses"}
          </Button>
        )}

        {view === "certificates" && (
          <p className="text-xs text-muted-foreground">
            Certificates are shown for each page of course enrollments.
          </p>
        )}
      </div>
    ) : undefined

  return (
    <WorkspacePageFrame view={view} toolbar={toolbar}>
      {error ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <ErrorState
            title="We couldn't load this section"
            action={
              <Button
                variant="outline"
                disabled={listQuery.isFetching || coursesQuery.isFetching}
                onClick={() => {
                  if (coursesQuery.isError) void coursesQuery.refetch()
                  else void listQuery.refetch()
                }}
              >
                {listQuery.isFetching || coursesQuery.isFetching
                  ? "Trying again…"
                  : "Try again"}
              </Button>
            }
          />
        </div>
      ) : loading ? (
        <div
          role="status"
          aria-label="Loading records"
          className="space-y-4 py-6"
        >
          <span className="sr-only">Loading…</span>
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div
          className="flex flex-1 items-center justify-center py-12"
          role="status"
        >
          <EmptyState
            icon={workspaceIcons[view]}
            title={
              offset > 0 && view !== "certificates"
                ? "You've reached the end"
                : copy.title
            }
            description={
              offset > 0 && view !== "certificates"
                ? "There are no more records on this page."
                : noCourses
                  ? "This section will fill up as courses are created and learners get started."
                  : copy.description
            }
            action={
              offset > 0 ||
              (view === "enrollments" && noCourses) ? undefined : (
                <WorkspacePageAction view={view} role={user.role} />
              )
            }
          />
        </div>
      ) : (
        <ul className="divide-y divide-border/60" aria-label="Records">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex min-w-0 flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium break-words">{item.title}</p>
                {item.description && (
                  <p className="mt-1 text-sm leading-6 break-words text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              <span className="w-fit shrink-0 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground capitalize">
                {item.status.replaceAll("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!error && !loading && (offset > 0 || listQuery.data?.hasNextPage) && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <Button
            variant="outline"
            disabled={offset === 0 || listQuery.isFetching}
            onClick={() => updateSearch({ page: Math.max(1, page - 1) })}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {view === "certificates" ? "Enrollment page" : "Page"} {page}
          </span>
          <Button
            variant="outline"
            disabled={!listQuery.data?.hasNextPage || listQuery.isFetching}
            onClick={() => updateSearch({ page: page + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </WorkspacePageFrame>
  )
}
