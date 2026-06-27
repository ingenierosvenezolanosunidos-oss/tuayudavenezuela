import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RECAPTCHA_SECRET = Deno.env.get('RECAPTCHA_SECRET_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ESTADOS_VALIDOS = ['buscando', 'sin_contacto', 'localizado']

async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET) return true
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
  })
  const data = await res.json()
  return data.success && (data.score ?? 1) >= 0.5
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { accion, reportId, recaptchaToken, ...payload } = await req.json()

    if (!reportId || typeof reportId !== 'string') {
      return new Response(JSON.stringify({ error: 'reportId requerido' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    if (!(await verifyRecaptcha(recaptchaToken ?? ''))) {
      return new Response(JSON.stringify({ error: 'reCAPTCHA inválido' }), {
        status: 403, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    if (accion === 'estado') {
      const { estado } = payload
      if (!ESTADOS_VALIDOS.includes(estado)) {
        return new Response(JSON.stringify({ error: 'estado inválido' }), {
          status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
        })
      }
      const { error } = await sb
        .from('reports')
        .update({ estado })
        .eq('id', reportId)
        .eq('tipo', 'personas')
      if (error) throw error

    } else if (accion === 'localizada') {
      const { nombre, contacto, relacion, nota } = payload
      const { error } = await sb
        .from('reports')
        .update({
          estado: 'localizado',
          localizado_por_nombre: nombre ?? null,
          localizado_por_contacto: contacto ?? null,
          localizado_relacion: relacion ?? null,
          localizado_nota: nota ?? null,
          localizado_fecha: new Date().toISOString().slice(0, 10),
        })
        .eq('id', reportId)
        .eq('tipo', 'personas')
      if (error) throw error

    } else {
      return new Response(JSON.stringify({ error: 'accion inválida' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
