import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Report } from '../types'
import { SERVICIO_CATS } from './ServicioForm'

interface Props {
  services: Report[]
  onAdd: () => void
  onSelect: (r: Report) => void
}

function SecurityNotice() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <div className="shrink-0 mx-4 mt-3 mb-1 lg:mx-auto lg:max-w-2xl lg:w-full">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex w-full items-center gap-2.5 text-left"
        >
          <span className="mt-0.5 shrink-0 text-lg">⚠️</span>
          <p className="flex-1 text-xs font-bold text-amber-800">{t('servicios_view.security_title')}</p>
          <span className="text-amber-600 text-xs">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <ul className="mt-1.5 ml-7 space-y-1 text-[11px] leading-relaxed text-amber-700">
            <li>• <strong>{t('servicios_view.security_1')}</strong></li>
            <li>• {t('servicios_view.security_2')}</li>
            <li>• {t('servicios_view.security_3')}</li>
            <li>• {t('servicios_view.security_4')}</li>
            <li>• {t('servicios_view.security_5')}</li>
            <li>• <strong>{t('servicios_view.security_6')}</strong></li>
          </ul>
        )}
      </div>
    </div>
  )
}

function catInfo(value: string): { value: string; label: string; emoji: string } {
  return SERVICIO_CATS.find((c) => c.value === value) ?? { value, label: value, emoji: '🔩' }
}

function estadoColor(estado: string) {
  return estado === 'no_disponible' ? '#9ca3af' : '#0891B2'
}

export default function ServiciosView({ services, onAdd, onSelect }: Props) {
  const { t } = useTranslation()
  const [filtro, setFiltro] = useState<string | null>(null)

  const visible = filtro ? services.filter((s) => s.tipo_centro === filtro) : services
  const usedCats = SERVICIO_CATS.filter((c) => services.some((s) => s.tipo_centro === c.value))

  return (
    <div className="flex h-full flex-col bg-gray-50">

      {/* Header */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('servicios_view.heading')}</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {services.length === 0
                ? t('servicios_view.be_first')
                : t('servicios_view.count', { count: services.length })}
            </p>
          </div>
          <button
            onClick={onAdd}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#0891B2' }}
          >
            <span>＋</span>
            <span>{t('servicios_view.offer_btn_short')}</span>
          </button>
        </div>

        {usedCats.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setFiltro(null)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                filtro === null ? 'text-white shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
              style={filtro === null ? { backgroundColor: '#0891B2', borderColor: '#0891B2' } : {}}
            >
              {t('servicios_view.filter_all')}
            </button>
            {usedCats.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFiltro(filtro === cat.value ? null : cat.value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  filtro === cat.value ? 'text-white shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                }`}
                style={filtro === cat.value ? { backgroundColor: '#0891B2', borderColor: '#0891B2' } : {}}
              >
                <span>{cat.emoji}</span>
                <span>{t(`servicio_cats.${cat.value}`)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <SecurityNotice />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-5xl opacity-40">🛠️</span>
            <div>
              <p className="font-semibold text-gray-600">
                {filtro ? t('servicios_view.no_in_cat') : t('servicios_view.no_published')}
              </p>
              <p className="mt-1 text-sm text-gray-400">{t('servicios_view.offer_cta')}</p>
            </div>
            <button
              onClick={onAdd}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#0891B2' }}
            >
              {t('servicios_view.offer_btn')}
            </button>
          </div>
        ) : (
          <div className="space-y-3 p-4 lg:mx-auto lg:max-w-2xl">
            {visible.map((s) => {
              const cat = catInfo(s.tipo_centro ?? '')
              const estadoKey = s.estado === 'no_disponible' ? 'estado.servicio.no_disponible' : 'estado.servicio.disponible'
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className="group w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md active:opacity-90"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: '#0891B2' }}
                    >
                      <span>{cat.emoji}</span>
                      <span>{t(`servicio_cats.${cat.value}`, { defaultValue: cat.label })}</span>
                    </span>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: estadoColor(s.estado) + '18',
                        color: estadoColor(s.estado),
                      }}
                    >
                      {t(estadoKey)}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-[15px] font-bold leading-snug text-gray-900">
                    {s.nombre}
                  </h3>

                  {s.zona && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <span className="text-xs">📍</span>
                      {s.zona}
                    </p>
                  )}

                  {s.descripcion && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {s.descripcion}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-50 pt-2.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {s.horario && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <span>🕐</span>
                          {s.horario}
                        </span>
                      )}
                      {s.contacto && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <span>💬</span>
                          {s.contacto}
                        </span>
                      )}
                    </div>
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5"
                      style={{ backgroundColor: '#0891B218', color: '#0891B2' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
