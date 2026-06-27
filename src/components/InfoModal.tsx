import { useState } from 'react'
import { TELEFONOS_EMERGENCIA, PRIMERAS_HORAS, PLATAFORMAS_AYUDA } from '../data/recursos'

interface Props {
  onClose: () => void
}

type Tab = 'telefonos' | 'guia' | 'plataformas'

export default function InfoModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('telefonos')

  return (
    <div className="fixed inset-0 z-[1100] flex flex-col bg-white md:items-center md:justify-center md:bg-black/40">
      <div className="flex h-full w-full flex-col bg-white md:h-auto md:max-h-[88vh] md:max-w-lg md:rounded-2xl md:shadow-panel">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-bold text-gray-900">Ayuda y emergencias</h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none text-gray-400">
            ✕
          </button>
        </header>

        <div className="flex border-b">
          <TabBtn active={tab === 'telefonos'} onClick={() => setTab('telefonos')}>
            📞 Teléfonos
          </TabBtn>
          <TabBtn active={tab === 'guia'} onClick={() => setTab('guia')}>
            🧭 Primeras horas
          </TabBtn>
          <TabBtn active={tab === 'plataformas'} onClick={() => setTab('plataformas')}>
            🌐 Plataformas
          </TabBtn>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {tab === 'telefonos' && (
            <div className="space-y-5">
              {TELEFONOS_EMERGENCIA.map((g) => (
                <div key={g.titulo}>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                    {g.titulo}
                  </h3>
                  <ul className="space-y-2">
                    {g.items.map((t) => (
                      <li key={t.nombre}>
                        <a
                          href={`tel:${t.numero.replace(/[^\d*+]/g, '')}`}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-card active:bg-gray-50"
                        >
                          <span className="text-sm font-medium text-gray-800">{t.nombre}</span>
                          <span className="font-bold text-brand">{t.numero}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-xs text-gray-400">
                Toca un número para llamar. Disponible sin conexión.
              </p>
            </div>
          )}

          {tab === 'guia' && (
            <ol className="space-y-3">
              {PRIMERAS_HORAS.map((p, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">{p.titulo}</div>
                    <div className="text-sm text-gray-600">{p.detalle}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {tab === 'plataformas' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Iniciativas ciudadanas de ayuda para Venezuela. No son organismos oficiales.
              </p>
              {PLATAFORMAS_AYUDA.map((p) => (
                <a
                  key={p.nombre}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-card transition-colors hover:border-brand/30 hover:bg-brand-tint active:bg-gray-50"
                >
                  <span className="mt-0.5 text-2xl">{p.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900">{p.nombre}</div>
                    <div className="text-sm text-gray-500">{p.descripcion}</div>
                    <div className="mt-1 text-xs font-medium text-brand">{p.url.replace('https://', '')}</div>
                  </div>
                  <span className="mt-1 text-gray-400 text-sm">↗</span>
                </a>
              ))}
              <p className="text-xs text-gray-400">
                Estas plataformas son iniciativas independientes y no sustituyen a los servicios de emergencia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 border-b-2 py-2.5 text-sm font-semibold transition-colors ${
        active ? 'border-brand text-brand' : 'border-transparent text-gray-500'
      }`}
    >
      {children}
    </button>
  )
}
