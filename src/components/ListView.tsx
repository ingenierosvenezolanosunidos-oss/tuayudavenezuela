import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Report, Tipo } from '../types'
import {
  LAYER_BY_ID,
  type LayerDef,
  PERSONA_ESTADO_BY_VALUE,
  HOSPITAL_ESTADO_BY_VALUE,
} from '../layers'
import { LayerIcon } from './layerIcons'

function thumbUrl(r: Report): string | null {
  return r.foto_url ?? r.personas?.[0]?.foto_url ?? null
}

function CardImage({ report, layer }: { report: Report; layer: LayerDef }) {
  const [failed, setFailed] = useState(false)
  const src = thumbUrl(report)
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={report.nombre}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full bg-gray-100 object-contain"
      />
    )
  }
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2"
      style={{ backgroundColor: layer.color + '12' }}
    >
      <span className="opacity-50" style={{ color: layer.color }} aria-hidden>
        <LayerIcon tipo={report.tipo} size={44} strokeWidth={1.5} />
      </span>
    </div>
  )
}

function estadoBadge(r: Report) {
  if (r.tipo === 'personas') return PERSONA_ESTADO_BY_VALUE[r.estado] ?? null
  if (r.tipo === 'hospital') return HOSPITAL_ESTADO_BY_VALUE[r.estado] ?? null
  return null
}

interface Props {
  reports: Report[]
  active: Set<Tipo>
  onSelect: (r: Report) => void
}

export default function ListView({ reports, active, onSelect }: Props) {
  const { t } = useTranslation()
  const visible = reports.filter((r) => active.has(r.tipo))

  if (visible.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-gray-400 bg-white">
        {t('list_view.empty')}
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="grid grid-cols-2 gap-2.5 p-2.5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-4 xl:p-4">
        {visible.map((r) => {
          const layer = LAYER_BY_ID[r.tipo]
          const urgent = (r.necesidades ?? []).some((n) => n.nivel === 'urgente')
          const badge = estadoBadge(r)
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r)}
              className="group flex flex-col overflow-hidden rounded-xl bg-white text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md active:opacity-90 xl:rounded-2xl"
            >
              {/* Image — 16:9 */}
              <div className="relative w-full overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0">
                  <CardImage report={r} layer={layer} />
                </div>

                {/* Category chip */}
                <div className="absolute bottom-1.5 left-1.5">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow"
                    style={{ backgroundColor: layer.color }}
                  >
                    <LayerIcon tipo={r.tipo} size={12} strokeWidth={2.25} />
                    <span>{t(`layers.${layer.id}.short`)}</span>
                  </span>
                </div>

                {/* Status badges */}
                <div className="absolute right-1.5 top-1.5 flex flex-col items-end gap-1">
                  {urgent && (
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow">
                      {t('nivel.urgente')}
                    </span>
                  )}
                  {badge && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow"
                      style={{ backgroundColor: badge.color }}
                    >
                      {t(`estado.${r.tipo === 'personas' ? 'personas' : 'hospital'}.${r.estado}`, { defaultValue: badge.label })}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1 p-2.5 xl:gap-1.5 xl:p-3.5">
                <h3 className="line-clamp-2 text-[12px] font-bold leading-snug text-gray-900 group-hover:text-brand xl:text-[15px]">
                  {r.nombre}
                </h3>

                {r.zona && (
                  <p className="flex items-center gap-0.5 text-[11px] text-gray-500 xl:text-[13px]">
                    <span className="text-[10px]">📍</span>
                    <span className="line-clamp-1">{r.zona}</span>
                  </p>
                )}

                {r.descripcion && (
                  <p className="hidden line-clamp-2 text-[12px] leading-relaxed text-gray-500 sm:block xl:text-[13px]">
                    {r.descripcion}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-end pt-1">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5"
                    style={{ backgroundColor: layer.color + '18', color: layer.color }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
