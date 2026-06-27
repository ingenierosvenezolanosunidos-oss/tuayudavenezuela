import { useState } from 'react'

export interface LocalizacionData {
  localizado_por_nombre: string
  localizado_por_contacto: string
  localizado_relacion: string
  localizado_nota: string
}

interface Props {
  nombre: string
  onCancel: () => void
  onConfirm: (data: LocalizacionData) => void
}

// Formulario que aparece al marcar a una persona como Localizada. Captura los
// datos de quien la localizó, para confirmar y dar seguimiento. El contacto se
// guarda para verificación; no se muestra públicamente en la ficha.
export default function LocalizarModal({ nombre, onCancel, onConfirm }: Props) {
  const [porNombre, setPorNombre] = useState('')
  const [contacto, setContacto] = useState('')
  const [relacion, setRelacion] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState<string | null>(null)

  function confirm() {
    if (!porNombre.trim() || !contacto.trim()) {
      setError('El nombre y el contacto son obligatorios.')
      return
    }
    onConfirm({
      localizado_por_nombre: porNombre.trim(),
      localizado_por_contacto: contacto.trim(),
      localizado_relacion: relacion.trim(),
      localizado_nota: nota.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/40 md:items-center">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-panel md:max-w-md md:rounded-2xl">
        <div className="mb-1 flex items-start justify-between">
          <h2 className="text-lg font-bold text-gray-900">¿Quién la localizó?</h2>
          <button onClick={onCancel} aria-label="Cerrar" className="text-2xl leading-none text-gray-400">
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          Vas a marcar a <span className="font-semibold">{nombre}</span> como localizada.
          Deja los datos de contacto de quien la localizó para confirmar y dar seguimiento.
        </p>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Nombre <span className="text-hospital">*</span>
            </label>
            <input
              value={porNombre}
              onChange={(e) => setPorNombre(e.target.value)}
              placeholder="Nombre de quien la localizó"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Teléfono o contacto <span className="text-hospital">*</span>
            </label>
            <input
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Teléfono u otra vía de contacto"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Relación o parentesco
            </label>
            <input
              value={relacion}
              onChange={(e) => setRelacion(e.target.value)}
              placeholder="Opcional (familiar, vecino, voluntario…)"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Nota</label>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              placeholder="Opcional: dónde la vio, en qué condiciones…"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-hospital">{error}</div>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 font-semibold text-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={confirm}
            className="flex-1 rounded-xl bg-acopio py-2.5 font-semibold text-white"
          >
            ✅ Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
