import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { CARACAS_CENTER } from '../data/dummy'

interface Props {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}

const pin = L.divIcon({
  html: '<div class="pin" style="--pin:#2563EB"><span class="pin__glyph">📍</span></div>',
  className: 'pin-wrap',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
})

function ClickCapture({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap()
  const prev = useRef<[number, number] | null>(null)
  useEffect(() => {
    if (!target) return
    if (prev.current?.[0] === target[0] && prev.current?.[1] === target[1]) return
    prev.current = target
    map.flyTo(target, 16, { duration: 1 })
  }, [target, map])
  return null
}

export default function LocationPicker({ lat, lng, onChange }: Props) {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gpsTarget, setGpsTarget] = useState<[number, number] | null>(null)

  function useGps() {
    if (!navigator.geolocation) {
      setError('Tu dispositivo no permite ubicación.')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        onChange(coords[0], coords[1])
        setGpsTarget(coords)
        setLocating(false)
      },
      () => {
        setError('No se pudo obtener tu ubicación. Toca el mapa para marcarla.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const center: [number, number] = CARACAS_CENTER

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={useGps}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          disabled={locating}
        >
          {locating ? 'Ubicando…' : '📍 Usar mi ubicación'}
        </button>
        <span className="text-xs text-gray-500">o toca el mapa</span>
      </div>
      <div className="h-48 overflow-hidden rounded-lg border">
        <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
          <ClickCapture onChange={onChange} />
          <FlyTo target={gpsTarget} />
          {lat != null && lng != null && <Marker position={[lat, lng]} icon={pin} />}
        </MapContainer>
      </div>
      {lat != null && lng != null && (
        <div className="mt-1 text-xs text-gray-500">
          Ubicación: {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>
      )}
      {error && <div className="mt-1 text-xs text-hospital">{error}</div>}
    </div>
  )
}
