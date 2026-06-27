-- tuAyudaVenezuela — Supabase schema
-- Anonymous submissions go through Edge Functions (reCAPTCHA-gated).
-- RLS: public SELECT only — no direct INSERT/UPDATE/DELETE from the client.
-- All writes use the service_role_key inside Edge Functions.

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('acopio','hospital','personas','infra','emergencia','necesidades','servicio','refugio')),
  nombre text not null check (char_length(nombre) between 1 and 300),
  descripcion text check (descripcion is null or char_length(descripcion) <= 2000),
  estado text default 'activo' check (char_length(estado) <= 50),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  foto_url text check (foto_url is null or char_length(foto_url) <= 500),
  -- category extras
  horario text check (horario is null or char_length(horario) <= 300),
  contacto text check (contacto is null or char_length(contacto) <= 300),
  zona text check (zona is null or char_length(zona) <= 300),
  duracion text check (duracion is null or char_length(duracion) <= 200),
  capacidad text check (capacidad is null or char_length(capacidad) <= 200),
  telefono text check (telefono is null or char_length(telefono) <= 50),
  tipo_centro text check (tipo_centro is null or char_length(tipo_centro) <= 100),
  localizado_por_nombre text check (localizado_por_nombre is null or char_length(localizado_por_nombre) <= 300),
  localizado_por_contacto text check (localizado_por_contacto is null or char_length(localizado_por_contacto) <= 300),
  localizado_relacion text check (localizado_relacion is null or char_length(localizado_relacion) <= 100),
  localizado_nota text check (localizado_nota is null or char_length(localizado_nota) <= 1000),
  localizado_fecha date,
  created_at timestamptz not null default now()
);

create table if not exists necesidades (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 150),
  nivel text not null check (nivel in ('urgente','medio','bajo','disponible'))
);

create table if not exists acepta (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  item text not null check (char_length(item) between 1 and 150)
);

create table if not exists personas (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  foto_url text check (foto_url is null or char_length(foto_url) <= 500),
  ultima_vez_visto text check (ultima_vez_visto is null or char_length(ultima_vez_visto) <= 300),
  descripcion text check (descripcion is null or char_length(descripcion) <= 2000)
);

create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  nombre text check (nombre is null or char_length(nombre) <= 300),
  condicion text check (condicion is null or char_length(condicion) <= 300),
  fecha_ingreso date
);

create table if not exists hospital_listas (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  tipo text not null check (tipo in ('foto', 'link')),
  url text not null check (char_length(url) between 1 and 500),
  descripcion text check (descripcion is null or char_length(descripcion) <= 300),
  created_at timestamptz not null default now()
);

-- Reportes de contenido (moderación): write-only desde el cliente.
create table if not exists reportes_abuso (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  motivo text not null check (char_length(motivo) <= 100),
  detalle text check (detalle is null or char_length(detalle) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists idx_reports_tipo on reports(tipo);
create index if not exists idx_abuso_report on reportes_abuso(report_id);
create index if not exists idx_reports_created on reports(created_at desc);
create index if not exists idx_necesidades_report on necesidades(report_id);
create index if not exists idx_acepta_report on acepta(report_id);
create index if not exists idx_personas_report on personas(report_id);
create index if not exists idx_pacientes_report on pacientes(report_id);
create index if not exists idx_hospital_listas_report on hospital_listas(report_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- SELECT is public. INSERT/UPDATE/DELETE are blocked from the client —
-- all writes go through Edge Functions using the service_role_key.

alter table reports enable row level security;
alter table necesidades enable row level security;
alter table acepta enable row level security;
alter table personas enable row level security;
alter table pacientes enable row level security;
alter table hospital_listas enable row level security;
alter table reportes_abuso enable row level security;

do $$
declare t text;
begin
  foreach t in array array['reports','necesidades','acepta','personas','pacientes','hospital_listas','reportes_abuso']
  loop
    execute format('drop policy if exists %I_select on %I;', t, t);
    execute format('drop policy if exists %I_insert on %I;', t, t);
    -- Public read on all tables except reportes_abuso (moderación interna)
    if t <> 'reportes_abuso' then
      execute format('create policy %I_select on %I for select using (true);', t, t);
    end if;
    -- NO insert policy — only service_role_key (Edge Functions) can insert
  end loop;
end $$;

-- ── Storage: fotos bucket ─────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos', 'fotos', true,
  5242880,  -- 5 MB max per file
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  file_size_limit  = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "fotos_public_read" on storage.objects;
create policy "fotos_public_read" on storage.objects
  for select using (bucket_id = 'fotos');

-- Uploads still come directly from the browser (before calling the Edge Function),
-- so the anon role needs insert on storage. Size/type limits are enforced by the
-- bucket config above.
drop policy if exists "fotos_anon_insert" on storage.objects;
create policy "fotos_anon_insert" on storage.objects
  for insert with check (bucket_id = 'fotos');

-- ── RPCs (kept for reference but no longer called from the client) ────────────
-- updatePersonaEstado and updatePersonaLocalizada now go through the
-- marcar-persona Edge Function. These RPCs can be revoked or left unused.

create or replace function marcar_persona_estado(p_report_id uuid, p_estado text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_estado not in ('buscando', 'sin_contacto', 'localizado') then
    raise exception 'estado inválido: %', p_estado;
  end if;
  update reports set estado = p_estado
  where id = p_report_id and tipo = 'personas';
end;
$$;

-- Revoke anon access — the Edge Function uses service_role_key directly.
revoke execute on function marcar_persona_estado(uuid, text) from anon;

create or replace function marcar_persona_localizada(
  p_report_id uuid, p_nombre text, p_contacto text, p_relacion text, p_nota text
)
returns void language plpgsql security definer set search_path = public as $$
begin
  update reports
    set estado = 'localizado',
        localizado_por_nombre    = p_nombre,
        localizado_por_contacto  = p_contacto,
        localizado_relacion      = p_relacion,
        localizado_nota          = p_nota,
        localizado_fecha         = current_date
  where id = p_report_id and tipo = 'personas';
end;
$$;

revoke execute on function marcar_persona_localizada(uuid, text, text, text, text) from anon;
