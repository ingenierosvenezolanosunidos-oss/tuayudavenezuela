import type { Report } from '../types'
import { LAYER_BY_ID, PERSONA_ESTADOS } from '../layers'

interface Props {
  reports: Report[]
}

// Resumen de estado de personas buscadas — inspirado en los contadores del
// sitio desaparecidosterremotovenezuela.com (reportadas / sin contacto /
// localizados). Solo cuenta reportes de tipo 'personas'.
export default function PersonasStats({ reports }: Props) {
  const personas = reports.filter((r) => r.tipo === 'personas')
  if (personas.length === 0) return null

  const byEstado = (value: string) =>
    personas.filter((r) => r.estado === value).length

  const layer = LAYER_BY_ID.personas

  return (
    <div className="flex items-center gap-3 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2 text-sm no-scrollbar">
      <span className="flex shrink-0 items-center gap-1 font-semibold" style={{ color: layer.color }}>
        <span aria-hidden>{layer.glyph}</span>
        Personas
      </span>
      <Stat n={personas.length} label="reportadas" color="#374151" />
      {PERSONA_ESTADOS.map((e) => (
        <Stat key={e.value} n={byEstado(e.value)} label={e.label.toLowerCase()} color={e.color} />
      ))}
    </div>
  )
}

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <span className="flex shrink-0 items-baseline gap-1 whitespace-nowrap">
      <span className="font-bold tabular-nums" style={{ color }}>
        {n}
      </span>
      <span className="text-gray-500">{label}</span>
    </span>
  )
}
