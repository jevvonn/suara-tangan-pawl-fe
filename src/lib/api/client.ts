import { ApiError, type FieldErrors } from '@/lib/api/errors'

/**
 * HTTP client for the Laravel API. Every response uses the envelope
 * `{ success, message, errors, data }`; the client returns `data` and throws
 * an `ApiError` for everything else.
 *
 *   api.get<ApiLetter[]>('/letters')
 *   api.post<ApiLetter>('/letters', formData)        // multipart
 *   api.put<ApiUser>(`/users/${id}`, { role })        // JSON
 *   api.put<ApiLetter>(`/letters/${id}`, formData)    // sent as POST + _method=PUT
 *   api.delete(`/letters/${id}`)
 */

/** Base URL of the API, without a trailing slash. */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(
  /\/+$/,
  '',
)

// --- Bearer token ---------------------------------------------------------

const TOKEN_KEY = 'suara-tangan.token'

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null // storage blocked (e.g. private mode): stay logged out
  }
}

let token = readStoredToken()
const tokenListeners = new Set<() => void>()

function notifyTokenListeners() {
  tokenListeners.forEach((listener) => listener())
}

export function getToken(): string | null {
  return token
}

/** Stores the token (or removes it with `null`) and notifies subscribers. */
export function setToken(value: string | null) {
  if (value === token) return
  token = value
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage unavailable: the token still lives in memory for this tab.
  }
  notifyTokenListeners()
}

export function clearToken() {
  setToken(null)
}

/** For `useSyncExternalStore`: calls `listener` whenever the token changes. */
export function subscribeToToken(listener: () => void) {
  tokenListeners.add(listener)
  return () => {
    tokenListeners.delete(listener)
  }
}

// Logging in or out in another tab applies here too.
window.addEventListener('storage', (event) => {
  if (event.key !== null && event.key !== TOKEN_KEY) return
  const stored = readStoredToken()
  if (stored === token) return
  token = stored
  notifyTokenListeners()
})

// --- Requests -------------------------------------------------------------

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type QueryParams = Record<string, string | number | boolean | null | undefined>

export type RequestOptions = {
  method?: HttpMethod
  /**
   * `FormData` is sent as multipart (the browser sets the Content-Type);
   * anything else is sent as JSON.
   */
  body?: unknown
  /** Added to the URL as `?key=value`; `null`/`undefined` values are skipped. */
  query?: QueryParams
  signal?: AbortSignal
  /** Token to send instead of the stored one; `null` sends none. */
  token?: string | null
}

type Envelope<T> = {
  success: boolean
  message: string
  errors: unknown
  data: T
}

const NETWORK_ERROR_MESSAGE =
  'Tidak dapat terhubung ke server. Periksa koneksi internet kamu lalu coba lagi.'
const UNKNOWN_ERROR_MESSAGE = 'Terjadi kesalahan pada server. Coba lagi.'

function buildUrl(path: string, query?: QueryParams) {
  // The base may be relative (e.g. "/api" behind a proxy), so resolve it against the page.
  const url = new URL(`${API_URL}/${path.replace(/^\/+/, '')}`, window.location.origin)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined) url.searchParams.set(key, String(value))
  }
  return url
}

function isEnvelope(value: unknown): value is Envelope<unknown> {
  return typeof value === 'object' && value !== null && 'success' in value
}

/** `errors` is `{ field: ["message", ...] }` for validation errors, otherwise null or a string. */
function toFieldErrors(errors: unknown): FieldErrors {
  if (typeof errors !== 'object' || errors === null || Array.isArray(errors)) return {}
  const result: FieldErrors = {}
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) result[field] = messages.map(String)
    else if (typeof messages === 'string') result[field] = [messages]
  }
  return result
}

async function readEnvelope(response: Response): Promise<Envelope<unknown> | null> {
  if (response.status === 204) return { success: true, message: '', errors: null, data: undefined }
  try {
    const json: unknown = await response.json()
    return isEnvelope(json) ? json : null
  } catch {
    return null
  }
}

/**
 * Sends a request and returns the envelope's `data`.
 *
 * Throws `ApiError` when the server can't be reached (`status` 0), answers
 * with a non-2xx status, or returns `success: false`. A 401 on a request made
 * with the stored token clears that token, which logs the user out.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, query, signal } = options
  let method: HttpMethod = options.method ?? (body === undefined ? 'GET' : 'POST')
  const authToken = options.token === undefined ? token : options.token

  const headers = new Headers({ Accept: 'application/json' })
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`)

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
    if (method !== 'POST') {
      // PHP only parses multipart bodies on POST, so send POST and let Laravel
      // read the real method from `_method`. Copy so the caller's form isn't changed.
      const spoofed = new FormData()
      body.forEach((value, key) => spoofed.append(key, value))
      spoofed.set('_method', method)
      payload = spoofed
      method = 'POST'
    }
  } else if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
    payload = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), { method, headers, body: payload, signal })
  } catch (error) {
    if (signal?.aborted) throw error // let react-query see the cancellation
    throw new ApiError(NETWORK_ERROR_MESSAGE, { status: 0 })
  }

  const envelope = await readEnvelope(response)
  if (response.ok && envelope?.success) return envelope.data as T

  // Only drop the token that was rejected, not one stored by a newer login.
  if (response.status === 401 && authToken && authToken === token) clearToken()

  const fieldErrors = toFieldErrors(envelope?.errors)
  // For validation errors, lead with the first field's message (more useful than "Validation failed.").
  const message =
    Object.values(fieldErrors)[0]?.[0] || envelope?.message || UNKNOWN_ERROR_MESSAGE
  throw new ApiError(message, { status: response.ok ? 400 : response.status, fieldErrors })
}

type Options = Omit<RequestOptions, 'method' | 'body'>

export const api = {
  get: <T = unknown>(path: string, options?: Options) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown, options?: Options) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  put: <T = unknown>(path: string, body?: unknown, options?: Options) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),
  patch: <T = unknown>(path: string, body?: unknown, options?: Options) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T = unknown>(path: string, options?: Options) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
}
