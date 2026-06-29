import type { Tipo } from './types'

export interface LayerDef {
  id: Tipo
  label: string
  short: string
  color: string
  // Single emoji used inside the map marker / list icon. Keeps bundle tiny —
  // no icon font or SVG sprite needed.
  glyph: string
  descripcion: string
}

export const LAYERS: LayerDef[] = [
  {
    id: 'acopio',
    label: 'Centros de acopio',
    short: 'Acopio',
    color: '#059669',   // esmeralda
    glyph: '📦',
    descripcion: 'Lugares que reciben y distribuyen donaciones',
  },
  {
    id: 'hospital',
    label: 'Hospitales',
    short: 'Hospitales',
    color: '#2563EB',   // azul
    glyph: '🏥',
    descripcion: 'Centros de salud y pacientes reportados',
  },
  {
    id: 'personas',
    label: 'Personas buscadas',
    short: 'Personas',
    color: '#EA580C',   // naranja — se mantiene, es suficientemente distinto
    glyph: '🧑',
    descripcion: 'Personas desaparecidas o buscadas',
  },
  {
    id: 'emergencia',
    label: 'Emergencias',
    short: 'Emergencias',
    color: '#EAB308',   // amarillo
    glyph: '🚨',
    descripcion: 'Incidentes activos y fallas de servicios',
  },
  {
    id: 'necesidades',
    label: 'Necesidades por zona',
    short: 'Necesidades',
    color: '#7C3AED',   // violeta
    glyph: '🟣',
    descripcion: 'Zonas con mayor necesidad de ayuda',
  },
  {
    id: 'servicio',
    label: 'Servicios ofrecidos',
    short: 'Servicios',
    color: '#059669',
    glyph: '🛠️',
    descripcion: 'Personas y grupos ofreciendo sus servicios',
  },
  {
    id: 'refugio',
    label: 'Refugios',
    short: 'Refugios',
    color: '#A16207',   // marrón claro
    glyph: '🏠',
    descripcion: 'Espacios de acogida y refugio temporal',
  },
]

export const REFUGIO_ESTADOS: EstadoDef[] = [
  { value: 'abierto', label: 'Abierto', color: '#1D9E75' },
  { value: 'lleno', label: 'Lleno', color: '#BA7517' },
  { value: 'cerrado', label: 'Cerrado', color: '#E24B4A' },
]

export const REFUGIO_ESTADO_BY_VALUE: Record<string, EstadoDef> =
  REFUGIO_ESTADOS.reduce(
    (acc, e) => { acc[e.value] = e; return acc },
    {} as Record<string, EstadoDef>,
  )

export const LAYER_BY_ID: Record<Tipo, LayerDef> = LAYERS.reduce(
  (acc, l) => {
    acc[l.id] = l
    return acc
  },
  {} as Record<Tipo, LayerDef>,
)
// Legacy infra records from the DB display under the unified emergencia layer.
LAYER_BY_ID['infra'] = LAYER_BY_ID['emergencia']

export const NIVEL_COLOR: Record<string, string> = {
  urgente: '#E24B4A',
  medio: '#BA7517',
  bajo: '#1D9E75',
  disponible: '#1D9E75',
}

export const NIVEL_LABEL: Record<string, string> = {
  urgente: 'Urgente',
  medio: 'Medio',
  bajo: 'Bajo',
  disponible: 'Disponible',
}

// Estados para personas buscadas — inspirado en las categorías que maneja
// desaparecidosterremotovenezuela.com (en búsqueda / sin contacto / localizada).
export interface EstadoDef {
  value: string
  label: string
  color: string
}

export const PERSONA_ESTADOS: EstadoDef[] = [
  { value: 'buscando', label: 'En búsqueda', color: '#BA7517' },
  { value: 'sin_contacto', label: 'Sin contacto', color: '#E24B4A' },
  { value: 'localizado', label: 'Localizada', color: '#1D9E75' },
]

export const PERSONA_ESTADO_BY_VALUE: Record<string, EstadoDef> =
  PERSONA_ESTADOS.reduce(
    (acc, e) => {
      acc[e.value] = e
      return acc
    },
    {} as Record<string, EstadoDef>,
  )

// Estado operativo de centros de salud — patrón de hospitalesenvenezuela.com.
export const HOSPITAL_ESTADOS: EstadoDef[] = [
  { value: 'abierto', label: 'Abierto', color: '#1D9E75' },
  { value: 'saturado', label: 'Saturado', color: '#BA7517' },
  { value: 'cerrado', label: 'Cerrado', color: '#E24B4A' },
  { value: 'sin_reporte', label: 'Sin reporte', color: '#6B7280' },
]

export const HOSPITAL_ESTADO_BY_VALUE: Record<string, EstadoDef> =
  HOSPITAL_ESTADOS.reduce(
    (acc, e) => {
      acc[e.value] = e
      return acc
    },
    {} as Record<string, EstadoDef>,
  )

export const HOSPITAL_TIPOS = [
  'Hospital',
  'Clínica',
  'Ambulatorio',
  'CDI',
  'Maternidad',
  'Otro',
]

export const HOSPITAL_NECESIDADES_PRESET = [
  'Medicamentos básicos',
  'Sangre (especificar tipo)',
  'Oxígeno',
  'Insumos (jeringas, guantes, etc.)',
  'Personal médico',
  'Alimentos para pacientes',
  'Agua',
  'Generador / Electricidad',
  'Equipos médicos',
]

