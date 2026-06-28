import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RECAPTCHA_SECRET = Deno.env.get('RECAPTCHA_SECRET_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Updates an existing report and its relations. Writes use the service_role_key
// because RLS blocks INSERT/UPDATE/DELETE from the client (anon = SELECT only).
//
// Relations are replaced (delete + insert) ONLY when the field is present in the
// payload. The edit form preloads necesidades/acepta/pacientes, so replacing
// them is safe. It does NOT preload hospital_listas, so those are intentionally
// left untouched to avoid wiping existing lists on every edit.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const body = await req.json()
    const { recaptchaToken, id, ...draft } = body

    if (!id) {
      return new Response(JSON.stringify({ error: 'id requerido' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Verify reCAPTCHA only when secret is configured
    if (RECAPTCHA_SECRET) {
      const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${RECAPTCHA_SECRET}&response=${recaptchaToken ?? ''}`,
      })
      const data = await res.json()
      const score: number = data.score ?? 1
      if (!data.success || score < 0.5) {
        const detail = {
          error: 'reCAPTCHA inválido',
          success: data.success,
          score: data.score,
          action: data.action,
          'error-codes': data['error-codes'] ?? null,
        }
        return new Response(JSON.stringify(detail), {
          status: 403,
          headers: { ...CORS, 'Content-Type': 'application/json' },
        })
      }
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // ── Update scalar fields on the report row ─────────────────
    const { data: updated, error: updateErr } = await sb
      .from('reports')
      .update({
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
      .eq('id', id)
      .select()
      .single()

    if (updateErr) throw updateErr
    if (!updated) {
      return new Response(JSON.stringify({ error: 'Reporte no encontrado' }), {
        status: 404, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // ── Replace relational data (delete + insert) ──────────────
    if (draft.necesidades !== undefined) {
      await sb.from('necesidades').delete().eq('report_id', id)
      if (draft.necesidades.length > 0) {
        const { error } = await sb.from('necesidades').insert(
          draft.necesidades.map((n: { nombre: string; nivel: string }) => ({
            report_id: id, nombre: n.nombre, nivel: n.nivel,
          })),
        )
        if (error) throw error
      }
    }

    if (draft.acepta !== undefined) {
      await sb.from('acepta').delete().eq('report_id', id)
      if (draft.acepta.length > 0) {
        const { error } = await sb.from('acepta').insert(
          draft.acepta.map((item: string) => ({ report_id: id, item })),
        )
        if (error) throw error
      }
    }

    if (draft.ultima_vez_visto !== undefined) {
      await sb.from('personas').delete().eq('report_id', id)
      const { error } = await sb.from('personas').insert({
        report_id: id,
        ultima_vez_visto: draft.ultima_vez_visto ?? '',
        descripcion: draft.descripcion,
        foto_url: draft.foto_url ?? null,
      })
      if (error) throw error
    }

    if (draft.pacientes !== undefined) {
      await sb.from('pacientes').delete().eq('report_id', id)
      if (draft.pacientes.length > 0) {
        const { error } = await sb.from('pacientes').insert(
          draft.pacientes.map((p: { nombre: string; fecha_ingreso: string }) => ({
            report_id: id, nombre: p.nombre, condicion: '', fecha_ingreso: p.fecha_ingreso || null,
          })),
        )
        if (error) throw error
      }
    }

    return new Response(JSON.stringify(updated), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
