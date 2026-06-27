// Domain types — mirror the Supabase schema 1:1.

export type Tipo =
  | 'acopio'
  | 'hospital'
  | 'personas'
  | 'infra'
  | 'emergencia'
  | 'necesidades'
  | 'servicio'
  | 'refugio'

export type Nivel = 'urgente' | 'medio' | 'bajo' | 'disponible'

export type EstadoComun =
  | 'activo'
  | 'resuelto'
  | 'critico'
  | 'estable'
  | 'saturado'

export interface Necesidad {
  id: string
  report_id: string
  nombre: string
  nivel: Nivel
}

export interface Acepta {
  id: string
  report_id: string
  item: string
}

export interface Persona {
  id: string
  report_id: string
  foto_url: string | null
  ultima_vez_visto: string
  descripcion: string
}

export interface Paciente {
  id: string
  report_id: string
  nombre: string
  condicion: string
  fecha_ingreso: string
}

export interface HospitalLista {
  id: string
  report_id: string
  tipo: 'foto' | 'link'
  url: string
  descripcion: string | null
  created_at: string
}

export interface Report {
  id: string
  tipo: Tipo
  nombre: string
  descripcion: string
  estado: string
  lat: number
  lng: number
  foto_url: string | null
  created_at: string
  // Optional joined / category-specific extras kept loosely so a single
  // report object can carry whatever its category needs.
  horario?: string
  contacto?: string
  zona?: string
  duracion?: string
  capacidad?: string
  telefono?: string
  tipo_centro?: string
  // Datos de la localización (cuando estado === 'localizado') — quién la
  // localizó, para confirmar y dar seguimiento.
  localizado_por_nombre?: string
  localizado_por_contacto?: string
  localizado_relacion?: string
  localizado_nota?: string
  localizado_fecha?: string
  // Relations
  necesidades?: Necesidad[]
  acepta?: Acepta[]
  personas?: Persona[]
  pacientes?: Paciente[]
  listas?: HospitalLista[]
}
