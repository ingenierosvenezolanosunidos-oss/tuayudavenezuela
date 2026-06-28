import type { Report } from '../types'
import { useState } from 'react'
import {
  LAYER_BY_ID,
  NIVEL_COLOR,
  NIVEL_LABEL,
  PERSONA_ESTADOS,
  PERSONA_ESTADO_BY_VALUE,
  HOSPITAL_ESTADO_BY_VALUE,
} from '../layers'
import LocalizarModal, { type LocalizacionData } from './LocalizarModal'
import ShareBar from './ShareBar'
import ReportarContenidoModal from './ReportarContenidoModal'
import SolicitarEliminacionModal from './SolicitarEliminacionModal'

interface Props {
  report: Report | null
  onClose: () => void
  onUpdateEstado: (report: Report, estado: string) => void
  onLocalizar: (report: Report, data: LocalizacionData) => void
  onEdit: (report: Report) => void
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="mb-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="text-sm text-gray-800">{value}</div>
    </div>
  )
}

function NeedsList({ report }: { report: Report }) {
  const needs = report.necesidades ?? []
  if (needs.length === 0) return null
  return (
    <div className="mb-3">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Necesidades
      </div>
      <ul className="space-y-1">
        {needs.map((n) => (
          <li key={n.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-800">{n.nombre}</span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: NIVEL_COLOR[n.nivel] }}
            >
              {NIVEL_LABEL[n.nivel]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CategoryBody({
  report,
  onUpdateEstado,
  onRequestLocalizar,
}: {
  report: Report
  onUpdateEstado: (report: Report, estado: string) => void
  onRequestLocalizar: () => void
}) {
  switch (report.tipo) {
    case 'acopio':
      return (
        <>
          <NeedsList report={report} />
          {report.acepta && report.acepta.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Donaciones que aceptan
              </div>
              <div className="flex flex-wrap gap-1.5">
                {report.acepta.map((a) => (
                  <span
                    key={a.id}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                  >
                    {a.item}
                  </span>
                ))}
              </div>
            </div>
          )}
          <Field label="Horario" value={report.horario} />
          <Field label="Contacto" value={report.contacto} />
        </>
      )
    case 'hospital': {
      const est = HOSPITAL_ESTADO_BY_VALUE[report.estado]
      return (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {est && (
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: est.color }}
              >
                {est.label}
              </span>
            )}
            {report.tipo_centro && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {report.tipo_centro}
              </span>
            )}
          </div>
          <Field label="Capacidad" value={report.capacidad} />
          {report.telefono && (
            <div className="mb-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Teléfono
              </div>
              <a href={`tel:${report.telefono}`} className="text-sm font-medium text-brand">
                {report.telefono}
              </a>
            </div>
          )}
          <Field label="Contacto" value={report.contacto} />
          <NeedsList report={report} />
          {report.pacientes && report.pacientes.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Pacientes reportados por la comunidad
              </div>
              <ul className="space-y-2">
                {report.pacientes.map((p) => (
                  <li key={p.id} className="rounded-lg bg-gray-50 p-2 text-sm">
                    <div className="font-medium text-gray-800">{p.nombre}</div>
                    <div className="text-gray-600">{p.condicion}</div>
                    <div className="text-xs text-gray-400">Ingreso: {p.fecha_ingreso}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.listas && report.listas.length > 0 && (
            <div className="mb-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Listas de personas
              </div>
              <div className="space-y-2">
                {report.listas.map((l) => (
                  <div key={l.id}>
                    {l.tipo === 'foto' ? (
                      <a href={l.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={l.url}
                          alt={l.descripcion ?? 'Lista de personas'}
                          className="w-full rounded-lg object-cover max-h-48"
                          loading="lazy"
                        />
                        {l.descripcion && (
                          <p className="mt-1 text-xs text-gray-500">{l.descripcion}</p>
                        )}
                      </a>
                    ) : (
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-brand hover:bg-gray-100"
                      >
                        <span>🔗</span>
                        <span className="flex-1 truncate">{l.descripcion || l.url}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )
    }
    case 'personas': {
      const per = report.personas?.[0]
      const est = PERSONA_ESTADO_BY_VALUE[report.estado]
      return (
        <>
          {est && (
            <div className="mb-3">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: est.color }}
              >
                {est.label}
              </span>
            </div>
          )}
          {per?.foto_url && (
            <img
              src={per.foto_url}
              alt={report.nombre}
              className="mb-3 h-48 w-full rounded-lg object-cover"
              loading="lazy"
            />
          )}
          <Field label="Última vez vista" value={per?.ultima_vez_visto} />
          <Field label="Descripción" value={per?.descripcion ?? report.descripcion} />

          {/* Datos de la localización, si ya fue localizada. El contacto de
              quien la localizó se guarda para seguimiento, no se muestra aquí. */}
          {report.estado === 'localizado' &&
            (report.localizado_por_nombre || report.localizado_nota) && (
              <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-acopio">
                  ✅ Localización confirmada
                </div>
                <Field label="Localizada por" value={report.localizado_por_nombre} />
                <Field label="Relación" value={report.localizado_relacion} />
                <Field label="Cuándo" value={report.localizado_fecha} />
                <Field label="Nota" value={report.localizado_nota} />
              </div>
            )}

          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              ¿Tienes novedades?
            </div>
            <div className="flex flex-col gap-2">
              {PERSONA_ESTADOS.map((e) => {
                const current = report.estado === e.value
                const isFound = e.value === 'localizado'
                return (
                  <button
                    key={e.value}
                    disabled={current}
                    onClick={() =>
                      isFound ? onRequestLocalizar() : onUpdateEstado(report, e.value)
                    }
                    className="rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-default"
                    style={
                      current
                        ? { backgroundColor: e.color, color: '#fff', opacity: 0.55 }
                        : isFound
                          ? { backgroundColor: e.color, color: '#fff' }
                          : { backgroundColor: '#fff', color: e.color, border: `1px solid ${e.color}` }
                    }
                  >
                    {current
                      ? `Estado actual: ${e.label}`
                      : isFound
                        ? '✅ Esta persona apareció (Localizada)'
                        : `Marcar como ${e.label}`}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              Cualquiera puede actualizar el estado. No se piden datos personales.
            </p>
          </div>
        </>
      )
    }
    case 'infra':
    case 'emergencia':
      return (
        <>
          {report.foto_url && (
            <img
              src={report.foto_url}
              alt={report.nombre}
              className="mb-3 h-48 w-full rounded-lg object-cover"
              loading="lazy"
            />
          )}
          <Field label="Descripción" value={report.descripcion} />
          <Field label="Zona afectada" value={report.zona} />
          <Field label="Duración / desde cuándo" value={report.duracion} />
          <Field label="Contacto o referencia" value={report.contacto} />
        </>
      )
    case 'necesidades':
      return (
        <>
          <Field label="Zona" value={report.zona} />
          <NeedsList report={report} />
        </>
      )
    default:
      return null
  }
}

export default function DetailPanel({ report, onClose, onUpdateEstado, onLocalizar, onEdit }: Props) {
  const [localizarOpen, setLocalizarOpen] = useState(false)
  const [reportarOpen, setReportarOpen] = useState(false)
  const [eliminarOpen, setEliminarOpen] = useState(false)
  if (!report) return null
  const layer = LAYER_BY_ID[report.tipo]

  return (
    <>
      {/* Scrim on mobile */}
      <div
        className="fixed inset-0 z-[1000] bg-black/30 md:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label={report.nombre}
        className="fixed z-[1001] bg-white shadow-2xl
          inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl
          md:inset-y-0 md:right-0 md:left-auto md:w-96 md:max-h-none md:rounded-none
          flex flex-col"
      >
        <div
          className="flex items-start gap-3 rounded-t-2xl px-4 py-3 md:rounded-none"
          style={{ backgroundColor: layer.color }}
        >
          <span className="text-2xl" aria-hidden>
            {layer.glyph}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium uppercase tracking-wide text-white/80">
              {layer.label}
            </div>
            <h2 className="truncate text-lg font-bold text-white">{report.nombre}</h2>
          </div>
          <button
            onClick={() => onEdit(report)}
            aria-label="Editar"
            className="rounded-full bg-white/20 px-2 py-1 text-sm leading-none text-white"
            title="Editar publicación"
          >
            ✏️
          </button>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full bg-white/20 px-2 py-0.5 text-lg leading-none text-white"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3">
          {report.descripcion && report.tipo !== 'infra' && report.tipo !== 'emergencia' && report.tipo !== 'personas' && (
            <p className="mb-3 text-sm text-gray-700">{report.descripcion}</p>
          )}
          <CategoryBody
            report={report}
            onUpdateEstado={onUpdateEstado}
            onRequestLocalizar={() => setLocalizarOpen(true)}
          />

          <ShareBar report={report} onReportar={() => setReportarOpen(true)} />

          <div className="mt-3 border-t pt-2 text-xs text-gray-400">
            Reportado: {new Date(report.created_at).toLocaleString('es-VE')}
          </div>

          <div className="mt-2 text-center">
            <button
              onClick={() => setEliminarOpen(true)}
              className="text-xs text-gray-400 underline hover:text-red-500"
            >
              Solicitar eliminación de este registro
            </button>
          </div>
        </div>
      </aside>

      {localizarOpen && (
        <LocalizarModal
          nombre={report.nombre}
          onCancel={() => setLocalizarOpen(false)}
          onConfirm={(data) => {
            onLocalizar(report, data)
            setLocalizarOpen(false)
          }}
        />
      )}

      {reportarOpen && (
        <ReportarContenidoModal
          reportId={report.id}
          onClose={() => setReportarOpen(false)}
        />
      )}

      {eliminarOpen && (
        <SolicitarEliminacionModal
          reportId={report.id}
          nombreRegistro={report.nombre}
          onClose={() => setEliminarOpen(false)}
        />
      )}
    </>
  )
}
