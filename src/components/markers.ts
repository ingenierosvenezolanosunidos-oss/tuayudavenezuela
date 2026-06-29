import L from 'leaflet'
import { LAYER_BY_ID } from '../layers'
import { layerIconSvg } from './layerIcons'
import type { Tipo } from '../types'

// Build a lightweight pin as an HTML divIcon — no image assets, colored per
// category, with a white line icon in the center.
const cache = new Map<Tipo, L.DivIcon>()

export function pinIcon(tipo: Tipo): L.DivIcon {
  const cached = cache.get(tipo)
  if (cached) return cached

  const layer = LAYER_BY_ID[tipo]
  const html = `
    <div class="pin" style="--pin:${layer.color}">
      <span class="pin__glyph">${layerIconSvg(tipo, '#fff', 18)}</span>
    </div>`
  const icon = L.divIcon({
    html,
    className: 'pin-wrap',
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -44],
  })
  cache.set(tipo, icon)
  return icon
}
