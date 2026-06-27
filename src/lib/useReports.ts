import { useEffect, useState, useCallback } from 'react'
import type { Report } from '../types'
import { DUMMY_REPORTS } from '../data/dummy'
import { readCache, writeCache } from './cache'
import { SUPABASE_ENABLED, getSupabase } from './supabase'

export type DataSource = 'live' | 'cache' | 'dummy'

export interface ReportsState {
  reports: Report[]
  loading: boolean
  source: DataSource
  cachedAt: number | null
  offline: boolean
  refresh: () => void
}

// Pulls reports + all related rows from Supabase and stitches them into the
// nested Report shape the UI expects.
async function fetchLive(): Promise<Report[]> {
  const sb = await getSupabase()
  const [reports, necesidades, acepta, personas, pacientes, listas] = await Promise.all([
    sb.from('reports').select('*').order('created_at', { ascending: false }),
    sb.from('necesidades').select('*'),
    sb.from('acepta').select('*'),
    sb.from('personas').select('*'),
    sb.from('pacientes').select('*'),
    sb.from('hospital_listas').select('*'),
  ])
  if (reports.error) throw reports.error

  const byReport = <T extends { report_id: string }>(rows: T[] | null) => {
    const map = new Map<string, T[]>()
    for (const r of rows ?? []) {
      const arr = map.get(r.report_id) ?? []
      arr.push(r)
      map.set(r.report_id, arr)
    }
    return map
  }

  const nMap = byReport(necesidades.data)
  const aMap = byReport(acepta.data)
  const perMap = byReport(personas.data)
  const pacMap = byReport(pacientes.data)
  const lstMap = byReport(listas.data)

  return (reports.data ?? []).map((r: Report) => ({
    ...r,
    necesidades: nMap.get(r.id) ?? [],
    acepta: aMap.get(r.id) ?? [],
    personas: perMap.get(r.id) ?? [],
    pacientes: pacMap.get(r.id) ?? [],
    listas: lstMap.get(r.id) ?? [],
  }))
}

export function useReports(): ReportsState {
  const [reports, setReports] = useState<Report[]>(DUMMY_REPORTS)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<DataSource>('dummy')
  const [cachedAt, setCachedAt] = useState<number | null>(null)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [nonce, setNonce] = useState(0)

  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      // 1) Show cache immediately if present (instant paint, offline-first).
      const cached = await readCache()
      if (!cancelled && cached) {
        setReports(cached.reports)
        setCachedAt(cached.cachedAt)
        setSource('cache')
      }

      // 2) Try live data if Supabase is configured and we're online.
      if (SUPABASE_ENABLED && navigator.onLine) {
        try {
          const live = await fetchLive()
          if (!cancelled) {
            setReports(live)
            setSource('live')
            setCachedAt(Date.now())
          }
          await writeCache(live)
        } catch {
          // Keep whatever we already showed (cache or dummy).
          if (!cancelled && !cached) setSource('dummy')
        }
      } else if (!cached) {
        // No backend and no cache → seed the cache with dummy data so the
        // offline indicator and list behave consistently.
        if (!cancelled) setSource('dummy')
      }

      if (!cancelled) setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [nonce])

  return { reports, loading, source, cachedAt, offline, refresh }
}
