import { useId, useState } from "react"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import {
  AssignCourseLearnerDocument,
  USERS_PAGE_QUERY,
  type CurrentUser,
} from "@workspace/data"
import { Button } from "@workspace/ui/components/button"
import { Combobox } from "@workspace/ui/components/combobox"
import { Alert } from "@workspace/ui/components/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { useToast } from "@workspace/ui/components/toaster"
import {
  courseMutation,
  courseManagementError,
  courseResourceOptions,
} from "../../workspace/course/course-management"
import { workspaceCoursesOptions } from "../../workspace/lists"

export function EnrollmentAssignDialog({
  user,
  courseId,
  onClose,
}: {
  user: CurrentUser
  courseId: string
  onClose: () => void
}) {
  const { dataClients } = useRouter().options.context
  const cache = useQueryClient()
  const { toast } = useToast()
  const id = useId()
  const [course, setCourse] = useState(courseId)
  const [learnerSearch, setLearnerSearch] = useState("")
  const [learners, setLearners] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const allowed = user.role === "admin"

  const coursesQuery = useInfiniteQuery({
    ...workspaceCoursesOptions(dataClients, user),
    enabled: allowed,
  })
  const courses =
    coursesQuery.data?.pages.flat().filter((item) => item.status === "published") ??
    []
  const learnersQuery = useQuery({
    ...courseResourceOptions(
      dataClients,
      user,
      "learner-picker",
      USERS_PAGE_QUERY,
      {
        limit: 20,
        offset: 0,
        role: "learner",
        disabled: false,
        search: learnerSearch.trim() || undefined,
      }
    ),
    enabled: allowed,
  })

  const assign = async () => {
    if (!course || learners.length === 0 || busy) return
    setBusy(true)
    try {
      const results = await Promise.allSettled(
        learners.map((learnerId) =>
          courseMutation(dataClients, AssignCourseLearnerDocument, {
            courseId: course,
            learnerId,
          })
        )
      )
      const assigned = results.filter(
        (result) => result.status === "fulfilled"
      ).length
      await cache.invalidateQueries({
        queryKey: ["workspace", dataClients.graphqlUrl, user.id],
      })
      if (assigned === learners.length) {
        toast({
          title:
            assigned === 1 ? "Learner assigned." : `${assigned} learners assigned.`,
          status: "success",
        })
        onClose()
      } else {
        const failure = results.find(
          (result) => result.status === "rejected"
        )
        toast({
          title:
            assigned === 0
              ? "Learners could not be assigned"
              : `Only ${assigned} of ${learners.length} learners assigned`,
          description:
            failure?.status === "rejected"
              ? courseManagementError(failure.reason)
              : undefined,
          status: "error",
        })
      }
    } catch (error) {
      toast({
        title: "Learners could not be assigned",
        description: courseManagementError(error),
        status: "error",
      })
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
          <DialogTitle>Assign course</DialogTitle>
          <DialogDescription>
            Assign a published course to one or more active learners.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!allowed ? (
            <Alert variant="warning">
              Only administrators can assign courses to learners.
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor={`${id}-course`} className="font-medium">
                  Course
                </label>
                <Combobox
                  id={`${id}-course`}
                  value={course}
                  onValueChange={setCourse}
                  placeholder="Search and select a course"
                  loading={coursesQuery.isFetching}
                  error={
                    coursesQuery.isError
                      ? "Courses could not be loaded."
                      : undefined
                  }
                  onRetry={() => void coursesQuery.refetch()}
                  disabled={busy}
                  className="w-full"
                  options={courses.map((item) => ({
                    value: item.id,
                    label: item.title,
                    description: item.status,
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={`${id}-learner`} className="font-medium">
                  Learners
                </label>
                <Combobox
                  id={`${id}-learner`}
                  value=""
                  onValueChange={() => {}}
                  multiple
                  values={learners}
                  onValuesChange={setLearners}
                  onSearchChange={setLearnerSearch}
                  placeholder="Search and select learners"
                  loading={learnersQuery.isFetching}
                  error={
                    learnersQuery.isError
                      ? "Learners could not be loaded."
                      : undefined
                  }
                  onRetry={() => void learnersQuery.refetch()}
                  disabled={busy}
                  className="w-full"
                  options={[
                    ...(learnersQuery.data?.usersPage.items ?? []).map(
                      (person) => ({
                        value: person.id,
                        label: person.name,
                        description: person.email,
                        avatarUrl: person.avatarUrl,
                      })
                    ),
                  ]}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Only published courses can be assigned.
              </p>
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
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            disabled={!allowed || busy || !course || learners.length === 0}
            onClick={() => void assign()}
          >
            {busy ? "Assigning…" : "Assign course"}
          </Button>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
