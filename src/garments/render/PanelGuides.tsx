import type { GarmentPanelDefinition } from '../types'

interface PanelGuidesProps {
  panels: GarmentPanelDefinition[]
  activePanelId: string
  onSelectPanel: (panelId: string) => void
}

export function PanelGuides({ panels, activePanelId, onSelectPanel }: PanelGuidesProps) {
  return (
    <g>
      {panels.map((panel) => {
        const active = panel.id === activePanelId
        return (
          <g key={panel.id}>
            <rect
              x={panel.frame.x}
              y={panel.frame.y}
              width={panel.frame.width}
              height={panel.frame.height}
              fill={active ? 'rgba(201,163,106,0.06)' : 'transparent'}
              stroke={active ? 'rgba(201,163,106,0.7)' : 'rgba(238,240,244,0.22)'}
              strokeDasharray="5 4"
              strokeWidth={active ? 1.4 : 1}
              rx="3"
              onPointerDown={(event) => {
                event.stopPropagation()
                onSelectPanel(panel.id)
              }}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={panel.frame.x + 6}
              y={panel.frame.y + 14}
              fill={active ? '#c9a36a' : 'rgba(238,240,244,0.42)'}
              fontSize="10"
              fontFamily="IBM Plex Sans, sans-serif"
              pointerEvents="none"
            >
              {panel.label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
