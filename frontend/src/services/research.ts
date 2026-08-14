import { api, API_BASE } from './client'
import type { HealthResponse, Job, StartResearchResponse } from '@/types'

/**
 * Thin wrappers over the endpoints backend/server.py actually exposes:
 *   GET  /api/health
 *   POST /api/research
 *   GET  /api/research/{id}
 *   GET  /api/research/{id}/stream   (SSE — see services/stream.ts)
 *   GET  /api/research/{id}/report.md
 */

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/api/health')
  return data
}

export async function startResearch(topic: string): Promise<StartResearchResponse> {
  const { data } = await api.post<StartResearchResponse>('/api/research', { topic })
  return data
}

export async function fetchJob(jobId: string): Promise<Job> {
  const { data } = await api.get<Job>(`/api/research/${jobId}`)
  return data
}

/** Server-rendered markdown, including the critic review the UI keeps separate. */
export async function fetchReportMarkdown(jobId: string): Promise<string> {
  const { data } = await api.get<string>(`/api/research/${jobId}/report.md`, {
    responseType: 'text',
    transformResponse: [(d) => d],
  })
  return data
}

export function reportDownloadUrl(jobId: string): string {
  return `${API_BASE}/api/research/${jobId}/report.md`
}

export function streamUrl(jobId: string): string {
  return `${API_BASE}/api/research/${jobId}/stream`
}
