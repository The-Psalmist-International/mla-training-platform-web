import { useEffect, useRef, useState } from "react"
import { useBlocker, useRouter } from "@tanstack/react-router"
import { useToast } from "@workspace/ui/components/toaster"
import type { CurrentUser, DataClients } from "@workspace/data"
import type { ManagedCourse } from "../../workspace/course-management"
import { courseManagementError } from "../../workspace/course-management"
import type {
  CoursePageAction,
  CourseSearchState,
} from "../../workspace/course-search"

export interface CourseWorkspace {
  course: ManagedCourse
  user: CurrentUser
  clients: DataClients
  owns: boolean
  editable: boolean
  search: CourseSearchState
  update: (patch: Partial<CourseSearchState>, replace?: boolean) => void
  open: (action: CoursePageAction, patch?: Partial<CourseSearchState>) => void
  close: () => void
  refresh: () => Promise<void>
}
export function useCourseTask(workspace: CourseWorkspace) {
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const { auth } = useRouter().options.context
  const { toast } = useToast()
  useBlocker({
    shouldBlockFn: () => pending.current,
    enableBeforeUnload: () => pending.current,
  })
  const run = async (
    task: () => Promise<unknown>,
    success: string,
    close = false
  ) => {
    if (pending.current || auth.getUser() !== workspace.user) return false
    pending.current = true
    setBusy(true)
    try {
      await task()
      if (auth.getUser() !== workspace.user) return false
      toast({
        title: "Course updated",
        description: success,
        status: "success",
      })
      await workspace.refresh()
      pending.current = false
      if (close) workspace.close()
      return true
    } catch (error) {
      if (auth.getUser() === workspace.user)
        toast({
          title: "Action could not be completed",
          description: courseManagementError(error),
          status: "error",
        })
      await workspace.refresh().catch(() => {})
      return false
    } finally {
      pending.current = false
      setBusy(false)
    }
  }
  return { busy, run }
}
export function useCourseTableSearch(workspace: CourseWorkspace) {
  const [value, setValue] = useState(workspace.search.courseQ ?? "")
  useEffect(
    () => setValue(workspace.search.courseQ ?? ""),
    [workspace.search.courseQ]
  )
  useEffect(() => {
    if (value.trim() === (workspace.search.courseQ ?? "")) return
    const timeout = setTimeout(
      () =>
        workspace.update(
          { courseQ: value.trim(), coursePage: undefined },
          true
        ),
      300
    )
    return () => clearTimeout(timeout)
  }, [value, workspace.search.courseQ, workspace.update])
  return {
    value,
    onChange: (text: string) => setValue(text.slice(0, 200)),
    isTyping: value.trim() !== (workspace.search.courseQ ?? ""),
  }
}
