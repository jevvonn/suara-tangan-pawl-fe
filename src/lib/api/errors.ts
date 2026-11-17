/**
 * Error shape the services throw. `field` lets forms show the message
 * next to the input it belongs to (e.g. a duplicate email).
 */
export class ApiError extends Error {
  readonly status: number
  readonly field?: string

  constructor(message: string, options: { status?: number; field?: string } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status ?? 400
    this.field = options.field
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan. Coba lagi.'
}
