import L from 'leaflet'
import { LAYER_BY_ID } from '../layers'
import type { Tipo } from '../types'

// Build a lightweight pin as an HTML divIcon — no image assets, fully colored
// per category, with the layer glyph in the center.
const cache = new Map<Tipo, L.DivIcon>()

export function pinIcon(tipo: Tipo): L.DivIcon {
  const cached = cache.get(tipo)
  if (cached) return cached

  const layer = LAYER_BY_ID[tipo]
  const html = `
    <div class="pin" style="--pin:${layer.color}">
      <span class="pin__glyph">${layer.glyph}</span>
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
