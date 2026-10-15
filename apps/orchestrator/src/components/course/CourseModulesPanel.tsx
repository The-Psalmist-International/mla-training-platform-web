import { useState } from "react"
import { Accordion } from "@base-ui/react/accordion"
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useReducedMotion } from "framer-motion"
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus"
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye"
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple"
import { ArrowUpIcon } from "@phosphor-icons/react/dist/csr/ArrowUp"
import { ArrowDownIcon } from "@phosphor-icons/react/dist/csr/ArrowDown"
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive"
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight"
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks"
import { DotsSixVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsSixVertical"
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown"
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star"
import { ReorderModulesDocument, ReorderLessonsDocument } from "@workspace/data"
import { Button } from "@workspace/ui/components/button"
import { Markdown } from "@workspace/ui/components/markdown"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import {
  TableRowActions,
  type TableRowAction,
} from "@workspace/ui/components/table-row-actions"
import { Alert } from "@workspace/ui/components/alert"
import {
  courseMutation,
  reorderIds,
  reorderTo,
  type ManagedModule,
  type ManagedLesson,
} from "../../workspace/course/course-management"
import { useCourseTask, type CourseWorkspace } from "./course-workspace"

type Task = ReturnType<typeof useCourseTask>
function useSortSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
}
function DragHandle({
  sortable,
  label,
  disabled,
}: {
  sortable: ReturnType<typeof useSortable>
  label: string
  disabled: boolean
}) {
  return (
    <Button
      ref={sortable.setActivatorNodeRef}
      {...sortable.attributes}
      {...sortable.listeners}
      type="button"
      variant="ghost"
      size="icon-sm"
      className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
      aria-label={label}
      title={label}
      disabled={disabled}
    >
      <DotsSixVerticalIcon aria-hidden />
    </Button>
  )
}
function orderedEntries<TEntry extends { id: string }>(
  entries: TEntry[],
  order: string[] | null
) {
  if (!order) return entries
  const byId = new Map(entries.map((entry) => [entry.id, entry]))
  return order
    .flatMap((id) => {
      const entry = byId.get(id)
      return entry ? [entry] : []
    })
    .concat(entries.filter((entry) => !order.includes(entry.id)))
}

export function CourseModulesPanel({
  workspace,
}: {
  workspace: CourseWorkspace
}) {
  const { course, editable } = workspace
  const task = useCourseTask(workspace),
    sensors = useSortSensors()
  const [order, setOrder] = useState<string[] | null>(null)
  const modules = orderedEntries(course.modules, order)
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!editable || task.busy || !over) return
    const ids = modules.map((module) => module.id),
      next = reorderTo(ids, String(active.id), String(over.id))
    if (next === ids) return
    setOrder(next)
    void task
      .run(
        () =>
          courseMutation(workspace.clients, ReorderModulesDocument, {
            courseId: course.id,
            orderedIds: next,
          }),
        "Module order updated."
      )
      .finally(() => setOrder(null))
  }
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Modules</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {editable
              ? "Drag the handles to reorder modules and lessons. Expand a lesson to see its content."
              : "Expand modules and lessons to review the course content."}
          </p>
        </div>
        {editable && (
          <Button
            disabled={task.busy}
            onClick={() => workspace.open("add-module")}
          >
            <PlusIcon aria-hidden />
            Add module
          </Button>
        )}
      </div>
      {workspace.owns && course.status === "published" && (
        <Alert>
          Return the course to draft in Settings to change modules and lessons.
        </Alert>
      )}
      {!modules.length && (
        <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          No modules yet. Add a module to start building this course.
        </div>
      )}
      <DndContext
        id={`course-modules-${course.id}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={modules.map((module) => module.id)}
          strategy={verticalListSortingStrategy}
        >
          <Accordion.Root
            multiple
            defaultValue={course.modules.map((module) => module.id)}
            className="space-y-4"
          >
            {modules.map((module, index) => (
              <SortableModule
                key={module.id}
                workspace={workspace}
                module={module}
                index={index}
                modules={modules}
                task={task}
              />
            ))}
          </Accordion.Root>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableModule({
  workspace,
  module,
  index,
  modules,
  task,
}: {
  workspace: CourseWorkspace
  module: ManagedModule
  index: number
  modules: ManagedModule[]
  task: Task
}) {
  const { course, editable } = workspace
  const sortable = useSortable({
    id: module.id,
    disabled: !editable || task.busy,
  })
  const reduced = useReducedMotion()
  const primary: TableRowAction[] = editable
    ? [
        {
          label: "Edit module",
          icon: <PencilSimpleIcon aria-hidden />,
          disabled: task.busy,
          onSelect: () =>
            workspace.open("edit-module", { moduleId: module.id }),
        },
      ]
    : []
  const move = (direction: -1 | 1) =>
    void task.run(
      () =>
        courseMutation(workspace.clients, ReorderModulesDocument, {
          courseId: course.id,
          orderedIds: reorderIds(
            modules.map((entry) => entry.id),
            index,
            direction
          ),
        }),
      "Module order updated."
    )
  const secondary: TableRowAction[] = editable
    ? [
        {
          label: "Add lesson",
          icon: <PlusIcon aria-hidden />,
          disabled: task.busy,
          onSelect: () => workspace.open("add-lesson", { moduleId: module.id }),
        },
        {
          label: "Move module up",
          icon: <ArrowUpIcon aria-hidden />,
          disabled: task.busy || index === 0,
          onSelect: () => move(-1),
        },
        {
          label: "Move module down",
          icon: <ArrowDownIcon aria-hidden />,
          disabled: task.busy || index === modules.length - 1,
          onSelect: () => move(1),
        },
        {
          label: "Archive module",
          icon: <ArchiveIcon aria-hidden />,
          destructive: true,
          disabled: task.busy,
          onSelect: () =>
            workspace.open("archive-module", { moduleId: module.id }),
        },
      ]
    : []
  return (
    <Accordion.Item
      value={module.id}
      ref={sortable.setNodeRef}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: reduced ? "none" : sortable.transition,
        zIndex: sortable.isDragging ? 10 : undefined,
      }}
      className={`relative rounded-lg border bg-card ${sortable.isDragging ? "border-primary shadow-md" : "border-border"}`}
    >
      <div className="flex items-center gap-2 rounded-t-lg bg-muted/30 px-3 py-3">
        {editable && (
          <DragHandle
            sortable={sortable}
            label={`Drag to reorder module ${module.title}`}
            disabled={task.busy || modules.length < 2}
          />
        )}
        <Accordion.Header className="min-w-0 flex-1">
          <Accordion.Trigger className="group flex min-h-10 w-full items-center gap-3 text-left focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
            <CaretDownIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-panel-open:rotate-180 motion-reduce:transition-none"
            />
            <span className="min-w-0">
              <span className="block font-semibold">
                {index + 1}. {module.title}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {module.items.length} lessons
              </span>
            </span>
          </Accordion.Trigger>
        </Accordion.Header>
        <TableRowActions
          subject={module.title}
          primary={primary}
          secondary={secondary}
        />
      </div>
      <Accordion.Panel className="border-t border-border">
        <SortableLessons workspace={workspace} module={module} task={task} />
      </Accordion.Panel>
    </Accordion.Item>
  )
}

function SortableLessons({
  workspace,
  module,
  task,
}: {
  workspace: CourseWorkspace
  module: ManagedModule
  task: Task
}) {
  const sensors = useSortSensors(),
    [order, setOrder] = useState<string[] | null>(null)
  const lessons = orderedEntries(module.items, order)
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!workspace.editable || task.busy || !over) return
    const ids = lessons.map((lesson) => lesson.id),
      next = reorderTo(ids, String(active.id), String(over.id))
    if (next === ids) return
    setOrder(next)
    void task
      .run(
        () =>
          courseMutation(workspace.clients, ReorderLessonsDocument, {
            courseId: workspace.course.id,
            moduleId: module.id,
            orderedIds: next,
          }),
        "Lesson order updated."
      )
      .finally(() => setOrder(null))
  }
  if (!lessons.length)
    return (
      <div className="flex items-center justify-between gap-3 p-4 text-sm text-muted-foreground">
        <span>No lessons yet.</span>
        {workspace.editable && (
          <Button
            variant="outline"
            size="sm"
            disabled={task.busy}
            onClick={() =>
              workspace.open("add-lesson", { moduleId: module.id })
            }
          >
            Add lesson
          </Button>
        )}
      </div>
    )
  return (
    <DndContext
      id={`module-lessons-${module.id}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={lessons.map((lesson) => lesson.id)}
        strategy={verticalListSortingStrategy}
      >
        <Accordion.Root multiple className="divide-y divide-border">
          {lessons.map((lesson, index) => (
            <SortableLesson
              key={lesson.id}
              workspace={workspace}
              module={module}
              lesson={lesson}
              index={index}
              lessons={lessons}
              task={task}
            />
          ))}
        </Accordion.Root>
      </SortableContext>
    </DndContext>
  )
}

function SortableLesson({
  workspace,
  module,
  lesson,
  index,
  lessons,
  task,
}: {
  workspace: CourseWorkspace
  module: ManagedModule
  lesson: ManagedLesson
  index: number
  lessons: ManagedLesson[]
  task: Task
}) {
  const { course, editable } = workspace
  const sortable = useSortable({
      id: lesson.id,
      disabled: !editable || task.busy,
    }),
    reduced = useReducedMotion()
  const select = { moduleId: module.id, lessonId: lesson.id }
  const primary: TableRowAction[] = [
    {
      label: "View lesson",
      icon: <EyeIcon aria-hidden />,
      onSelect: () => workspace.open("view-lesson", select),
    },
  ]
  if (editable)
    primary.push({
      label: "Edit lesson",
      icon: <PencilSimpleIcon aria-hidden />,
      disabled: task.busy,
      onSelect: () => workspace.open("edit-lesson", select),
    })
  const move = (direction: -1 | 1) =>
    void task.run(
      () =>
        courseMutation(workspace.clients, ReorderLessonsDocument, {
          courseId: course.id,
          moduleId: module.id,
          orderedIds: reorderIds(
            lessons.map((entry) => entry.id),
            index,
            direction
          ),
        }),
      "Lesson order updated."
    )
  const secondary: TableRowAction[] = editable
    ? [
        ...(lesson.type === "assessment"
          ? [
              {
                label: "Manage questions",
                icon: <ListChecksIcon aria-hidden />,
                disabled: task.busy,
                onSelect: () => workspace.open("questions", select),
              },
            ]
          : []),
        {
          label: "Move lesson up",
          icon: <ArrowUpIcon aria-hidden />,
          disabled: task.busy || index === 0,
          onSelect: () => move(-1),
        },
        {
          label: "Move lesson down",
          icon: <ArrowDownIcon aria-hidden />,
          disabled: task.busy || index === lessons.length - 1,
          onSelect: () => move(1),
        },
        {
          label: "Move to another module",
          icon: <ArrowsLeftRightIcon aria-hidden />,
          disabled: task.busy || course.modules.length < 2,
          onSelect: () => workspace.open("move-lesson", select),
        },
        {
          label: "Archive lesson",
          icon: <ArchiveIcon aria-hidden />,
          destructive: true,
          disabled: task.busy,
          onSelect: () => workspace.open("archive-lesson", select),
        },
      ]
    : []
  return (
    <Accordion.Item
      value={lesson.id}
      ref={sortable.setNodeRef}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: reduced ? "none" : sortable.transition,
        zIndex: sortable.isDragging ? 10 : undefined,
      }}
      className={`relative bg-card ${sortable.isDragging ? "rounded-md shadow-md ring-2 ring-primary" : ""}`}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        {editable && (
          <DragHandle
            sortable={sortable}
            label={`Drag to reorder lesson ${lesson.title}`}
            disabled={task.busy || lessons.length < 2}
          />
        )}
        <Accordion.Header className="min-w-0 flex-1">
          <Accordion.Trigger className="group flex min-h-10 w-full items-center gap-3 text-left focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
            <CaretDownIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-panel-open:rotate-180 motion-reduce:transition-none"
            />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                <span className="min-w-0 truncate">
                  {index + 1}. {lesson.title}
                </span>
                <StatusBadge>
                  {lesson.type.replaceAll("_", " ")}
                </StatusBadge>
                {lesson.required && (
                  <StarIcon
                    aria-label="Required"
                    weight="fill"
                    className="size-3.5 shrink-0 text-yellow-500"
                  />
                )}
              </span>
            </span>
          </Accordion.Trigger>
        </Accordion.Header>
        <TableRowActions
          subject={lesson.title}
          primary={primary}
          secondary={secondary}
        />
      </div>
      <Accordion.Panel className="border-t border-border/60 bg-muted/15 px-5 py-4 text-sm leading-6 text-muted-foreground">
        <LessonSummary lesson={lesson} />
      </Accordion.Panel>
    </Accordion.Item>
  )
}

function LessonSummary({ lesson }: { lesson: ManagedLesson }) {
  if (lesson.type === "text") {
    if (!lesson.body) return <p>No lesson content yet.</p>
    return (
      <div className="line-clamp-6">
        <Markdown value={lesson.body} />
      </div>
    )
  }
  if (lesson.type === "video_lesson")
    return (
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <span>
          Status:{" "}
          {lesson.videoLesson?.videoAsset?.status.replaceAll("_", " ") ??
            "No video attached"}
        </span>
        <span>
          Completion: {lesson.videoLesson?.completionThreshold ?? 90}% watched
        </span>
      </div>
    )
  if (lesson.type === "assessment")
    return (
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <span>{lesson.assessment?.questions?.length ?? 0} questions</span>
        <span>Pass mark: {lesson.assessment?.passMark ?? 70}%</span>
        <span>Attempts: {lesson.assessment?.attemptLimit ?? "Unlimited"}</span>
      </div>
    )
  return (
    <div className="space-y-2">
      <p className="line-clamp-6 whitespace-pre-wrap">
        {lesson.videoPrompt?.instructions || "No submission instructions yet."}
      </p>
      <p>
        Maximum duration: {lesson.videoPrompt?.maxDurationSeconds ?? 120}{" "}
        seconds ·{" "}
        {lesson.videoPrompt?.requiresReview
          ? "Instructor review required"
          : "Automatic approval"}
      </p>
    </div>
  )
}
