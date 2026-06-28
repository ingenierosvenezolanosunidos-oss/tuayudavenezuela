import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RECAPTCHA_SECRET = Deno.env.get('RECAPTCHA_SECRET_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const body = await req.json()
    const { recaptchaToken, accion, ...draft } = body

    // Verify reCAPTCHA only when secret is configured
    if (RECAPTCHA_SECRET) {
      const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${RECAPTCHA_SECRET}&response=${recaptchaToken ?? ''}`,
      })
      const data = await res.json()
      const score: number = data.score ?? 1
      const codes: string[] = data['error-codes'] ?? []
      // 'browser-error' means reCAPTCHA could not run in the client environment
      // (extensions, privacy settings, network) — not a bot signal. Don't block
      // writes on it; still reject low scores and invalid/duplicate tokens.
      const couldNotVerify = codes.includes('browser-error')
      if (!couldNotVerify && (!data.success || score < 0.5)) {
        return new Response(JSON.stringify({ error: 'reCAPTCHA inválido' }), {
          status: 403,
          headers: { ...CORS, 'Content-Type': 'application/json' },
        })
      }
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // ── reporte de abuso (moderación) ──────────────────────────
    if (accion === 'reporte_abuso') {
      const { reportId, motivo, detalle } = draft
      if (!reportId || !motivo) {
        return new Response(JSON.stringify({ error: 'reportId y motivo requeridos' }), {
          status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
        })
      }
      const { error } = await sb
        .from('reportes_abuso')
        .insert({ report_id: reportId, motivo, detalle: detalle || null })
      if (error) throw error
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const { data, error } = await sb
      .from('reports')
      .insert({
        tipo: draft.tipo,
        nombre: draft.nombre,
        descripcion: draft.descripcion,
        estado: draft.estado || 'activo',
        lat: draft.lat,
        lng: draft.lng,
        foto_url: draft.foto_url ?? null,
        horario: draft.horario ?? null,
        contacto: draft.contacto ?? null,
        zona: draft.zona ?? null,
        duracion: draft.duracion ?? null,
        capacidad: draft.capacidad ?? null,
        telefono: draft.telefono ?? null,
        tipo_centro: draft.tipo_centro ?? null,
      })
      .select()
      .single()

    if (error) throw error

    const report = data
    const reportId = report.id

    if (draft.necesidades?.length) {
      await sb.from('necesidades').insert(
        draft.necesidades.map((n: { nombre: string; nivel: string }) => ({
          report_id: reportId,
          nombre: n.nombre,
          nivel: n.nivel,
        })),
      )
    }
    if (draft.acepta?.length) {
      await sb
        .from('acepta')
        .insert(draft.acepta.map((item: string) => ({ report_id: reportId, item })))
    }
    if (draft.tipo === 'personas' && draft.ultima_vez_visto) {
      await sb.from('personas').insert({
        report_id: reportId,
        foto_url: draft.foto_url ?? null,
        ultima_vez_visto: draft.ultima_vez_visto,
        descripcion: draft.descripcion,
      })
    }
    if (draft.tipo === 'hospital' && draft.pacientes?.length) {
      await sb.from('pacientes').insert(
        draft.pacientes.map((p: { nombre: string; fecha_ingreso: string }) => ({
          report_id: reportId,
          nombre: p.nombre,
          condicion: '',
          fecha_ingreso: p.fecha_ingreso || null,
        })),
      )
    }
    if (draft.tipo === 'hospital' && draft.listas?.length) {
      await sb.from('hospital_listas').insert(
        draft.listas.map((l: { tipo: string; url: string; descripcion?: string }) => ({
          report_id: reportId,
          tipo: l.tipo,
          url: l.url,
          descripcion: l.descripcion ?? null,
        })),
      )
    }

    return new Response(JSON.stringify(report), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
