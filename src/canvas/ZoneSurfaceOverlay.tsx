import { defaultPanelIdForZone, placementZoneLabel, type PlacementZone } from '@/design/designObjects'
import { getArtworkPanelBounds, type ArtworkPanelBounds } from '@/design/objectPlacement'
import type { DesignDocument } from '@/design/types'
import { getGarmentPanel } from '@/garments/coordinates'
import { getGarment } from '@/garments/registry'
import { panelSilhouettePaths, silhouetteBounds } from '@/garments/topology'

interface ZoneSurfaceOverlayProps {
  document: DesignDocument
  zone: PlacementZone
}

export function ZoneSurfaceOverlay({ document, zone }: ZoneSurfaceOverlayProps) {
  const panelId = defaultPanelIdForZone(document, zone)
  const bounds = getArtworkPanelBounds(document, panelId)
  if (!bounds || !panelId) {
    return null
  }

  const panel = getGarmentPanel(getGarment(document.garmentType), panelId)
  const silhouettes = panelSilhouettePaths(panel ?? undefined)
  const outline = silhouetteBounds(silhouettes)
  const labelBounds = outline
    ? { ...bounds, x: outline.x, y: outline.y, width: outline.width, height: outline.height }
    : bounds
  const surfaceKind = zone === 'front' || zone === 'back' ? 'view' : 'region'

  return (
    <g
      data-zone-surface={zone}
      data-zone-surface-panel={bounds.id}
      data-zone-surface-kind={silhouettes.length > 0 ? 'silhouette' : 'box'}
      pointerEvents="none"
    >
      {silhouettes.length > 0 ? (
        silhouettes.map((path) => (
          <path
            key={path}
            d={path}
            fill={surfaceKind === 'region' ? 'rgba(201,163,106,0.07)' : 'transparent'}
            stroke="#c9a36a"
            strokeWidth={surfaceKind === 'region' ? 1.5 : 1}
            strokeDasharray={surfaceKind === 'region' ? '6 4' : '3 3'}
          />
        ))
      ) : (
        <rect
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
          fill={surfaceKind === 'region' ? 'rgba(201,163,106,0.07)' : 'transparent'}
          stroke="#c9a36a"
          strokeWidth={surfaceKind === 'region' ? 1.5 : 1}
          strokeDasharray={surfaceKind === 'region' ? '6 4' : '3 3'}
        />
      )}
      <SurfaceLabel bounds={labelBounds} zone={zone} />
    </g>
  )
}

function SurfaceLabel({ bounds, zone }: { bounds: ArtworkPanelBounds; zone: PlacementZone }) {
  return (
    <text
      x={bounds.x + 6}
      y={bounds.y + 14}
      fill="#c9a36a"
      fontSize={11}
      fontFamily="IBM Plex Sans, sans-serif"
    >
      {placementZoneLabel(zone)} · 2D
    </text>
  )
}
