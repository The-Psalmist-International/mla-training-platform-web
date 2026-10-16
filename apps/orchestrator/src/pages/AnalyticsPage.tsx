import { useSyncExternalStore } from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { CurrentUser } from "@workspace/data"
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise"
import { Button } from "@workspace/ui/components/button"
import { DateRangePicker } from "@workspace/ui/components/date-range-picker"
import { SelectInput } from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ErrorState } from "@workspace/ui/components/error-state"
import { WorkspacePageFrame } from "../components/layout/WorkspacePageFrame"
import { AnalyticsDashboard } from "../components/analytics/AnalyticsDashboard"
import {
  analyticsInput,
  analyticsOptions,
  validateAnalyticsSearch,
  type AnalyticsSearch,
} from "../workspace/analytics/analytics"

export function AnalyticsPage() {
  const { auth } = useRouter().options.context
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, auth.getUser)
  return user ? <AnalyticsContent key={user.id} user={user} /> : null
}
function AnalyticsContent({ user }: { user: CurrentUser }) {
  const { dataClients } = useRouter().options.context
  const search = validateAnalyticsSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const input = analyticsInput(search)
  const query = useQuery(analyticsOptions(dataClients, user, input))
  const update = (patch: Partial<AnalyticsSearch>) =>
    void navigate({
      to: "/workspace/analytics",
      search: (previous) => validateAnalyticsSearch({ ...previous, ...patch }),
      resetScroll: false,
    })
  return (
    <WorkspacePageFrame view="analytics">
      <div className="w-full space-y-10">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-5">
          <div className="flex max-w-full flex-col gap-3">
            <label
              htmlFor="analytics-range"
              className="text-xs font-medium text-muted-foreground"
            >
              Date range
            </label>
            <DateRangePicker
              id="analytics-range"
              value={{ from: input.from, to: input.to }}
              onChange={({ from, to }) =>
                update({ range: "custom", from, to, page: 1 })
              }
              className="gap-3 px-3"
            />
          </div>
          <div className="flex max-w-full min-w-48 flex-1 flex-col gap-3 sm:max-w-sm">
            <label
              htmlFor="analytics-course"
              className="text-xs font-medium text-muted-foreground"
            >
              Course
            </label>
            <SelectInput
              id="analytics-course"
              value={search.courseId ?? "all"}
              options={[
                {
                  value: "all",
                  label:
                    user.role === "admin" ? "All courses" : "All my courses",
                },
                ...(query.data?.courses ?? []).map((course) => ({
                  value: course.id,
                  label: course.title,
                })),
              ]}
              onValueChange={(courseId) =>
                update({
                  courseId: courseId === "all" ? undefined : courseId,
                  page: 1,
                })
              }
              disabled={!query.data}
            />
          </div>
          <Button
            size="icon-lg"
            variant="outline"
            className="ml-auto"
            aria-label="Refresh analytics"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            <ArrowClockwiseIcon
              aria-hidden
              className={
                query.isFetching
                  ? "animate-spin motion-reduce:animate-none"
                  : ""
              }
            />
          </Button>
        </div>
        {query.isPending ? (
          <div role="status" className="grid gap-6 lg:grid-cols-2">
            <span className="sr-only">Loading training analytics</span>
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : query.isError && !query.data ? (
          <div className="flex justify-center py-12">
            <ErrorState
              title="Analytics could not be loaded"
              description="Try again, or reset your course and date filters."
              action={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => void query.refetch()}
                  >
                    Try again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      update({
                        courseId: undefined,
                        range: "90",
                        from: undefined,
                        to: undefined,
                        page: 1,
                      })
                    }
                  >
                    Reset filters
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <>
            {query.isError && (
              <p role="alert" className="text-sm text-destructive">
                Refresh failed. The last loaded results are still shown.
              </p>
            )}
            <AnalyticsDashboard
              data={query.data}
              role={user.role}
              courseId={search.courseId}
              page={search.page ?? 1}
              onCourse={(courseId) => update({ courseId, page: 1 })}
              onPage={(page) => update({ page })}
              onRefresh={() => void query.refetch()}
              fetching={query.isFetching}
            />
          </>
        )}
      </div>
    </WorkspacePageFrame>
  )
}
