import { useState, useEffect, useCallback } from 'react'
import { LAYERS } from '../layers'
import type { Report } from '../types'

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER as string | undefined
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SERVICE_KEY = import.meta.env.VITE_ADMIN_SERVICE_KEY as string | undefined

type Tab = 'acopio' | 'hospital' | 'personas' | 'emergencia' | 'necesidades' | 'servicio' | 'refugio' | 'solicitudes'

async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY!,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'return=minimal',
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res
}

async function fetchReports(tipo: string): Promise<Report[]> {
  const filter = tipo === 'emergencia' ? `tipo=in.(emergencia,infra)` : `tipo=eq.${tipo}`
  const res = await adminFetch(`reports?${filter}&order=created_at.desc&select=*`)
  return res.json()
}

async function fetchSolicitudes(): Promise<{ id: string; report_id: string; motivo: string; detalle: string; created_at: string }[]> {
  const res = await adminFetch(`reportes_abuso?motivo=eq.Solicitud de eliminación&order=created_at.desc&select=*`)
  return res.json()
}

async function deleteReport(id: string): Promise<void> {
  await adminFetch(`reports?id=eq.${id}`, { method: 'DELETE' })
}

async function deleteSolicitud(id: string): Promise<void> {
  await adminFetch(`reportes_abuso?id=eq.${id}`, { method: 'DELETE' })
}

// ── Login ─────────────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (user === ADMIN_USER && pass === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1')
      onLogin()
    } else {
      setError('Usuario o contraseña incorrectos.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">Administración</h1>
        <p className="mb-6 text-center text-sm text-gray-500">tuAyudaVenezuela</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Usuario</label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              autoComplete="username"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Reports Table ─────────────────────────────────────────────────────────────

function ReportsTable({ tipo }: { tipo: string }) {
  const [rows, setRows] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<Report | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchReports(tipo)
      setRows(data)
    } finally {
      setLoading(false)
    }
  }, [tipo])

  useEffect(() => { load() }, [load])

  async function handleDelete(r: Report) {
    setDeleting(r.id)
    try {
      await deleteReport(r.id)
      setRows(prev => prev.filter(x => x.id !== r.id))
    } finally {
      setDeleting(null)
      setConfirm(null)
    }
  }

  if (loading) return <p className="py-8 text-center text-gray-400">Cargando...</p>
  if (rows.length === 0) return <p className="py-8 text-center text-gray-400">No hay registros.</p>

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Zona</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="max-w-[200px] truncate px-4 py-3 font-medium text-gray-900">{r.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{r.tipo}</td>
                <td className="px-4 py-3 text-gray-600">{r.estado ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{r.zona ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString('es-VE')}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setConfirm(r)}
                    className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-gray-900">¿Eliminar registro?</h3>
            <p className="mb-4 text-sm text-gray-600">
              Se eliminará permanentemente: <strong>{confirm.nombre}</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 font-semibold text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirm)}
                disabled={deleting === confirm.id}
                className="flex-1 rounded-xl bg-red-500 py-2.5 font-semibold text-white disabled:opacity-60"
              >
                {deleting === confirm.id ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Solicitudes Table ─────────────────────────────────────────────────────────

function SolicitudesTable() {
  const [rows, setRows] = useState<{ id: string; report_id: string; motivo: string; detalle: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchSolicitudes().then(setRows).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await deleteSolicitud(id)
      setRows(prev => prev.filter(x => x.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <p className="py-8 text-center text-gray-400">Cargando...</p>
  if (rows.length === 0) return <p className="py-8 text-center text-gray-400">No hay solicitudes pendientes.</p>

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 text-left">ID Registro</th>
            <th className="px-4 py-3 text-left">Detalle</th>
            <th className="px-4 py-3 text-left">Fecha</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.report_id}</td>
              <td className="max-w-xs px-4 py-3 text-gray-700 whitespace-pre-wrap text-xs">{r.detalle}</td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {new Date(r.created_at).toLocaleDateString('es-VE')}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                  className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-60"
                >
                  {deleting === r.id ? '…' : 'Archivar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; emoji: string }[] = [
  ...LAYERS.map(l => ({ id: l.id as Tab, label: l.short, emoji: l.glyph })),
  { id: 'solicitudes', label: 'Solicitudes', emoji: '🗑️' },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('admin_auth') === '1')
  const [tab, setTab] = useState<Tab>('acopio')

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
          <p className="text-lg font-bold text-red-600">Faltan variables de entorno</p>
          <p className="mt-2 text-sm text-gray-500">Configura VITE_ADMIN_SERVICE_KEY en tu .env.local</p>
        </div>
      </div>
    )
  }

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Panel de administración</h1>
          <p className="text-xs text-gray-500">tuAyudaVenezuela</p>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false) }}
          className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === 'solicitudes'
            ? <SolicitudesTable />
            : <ReportsTable key={tab} tipo={tab} />
          }
        </div>
      </div>
    </div>
  )
}
