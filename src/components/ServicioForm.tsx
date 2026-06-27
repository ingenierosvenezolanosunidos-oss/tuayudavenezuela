import { useState } from 'react'
import type { Report } from '../types'
import { submitReport } from '../lib/submit'

interface Props {
  onClose: () => void
  onCreated: (r: Report) => void
}

export const SERVICIO_CATS = [
  { value: 'construccion', label: 'Construcción', emoji: '🔨' },
  { value: 'electricidad', label: 'Electricidad', emoji: '⚡' },
  { value: 'plomeria', label: 'Plomería', emoji: '🔧' },
  { value: 'salud', label: 'Salud', emoji: '💊' },
  { value: 'educacion', label: 'Educación', emoji: '📚' },
  { value: 'tecnologia', label: 'Tecnología', emoji: '💻' },
  { value: 'transporte', label: 'Transporte', emoji: '🚗' },
  { value: 'voluntariado', label: 'Voluntariado', emoji: '🤝' },
  { value: 'alimentos', label: 'Alimentos', emoji: '🍽️' },
  { value: 'legal', label: 'Asesoría legal', emoji: '⚖️' },
  { value: 'otro', label: 'Otro', emoji: '🔩' },
] as const

// Center of Venezuela — used as default location when user skips the map.
const VE_LAT = 8.0
const VE_LNG = -66.0

export default function ServicioForm({ onClose, onCreated }: Props) {
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState<string>(SERVICIO_CATS[0].value)
  const [descripcion, setDescripcion] = useState('')
  const [zona, setZona] = useState('')
  const [contacto, setContacto] = useState('')
  const [horario, setHorario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!nombre.trim()) return setError('Indica el nombre o título del servicio.')
    if (!zona.trim()) return setError('Indica la zona o ciudad donde ofreces el servicio.')

    setSubmitting(true)
    try {
      const created = await submitReport({
        tipo: 'servicio',
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        estado: 'disponible',
        lat: VE_LAT,
        lng: VE_LNG,
        zona: zona.trim(),
        contacto: contacto.trim() || undefined,
        horario: horario.trim() || undefined,
        tipo_centro: categoria,
      })
      onCreated(created)
    } catch (err) {
      setError('No se pudo publicar el servicio. Intenta de nuevo.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1100] flex flex-col bg-white md:items-center md:justify-center md:bg-black/40">
      <div className="flex h-full w-full flex-col bg-white md:h-auto md:max-h-[92vh] md:max-w-lg md:rounded-2xl md:shadow-2xl">

        <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ofrecer un servicio</h2>
            <p className="text-xs text-gray-500">Comparte lo que puedes hacer por tu comunidad</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none text-gray-400 hover:text-gray-600">✕</button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-4 py-4">

          <p className="flex items-start gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2.5 text-xs text-cyan-800">
            <span aria-hidden>🔒</span>
            Publicación anónima. No pedimos nombre ni cuenta. El contacto es opcional.
          </p>

          {/* Categoría */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Categoría</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {SERVICIO_CATS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategoria(cat.value)}
                  className="flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center text-xs font-medium transition-all"
                  style={
                    categoria === cat.value
                      ? { borderColor: '#0891B2', backgroundColor: '#0891B215', color: '#0891B2' }
                      : { borderColor: '#e5e7eb', color: '#6b7280' }
                  }
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              ¿Qué ofreces? <span className="text-red-500">*</span>
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Plomería, Ingeniero civil, Clases de inglés, Voluntario en salud"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#0891B2] focus:outline-none"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Describe con más detalle lo que puedes hacer, tu experiencia, condiciones, etc."
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#0891B2] focus:outline-none"
            />
          </div>

          {/* Zona */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Zona / Ciudad <span className="text-red-500">*</span>
            </label>
            <input
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Ej: Petare, Caracas · Maracaibo · Valencia"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#0891B2] focus:outline-none"
            />
          </div>

          {/* Contacto */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Contacto (opcional)</label>
            <input
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Ej: WhatsApp 0414-555-1234 · @usuario_twitter"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#0891B2] focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">No pongas datos que no quieras hacer públicos.</p>
          </div>

          {/* Disponibilidad */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Disponibilidad (opcional)</label>
            <input
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              placeholder="Ej: Fines de semana · Tardes · Inmediata"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#0891B2] focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>
          )}
        </form>

        <footer className="shrink-0 border-t px-4 py-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl py-3 font-semibold text-white shadow-sm transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#0891B2' }}
          >
            {submitting ? 'Publicando…' : '🛠️ Publicar servicio'}
          </button>
        </footer>
      </div>
    </div>
  )
}
