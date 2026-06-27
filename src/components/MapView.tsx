import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import type { Report, Tipo } from '../types'
import { CARACAS_CENTER } from '../data/dummy'
import { pinIcon } from './markers'
import { LAYER_BY_ID } from '../layers'

interface Props {
  reports: Report[]
  active: Set<Tipo>
  onSelect: (r: Report) => void
}

// Weight a "necesidades" zone by how urgent its needs are, to size the heatmap
// circle. Falls back to a base radius when there are no needs rows.
function zonaWeight(r: Report): number {
  const needs = r.necesidades ?? []
  if (needs.length === 0) return 1
  return needs.reduce((sum, n) => {
    if (n.nivel === 'urgente') return sum + 3
    if (n.nivel === 'medio') return sum + 2
    return sum + 1
  }, 0)
}

export default function MapView({ reports, active, onSelect }: Props) {
  const visible = reports.filter((r) => active.has(r.tipo))
  const zonas = visible.filter((r) => r.tipo === 'necesidades')
  const pins = visible.filter((r) => r.tipo !== 'necesidades')

  return (
    <MapContainer
      center={CARACAS_CENTER}
      zoom={12}
      className="h-full w-full"
      zoomControl={false}
      preferCanvas
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {/* Necesidades heatmap-style overlay: translucent circles sized by urgency */}
      {zonas.map((r) => {
        const color = LAYER_BY_ID.necesidades.color
        return (
          <Circle
            key={r.id}
            center={[r.lat, r.lng]}
            radius={350 + zonaWeight(r) * 120}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.28,
              weight: 1,
            }}
            eventHandlers={{ click: () => onSelect(r) }}
          />
        )
      })}

      {pins.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={pinIcon(r.tipo)}
          eventHandlers={{ click: () => onSelect(r) }}
        />
      ))}
    </MapContainer>
  )
}
