import { get, set } from 'idb-keyval'
import type { Report } from '../types'

const REPORTS_KEY = 'reports-cache'
const TIMESTAMP_KEY = 'reports-cache-ts'

export interface CachedData {
  reports: Report[]
  cachedAt: number
}

export async function readCache(): Promise<CachedData | null> {
  try {
    const reports = await get<Report[]>(REPORTS_KEY)
    const cachedAt = await get<number>(TIMESTAMP_KEY)
    if (reports && cachedAt) return { reports, cachedAt }
  } catch {
    // IndexedDB unavailable (private mode, etc.) — caller falls back to dummy.
  }
  return null
}

export async function writeCache(reports: Report[]): Promise<void> {
  try {
    await set(REPORTS_KEY, reports)
    await set(TIMESTAMP_KEY, Date.now())
  } catch {
    // Best-effort; ignore quota/availability errors.
  }
}
