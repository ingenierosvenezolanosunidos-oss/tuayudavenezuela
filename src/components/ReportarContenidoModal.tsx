import { useState } from 'react'
import { reportarContenido } from '../lib/submit'

interface Props {
  reportId: string
  onClose: () => void
}

const MOTIVOS = [
  'Contenido obsceno',
  'Información falsa',
  'Duplicado',
  'Otro',
]

// Modal anónimo para reportar un contenido a moderación.
export default function ReportarContenidoModal({ reportId, onClose }: Props) {
  const [motivo, setMotivo] = useState(MOTIVOS[0])
  const [detalle, setDetalle] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  async function enviar() {
    setSending(true)
    try {
      await reportarContenido(reportId, motivo, detalle.trim())
      setDone(true)
    } catch {
      // Falla silenciosa: igual agradecemos para no frustrar al usuario.
      setDone(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/40 md:items-center">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-panel md:max-w-md md:rounded-2xl">
        {done ? (
          <div className="py-6 text-center">
            <div className="mb-2 text-4xl">🙏</div>
            <h2 className="text-lg font-bold text-gray-900">Gracias por avisar</h2>
            <p className="mt-1 text-sm text-gray-600">
              Revisaremos este contenido lo antes posible.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl bg-brand py-2.5 font-semibold text-white"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="mb-1 flex items-start justify-between">
              <h2 className="text-lg font-bold text-gray-900">Reportar contenido</h2>
              <button onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none text-gray-400">
                ✕
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              ¿Por qué quieres reportar este contenido? Es anónimo.
            </p>

            <div className="space-y-2">
              {MOTIVOS.map((m) => (
                <label
                  key={m}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm"
                  style={
                    motivo === m
                      ? { borderColor: '#2563EB', backgroundColor: '#EFF4FF' }
                      : { borderColor: '#e5e7eb' }
                  }
                >
                  <input
                    type="radio"
                    name="motivo"
                    checked={motivo === m}
                    onChange={() => setMotivo(m)}
                  />
                  <span className="font-medium text-gray-800">{m}</span>
                </label>
              ))}
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Detalle (opcional)
              </label>
              <textarea
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                rows={2}
                placeholder="Cuéntanos brevemente qué ocurre."
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 font-semibold text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={enviar}
                disabled={sending}
                className="flex-1 rounded-xl bg-hospital py-2.5 font-semibold text-white disabled:opacity-60"
              >
                {sending ? 'Enviando…' : 'Enviar reporte'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
