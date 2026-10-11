import { useEffect, useRef, type ComponentProps } from "react"
import { useField, useFormikContext } from "formik"
import { Input } from "./input"

type FormInputProps = Omit<
  ComponentProps<typeof Input>,
  "name" | "value" | "onChange" | "onBlur"
> & { name: string }

export function FormInput({
  name,
  id = name,
  disabled,
  "aria-describedby": describedBy,
  ...props
}: FormInputProps) {
  const [field, meta] = useField<string>(name)
  const { isSubmitting } = useFormikContext()
  const error = meta.touched && meta.error
  const errorId = `${id}-error`
  return (
    <>
      <Input
        {...props}
        {...field}
        id={id}
        disabled={disabled || isSubmitting}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [describedBy, error ? errorId : undefined]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      {error && (
        <p id={errorId} className="text-sm leading-6 text-destructive">
          {error}
        </p>
      )}
    </>
  )
}

export function FormFeedback() {
  const { status, submitCount, isSubmitting, isValidating, errors } =
    useFormikContext()
  const ref = useRef<HTMLDivElement>(null)
  const focusedSubmit = useRef(0)
  useEffect(() => {
    if (
      !submitCount ||
      submitCount === focusedSubmit.current ||
      isSubmitting ||
      isValidating
    )
      return
    focusedSubmit.current = submitCount
    if (Object.keys(errors).length) ref.current?.focus()
  }, [submitCount, isSubmitting, isValidating, errors])
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      hidden={
        typeof status !== "string" &&
        !(submitCount && Object.keys(errors).length)
      }
      className="space-y-2 text-sm leading-6 text-destructive outline-offset-4"
    >
      {submitCount > 0 && Object.keys(errors).length > 0 && (
        <>
          <p>Please correct the following fields:</p>
          <ul className="list-inside list-disc">
            {Object.entries(errors).map(
              ([name, message]) =>
                typeof message === "string" && (
                  <li key={name}>
                    <button
                      type="button"
                      className="underline underline-offset-4"
                      onClick={() => {
                        const input = ref.current
                          ?.closest("form")
                          ?.elements.namedItem(name)
                        if (input instanceof HTMLElement) input.focus()
                      }}
                    >
                      {message}
                    </button>
                  </li>
                )
            )}
          </ul>
        </>
      )}
      {typeof status === "string" && <p>{status}</p>}
    </div>
  )
}
