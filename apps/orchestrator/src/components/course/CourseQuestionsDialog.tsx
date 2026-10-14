import { FieldArray, Form, FormikProvider, useFormik } from "formik"
import * as yup from "yup"
import { SetCourseQuestionsDocument } from "@workspace/data"
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash"
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { Button } from "@workspace/ui/components/button"
import { FormInput, FormFeedback } from "@workspace/ui/components/form-input"
import { SelectInput } from "@workspace/ui/components/select"
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
import { courseMutation } from "../../workspace/course-management"
import { useCourseTask, type CourseWorkspace } from "./course-workspace"

type Question = {
  type: "mcq" | "true_false" | "short_answer"
  prompt: string
  points: number
  explanation: string
  referenceAnswer: string
  options: { label: string; isCorrect: boolean }[]
}
const blankQuestion = (): Question => ({
  type: "mcq",
  prompt: "",
  points: 1,
  explanation: "",
  referenceAnswer: "",
  options: [
    { label: "", isCorrect: true },
    { label: "", isCorrect: false },
  ],
})
export const questionsSchema = yup.object({
  questions: yup
    .array()
    .max(100)
    .of(
      yup
        .object({
          prompt: yup
            .string()
            .trim()
            .required("Enter the question.")
            .max(10000),
          points: yup
            .number()
            .integer()
            .min(1)
            .max(10000)
            .required("Enter question points."),
          explanation: yup.string().max(10000),
          referenceAnswer: yup.string().max(10000),
        })
        .test(
          "answers",
          "Short answers need a reference answer. Choice questions need 2–10 unique answers and exactly one correct answer.",
          (question) => {
            const row = question as unknown as Question
            if (row.type === "short_answer") return !!row.referenceAnswer.trim()
            const labels = row.options.map((option) =>
              option.label.trim().toLowerCase()
            )
            return (
              labels.length >= 2 &&
              labels.length <= 10 &&
              labels.every(Boolean) &&
              new Set(labels).size === labels.length &&
              row.options.filter((option) => option.isCorrect).length === 1 &&
              (row.type !== "true_false" ||
                (labels.length === 2 &&
                  labels.includes("true") &&
                  labels.includes("false")))
            )
          }
        )
    ),
})

export function CourseQuestionsDialog({
  workspace,
}: {
  workspace: CourseWorkspace
}) {
  const module = workspace.course.modules.find(
    (entry) => entry.id === workspace.search.moduleId
  )
  const lesson = module?.items.find(
    (entry) =>
      entry.id === workspace.search.lessonId && entry.type === "assessment"
  )
  const { busy, run } = useCourseTask(workspace)
  const form = useFormik<{ questions: Question[] }>({
    initialValues: {
      questions: (lesson?.assessment?.questions ?? []).map((question) => ({
        type: question.type,
        prompt: question.prompt,
        points: question.points,
        explanation: question.explanation,
        referenceAnswer: question.referenceAnswer ?? "",
        options: question.options.map((option) => ({
          label: option.label,
          isCorrect: option.isCorrect,
        })),
      })),
    },
    validationSchema: questionsSchema,
    onSubmit: async (values) => {
      if (!workspace.editable || !module || !lesson) return
      await run(
        () =>
          courseMutation(workspace.clients, SetCourseQuestionsDocument, {
            courseId: workspace.course.id,
            moduleId: module.id,
            itemId: lesson.id,
            questions: values.questions.map((question) => ({
              ...question,
              prompt: question.prompt.trim(),
              points: Number(question.points),
              referenceAnswer:
                question.type === "short_answer"
                  ? question.referenceAnswer.trim()
                  : null,
              options:
                question.type === "short_answer"
                  ? []
                  : question.options.map((option) => ({
                      ...option,
                      label: option.label.trim(),
                    })),
            })),
          }),
        "Assessment questions saved.",
        true
      )
    },
  })
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) workspace.close()
      }}
    >
      <DialogContent className="sm:max-w-3xl" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>Assessment questions</DialogTitle>
          <DialogDescription>
            {lesson?.title ?? "Selected assessment"}
          </DialogDescription>
        </DialogHeader>
        <FormikProvider value={form}>
          <Form noValidate className="flex min-h-0 flex-1 flex-col">
            <DialogBody className="space-y-5">
              {!lesson || !workspace.editable ? (
                <Alert variant="warning">
                  Questions can only be managed for your draft course.
                </Alert>
              ) : (
                <FieldArray
                  name="questions"
                  render={(array) => (
                    <div className="space-y-5">
                      {!form.values.questions.length && (
                        <div className="flex min-h-64 items-center justify-center py-8">
                          <EmptyState
                            icon={ListChecksIcon}
                            title="No questions yet"
                            description="Add questions before publishing this assessment."
                            action={
                              <Button
                                type="button"
                                disabled={busy}
                                onClick={() => array.push(blankQuestion())}
                              >
                                Add question
                              </Button>
                            }
                          />
                        </div>
                      )}
                      {form.values.questions.map((question, index) => (
                        <section
                          key={index}
                          className="space-y-4 rounded-lg border border-border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">
                              Question {index + 1}
                            </h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Remove question ${index + 1}`}
                              disabled={busy}
                              onClick={() => array.remove(index)}
                            >
                              <TrashIcon aria-hidden />
                            </Button>
                          </div>
                          <label className="block space-y-2">
                            <span className="font-medium">Question type</span>
                            <SelectInput
                              value={question.type}
                              disabled={busy}
                              className="w-full"
                              options={[
                                { value: "mcq", label: "Multiple choice" },
                                { value: "true_false", label: "True or false" },
                                {
                                  value: "short_answer",
                                  label: "Short answer",
                                },
                              ]}
                              onValueChange={(type) => {
                                void form.setFieldValue(
                                  `questions.${index}.type`,
                                  type
                                )
                                void form.setFieldValue(
                                  `questions.${index}.options`,
                                  type === "short_answer"
                                    ? []
                                    : type === "true_false"
                                      ? [
                                          { label: "True", isCorrect: true },
                                          { label: "False", isCorrect: false },
                                        ]
                                      : [
                                          { label: "", isCorrect: true },
                                          { label: "", isCorrect: false },
                                        ]
                                )
                              }}
                            />
                          </label>
                          <label className="block space-y-2">
                            <span className="font-medium">Question</span>
                            <FormInput
                              name={`questions.${index}.prompt`}
                              maxLength={10000}
                              disabled={busy}
                            />
                          </label>
                          <label className="block space-y-2">
                            <span className="font-medium">Points</span>
                            <FormInput
                              name={`questions.${index}.points`}
                              type="number"
                              min={1}
                              max={10000}
                              disabled={busy}
                            />
                          </label>
                          {question.type === "short_answer" ? (
                            <label className="block space-y-2">
                              <span className="font-medium">
                                Reference answer
                              </span>
                              <FormInput
                                name={`questions.${index}.referenceAnswer`}
                                maxLength={10000}
                                disabled={busy}
                              />
                            </label>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-sm font-medium">
                                Answers · select the correct answer
                              </p>
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center gap-3"
                                >
                                  <input
                                    type="radio"
                                    name={`correct-${index}`}
                                    checked={option.isCorrect}
                                    disabled={busy}
                                    aria-label={`Answer ${optionIndex + 1} is correct for question ${index + 1}`}
                                    onChange={() =>
                                      void form.setFieldValue(
                                        `questions.${index}.options`,
                                        question.options.map(
                                          (entry, entryIndex) => ({
                                            ...entry,
                                            isCorrect:
                                              entryIndex === optionIndex,
                                          })
                                        )
                                      )
                                    }
                                  />
                                  <div className="flex-1">
                                    <FormInput
                                      name={`questions.${index}.options.${optionIndex}.label`}
                                      aria-label={`Answer ${optionIndex + 1}`}
                                      disabled={
                                        busy || question.type === "true_false"
                                      }
                                      maxLength={2000}
                                    />
                                  </div>
                                  {question.type === "mcq" && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      aria-label={`Remove answer ${optionIndex + 1}`}
                                      disabled={
                                        busy || question.options.length <= 2
                                      }
                                      onClick={() =>
                                        void form.setFieldValue(
                                          `questions.${index}.options`,
                                          question.options.filter(
                                            (_, entryIndex) =>
                                              entryIndex !== optionIndex
                                          )
                                        )
                                      }
                                    >
                                      <TrashIcon aria-hidden />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              {question.type === "mcq" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    busy || question.options.length >= 10
                                  }
                                  onClick={() =>
                                    void form.setFieldValue(
                                      `questions.${index}.options`,
                                      [
                                        ...question.options,
                                        { label: "", isCorrect: false },
                                      ]
                                    )
                                  }
                                >
                                  Add answer
                                </Button>
                              )}
                            </div>
                          )}
                          <label className="block space-y-2">
                            <span className="font-medium">
                              Explanation (optional)
                            </span>
                            <FormInput
                              name={`questions.${index}.explanation`}
                              maxLength={10000}
                              disabled={busy}
                            />
                          </label>
                        </section>
                      ))}
                      {form.values.questions.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busy || form.values.questions.length >= 100}
                          onClick={() => array.push(blankQuestion())}
                        >
                          Add question
                        </Button>
                      )}
                    </div>
                  )}
                />
              )}
              {form.submitCount > 0 && !form.isValid && (
                <Alert variant="warning">
                  Check question prompts, points, reference answers, and answer
                  choices.
                </Alert>
              )}
              <FormFeedback />
            </DialogBody>
            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  busy || form.isSubmitting || !lesson || !workspace.editable
                }
              >
                {busy ? "Saving..." : "Save questions"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={workspace.close}
              >
                Cancel
              </Button>
            </DialogFooter>
          </Form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  )
}
