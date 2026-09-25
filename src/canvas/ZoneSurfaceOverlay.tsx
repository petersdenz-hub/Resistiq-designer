import { defaultPanelIdForZone, placementZoneLabel, type PlacementZone } from '@/design/designObjects'
import { getArtworkPanelBounds, type ArtworkPanelBounds } from '@/design/objectPlacement'
import type { DesignDocument } from '@/design/types'

interface ZoneSurfaceOverlayProps {
  document: DesignDocument
  zone: PlacementZone
}

export function ZoneSurfaceOverlay({ document, zone }: ZoneSurfaceOverlayProps) {
  const bounds = getArtworkPanelBounds(document, defaultPanelIdForZone(document, zone))
  if (!bounds) {
    return null
  }

  const surfaceKind = zone === 'front' || zone === 'back' ? 'view' : 'region'

  return (
    <g data-zone-surface={zone} data-zone-surface-panel={bounds.id} pointerEvents="none">
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
      <SurfaceLabel bounds={bounds} zone={zone} />
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
