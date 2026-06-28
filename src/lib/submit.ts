import type { Nivel, Report, Tipo } from '../types'
import { getSupabase, SUPABASE_ENABLED, STORAGE_BUCKET, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase'
import { getRecaptchaToken } from './recaptcha'

export interface DraftReport {
  tipo: Tipo
  nombre: string
  descripcion: string
  estado: string
  lat: number
  lng: number
  foto?: File | null
  // category extras
  horario?: string
  contacto?: string
  zona?: string
  duracion?: string
  capacidad?: string
  telefono?: string
  tipo_centro?: string
  ultima_vez_visto?: string
  necesidades?: { nombre: string; nivel: Nivel }[]
  acepta?: string[]
  pacientes?: { nombre: string; fecha_ingreso: string }[]
  listas?: { tipo: 'foto' | 'link'; file?: File | null; url?: string; descripcion?: string }[]
}

async function uploadPhoto(file: File): Promise<string | null> {
  const sb = await getSupabase()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await sb.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// Submits an anonymous report. Returns the created Report so the UI can show it
// immediately. When Supabase is not configured, returns a local-only object so
// the app stays usable in demo mode.
export async function submitReport(draft: DraftReport): Promise<Report> {
  if (!SUPABASE_ENABLED) {
    return {
      id: crypto.randomUUID(),
      tipo: draft.tipo,
      nombre: draft.nombre,
      descripcion: draft.descripcion,
      estado: draft.estado || 'activo',
      lat: draft.lat,
      lng: draft.lng,
      foto_url: draft.foto ? URL.createObjectURL(draft.foto) : null,
      created_at: new Date().toISOString(),
      horario: draft.horario,
      contacto: draft.contacto,
      zona: draft.zona,
      duracion: draft.duracion,
      capacidad: draft.capacidad,
      telefono: draft.telefono,
      tipo_centro: draft.tipo_centro,
      necesidades: (draft.necesidades ?? []).map((n, i) => ({
        id: `local-n-${i}`,
        report_id: 'local',
        nombre: n.nombre,
        nivel: n.nivel,
      })),
      acepta: (draft.acepta ?? []).map((item, i) => ({
        id: `local-a-${i}`,
        report_id: 'local',
        item,
      })),
      personas: draft.ultima_vez_visto
        ? [
            {
              id: 'local-per',
              report_id: 'local',
              foto_url: draft.foto ? URL.createObjectURL(draft.foto) : null,
              ultima_vez_visto: draft.ultima_vez_visto,
              descripcion: draft.descripcion,
            },
          ]
        : [],
      pacientes: (draft.pacientes ?? []).map((p, i) => ({
        id: `local-pac-${i}`,
        report_id: 'local',
        nombre: p.nombre,
        condicion: '',
        fecha_ingreso: p.fecha_ingreso,
      })),
      listas: (draft.listas ?? []).map((l, i) => ({
        id: `local-lst-${i}`,
        report_id: 'local',
        tipo: l.tipo,
        url: l.tipo === 'foto' && l.file ? URL.createObjectURL(l.file) : (l.url ?? ''),
        descripcion: l.descripcion ?? null,
        created_at: new Date().toISOString(),
      })),
    }
  }

  // Upload photos first (client → Storage), then pass the resulting URLs to the
  // Edge Function so it never receives raw binary data.
  let foto_url: string | null = null
  if (draft.foto) foto_url = await uploadPhoto(draft.foto)

  const listasSerialized = draft.listas
    ? await Promise.all(
        draft.listas.map(async (l) => {
          const url =
            l.tipo === 'foto' && l.file ? (await uploadPhoto(l.file)) ?? '' : (l.url ?? '')
          return { tipo: l.tipo, url, descripcion: l.descripcion ?? null }
        }),
      )
    : undefined

  const recaptchaToken = await getRecaptchaToken('submit')

  // Call the Edge Function which verifies reCAPTCHA before inserting
  const fnUrl = `${SUPABASE_URL}/functions/v1/submit-report`
  const res = await fetch(fnUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({
      recaptchaToken,
      tipo: draft.tipo,
      nombre: draft.nombre,
      descripcion: draft.descripcion,
      estado: draft.estado || 'activo',
      lat: draft.lat,
      lng: draft.lng,
      foto_url,
      horario: draft.horario ?? null,
      contacto: draft.contacto ?? null,
      zona: draft.zona ?? null,
      duracion: draft.duracion ?? null,
      capacidad: draft.capacidad ?? null,
      telefono: draft.telefono ?? null,
      tipo_centro: draft.tipo_centro ?? null,
      ultima_vez_visto: draft.ultima_vez_visto ?? null,
      necesidades: draft.necesidades ?? null,
      acepta: draft.acepta ?? null,
      pacientes: draft.pacientes ?? null,
      listas: listasSerialized ?? null,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }

  return (await res.json()) as Report
}

async function callPersonaFn(body: Record<string, unknown>): Promise<void> {
  const recaptchaToken = await getRecaptchaToken('persona')
  const res = await fetch(`${SUPABASE_URL}/functions/v1/marcar-persona`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ ...body, recaptchaToken }),
  })
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    throw new Error(b.error ?? `HTTP ${res.status}`)
  }
}

export async function updatePersonaEstado(reportId: string, estado: string): Promise<void> {
  if (!SUPABASE_ENABLED) return
  await callPersonaFn({ accion: 'estado', reportId, estado })
}

export interface LocalizacionPayload {
  localizado_por_nombre: string
  localizado_por_contacto: string
  localizado_relacion: string
  localizado_nota: string
}

export async function updatePersonaLocalizada(
  reportId: string,
  data: LocalizacionPayload,
): Promise<void> {
  if (!SUPABASE_ENABLED) return
  await callPersonaFn({
    accion: 'localizada',
    reportId,
    nombre: data.localizado_por_nombre || null,
    contacto: data.localizado_por_contacto || null,
    relacion: data.localizado_relacion || null,
    nota: data.localizado_nota || null,
  })
}

// Actualiza un reporte existente (campos escalares + relaciones).
// En modo demo (sin Supabase) devuelve el reporte fusionado localmente.
export async function updateReport(id: string, draft: DraftReport, existingReport: Report): Promise<Report> {
  if (!SUPABASE_ENABLED) {
    return {
      ...existingReport,
      nombre: draft.nombre,
      descripcion: draft.descripcion,
      estado: draft.estado,
      lat: draft.lat,
      lng: draft.lng,
      horario: draft.horario,
      contacto: draft.contacto,
      zona: draft.zona,
      duracion: draft.duracion,
      capacidad: draft.capacidad,
      telefono: draft.telefono,
      tipo_centro: draft.tipo_centro,
      necesidades: (draft.necesidades ?? []).map((n, i) => ({
        id: `local-n-${i}`,
        report_id: id,
        nombre: n.nombre,
        nivel: n.nivel,
      })),
      acepta: (draft.acepta ?? []).map((item, i) => ({
        id: `local-a-${i}`,
        report_id: id,
        item,
      })),
      personas: draft.ultima_vez_visto
        ? [{
            id: existingReport.personas?.[0]?.id ?? 'local-per',
            report_id: id,
            foto_url: draft.foto ? URL.createObjectURL(draft.foto) : existingReport.personas?.[0]?.foto_url ?? null,
            ultima_vez_visto: draft.ultima_vez_visto,
            descripcion: draft.descripcion,
          }]
        : existingReport.personas ?? [],
      pacientes: (draft.pacientes ?? []).map((p, i) => ({
        id: `local-pac-${i}`,
        report_id: id,
        nombre: p.nombre,
        condicion: '',
        fecha_ingreso: p.fecha_ingreso,
      })),
    }
  }

  let foto_url: string | null = existingReport.foto_url ?? null
  if (draft.foto) foto_url = await uploadPhoto(draft.foto)

  const sb = await getSupabase()

  // Update scalar fields on the report row
  const { error: updateErr } = await sb.from('reports').update({
    nombre: draft.nombre,
    descripcion: draft.descripcion,
    estado: draft.estado,
    lat: draft.lat,
    lng: draft.lng,
    foto_url,
    horario: draft.horario ?? null,
    contacto: draft.contacto ?? null,
    zona: draft.zona ?? null,
    duracion: draft.duracion ?? null,
    capacidad: draft.capacidad ?? null,
    telefono: draft.telefono ?? null,
    tipo_centro: draft.tipo_centro ?? null,
  }).eq('id', id)
  if (updateErr) throw updateErr

  // Replace relational data (delete + insert pattern)
  if (draft.necesidades !== undefined) {
    await sb.from('necesidades').delete().eq('report_id', id)
    if (draft.necesidades.length > 0) {
      await sb.from('necesidades').insert(draft.necesidades.map(n => ({ report_id: id, nombre: n.nombre, nivel: n.nivel })))
    }
  }
  if (draft.acepta !== undefined) {
    await sb.from('acepta').delete().eq('report_id', id)
    if (draft.acepta.length > 0) {
      await sb.from('acepta').insert(draft.acepta.map(item => ({ report_id: id, item })))
    }
  }
  if (draft.ultima_vez_visto !== undefined) {
    await sb.from('personas').delete().eq('report_id', id)
    await sb.from('personas').insert({ report_id: id, ultima_vez_visto: draft.ultima_vez_visto ?? '', descripcion: draft.descripcion, foto_url })
  }
  if (draft.pacientes !== undefined) {
    await sb.from('pacientes').delete().eq('report_id', id)
    if (draft.pacientes.length > 0) {
      await sb.from('pacientes').insert(draft.pacientes.map(p => ({ report_id: id, nombre: p.nombre, fecha_ingreso: p.fecha_ingreso })))
    }
  }

  // Return merged report for immediate UI update
  return {
    ...existingReport,
    nombre: draft.nombre,
    descripcion: draft.descripcion,
    estado: draft.estado,
    lat: draft.lat,
    lng: draft.lng,
    foto_url,
    horario: draft.horario,
    contacto: draft.contacto,
    zona: draft.zona,
    duracion: draft.duracion,
    capacidad: draft.capacidad,
    telefono: draft.telefono,
    tipo_centro: draft.tipo_centro,
  }
}

// Reporta un contenido como obsceno, falso, duplicado, etc. (moderación).
// Pasa por la Edge Function para incluir reCAPTCHA y evitar spam en la tabla.
export async function reportarContenido(
  reportId: string,
  motivo: string,
  detalle: string,
): Promise<void> {
  if (!SUPABASE_ENABLED) return
  const recaptchaToken = await getRecaptchaToken('reporte_abuso')
  const res = await fetch(`${SUPABASE_URL}/functions/v1/submit-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ accion: 'reporte_abuso', reportId, motivo, detalle, recaptchaToken }),
  })
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    throw new Error(b.error ?? `HTTP ${res.status}`)
  }
}
