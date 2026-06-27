import { useState } from 'react'
import type { Report } from '../types'
import { SERVICIO_CATS } from './ServicioForm'

interface Props {
  services: Report[]
  onAdd: () => void
  onSelect: (r: Report) => void
}

function catInfo(value: string) {
  return SERVICIO_CATS.find((c) => c.value === value) ?? { label: value, emoji: '🔩' }
}

function estadoColor(estado: string) {
  return estado === 'no_disponible' ? '#9ca3af' : '#0891B2'
}
function estadoLabel(estado: string) {
  return estado === 'no_disponible' ? 'No disponible' : 'Disponible'
}

export default function ServiciosView({ services, onAdd, onSelect }: Props) {
  const [filtro, setFiltro] = useState<string | null>(null)

  const visible = filtro ? services.filter((s) => s.tipo_centro === filtro) : services

  // Only show categories that have at least one service
  const usedCats = SERVICIO_CATS.filter((c) => services.some((s) => s.tipo_centro === c.value))

  return (
    <div className="flex h-full flex-col bg-gray-50">

      {/* Header */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Servicios ofrecidos</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {services.length === 0
                ? 'Sé el primero en ofrecer un servicio'
                : `${services.length} servicio${services.length !== 1 ? 's' : ''} disponible${services.length !== 1 ? 's' : ''} en la comunidad`}
            </p>
          </div>
          <button
            onClick={onAdd}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#0891B2' }}
          >
            <span>＋</span>
            <span>Ofrecer</span>
          </button>
        </div>

        {/* Category filters */}
        {usedCats.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setFiltro(null)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                filtro === null ? 'text-white shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
              style={filtro === null ? { backgroundColor: '#0891B2', borderColor: '#0891B2' } : {}}
            >
              Todos
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
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Security alert */}
      <div className="shrink-0 mx-4 mt-3 mb-1 lg:mx-auto lg:max-w-2xl lg:w-full">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 text-lg">⚠️</span>
            <div>
              <p className="text-xs font-bold text-amber-800">Aviso de seguridad — protégete de estafas</p>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-amber-700">
                <li>• <strong>Nunca envíes dinero por adelantado</strong> a cambio de un servicio o ayuda.</li>
                <li>• Desconfía de quienes pidan pagos por transferencia, recarga o criptomonedas sin haberte conocido antes.</li>
                <li>• Verifica la identidad de la persona antes de compartir datos personales o tu ubicación exacta.</li>
                <li>• Acuerda el primer encuentro en un lugar público y con alguien de confianza presente.</li>
                <li>• Si algo parece demasiado bueno para ser verdad, probablemente no lo sea.</li>
                <li>• <strong>Esta plataforma no cobra ni avala ningún servicio.</strong> Reporta actividad sospechosa al correo de contacto.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-5xl opacity-40">🛠️</span>
            <div>
              <p className="font-semibold text-gray-600">
                {filtro ? 'No hay servicios en esta categoría' : 'No hay servicios publicados aún'}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                ¿Tienes algo que ofrecer? Publícalo y ayuda a tu comunidad.
              </p>
            </div>
            <button
              onClick={onAdd}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#0891B2' }}
            >
              Ofrecer un servicio
            </button>
          </div>
        ) : (
          <div className="space-y-3 p-4 lg:mx-auto lg:max-w-2xl">
            {visible.map((s) => {
              const cat = catInfo(s.tipo_centro ?? '')
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className="group w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md active:opacity-90"
                >
                  {/* Top row: category chip + status */}
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: '#0891B2' }}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </span>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: estadoColor(s.estado) + '18',
                        color: estadoColor(s.estado),
                      }}
                    >
                      {estadoLabel(s.estado)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-2.5 text-[15px] font-bold leading-snug text-gray-900">
                    {s.nombre}
                  </h3>

                  {/* Zone */}
                  {s.zona && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <span className="text-xs">📍</span>
                      {s.zona}
                    </p>
                  )}

                  {/* Description */}
                  {s.descripcion && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {s.descripcion}
                    </p>
                  )}

                  {/* Footer */}
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
