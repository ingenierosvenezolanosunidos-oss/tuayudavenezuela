import { useState } from 'react'
import type { Nivel, Report, Tipo } from '../types'
import { LAYERS, PERSONA_ESTADOS, HOSPITAL_ESTADOS, HOSPITAL_TIPOS, HOSPITAL_NECESIDADES_PRESET, REFUGIO_ESTADOS } from '../layers'
import { submitReport, type DraftReport } from '../lib/submit'
import LocationPicker from './LocationPicker'

interface Props {
  onClose: () => void
  onCreated: (r: Report) => void
  initialTipo?: Tipo
}

const NIVELES: Nivel[] = ['urgente', 'medio', 'bajo', 'disponible']

const emptyNeed = () => ({ nombre: '', nivel: 'medio' as Nivel })
const emptyPaciente = () => ({ nombre: '', fecha_ingreso: '' })
type ListaDraft = { tipo: 'foto'; file: File; preview: string; descripcion: string } | { tipo: 'link'; url: string; descripcion: string }

// Excluded from the type selector — each has its own dedicated form or is legacy
const EXCLUDED_TIPOS: Tipo[] = ['servicio', 'infra']

// Unified subcategories for Emergencias + Infraestructura
export const EMERGENCIA_CATS = [
  // Emergencias activas
  { value: 'incendio',     label: 'Incendio',               emoji: '🔥', group: 'Emergencias activas' },
  { value: 'derrumbe',    label: 'Derrumbe / Desplome',     emoji: '🏗️', group: 'Emergencias activas' },
  { value: 'gas',         label: 'Escape de gas',           emoji: '💨', group: 'Emergencias activas' },
  { value: 'inundacion',  label: 'Inundación',              emoji: '🌊', group: 'Emergencias activas' },
  { value: 'accidente',   label: 'Accidente vial',          emoji: '🚗', group: 'Emergencias activas' },
  { value: 'inseguridad', label: 'Inseguridad / Violencia', emoji: '🔫', group: 'Emergencias activas' },
  // Infraestructura caída
  { value: 'sin_luz',     label: 'Corte de luz',            emoji: '⚡', group: 'Infraestructura' },
  { value: 'sin_agua',    label: 'Corte de agua',           emoji: '💧', group: 'Infraestructura' },
  { value: 'sin_señal',   label: 'Sin señal telefónica',    emoji: '📵', group: 'Infraestructura' },
  { value: 'sin_datos',   label: 'Sin datos móviles',       emoji: '📶', group: 'Infraestructura' },
  { value: 'sin_internet',label: 'Sin internet / Cable',    emoji: '🌐', group: 'Infraestructura' },
  { value: 'via_dañada',  label: 'Vía bloqueada / dañada',  emoji: '🚧', group: 'Infraestructura' },
] as const

const EMERGENCIA_GROUPS = ['Emergencias activas', 'Infraestructura'] as const

export default function ReportForm({ onClose, onCreated, initialTipo = 'acopio' }: Props) {
  const [tipo, setTipo] = useState<Tipo>(initialTipo)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  const [horario, setHorario] = useState('')
  const [contacto, setContacto] = useState('')
  const [zona, setZona] = useState('')
  const [duracion, setDuracion] = useState('')
  const [capacidad, setCapacidad] = useState('')
  const [telefono, setTelefono] = useState('')
  const [tipoCentro, setTipoCentro] = useState<string>(HOSPITAL_TIPOS[0])
  const [hospitalEstado, setHospitalEstado] = useState('abierto')
  const [refugioEstado, setRefugioEstado] = useState('abierto')
  const [emergenciaCat, setEmergenciaCat] = useState<string>(EMERGENCIA_CATS[0].value)
  const [ultimaVez, setUltimaVez] = useState('')
  const [personaEstado, setPersonaEstado] = useState('buscando')
  const [necesidades, setNecesidades] = useState([emptyNeed()])
  const [aceptaText, setAceptaText] = useState('')
  const [pacientes, setPacientes] = useState([emptyPaciente()])
  const [listas, setListas] = useState<ListaDraft[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFoto(f)
    setFotoPreview(f ? URL.createObjectURL(f) : null)
  }

  function pickEmergenciaCat(value: string) {
    setEmergenciaCat(value)
    // Auto-fill nombre if still empty
    const cat = EMERGENCIA_CATS.find((c) => c.value === value)
    if (cat && !nombre.trim()) setNombre(cat.label)
  }

  const showNeeds = tipo === 'acopio' || tipo === 'necesidades' || tipo === 'hospital'
  const showAcepta = tipo === 'acopio'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!nombre.trim()) return setError('Indica un nombre o título.')
    if (lat == null) return setError('Marca la ubicación en el mapa.')

    const estado =
      tipo === 'personas' ? personaEstado
      : tipo === 'hospital' ? hospitalEstado
      : tipo === 'refugio' ? refugioEstado
      : 'activo'

    const draft: DraftReport = {
      tipo,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      estado,
      lat,
      lng: lng!,
      foto,
      horario: horario || undefined,
      contacto: contacto || undefined,
      zona: zona || undefined,
      duracion: duracion || undefined,
      capacidad: capacidad || undefined,
      telefono: tipo === 'hospital' ? telefono || undefined : undefined,
      tipo_centro:
        tipo === 'hospital' ? tipoCentro
        : tipo === 'emergencia' ? emergenciaCat
        : undefined,
      ultima_vez_visto: tipo === 'personas' ? ultimaVez || undefined : undefined,
      necesidades: showNeeds
        ? necesidades.filter((n) => n.nombre.trim()).map((n) => ({ ...n, nombre: n.nombre.trim() }))
        : undefined,
      acepta: showAcepta
        ? aceptaText.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
      pacientes:
        tipo === 'hospital'
          ? pacientes.filter((p) => p.nombre.trim()).map((p) => ({
              nombre: p.nombre.trim(),
              fecha_ingreso: p.fecha_ingreso,
            }))
          : undefined,
      listas:
        tipo === 'hospital' && listas.length > 0
          ? listas.map((l) =>
              l.tipo === 'foto'
                ? { tipo: 'foto' as const, file: l.file, descripcion: l.descripcion || undefined }
                : { tipo: 'link' as const, url: l.url, descripcion: l.descripcion || undefined },
            )
          : undefined,
    }

    setSubmitting(true)
    try {
      const created = await submitReport(draft)
      onCreated(created)
    } catch (err) {
      setError('No se pudo enviar. Intenta de nuevo.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const activeLayer = LAYERS.find((l) => l.id === tipo)

  return (
    <div className="fixed inset-0 z-[1100] flex flex-col bg-white md:items-center md:justify-center md:bg-black/40">
      <div className="flex h-full w-full flex-col bg-white md:h-auto md:max-h-[92vh] md:max-w-lg md:rounded-2xl md:shadow-2xl">

        <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            {activeLayer && (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg"
                style={{ backgroundColor: activeLayer.color + '18' }}
              >
                {activeLayer.glyph}
              </span>
            )}
            <h2 className="text-lg font-bold text-gray-900">Crear publicación</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none text-gray-400 hover:text-gray-600">✕</button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <p className="flex items-start gap-2 rounded-xl border border-brand-tint bg-brand-tint px-3 py-2 text-xs text-brand-dark">
            <span aria-hidden>🔒</span>
            Publicación 100% anónima. No pedimos nombre, teléfono ni cuenta.
          </p>

          {/* ── Tipo ── */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Tipo de publicación</label>
            <div className="grid grid-cols-4 gap-2">
              {LAYERS.filter((l) => !EXCLUDED_TIPOS.includes(l.id)).map((l) => (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => setTipo(l.id)}
                  className="flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center text-[11px] font-semibold transition-all"
                  style={
                    tipo === l.id
                      ? { borderColor: l.color, backgroundColor: l.color + '14', color: l.color }
                      : { borderColor: '#e5e7eb', color: '#6b7280' }
                  }
                >
                  <span className="text-xl" aria-hidden>{l.glyph}</span>
                  <span className="leading-tight">{l.short}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Emergencias e Infraestructura — subcategoría ── */}
          {tipo === 'emergencia' && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">¿Qué está pasando?</label>
              {EMERGENCIA_GROUPS.map((group) => (
                <div key={group} className="mb-3">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{group}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {EMERGENCIA_CATS.filter((c) => c.group === group).map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => pickEmergenciaCat(cat.value)}
                        className="flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center text-[11px] font-semibold transition-all"
                        style={
                          emergenciaCat === cat.value
                            ? { borderColor: '#E24B4A', backgroundColor: '#E24B4A14', color: '#E24B4A' }
                            : { borderColor: '#e5e7eb', color: '#6b7280' }
                        }
                      >
                        <span className="text-xl">{cat.emoji}</span>
                        <span className="leading-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Nombre / título ── */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              {tipo === 'personas' ? 'Nombre de la persona' : 'Título'}
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
              placeholder={
                tipo === 'personas' ? 'Ej: María González'
                : tipo === 'refugio' ? 'Ej: Refugio Iglesia San José'
                : tipo === 'emergencia' ? 'Ej: Incendio edificio Los Palos Grandes'
                : 'Ej: Centro de acopio Chacao'
              }
            />
          </div>

          {/* ── Descripción ── */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
              placeholder={
                tipo === 'emergencia'
                  ? 'Detalla la situación: dirección, intensidad, personas afectadas…'
                  : 'Describe la situación con el mayor detalle posible.'
              }
            />
          </div>

          {/* ── Campos por tipo ── */}

          {tipo === 'acopio' && (
            <>
              <Text label="Horario" value={horario} onChange={setHorario} placeholder="Lun a Sáb, 8:00 - 17:00" />
              <Text label="Contacto (sin datos personales)" value={contacto} onChange={setContacto} placeholder="Ej: Parroquia San José" />
            </>
          )}

          {tipo === 'hospital' && (
            <>
              <EstadoGrid label="Estado operativo" estados={HOSPITAL_ESTADOS} value={hospitalEstado} onChange={setHospitalEstado} />
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Tipo de centro</label>
                <select value={tipoCentro} onChange={(e) => setTipoCentro(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
                  {HOSPITAL_TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Text label="Capacidad / estado" value={capacidad} onChange={setCapacidad} placeholder="Ej: UCI al 90%, emergencias abiertas" />
              <Text label="Teléfono" value={telefono} onChange={setTelefono} placeholder="Ej: 0212-555-1234" />
              <Text label="Contacto" value={contacto} onChange={setContacto} placeholder="Ej: Emergencias piso 1" />
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Pacientes reportados</label>
                <p className="mb-2 text-xs text-gray-500">Solo lo necesario. No incluyas datos sensibles.</p>
                <div className="space-y-3">
                  {pacientes.map((p, i) => (
                    <div key={i} className="space-y-2 rounded-xl border border-gray-200 p-3">
                      <input value={p.nombre} onChange={(e) => { const c = [...pacientes]; c[i] = { ...c[i], nombre: e.target.value }; setPacientes(c) }} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Nombre o referencia" />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Ingreso</label>
                        <input type="date" value={p.fecha_ingreso} onChange={(e) => { const c = [...pacientes]; c[i] = { ...c[i], fecha_ingreso: e.target.value }; setPacientes(c) }} className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                        {pacientes.length > 1 && <button type="button" onClick={() => setPacientes(pacientes.filter((_, j) => j !== i))} className="text-sm text-red-500">Quitar</button>}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setPacientes([...pacientes, emptyPaciente()])} className="mt-2 text-sm font-medium text-brand">+ Agregar paciente</button>
              </div>
              {/* Listas de personas: fotos de pizarras/listas físicas o links */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Listas de personas</label>
                <p className="mb-2 text-xs text-gray-500">Sube fotos de listas físicas o agrega links (Google Docs, Drive, etc.).</p>
                <div className="space-y-2">
                  {listas.map((l, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-2">
                      {l.tipo === 'foto' ? (
                        <>
                          <img src={l.preview} alt="Lista" className="h-32 w-full rounded-lg object-cover" />
                        </>
                      ) : (
                        <input
                          value={l.url}
                          onChange={(e) => { const c = [...listas]; (c[i] as { tipo: 'link'; url: string; descripcion: string }).url = e.target.value; setListas(c) }}
                          className="w-full rounded-lg border px-3 py-2 text-sm"
                          placeholder="https://docs.google.com/..."
                        />
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          value={l.descripcion}
                          onChange={(e) => { const c = [...listas]; c[i] = { ...c[i], descripcion: e.target.value }; setListas(c) }}
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                          placeholder="Descripción opcional (ej: Lista UCI piso 3)"
                        />
                        <button type="button" onClick={() => setListas(listas.filter((_, j) => j !== i))} className="text-sm text-red-500">Quitar</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-3">
                  <label className="cursor-pointer text-sm font-medium text-brand">
                    + Foto de lista
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      setListas([...listas, { tipo: 'foto', file: f, preview: URL.createObjectURL(f), descripcion: '' }])
                      e.target.value = ''
                    }} />
                  </label>
                  <button type="button" className="text-sm font-medium text-brand" onClick={() => setListas([...listas, { tipo: 'link', url: '', descripcion: '' }])}>
                    + Link a lista
                  </button>
                </div>
              </div>
            </>
          )}

          {tipo === 'refugio' && (
            <>
              <EstadoGrid label="Estado del refugio" estados={REFUGIO_ESTADOS} value={refugioEstado} onChange={setRefugioEstado} />
              <Text label="Capacidad" value={capacidad} onChange={setCapacidad} placeholder="Ej: 50 personas" />
              <Text label="Zona / Dirección referencial" value={zona} onChange={setZona} placeholder="Ej: El Valle, frente al mercado" />
              <Text label="Horario de atención" value={horario} onChange={setHorario} placeholder="Ej: 24 horas · Solo nocturno" />
              <Text label="Contacto" value={contacto} onChange={setContacto} placeholder="Ej: 0212-555-1234 · @usuario" />
            </>
          )}

          {tipo === 'emergencia' && (
            <>
              <Text label="Zona afectada" value={zona} onChange={setZona} placeholder="Ej: Petare, calle 4 con avenida principal" />
              <Text label="Duración / desde cuándo" value={duracion} onChange={setDuracion} placeholder="Ej: Desde las 3am · Más de 6 horas" />
              <Text label="Contacto o referencia" value={contacto} onChange={setContacto} placeholder="Ej: Bomberos ya fueron avisados" />
            </>
          )}

          {tipo === 'personas' && (
            <>
              <EstadoGrid label="Estado" estados={PERSONA_ESTADOS} value={personaEstado} onChange={setPersonaEstado} />
              <Text label="Última vez vista" value={ultimaVez} onChange={setUltimaVez} placeholder="Lugar y hora aproximada" />
            </>
          )}

          {tipo === 'necesidades' && (
            <Text label="Zona" value={zona} onChange={setZona} placeholder="Ej: Catia" />
          )}

          {showAcepta && (
            <Text label="Donaciones que aceptan (separar por comas)" value={aceptaText} onChange={setAceptaText} placeholder="Agua, alimentos, medicinas" />
          )}

          {showNeeds && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Necesidades</label>
              {tipo === 'hospital' && (
                <div className="mb-3">
                  <p className="mb-2 text-xs text-gray-500">Selecciona las más comunes o agrega otras abajo.</p>
                  <div className="flex flex-wrap gap-2">
                    {HOSPITAL_NECESIDADES_PRESET.map((preset) => {
                      const active = necesidades.some((n) => n.nombre === preset)
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            if (active) {
                              setNecesidades(necesidades.filter((n) => n.nombre !== preset))
                            } else {
                              setNecesidades([...necesidades.filter((n) => n.nombre.trim()), { nombre: preset, nivel: 'urgente' }])
                            }
                          }}
                          className="rounded-full border px-3 py-1 text-xs font-medium transition-all"
                          style={active
                            ? { borderColor: '#E24B4A', backgroundColor: '#E24B4A14', color: '#E24B4A' }
                            : { borderColor: '#e5e7eb', color: '#6b7280' }
                          }
                        >
                          {preset}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {necesidades.map((n, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={n.nombre} onChange={(e) => { const c = [...necesidades]; c[i] = { ...c[i], nombre: e.target.value }; setNecesidades(c) }} className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder={tipo === 'hospital' ? 'Ej: Desfibrilador' : 'Ej: Agua potable'} />
                    <select value={n.nivel} onChange={(e) => { const c = [...necesidades]; c[i] = { ...c[i], nivel: e.target.value as Nivel }; setNecesidades(c) }} className="rounded-xl border border-gray-200 px-2 py-2 text-sm">
                      {NIVELES.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                    {necesidades.length > 1 && <button type="button" onClick={() => setNecesidades(necesidades.filter((_, j) => j !== i))} className="text-sm text-red-500">✕</button>}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setNecesidades([...necesidades, emptyNeed()])} className="mt-2 text-sm font-medium text-brand">+ Agregar necesidad</button>
            </div>
          )}

          {/* ── Foto ── */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Foto (opcional)</label>
            <input type="file" accept="image/*" capture="environment" onChange={onFile} className="text-sm" />
            {fotoPreview && <img src={fotoPreview} alt="Vista previa" className="mt-2 h-40 w-full rounded-xl object-cover" />}
          </div>

          {/* ── Ubicación ── */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Ubicación</label>
            <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln) }} />
          </div>

          {error && <div className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}
        </form>

        <footer className="shrink-0 border-t px-4 py-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-brand py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {submitting ? 'Publicando…' : '＋ Crear'}
          </button>
        </footer>
      </div>
    </div>
  )
}

function Text({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none" />
    </div>
  )
}

function EstadoGrid({ label, estados, value, onChange }: { label: string; estados: { value: string; label: string; color: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <div className={`grid gap-2 ${estados.length <= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {estados.map((e) => (
          <button type="button" key={e.value} onClick={() => onChange(e.value)}
            className="rounded-xl border px-2 py-2.5 text-sm font-semibold transition-all"
            style={value === e.value
              ? { borderColor: e.color, backgroundColor: e.color + '14', color: e.color }
              : { borderColor: '#e5e7eb', color: '#6b7280' }
            }
          >
            {e.label}
          </button>
        ))}
      </div>
    </div>
  )
}
