import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Report, Tipo } from './types'
import { LAYERS } from './layers'
import { useReports } from './lib/useReports'
import MapView from './components/MapView'
import ListView from './components/ListView'
import ServiciosView from './components/ServiciosView'
import ServicioForm from './components/ServicioForm'
import LayerToggle from './components/LayerToggle'
import PersonasStats from './components/PersonasStats'
import DetailPanel from './components/DetailPanel'
import ReportForm from './components/ReportForm'
import InfoModal from './components/InfoModal'
import { updatePersonaEstado, updatePersonaLocalizada } from './lib/submit'
import type { LocalizacionData } from './components/LocalizarModal'

type ViewMode = 'mapa' | 'lista' | 'servicios'

const ALL_TIPOS = LAYERS.map((l) => l.id)
const TEXT_SCALES = [14, 16, 18, 20]

const INITIAL_SHARED_ID = new URLSearchParams(window.location.search).get('reporte')

const NAV_ITEMS: { id: ViewMode; label: string; icon: ReactNode }[] = [
  {
    id: 'mapa',
    label: 'Mapa',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  {
    id: 'lista',
    label: 'Lista',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="6" x2="21" y2="6" />
        <line x1="9" y1="12" x2="21" y2="12" />
        <line x1="9" y1="18" x2="21" y2="18" />
        <circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'servicios',
    label: 'Servicios',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
]

export default function App() {
  const { reports, source, cachedAt, offline, refresh } = useReports()
  const [extra, setExtra] = useState<Report[]>([])
  const [overrides, setOverrides] = useState<Record<string, Partial<Report>>>({})
  // Single active layer — null means "all" (initial state shows all, same experience)
  const [activeLayer, setActiveLayer] = useState<Tipo | null>(null)
  const [view, setView] = useState<ViewMode>('mapa')
  const [selected, setSelected] = useState<Report | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [servicioFormOpen, setServicioFormOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [scaleIdx, setScaleIdx] = useState(1)
  const [autoOpened, setAutoOpened] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    document.documentElement.style.fontSize = `${TEXT_SCALES[scaleIdx]}px`
  }, [scaleIdx])

  const allReports = useMemo(
    () =>
      [...extra, ...reports].map((r) =>
        overrides[r.id] ? { ...r, ...overrides[r.id] } : r,
      ),
    [extra, reports, overrides],
  )

  useEffect(() => {
    if (autoOpened || !INITIAL_SHARED_ID) return
    const found = allReports.find((r) => r.id === INITIAL_SHARED_ID)
    if (found) {
      setSelected(found)
      setActiveLayer(found.tipo)
      setAutoOpened(true)
    }
  }, [allReports, autoOpened])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (selected) url.searchParams.set('reporte', selected.id)
    else url.searchParams.delete('reporte')
    window.history.replaceState(null, '', url.toString())
  }, [selected])

  // Filter by active single layer (null = show all).
  // Legacy 'infra' records are shown together with 'emergencia'.
  const displayed = useMemo(() => {
    const base = activeLayer
      ? allReports.filter((r) => r.tipo === activeLayer || (activeLayer === 'emergencia' && r.tipo === 'infra'))
      : allReports
    const q = query.trim().toLowerCase()
    if (!q) return base
    return base.filter((r) =>
      [r.nombre, r.descripcion, r.zona].some((f) => f?.toLowerCase().includes(q)),
    )
  }, [allReports, activeLayer, query])

  async function handleUpdateEstado(report: Report, estado: string) {
    setOverrides((prev) => ({ ...prev, [report.id]: { ...prev[report.id], estado } }))
    setSelected((s) => (s && s.id === report.id ? { ...s, estado } : s))
    try {
      await updatePersonaEstado(report.id, estado)
    } catch (err) {
      console.error('No se pudo actualizar el estado', err)
    }
  }

  async function handleLocalizar(report: Report, data: LocalizacionData) {
    const patch: Partial<Report> = {
      estado: 'localizado',
      ...data,
      localizado_fecha: new Date().toISOString().slice(0, 10),
    }
    setOverrides((prev) => ({ ...prev, [report.id]: { ...prev[report.id], ...patch } }))
    setSelected((s) => (s && s.id === report.id ? { ...s, ...patch } : s))
    try {
      await updatePersonaLocalizada(report.id, data)
    } catch (err) {
      console.error('No se pudo registrar la localización', err)
    }
  }

  const counts = useMemo(() => {
    const c = {} as Record<Tipo, number>
    for (const l of LAYERS) c[l.id] = 0
    for (const r of allReports) {
      // Legacy infra records count under emergencia
      const key = r.tipo === 'infra' ? 'emergencia' : r.tipo
      c[key] = (c[key] ?? 0) + 1
    }
    return c
  }, [allReports])

  function selectLayer(tipo: Tipo) {
    if (isServicios) setView('mapa')
    setActiveLayer(tipo)
  }

  function selectAll() {
    if (isServicios) setView('mapa')
    setActiveLayer(null)
  }

  function openServicios() {
    setView('servicios')
    setActiveLayer(null)
  }

  const stale = offline || source === 'cache' || source === 'dummy'
  const isServicios = view === 'servicios'

  // active set derived from single layer (for MapView / LayerToggle).
  // When emergencia is selected, also include legacy infra records.
  const activeSet = useMemo(() => {
    if (!activeLayer) return new Set<Tipo>(ALL_TIPOS)
    const set = new Set<Tipo>([activeLayer])
    if (activeLayer === 'emergencia') set.add('infra')
    return set
  }, [activeLayer])

  const services = useMemo(
    () => allReports.filter((r) => r.tipo === 'servicio'),
    [allReports],
  )

  return (
    <div className="flex h-[100dvh] bg-white">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:border-r lg:border-gray-100 lg:bg-white">

        <div className="flex items-center gap-3 px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-xl border border-gray-100">
            🇻🇪
          </span>
          <div className="leading-tight">
            <h1 className="text-lg font-bold tracking-tight">
              <span style={{ color: '#D4A017' }}>tu</span>
              <span style={{ color: '#003893' }}>Ayuda</span>
              <span style={{ color: '#CF142B' }}>Venezuela</span>
            </h1>
            <p className="text-[11px] text-gray-400">Ayuda comunitaria · Sin registro</p>
          </div>
        </div>

        <div className="flex h-1 w-full shrink-0">
          <div className="flex-1" style={{ backgroundColor: '#FCD116' }} />
          <div className="flex-1" style={{ backgroundColor: '#003893' }} />
          <div className="flex-1" style={{ backgroundColor: '#CF142B' }} />
        </div>

        {/* Nav: Mapa / Lista (desktop sidebar — Servicios is in the layer list) */}
        <nav className="flex flex-col gap-1 px-3 py-3">
          {NAV_ITEMS.filter((i) => i.id !== 'servicios').map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id)
                setActiveLayer(null)
              }}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors text-left ${
                view === item.id && !isServicios
                  ? 'bg-[#003893] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Search */}
        {!isServicios && (
          <div className="px-3 pb-2">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o zona…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm focus:border-brand focus:bg-white focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Limpiar" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">✕</button>
              )}
            </div>
          </div>
        )}

        {/* Layer list — vertical, includes Servicios at bottom */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {isServicios ? 'Categorías' : 'Filtrar por capa'}
          </p>
          <LayerToggle
            active={activeSet}
            counts={counts}
            onSelect={selectLayer}
            onAll={selectAll}
            vertical
            serviciosActive={isServicios}
            onServicios={openServicios}
          />
        </div>

        {/* Bottom: emergency + scale */}
        <div className="border-t border-gray-100 p-3 space-y-2">
          <button
            onClick={() => setInfoOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100"
          >
            🆘 Ayuda y emergencias
          </button>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-400">Texto:</span>
            <div className="flex overflow-hidden rounded-lg border border-gray-200">
              <button onClick={() => setScaleIdx((i) => Math.max(0, i - 1))} disabled={scaleIdx === 0} className="px-3 py-1 text-xs font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-50" aria-label="Reducir texto">A−</button>
              <button onClick={() => setScaleIdx((i) => Math.min(TEXT_SCALES.length - 1, i + 1))} disabled={scaleIdx === TEXT_SCALES.length - 1} className="border-l border-gray-200 px-3 py-1 text-sm font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-50" aria-label="Aumentar texto">A+</button>
            </div>
          </div>
        </div>

        {/* Disclaimer footer */}
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <p className="text-[10px] leading-relaxed text-gray-400 text-center">
            Sistema desarrollado por venezolanos para apoyarnos en la organización y centralización de información e insumos.{' '}
            <strong className="text-gray-500">No pedimos dinero.</strong>{' '}
            No somos responsables de los servicios publicados por terceros — somos un punto de encuentro para quienes necesitan y ofrecen ayuda.
          </p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-gray-400 text-center">
            Fallas o consultas:{' '}
            <a
              href="mailto:ingenierosvenezolanosunidos@gmail.com"
              className="text-[#003893] underline break-all hover:text-[#CF142B] transition-colors"
            >
              ingenierosvenezolanosunidos@gmail.com
            </a>
          </p>
        </div>
      </aside>

      {/* ── MAIN PANEL ───────────────────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">

        {/* Mobile header */}
        <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3 shadow-sm lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇻🇪</span>
            <h1 className="text-[15px] font-bold tracking-tight">
              <span style={{ color: '#D4A017' }}>tu</span>
              <span style={{ color: '#003893' }}>Ayuda</span>
              <span style={{ color: '#CF142B' }}>Venezuela</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-gray-200">
              <button onClick={() => setScaleIdx((i) => Math.max(0, i - 1))} disabled={scaleIdx === 0} className="px-2 py-1.5 text-xs font-bold text-gray-600 disabled:opacity-40" aria-label="Reducir texto">A−</button>
              <button onClick={() => setScaleIdx((i) => Math.min(TEXT_SCALES.length - 1, i + 1))} disabled={scaleIdx === TEXT_SCALES.length - 1} className="border-l border-gray-200 px-2 py-1.5 text-sm font-bold text-gray-600 disabled:opacity-40" aria-label="Aumentar texto">A+</button>
            </div>
            <button
              onClick={() => setInfoOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-sm font-semibold text-red-700 ring-1 ring-red-200"
              aria-label="Ayuda y emergencias"
            >
              🆘
            </button>
          </div>
        </header>

        {/* Mobile flag stripe */}
        <div className="flex h-1 w-full shrink-0 lg:hidden">
          <div className="flex-1" style={{ backgroundColor: '#FCD116' }} />
          <div className="flex-1" style={{ backgroundColor: '#003893' }} />
          <div className="flex-1" style={{ backgroundColor: '#CF142B' }} />
        </div>

        {/* Mobile search — only for mapa/lista */}
        {!isServicios && (
          <div className="relative z-10 flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 lg:hidden">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, zona…"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm focus:border-brand focus:bg-white focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">✕</button>
              )}
            </div>
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              aria-label={filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
              className="flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-all"
              style={
                filtersOpen || activeLayer
                  ? { borderColor: '#003893', backgroundColor: '#00389314', color: '#003893' }
                  : { borderColor: '#e5e7eb', backgroundColor: '#fff', color: '#6b7280' }
              }
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              {activeLayer ? LAYERS.find(l => l.id === activeLayer)?.glyph : null}
            </button>
          </div>
        )}

        {/* Offline indicator */}
        {offline && (
          <div className="flex shrink-0 items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-800">
            <span>📴 Sin conexión — mostrando datos guardados</span>
          </div>
        )}

        {/* Layer chips — only for mapa/lista; on mobile Servicios is in the bottom nav */}
        {!isServicios && filtersOpen && (
          <div className="relative z-10 shrink-0 border-b border-gray-200 bg-white shadow-card lg:hidden">
            <LayerToggle
              active={activeSet}
              counts={counts}
              onSelect={(t) => { selectLayer(t); setFiltersOpen(false) }}
              onAll={() => { selectAll(); setFiltersOpen(false) }}
            />
          </div>
        )}

        {/* Personas stats */}
        {!isServicios && activeLayer === 'personas' && <PersonasStats reports={displayed} />}

        {/* Main content */}
        <main className="relative isolate min-h-0 flex-1 overflow-hidden">
          {isServicios ? (
            <ServiciosView
              services={services}
              onAdd={() => setServicioFormOpen(true)}
              onSelect={setSelected}
            />
          ) : view === 'mapa' ? (
            <MapView reports={displayed} active={activeSet} onSelect={setSelected} />
          ) : (
            <ListView reports={displayed} active={activeSet} onSelect={setSelected} />
          )}
        </main>

        {/* Full-width Crear button — hidden in Servicios view */}
        {!isServicios && (
          <div className="z-10 shrink-0 border-t border-gray-100 bg-white p-3">
            <button
              onClick={() => setFormOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-dark active:scale-[.98]"
            >
              <span className="text-xl leading-none">＋</span>
              <span>Crear</span>
            </button>
          </div>
        )}

        {/* Mobile disclaimer */}
        <div className="z-10 shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-2 lg:hidden">
          <p className="text-[9px] leading-relaxed text-gray-400 text-center">
            Hecho por venezolanos. <strong className="text-gray-500">No pedimos dinero.</strong> No somos responsables de los servicios de terceros.
            Fallas:{' '}
            <a href="mailto:ingenierosvenezolanosunidos@gmail.com" className="text-[#003893] underline">
              ingenierosvenezolanosunidos@gmail.com
            </a>
          </p>
        </div>

        {/* Mobile bottom nav — Mapa / Lista / Servicios */}
        <nav className="z-10 flex shrink-0 border-t border-gray-200 bg-white lg:hidden">
          {NAV_ITEMS.map((item) => {
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id)
                  // Leaving a content view resets layer filter
                  if (item.id !== 'servicios') setActiveLayer(null)
                }}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-semibold transition-colors ${
                  active ? 'text-[#003893]' : 'text-gray-400'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {active && <span className="h-0.5 w-6 rounded-full bg-[#003893]" />}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overlays */}
      <DetailPanel
        report={selected}
        onClose={() => setSelected(null)}
        onUpdateEstado={handleUpdateEstado}
        onLocalizar={handleLocalizar}
      />

      {formOpen && (
        <ReportForm
          onClose={() => setFormOpen(false)}
          onCreated={(r) => {
            setExtra((prev) => [r, ...prev])
            setActiveLayer(r.tipo)
            setFormOpen(false)
            setSelected(r)
          }}
        />
      )}

      {servicioFormOpen && (
        <ServicioForm
          onClose={() => setServicioFormOpen(false)}
          onCreated={(r) => {
            setExtra((prev) => [r, ...prev])
            setServicioFormOpen(false)
            setSelected(r)
          }}
        />
      )}

      {infoOpen && <InfoModal onClose={() => setInfoOpen(false)} />}
    </div>
  )
}
