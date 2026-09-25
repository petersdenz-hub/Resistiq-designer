import type { DesignSafeArea } from '@/design/types'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { localRectToCanvas } from '../coordinates'
import type { GarmentPanelDefinition } from '../types'

interface PanelGuidesProps {
  panels: GarmentPanelDefinition[]
  safeAreas: DesignSafeArea[]
  activePanelId: string
  showSafeAreas: boolean
  /** Panel highlight is selection when no design element is selected. */
  selectionKind?: 'panel' | 'element'
  onSelectPanel: (panelId: string) => void
  onPanelPointerDown?: (panelId: string, event: ReactPointerEvent<SVGElement>) => void
}

export function PanelGuides({
  panels,
  safeAreas,
  activePanelId,
  showSafeAreas,
  selectionKind = 'panel',
  onSelectPanel,
  onPanelPointerDown,
}: PanelGuidesProps) {
  return (
    <g data-editor-chrome="true">
      {panels.map((panel) => {
        const active = panel.id === activePanelId
        const panelSelected = active && selectionKind === 'panel'
        const safe = showSafeAreas
          ? (safeAreas.find((area) => area.panelId === panel.id) ?? null)
          : null
        const safeCanvas = safe ? localRectToCanvas(panel, safe) : null

        return (
          <g
            key={panel.id}
            data-panel-guide={panel.id}
            data-panel-selected={panelSelected ? 'true' : 'false'}
          >
            <rect
              x={panel.frame.x}
              y={panel.frame.y}
              width={panel.frame.width}
              height={panel.frame.height}
              fill={
                panelSelected
                  ? 'rgba(201,163,106,0.12)'
                  : active
                    ? 'rgba(201,163,106,0.06)'
                    : 'rgba(238,240,244,0.03)'
              }
              stroke={panelSelected ? 'rgba(201,163,106,1)' : active ? 'rgba(201,163,106,0.7)' : 'rgba(238,240,244,0.55)'}
              strokeDasharray={panelSelected ? '0' : '4 3'}
              strokeWidth={panelSelected ? 2 : active ? 1.4 : 1.15}
              rx="3"
              onPointerDown={(event) => {
                event.stopPropagation()
                if (onPanelPointerDown) {
                  onPanelPointerDown(panel.id, event)
                  return
                }
                onSelectPanel(panel.id)
              }}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={panel.frame.x + 6}
              y={panel.frame.y + 13}
              fill={panelSelected || active ? '#c9a36a' : 'rgba(238,240,244,0.72)'}
              fontSize="9.5"
              fontFamily="IBM Plex Sans, sans-serif"
              pointerEvents="none"
            >
              {panelSelected ? `Panel · ${panel.label}` : panel.label}
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
