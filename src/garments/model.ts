import {
  GARMENT_DESIGN_ZONES,
  type DesignZoneDefinition,
  type GarmentDefinition,
  type GarmentDesignZoneId,
  type GarmentPanelDefinition,
  type GarmentPanelSide,
  type GarmentPanelType,
  type PercentRect,
} from './types'

const PRINTABLE_TYPES = new Set<GarmentPanelType>([
  'body',
  'sleeve',
  'leg',
  'hood',
  'chest',
])

const TOP_ZONES: GarmentDesignZoneId[] = ['front', 'back', 'left-sleeve', 'right-sleeve']
const BOTTOM_ZONES: GarmentDesignZoneId[] = ['front', 'back', 'left-leg', 'right-leg']

export function isGarmentDesignZone(value: unknown): value is GarmentDesignZoneId {
  return typeof value === 'string' && (GARMENT_DESIGN_ZONES as readonly string[]).includes(value)
}

export function panelName(panel: GarmentPanelDefinition): string {
  return panel.name ?? panel.label
}

export function inferPanelSide(panel: Pick<GarmentPanelDefinition, 'id' | 'viewId' | 'side'>): GarmentPanelSide {
  if (panel.side) {
    return panel.side
  }
  if (panel.id.includes('left')) {
    return 'left'
  }
  if (panel.id.includes('right')) {
    return 'right'
  }
  if (panel.viewId === 'back' || panel.id.includes('back')) {
    return 'back'
  }
  return 'front'
}

export function isPrintablePanel(panel: GarmentPanelDefinition): boolean {
  return panel.printable ?? PRINTABLE_TYPES.has(panel.type)
}

export function percentFromLocal(
  rect: { x: number; y: number; width: number; height: number },
  local: { width: number; height: number },
): PercentRect {
  return {
    x: (rect.x / local.width) * 100,
    y: (rect.y / local.height) * 100,
    width: (rect.width / local.width) * 100,
    height: (rect.height / local.height) * 100,
  }
}

export function localFromPercent(
  bounds: PercentRect,
  local: { width: number; height: number },
): { x: number; y: number; width: number; height: number } {
  return {
    x: (bounds.x / 100) * local.width,
    y: (bounds.y / 100) * local.height,
    width: (bounds.width / 100) * local.width,
    height: (bounds.height / 100) * local.height,
  }
}

/**
 * Panel design area in percentages of the panel local box.
 * Prefers an explicit `designBounds`, then the safe area, then the full panel.
 */
export function panelDesignBounds(panel: GarmentPanelDefinition): PercentRect {
  if (panel.designBounds) {
    return panel.designBounds
  }
  if (panel.safeArea) {
    return percentFromLocal(panel.safeArea, panel.local)
  }
  return { x: 0, y: 0, width: 100, height: 100 }
}

export function panelDesignBoundsLocal(panel: GarmentPanelDefinition) {
  return localFromPercent(panelDesignBounds(panel), panel.local)
}

function defaultZonesForPanel(panel: GarmentPanelDefinition): DesignZoneDefinition[] {
  if (!isPrintablePanel(panel)) {
    return []
  }

  const full: DesignZoneDefinition = {
    id: `${panel.id}-full`,
    name: `Full ${panelName(panel).toLowerCase()}`,
    bounds: { x: 0, y: 0, width: 100, height: 100 },
  }
  const print = panelDesignBounds(panel)
  const focused: DesignZoneDefinition = {
    id: `${panel.id}-print`,
    name: panel.safeArea?.label ?? 'Print area',
    bounds: print,
  }

  if (panel.type === 'body' && inferPanelSide(panel) === 'front') {
    return [
      { id: `${panel.id}-full-front`, name: 'Full front', bounds: { x: 0, y: 0, width: 100, height: 100 } },
      { id: `${panel.id}-chest`, name: 'Chest', bounds: print },
      {
        id: `${panel.id}-center-front`,
        name: 'Center front',
        bounds: { x: 30, y: 20, width: 40, height: 40 },
      },
    ]
  }
  if (panel.type === 'body' && inferPanelSide(panel) === 'back') {
    return [
      { id: `${panel.id}-full-back`, name: 'Full back', bounds: { x: 0, y: 0, width: 100, height: 100 } },
      {
        id: `${panel.id}-upper-back`,
        name: 'Upper back',
        bounds: { x: print.x, y: print.y, width: print.width, height: Math.min(print.height, 45) },
      },
    ]
  }
  if (panel.type === 'sleeve') {
    return [
      { id: `${panel.id}-outer`, name: 'Outer sleeve', bounds: { x: 0, y: 0, width: 100, height: 100 } },
      { id: `${panel.id}-center`, name: 'Sleeve center', bounds: print },
    ]
  }

  return focused.id === full.id ? [full] : [full, focused]
}

export function panelDesignZones(panel: GarmentPanelDefinition): DesignZoneDefinition[] {
  return panel.designZones ?? defaultZonesForPanel(panel)
}

export function inferSupportedDesignZones(
  garment: Pick<GarmentDefinition, 'panels' | 'supportedDesignZones'>,
): GarmentDesignZoneId[] {
  if (garment.supportedDesignZones && garment.supportedDesignZones.length > 0) {
    return [...garment.supportedDesignZones]
  }
  const types = new Set(garment.panels.map((panel) => panel.type))
  if (types.has('leg')) {
    return [...BOTTOM_ZONES]
  }
  return [...TOP_ZONES]
}

export function garmentPreviewView(
  garment: Pick<GarmentDefinition, 'preview' | 'views'>,
): string {
  return garment.preview?.viewId ?? garment.views[0]?.id ?? 'front'
}

export function completePanel(panel: GarmentPanelDefinition): GarmentPanelDefinition {
  return {
    ...panel,
    name: panelName(panel),
    side: inferPanelSide(panel),
    printable: isPrintablePanel(panel),
    designBounds: panelDesignBounds(panel),
    designZones: panelDesignZones(panel),
  }
}

export function completeGarment(garment: GarmentDefinition): GarmentDefinition {
  return {
    ...garment,
    preview: { viewId: garmentPreviewView(garment) },
    supportedDesignZones: inferSupportedDesignZones(garment),
    panels: garment.panels.map(completePanel),
  }
}
