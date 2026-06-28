import { useTranslation } from 'react-i18next'
import { LAYERS } from '../layers'
import type { Tipo } from '../types'

interface Props {
  active: Set<Tipo>
  counts: Record<Tipo, number>
  onSelect: (tipo: Tipo) => void
  onAll?: () => void
  vertical?: boolean
  serviciosActive?: boolean
  onServicios?: () => void
}

function IconGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconWrench() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

export default function LayerToggle({
  active,
  counts,
  onSelect,
  onAll,
  vertical = false,
  serviciosActive = false,
  onServicios,
}: Props) {
  const { t } = useTranslation()
  const reportLayers = LAYERS.filter((l) => l.id !== 'servicio')
  const allActive = active.size === LAYERS.length && !serviciosActive

  if (vertical) {
    return (
      <div className="flex flex-col gap-0.5">
        {onAll && (
          <button
            onClick={onAll}
            aria-pressed={allActive}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left hover:bg-gray-50"
            style={allActive ? { color: '#111827' } : { color: '#6b7280' }}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: allActive ? '#11182720' : '#f3f4f6' }}
            >
              <IconGrid />
            </span>
            <span className="flex-1 leading-tight">{t('layers.all')}</span>
          </button>
        )}
        {reportLayers.map((l) => {
          const on = active.has(l.id) && !serviciosActive
          return (
            <button
              key={l.id}
              onClick={() => onSelect(l.id)}
              aria-pressed={on}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left hover:bg-gray-50"
              style={on ? { color: l.color } : { color: '#6b7280' }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base"
                style={{ backgroundColor: on ? l.color + '20' : '#f3f4f6' }}
              >
                {l.glyph}
              </span>
              <span className="flex-1 leading-tight">{t(`layers.${l.id}.label`)}</span>
              <span
                className="rounded-full px-1.5 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: on ? l.color + '20' : '#f3f4f6',
                  color: on ? l.color : '#9ca3af',
                }}
              >
                {counts[l.id] ?? 0}
              </span>
            </button>
          )
        })}

        {onServicios && (
          <>
            <div className="mx-3 my-1.5 h-px bg-gray-100" />
            <button
              onClick={onServicios}
              aria-pressed={serviciosActive}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left hover:bg-gray-50"
              style={serviciosActive ? { color: '#003893' } : { color: '#6b7280' }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: serviciosActive ? '#00389320' : '#f3f4f6' }}
              >
                <IconWrench />
              </span>
              <span className="flex-1 leading-tight">{t('nav.services')}</span>
            </button>
          </>
        )}
      </div>
    )
  }

  /* ── GRID (mobile) ──── */
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0)
  return (
    <div className="grid grid-cols-4 gap-2 px-3 py-2">
      {onAll && (
        <button
          onClick={onAll}
          aria-pressed={allActive}
          className="flex flex-col items-center gap-0.5 rounded-xl border px-1 py-1.5 text-center text-[10px] font-semibold transition-all"
          style={
            allActive
              ? { borderColor: '#111827', backgroundColor: '#11182714', color: '#111827' }
              : { borderColor: '#e5e7eb', color: '#6b7280' }
          }
        >
          <span className="text-base flex items-center justify-center" aria-hidden><IconGrid /></span>
          <span className="leading-tight">{t('layers.all')}</span>
          <span
            className="rounded-full px-1 text-[9px] font-semibold"
            style={allActive ? { backgroundColor: '#11182720', color: '#111827' } : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}
          >
            {totalCount}
          </span>
        </button>
      )}

      {reportLayers.map((l) => {
        const on = active.has(l.id) && !serviciosActive
        return (
          <button
            key={l.id}
            onClick={() => onSelect(l.id)}
            aria-pressed={on}
            className="flex flex-col items-center gap-0.5 rounded-xl border px-1 py-1.5 text-center text-[10px] font-semibold transition-all"
            style={
              on
                ? { borderColor: l.color, backgroundColor: l.color + '14', color: l.color }
                : { borderColor: '#e5e7eb', color: '#6b7280' }
            }
          >
            <span className="text-base" aria-hidden>{l.glyph}</span>
            <span className="leading-tight">{t(`layers.${l.id}.short`)}</span>
            <span
              className="rounded-full px-1 text-[9px] font-semibold"
              style={on ? { backgroundColor: l.color + '20', color: l.color } : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}
            >
              {counts[l.id] ?? 0}
            </span>
          </button>
        )
      })}

      {onServicios && (
        <button
          onClick={onServicios}
          aria-pressed={serviciosActive}
          className="flex flex-col items-center gap-0.5 rounded-xl border px-1 py-1.5 text-center text-[10px] font-semibold transition-all"
          style={
            serviciosActive
              ? { borderColor: '#003893', backgroundColor: '#00389314', color: '#003893' }
              : { borderColor: '#e5e7eb', color: '#6b7280' }
          }
        >
          <span className="text-base flex items-center justify-center" aria-hidden><IconWrench /></span>
          <span className="leading-tight">{t('nav.services')}</span>
          <span
            className="rounded-full px-1 text-[9px] font-semibold"
            style={serviciosActive ? { backgroundColor: '#00389320', color: '#003893' } : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}
          >
            &nbsp;
          </span>
        </button>
      )}
    </div>
  )
}
