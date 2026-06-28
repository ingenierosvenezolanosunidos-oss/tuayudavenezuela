import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const [address, setAddress] = useState('')
  const [searching, setSearching] = useState(false)

  function useGps() {
    if (!navigator.geolocation) {
      setError(t('location_picker.error_no_geo'))
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        onChange(coords[0], coords[1])
        setFlyTarget(coords)
        setLocating(false)
      },
      () => {
        setError(t('location_picker.error_geo_fail'))
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  async function searchAddress() {
    const q = address.trim()
    if (!q) return
    setSearching(true)
    setError(null)
    try {
      // Photon (OSM-based) instead of Nominatim: Nominatim stopped sending CORS
      // headers, so browser requests to it are blocked. Photon allows CORS. We
      // bias results toward Venezuela and prefer matches inside the country.
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lat=${CARACAS_CENTER[0]}&lon=${CARACAS_CENTER[1]}`
      const res = await fetch(url)
      const data = await res.json()
      type Feature = { geometry: { coordinates: [number, number] }; properties?: { countrycode?: string } }
      const features: Feature[] = data.features ?? []
      const best = features.find((f) => f.properties?.countrycode === 'VE') ?? features[0]
      if (!best) {
        setError(t('location_picker.error_not_found'))
        setSearching(false)
        return
      }
      // GeoJSON coordinates are [lon, lat] — flip to [lat, lng].
      const [flon, flat] = best.geometry.coordinates
      const coords: [number, number] = [flat, flon]
      onChange(coords[0], coords[1])
      setFlyTarget(coords)
    } catch {
      setError(t('location_picker.error_search_fail'))
    } finally {
      setSearching(false)
    }
  }

  const center: [number, number] = lat != null && lng != null ? [lat, lng] : CARACAS_CENTER
  const initialZoom = lat != null && lng != null ? 15 : 13

  return (
    <div>
      {/* Address search */}
      <div className="mb-2 flex gap-2">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
          placeholder={t('location_picker.search_ph')}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button
          type="button"
          onClick={searchAddress}
          disabled={searching || !address.trim()}
          className="rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {searching ? '…' : '🔍'}
        </button>
      </div>

      {/* GPS + map — same action: place the pin */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {t('location_picker.place_pin_label')}
        </p>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={useGps}
            className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            disabled={locating}
          >
            {locating ? t('location_picker.locating') : t('location_picker.use_location')}
          </button>
          <span className="text-xs text-gray-500">{t('location_picker.or_tap_map')}</span>
        </div>

        <div className="h-64 overflow-hidden rounded-lg border">
          <MapContainer center={center} zoom={initialZoom} className="h-full w-full" zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
            <ClickCapture onChange={onChange} />
            <FlyTo target={flyTarget} />
            {lat != null && lng != null && <Marker position={[lat, lng]} icon={pin} />}
          </MapContainer>
        </div>

        {lat != null && lng != null && (
          <div className="mt-1 text-xs text-gray-500">
            {t('location_picker.coords', { lat: lat.toFixed(5), lng: lng.toFixed(5) })}
          </div>
        )}
        {error && <div className="mt-1 text-xs text-hospital">{error}</div>}
      </div>
    </div>
  )
}
