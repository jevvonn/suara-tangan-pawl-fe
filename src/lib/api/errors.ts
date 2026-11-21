import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

/** Validation messages per field, as the API sends them: `{ email: ["..."] }`. */
export type FieldErrors = Record<string, string[]>

/**
 * Error shape the services throw. `field` is the first field with an error and
 * `fieldErrors` has the messages of every field, so forms can show them next
 * to the inputs they belong to (e.g. a duplicate email).
 */
export class ApiError extends Error {
  /** HTTP status; 0 when the server couldn't be reached. */
  readonly status: number
  readonly field?: string
  readonly fieldErrors: FieldErrors

  constructor(
    message: string,
    options: { status?: number; field?: string; fieldErrors?: FieldErrors } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status ?? 400
    this.fieldErrors =
      options.fieldErrors ?? (options.field ? { [options.field]: [message] } : {})
    this.field = options.field ?? Object.keys(this.fieldErrors)[0]
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan. Coba lagi.'
}

/**
 * Shows an ApiError's field messages on the matching react-hook-form fields.
 * `fields` maps API field names (snake_case) to form field names, e.g.
 * `{ password_confirmation: 'passwordConfirmation' }`; other fields are ignored.
 * Returns true if at least one message was set, so callers can fall back to a
 * form-level message otherwise.
 */
export function setApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: Partial<Record<string, Path<T>>>,
  /** Lets callers reword a message, e.g. translate it. */
  formatMessage: (message: string, apiField: string) => string = (message) => message,
): boolean {
  if (!(error instanceof ApiError)) return false

  let applied = false
  for (const [apiField, messages] of Object.entries(error.fieldErrors)) {
    const formField = fields[apiField]
    if (!formField || !messages[0]) continue
    // Focus only the first field, like react-hook-form does for its own errors.
    setError(
      formField,
      { message: formatMessage(messages[0], apiField) },
      { shouldFocus: !applied },
    )
    applied = true
  }
  return applied
}
