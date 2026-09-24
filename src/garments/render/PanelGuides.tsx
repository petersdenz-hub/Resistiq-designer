import type { DesignSafeArea } from '@/design/types'
import { localRectToCanvas } from '../coordinates'
import type { GarmentPanelDefinition } from '../types'

interface PanelGuidesProps {
  panels: GarmentPanelDefinition[]
  safeAreas: DesignSafeArea[]
  activePanelId: string
  showSafeAreas: boolean
  onSelectPanel: (panelId: string) => void
}

export function PanelGuides({
  panels,
  safeAreas,
  activePanelId,
  showSafeAreas,
  onSelectPanel,
}: PanelGuidesProps) {
  return (
    <g>
      {panels.map((panel) => {
        const active = panel.id === activePanelId
        const safe = showSafeAreas
          ? (safeAreas.find((area) => area.panelId === panel.id) ?? null)
          : null
        const safeCanvas = safe ? localRectToCanvas(panel, safe) : null

        return (
          <g key={panel.id}>
            <rect
              x={panel.frame.x}
              y={panel.frame.y}
              width={panel.frame.width}
              height={panel.frame.height}
              fill={active ? 'rgba(201,163,106,0.07)' : 'rgba(238,240,244,0.02)'}
              stroke={active ? 'rgba(201,163,106,0.85)' : 'rgba(238,240,244,0.28)'}
              strokeDasharray={active ? '0' : '5 4'}
              strokeWidth={active ? 1.5 : 1}
              rx="3"
              onPointerDown={(event) => {
                event.stopPropagation()
                onSelectPanel(panel.id)
              }}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={panel.frame.x + 6}
              y={panel.frame.y + 13}
              fill={active ? '#c9a36a' : 'rgba(238,240,244,0.48)'}
              fontSize="9.5"
              fontFamily="IBM Plex Sans, sans-serif"
              pointerEvents="none"
            >
              {panel.label}
            </text>
            {safe && safeCanvas ? (
              <g pointerEvents="none">
                <rect
                  x={safeCanvas.x}
                  y={safeCanvas.y}
                  width={safeCanvas.width}
                  height={safeCanvas.height}
                  fill={active ? 'rgba(125, 184, 168, 0.08)' : 'rgba(125, 184, 168, 0.04)'}
                  stroke="rgba(125, 184, 168, 0.7)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  rx="2"
                />
                <text
                  x={safeCanvas.x + 5}
                  y={safeCanvas.y + safeCanvas.height - 6}
                  fill="rgba(125, 184, 168, 0.85)"
                  fontSize="8.5"
                  fontFamily="IBM Plex Sans, sans-serif"
                >
                  {safe.label}
                </text>
              </g>
            ) : null}
          </g>
        )
      })}
    </g>
  )
}
