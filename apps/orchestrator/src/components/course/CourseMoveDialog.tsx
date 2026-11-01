import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import {
  CourseMovePreviewDocument,
  MoveCourseIntoCourseDocument,
  COURSES_PAGE_QUERY,
  type CurrentUser,
} from "@workspace/data"
import {
  courseResourceOptions,
  courseMutation,
} from "../../workspace/course/course-management"
import { libraryActionError } from "../../workspace/library/library-actions"
import { Button } from "@workspace/ui/components/button"
import { Combobox } from "@workspace/ui/components/combobox"
import { Alert } from "@workspace/ui/components/alert"
import { BrandLoader } from "@workspace/ui/components/brand-loader"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@workspace/ui/components/dialog"

export function CourseMoveDialog({
  sourceId,
  destinationId,
  user,
  onDestination,
  onClose,
  onChanged,
}: {
  sourceId: string
  destinationId?: string
  user: CurrentUser
  onDestination: (id: string) => void
  onClose: () => void
  onChanged: (message: string) => void
}) {
  const { dataClients } = useRouter().options.context
  const [term, setTerm] = useState(""),
    [page, setPage] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("")
  const source = useQuery(
    courseResourceOptions(
      dataClients,
      user,
      "course-move-source",
      CourseMovePreviewDocument,
      { id: sourceId }
    )
  )
  const destination = useQuery({
    ...courseResourceOptions(
      dataClients,
      user,
      "course-move-target",
      CourseMovePreviewDocument,
      { id: destinationId ?? "" }
    ),
    enabled: !!destinationId,
  })
  const options = useQuery(
    courseResourceOptions(
      dataClients,
      user,
      "course-move-options",
      COURSES_PAGE_QUERY,
      {
        limit: 20,
        offset: page * 20,
        status: "draft",
        mine: user.role !== "admin",
        search: term.trim() || undefined,
      }
    )
  )
  const from = source.data?.course,
    to = destination.data?.course
  const count =
    from?.modules.reduce((sum, module) => sum + module.items.length, 0) ?? 0
  const allowed =
    from?.canDelete &&
    from.status !== "archived" &&
    count > 0 &&
    count <= 200 &&
    to?.status === "draft" &&
    to.id !== from.id &&
    to.modules.length < 100
  async function move() {
    if (!allowed || !destinationId || busy) return
    setBusy(true)
    setError("")
    try {
      await courseMutation(dataClients, MoveCourseIntoCourseDocument, {
        sourceId,
        destinationId,
      })
      await dataClients.queryClient.invalidateQueries({
        queryKey: ["workspace", dataClients.graphqlUrl, user.id],
      })
      onChanged(`${from!.title} moved into ${to!.title} as a module.`)
      onClose()
    } catch (failure) {
      setError(libraryActionError(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>Move course into another course</DialogTitle>
          <DialogDescription>
            The source becomes one module at the end of the destination course.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          {source.isPending ? (
            <BrandLoader label="Loading source course" />
          ) : source.isError ? (
            <Alert variant="warning">
              The source course could not be loaded.{" "}
              <Button variant="outline" onClick={() => void source.refetch()}>
                Try again
              </Button>
            </Alert>
          ) : (
            <>
              <p className="font-medium">{from?.title}</p>
              {!from?.canDelete ? (
                <Alert variant="warning">
                  This course has learner enrollment history and cannot be
                  moved.
                </Alert>
              ) : from.status === "archived" ? (
                <Alert variant="warning">
                  Archived courses cannot be moved.
                </Alert>
              ) : count === 0 || count > 200 ? (
                <Alert variant="warning">
                  A course needs between 1 and 200 active lessons to become one
                  module.
                </Alert>
              ) : (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="move-course-destination"
                      className="text-sm font-medium"
                    >
                      Destination draft course
                    </label>
                    <Combobox
                      id="move-course-destination"
                      value={destinationId ?? ""}
                      selectedLabel={to?.title ?? "Selected draft course"}
                      placeholder="Search draft courses"
                      disabled={busy}
                      onValueChange={onDestination}
                      onSearchChange={(value) => {
                        setTerm(value)
                        setPage(0)
                      }}
                      loading={options.isFetching}
                      error={
                        options.isError
                          ? "Courses could not be loaded."
                          : undefined
                      }
                      onRetry={() => void options.refetch()}
                      options={(options.data?.coursesPage.items ?? [])
                        .filter((course) => course.id !== sourceId)
                        .map((course) => ({
                          value: course.id,
                          label: course.title,
                        }))}
                    />
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>Destination page {page + 1}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy || page === 0 || options.isFetching}
                          onClick={() => setPage((value) => value - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            busy ||
                            options.isFetching ||
                            (page + 1) * 20 >=
                              (options.data?.coursesPage.totalCount ?? 0)
                          }
                          onClick={() => setPage((value) => value + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                  {destination.isFetching && destinationId && (
                    <BrandLoader label="Checking destination" />
                  )}
                  {destination.isError && (
                    <Alert variant="warning">
                      The destination could not be loaded.{" "}
                      <Button
                        variant="outline"
                        onClick={() => void destination.refetch()}
                      >
                        Try again
                      </Button>
                    </Alert>
                  )}
                  {to && (
                    <Alert>
                      Move {count} lessons into “{to.title}” under a new module
                      named “{from.title}”. The source sections will be
                      flattened in their current order, and the source course
                      will be archived. Lesson content, IDs, and privacy are
                      retained; course descriptions and certificate settings are
                      not copied.
                    </Alert>
                  )}
                  {to && !allowed && (
                    <Alert variant="warning">
                      Choose a different editable draft with fewer than 100
                      modules.
                    </Alert>
                  )}
                </>
              )}
            </>
          )}
          {error && <Alert variant="warning">{error}</Alert>}
        </DialogBody>
        <DialogFooter>
          <Button
            disabled={!allowed || busy || destination.isFetching}
            onClick={() => void move()}
          >
            {busy ? "Moving course…" : "Move as module"}
          </Button>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
