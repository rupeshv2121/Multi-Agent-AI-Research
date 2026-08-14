import axios, { AxiosError } from 'axios'

/**
 * In dev, Vite proxies `/api` to the FastAPI server (see vite.config.ts). In
 * production FastAPI serves this bundle from the same origin, so a relative
 * base works in both cases. `VITE_API_BASE_URL` overrides for split deploys.
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

/** FastAPI puts human-readable messages in `detail`; surface those verbatim. */
export function toMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (error.code === 'ECONNABORTED') return 'The request timed out.'
    if (!error.response) {
      return 'Could not reach the research server. Is `python backend/server.py` running on port 8000?'
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)
