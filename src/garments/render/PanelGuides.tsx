import type { DesignSafeArea } from '@/design/types'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { regionForPanel } from '../colorRegions'
import { localRectToCanvas } from '../coordinates'
import {
  isPrintablePanel,
  localFromPercent,
  panelBleedBounds,
  panelDesignBounds,
  panelDesignZones,
} from '../model'
import { panelSilhouettePaths } from '../topology'
import type { GarmentPanelDefinition } from '../types'

interface PanelGuidesProps {
  garmentType?: string
  panels: GarmentPanelDefinition[]
  safeAreas: DesignSafeArea[]
  activePanelId: string
  showPrintArea: boolean
  showSafeAreas: boolean
  showGuides: boolean
  /** Panel highlight is selection when no design element is selected. */
  selectionKind?: 'panel' | 'element'
  onSelectPanel: (panelId: string) => void
  onSelectZone?: (panelId: string, zoneId: string) => void
  onPanelPointerDown?: (panelId: string, event: ReactPointerEvent<SVGElement>) => void
}

export function PanelGuides({
  garmentType,
  panels,
  safeAreas,
  activePanelId,
  showPrintArea,
  showSafeAreas,
  showGuides,
  selectionKind = 'panel',
  onSelectPanel,
  onSelectZone,
  onPanelPointerDown,
}: PanelGuidesProps) {
  return (
    <g data-editor-chrome="true" data-print-guides={showPrintArea ? 'true' : 'false'} data-safe-guides={showSafeAreas ? 'true' : 'false'} data-panel-guides={showGuides ? 'true' : 'false'}>
      {panels.map((panel) => {
        const active = panel.id === activePanelId
        const panelSelected = active && selectionKind === 'panel'
        const region = garmentType ? regionForPanel(garmentType, panel.id) : null
        const silhouettes = panelSilhouettePaths(panel)
        const safe = showSafeAreas
          ? (safeAreas.find((area) => area.panelId === panel.id) ?? null)
          : null
        const safeCanvas = safe ? localRectToCanvas(panel, safe) : null
        const printable =
          showPrintArea && isPrintablePanel(panel)
            ? localRectToCanvas(panel, localFromPercent(panelDesignBounds(panel), panel.local))
            : null
        const bleed =
          showPrintArea && isPrintablePanel(panel)
            ? localRectToCanvas(panel, localFromPercent(panelBleedBounds(panel), panel.local))
            : null
        const zones =
          (showGuides || panelSelected) && isPrintablePanel(panel)
            ? panelDesignZones(panel).map((zone) => ({
                ...zone,
                canvas: localRectToCanvas(panel, localFromPercent(zone.bounds, panel.local)),
              }))
            : []

        return (
          <g
            key={panel.id}
            data-panel-guide={panel.id}
            data-region-id={region?.id ?? ''}
            data-region-selected={panelSelected ? 'true' : 'false'}
            data-panel-selected={panelSelected ? 'true' : 'false'}
            data-panel-printable={isPrintablePanel(panel) ? 'true' : 'false'}
          >
            {silhouettes.length > 0 ? (
              <g
                data-region-boundary={panel.id}
                onPointerDown={(event) => {
                  event.stopPropagation()
                  if (onPanelPointerDown) {
                    onPanelPointerDown(panel.id, event)
                    return
                  }
                  onSelectPanel(panel.id)
                }}
                style={{ cursor: 'pointer' }}
              >
                {silhouettes.map((path) => (
                  <path
                    key={path}
                    d={path}
                    fill={
                      panelSelected
                        ? 'rgba(201,163,106,0.10)'
                        : active
                          ? 'rgba(201,163,106,0.05)'
                          : showGuides
                            ? 'rgba(238,240,244,0.02)'
                            : 'transparent'
                    }
                    stroke={
                      panelSelected
                        ? 'rgba(201,163,106,1)'
                        : active
                          ? 'rgba(201,163,106,0.7)'
                          : showGuides
                            ? 'rgba(238,240,244,0.45)'
                            : 'transparent'
                    }
                    strokeDasharray={panelSelected ? '0' : '4 3'}
                    strokeWidth={panelSelected ? 2 : active ? 1.4 : 1.1}
                  />
                ))}
              </g>
            ) : showGuides || panelSelected || active ? (
              <rect
                x={panel.frame.x}
                y={panel.frame.y}
                width={panel.frame.width}
                height={panel.frame.height}
                fill={
                  panelSelected
                    ? 'rgba(201,163,106,0.10)'
                    : active
                      ? 'rgba(201,163,106,0.05)'
                      : 'rgba(238,240,244,0.02)'
                }
                stroke={panelSelected ? 'rgba(201,163,106,1)' : active ? 'rgba(201,163,106,0.7)' : 'rgba(238,240,244,0.45)'}
                strokeDasharray={panelSelected ? '0' : '4 3'}
                strokeWidth={panelSelected ? 2 : active ? 1.4 : 1.1}
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
            ) : (
              <rect
                x={panel.frame.x}
                y={panel.frame.y}
                width={panel.frame.width}
                height={panel.frame.height}
                fill="transparent"
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
            )}
            {showGuides ? (
              <text
                x={panel.frame.x + 6}
                y={panel.frame.y + 13}
                fill={panelSelected || active ? '#c9a36a' : 'rgba(238,240,244,0.72)'}
                fontSize="9.5"
                fontFamily="IBM Plex Sans, sans-serif"
                pointerEvents="none"
              >
                {region?.label ?? panel.label}
              </text>
            ) : null}
            {bleed && silhouettes.length === 0 && (active || panelSelected) ? (
              <g pointerEvents="none" data-bleed-area={panel.id}>
                <rect
                  x={bleed.x}
                  y={bleed.y}
                  width={bleed.width}
                  height={bleed.height}
                  fill="none"
                  stroke="rgba(201,163,106,0.28)"
                  strokeDasharray="1 4"
                  strokeWidth="0.9"
                  rx="2"
                />
              </g>
            ) : null}
            {printable && (active || panelSelected || showPrintArea) ? (
              <g
                data-printable-area={panel.id}
                data-printable-area-kind={silhouettes.length > 0 ? 'silhouette' : 'box'}
                onPointerDown={(event) => {
                  event.stopPropagation()
                  onSelectPanel(panel.id)
                }}
                style={{ cursor: 'pointer' }}
              >
                {silhouettes.length > 0 ? (
                  silhouettes.map((path) => (
                    <path
                      key={path}
                      d={path}
                      fill="rgba(201,163,106,0.015)"
                      stroke="rgba(201,163,106,0.32)"
                      strokeDasharray="4 5"
                      strokeWidth="0.9"
                    />
                  ))
                ) : (
                  <rect
                    x={printable.x}
                    y={printable.y}
                    width={printable.width}
                    height={printable.height}
                    fill="rgba(201,163,106,0.015)"
                    stroke="rgba(201,163,106,0.32)"
                    strokeDasharray="4 5"
                    strokeWidth="0.9"
                    rx="2"
                  />
                )}
                {showGuides ? (
                  <text
                    x={(silhouettes.length > 0 ? panel.frame.x : printable.x) + 5}
                    y={(silhouettes.length > 0 ? panel.frame.y : printable.y) + 11}
                    fill="rgba(201,163,106,0.72)"
                    fontSize="7.5"
                    fontFamily="IBM Plex Sans, sans-serif"
                    letterSpacing="0.6"
                    pointerEvents="none"
                  >
                    PRINT AREA
                  </text>
                ) : null}
              </g>
            ) : null}
            {safe && safeCanvas && silhouettes.length === 0 ? (
              <g pointerEvents="none" data-safe-area={panel.id}>
                <rect
                  x={safeCanvas.x}
                  y={safeCanvas.y}
                  width={safeCanvas.width}
                  height={safeCanvas.height}
                  fill={active ? 'rgba(125, 184, 168, 0.045)' : 'rgba(125, 184, 168, 0.02)'}
                  stroke="rgba(125, 184, 168, 0.42)"
                  strokeDasharray="3 4"
                  strokeWidth="0.9"
                  rx="2"
                />
                {showGuides || panelSelected ? (
                  <text
                    x={safeCanvas.x + 5}
                    y={safeCanvas.y + Math.min(11, safeCanvas.height - 4)}
                    fill="rgba(170, 214, 202, 0.7)"
                    fontSize="7.5"
                    fontFamily="IBM Plex Sans, sans-serif"
                    letterSpacing="0.6"
                  >
                    SAFE AREA
                  </text>
                ) : null}
              </g>
            ) : null}
            {silhouettes.length === 0
              ? zones.map((zone) => (
                  <g
                    key={zone.id}
                    data-design-zone={zone.id}
                    data-design-zone-name={zone.name}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      if (onSelectZone) {
                        onSelectZone(panel.id, zone.id)
                        return
                      }
                      onSelectPanel(panel.id)
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={zone.canvas.x}
                      y={zone.canvas.y}
                      width={zone.canvas.width}
                      height={zone.canvas.height}
                      fill="none"
                      stroke="rgba(158, 176, 214, 0.7)"
                      strokeDasharray="2 3"
                      strokeWidth="0.95"
                      rx="2"
                    />
                    <text
                      x={zone.canvas.x + 4}
                      y={zone.canvas.y + Math.min(11, zone.canvas.height - 3)}
                      fill="rgba(186, 198, 224, 0.92)"
                      fontSize="8"
                      fontFamily="IBM Plex Sans, sans-serif"
                      pointerEvents="none"
                    >
                      {zone.name}
                    </text>
                  </g>
                ))
              : null}
          </g>
        )
      })}
    </g>
  )
}
