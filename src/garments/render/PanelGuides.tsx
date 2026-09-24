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
    <g data-editor-chrome="true">
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
              fill={active ? 'rgba(201,163,106,0.08)' : 'rgba(238,240,244,0.03)'}
              stroke={active ? 'rgba(201,163,106,0.9)' : 'rgba(238,240,244,0.55)'}
              strokeDasharray={active ? '0' : '4 3'}
              strokeWidth={active ? 1.6 : 1.15}
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
              fill={active ? '#c9a36a' : 'rgba(238,240,244,0.72)'}
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
                  fill={active ? 'rgba(125, 184, 168, 0.12)' : 'rgba(125, 184, 168, 0.06)'}
                  stroke="rgba(125, 184, 168, 0.88)"
                  strokeDasharray="3 3"
                  strokeWidth="1.15"
                  rx="2"
                />
                <text
                  x={safeCanvas.x + 5}
                  y={safeCanvas.y + Math.min(12, safeCanvas.height - 4)}
                  fill="rgba(170, 214, 202, 0.95)"
                  fontSize="9"
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
