import { useTranslation } from 'react-i18next'
import { LAYERS } from '../layers'
import { LayerIcon } from './layerIcons'
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

// Unified green palette for every filter — light green by default, dark green
// when selected, white icon/text when selected.
const GREEN = '#059669'
const GREEN_DARK = '#047857'
const GREEN_TINT = '#ECFDF5'
const GREEN_BORDER = '#A7F3D0'

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
    const rowStyle = (on: boolean) =>
      on ? { backgroundColor: GREEN_DARK, color: '#fff' } : { color: '#374151' }
    const iconBox = (on: boolean) =>
      ({ backgroundColor: on ? 'rgba(255,255,255,.22)' : GREEN_TINT, color: on ? '#fff' : GREEN })
    const badge = (on: boolean) =>
      ({ backgroundColor: on ? 'rgba(255,255,255,.22)' : GREEN_TINT, color: on ? '#fff' : GREEN })

    return (
      <div className="flex flex-col gap-0.5">
        {onAll && (
          <button
            onClick={onAll}
            aria-pressed={allActive}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left"
            style={rowStyle(allActive)}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={iconBox(allActive)}>
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
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left"
              style={rowStyle(on)}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={iconBox(on)}>
                <LayerIcon tipo={l.id} size={17} />
              </span>
              <span className="flex-1 leading-tight">{t(`layers.${l.id}.label`)}</span>
              <span className="rounded-full px-1.5 py-0.5 text-xs font-semibold" style={badge(on)}>
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
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left"
              style={rowStyle(serviciosActive)}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={iconBox(serviciosActive)}>
                <IconWrench />
              </span>
              <span className="flex-1 leading-tight">{t('nav.services')}</span>
            </button>
          </>
        )}
      </div>
    )
  }

  /* ── GRID (mobile chips) ──── */
  const chipStyle = (on: boolean) =>
    on
      ? { borderColor: GREEN_DARK, backgroundColor: GREEN_DARK, color: '#fff' }
      : { borderColor: GREEN_BORDER, backgroundColor: GREEN_TINT, color: GREEN }
  const badgeStyle = (on: boolean) =>
    on ? { backgroundColor: 'rgba(255,255,255,.25)', color: '#fff' } : { backgroundColor: '#D1FAE5', color: GREEN }

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0)
  return (
    <div className="grid grid-cols-4 gap-2 px-3 py-2">
      {onAll && (
        <button
          onClick={onAll}
          aria-pressed={allActive}
          className="flex flex-col items-center gap-0.5 rounded-xl border px-1 py-1.5 text-center text-[10px] font-semibold transition-all"
          style={chipStyle(allActive)}
        >
          <span className="flex items-center justify-center" aria-hidden><IconGrid /></span>
          <span className="leading-tight">{t('layers.all')}</span>
          <span className="rounded-full px-1 text-[9px] font-semibold" style={badgeStyle(allActive)}>
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
            style={chipStyle(on)}
          >
            <span className="flex items-center justify-center" aria-hidden><LayerIcon tipo={l.id} size={18} /></span>
            <span className="leading-tight">{t(`layers.${l.id}.short`)}</span>
            <span className="rounded-full px-1 text-[9px] font-semibold" style={badgeStyle(on)}>
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
          style={chipStyle(serviciosActive)}
        >
          <span className="flex items-center justify-center" aria-hidden><IconWrench /></span>
          <span className="leading-tight">{t('nav.services')}</span>
          <span className="rounded-full px-1 text-[9px] font-semibold" style={badgeStyle(serviciosActive)}>
            &nbsp;
          </span>
        </button>
      )}
    </div>
  )
}
