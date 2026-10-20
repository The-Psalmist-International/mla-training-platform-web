import { useId, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  SetCourseCertificateDocument,
  SetCourseOwnerDocument,
  USERS_PAGE_QUERY,
} from "@workspace/data"
import { Button } from "@workspace/ui/components/button"
import { Combobox } from "@workspace/ui/components/combobox"
import { SelectInput } from "@workspace/ui/components/select"
import { Alert } from "@workspace/ui/components/alert"
import {
  courseMutation,
  courseResourceOptions,
} from "../../workspace/course/course-management"
import { useCourseTask, type CourseWorkspace } from "./course-workspace"
import { CourseAccessPanel } from "./CourseAccessPanel"

export function CourseSettingsPanel({
  workspace,
}: {
  workspace: CourseWorkspace
}) {
  const { course, owns, editable, user } = workspace
  const id = useId()
  const { busy, run } = useCourseTask(workspace)
  const [enabled, setEnabled] = useState(course.certificateEnabled)
  const [staffSearch, setStaffSearch] = useState("")
  const [staffRole, setStaffRole] = useState<"admin" | "instructor">(
    "instructor"
  )
  const [owner, setOwner] = useState("")
  const staff = useQuery({
    ...courseResourceOptions(
      workspace.clients,
      user,
      "staff-picker",
      USERS_PAGE_QUERY,
      {
        limit: 20,
        offset: 0,
        search: staffSearch.trim() || undefined,
        disabled: false,
        role: staffRole,
      }
    ),
    enabled: user.role === "admin" && editable,
  })
  return (
    <div className="w-full space-y-8">
      <CourseAccessPanel workspace={workspace} />
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-4">
          <h2 className="text-lg font-semibold">Certificates</h2>
          <p className="text-sm text-muted-foreground">
            Issue a certificate when a learner completes every required lesson.
            Existing certificates keep their historical details.
          </p>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              disabled={!editable || busy}
              className="size-4 accent-primary"
            />
            Issue a certificate on completion
          </label>
        </div>
        {editable && (
          <Button
            className="shrink-0 self-start"
            disabled={busy || enabled === course.certificateEnabled}
            onClick={() =>
              void run(
                () =>
                  courseMutation(
                    workspace.clients,
                    SetCourseCertificateDocument,
                    { id: course.id, enabled }
                  ),
                "Certificate setting saved."
              )
            }
          >
            Save certificate setting
          </Button>
        )}
      </section>
      {user.role === "admin" && (
        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Course ownership</h2>
          <p className="text-sm text-muted-foreground">
            Assign the draft course to an active administrator or instructor.
          </p>
          <label className="block space-y-2">
            <span className="font-medium">Owner role</span>
            <SelectInput
              value={staffRole}
              onValueChange={(role) => {
                setStaffRole(role)
                setOwner("")
              }}
              disabled={!editable || busy}
              className="w-full"
              options={[
                { value: "instructor", label: "Instructor" },
                { value: "admin", label: "Administrator" },
              ]}
            />
          </label>
          <div className="space-y-2">
            <label htmlFor={`${id}-owner`} className="font-medium">
              New owner
            </label>
            <Combobox
              id={`${id}-owner`}
              value={owner}
              onValueChange={setOwner}
              onSearchChange={setStaffSearch}
              placeholder="Search and select an owner"
              loading={staff.isFetching}
              error={staff.isError ? "Owners could not be loaded." : undefined}
              onRetry={() => void staff.refetch()}
              disabled={!editable || busy}
              className="w-full"
              options={[
                ...(staff.data?.usersPage.items ?? [])
                  .filter((person) => person.role !== "learner")
                  .map((person) => ({
                    value: person.id,
                    label: person.name,
                    description: person.email,
                  })),
              ]}
            />
          </div>
          <Button
            disabled={!editable || busy || !owner || owner === course.ownerId}
            onClick={() =>
              void run(
                () =>
                  courseMutation(workspace.clients, SetCourseOwnerDocument, {
                    id: course.id,
                    ownerId: owner,
                  }),
                "Course owner updated."
              )
            }
          >
            Assign owner
          </Button>
        </section>
      )}
      <section className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold">Publication</h2>
          <p className="text-sm text-muted-foreground">
            Published courses must have complete modules and valid lesson
            content. Return a published course to draft before editing.
          </p>
          {course.status === "archived" && (
            <Alert>
              This course is archived. Its learning history is retained.
            </Alert>
          )}
        </div>
        {owns && course.status !== "archived" && (
          <Button
            className="shrink-0 self-start"
            disabled={busy}
            onClick={() =>
              workspace.open(
                course.status === "draft" ? "publish" : "unpublish"
              )
            }
          >
            {course.status === "draft" ? "Publish course" : "Return to draft"}
          </Button>
        )}
      </section>
      {owns && course.status !== "archived" && (
        <section className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 space-y-2">
            <h2 className="text-lg font-semibold">Archive course</h2>
            <p className="text-sm text-muted-foreground">
              Remove the course from the default library while retaining
              enrollments and learning history.
            </p>
          </div>
          <Button
            variant="destructive"
            className="shrink-0 self-start"
            disabled={busy}
            onClick={() => workspace.open("archive")}
          >
            Archive course
          </Button>
        </section>
      )}
    </div>
  )
}
