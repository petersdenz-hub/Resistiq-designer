import {
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
  'crown',
  'brim',
  'band',
  'hand',
  'foot',
  'shell',
  'flap',
])

const TOP_ZONES: GarmentDesignZoneId[] = ['front', 'back', 'left-sleeve', 'right-sleeve']
const BOTTOM_ZONES: GarmentDesignZoneId[] = ['front', 'back', 'left-leg', 'right-leg']

export function isGarmentDesignZone(value: unknown): value is GarmentDesignZoneId {
  return typeof value === 'string' && value.length > 0
}

export function panelName(panel: GarmentPanelDefinition): string {
  return panel.name ?? panel.label
}

/** Technical label used on the canvas. Derived from the definition name. */
export function panelDisplayLabel(panel: GarmentPanelDefinition): string {
  return panelName(panel).toUpperCase()
}

export function inferPlacementZone(
  panel: Pick<GarmentPanelDefinition, 'id' | 'viewId' | 'side' | 'type' | 'placementZone' | 'printable'>,
): string | undefined {
  if (panel.placementZone) {
    return panel.placementZone
  }
  if (panel.type === 'sleeve') {
    return inferPanelSide(panel) === 'left' ? 'left-sleeve' : 'right-sleeve'
  }
  if (panel.type === 'leg') {
    return inferPanelSide(panel) === 'left' ? 'left-leg' : 'right-leg'
  }
  if (panel.type === 'hand') {
    return inferPanelSide(panel) === 'left' ? 'left-hand' : 'right-hand'
  }
  if (panel.type === 'foot') {
    return inferPanelSide(panel) === 'left' ? 'left-foot' : 'right-foot'
  }
  if (panel.type === 'crown' || panel.type === 'brim' || panel.type === 'band' || panel.type === 'strap') {
    return panel.type
  }
  if (panel.type === 'shell' || panel.type === 'flap' || panel.type === 'body' || panel.printable) {
    if (panel.viewId === 'back' || inferPanelSide(panel) === 'back') {
      return 'back'
    }
    return panel.viewId || 'front'
  }
  return undefined
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

  if (panel.type === 'body' && inferPanelSide(panel) === 'left') {
    return [
      { id: `${panel.id}-full-front`, name: 'Left front', bounds: { x: 0, y: 0, width: 100, height: 100 } },
      { id: `${panel.id}-chest`, name: 'Front chest', bounds: print },
    ]
  }
  if (panel.type === 'body' && inferPanelSide(panel) === 'right') {
    return [
      { id: `${panel.id}-full-front`, name: 'Right front', bounds: { x: 0, y: 0, width: 100, height: 100 } },
      { id: `${panel.id}-chest`, name: 'Front chest', bounds: print },
    ]
  }
  if (panel.type === 'body' && inferPanelSide(panel) === 'front') {
    return [
      { id: `${panel.id}-full-front`, name: 'Front print', bounds: { x: 0, y: 0, width: 100, height: 100 } },
      { id: `${panel.id}-chest`, name: 'Front chest', bounds: print },
      {
        id: `${panel.id}-center-front`,
        name: 'Center front',
        bounds: { x: 30, y: 20, width: 40, height: 40 },
      },
    ]
  }
  if (panel.type === 'body' && inferPanelSide(panel) === 'back') {
    const upperHeight = Math.min(print.height, 36)
    return [
      { id: `${panel.id}-full-back`, name: 'Back print', bounds: { x: 0, y: 0, width: 100, height: 100 } },
      {
        id: `${panel.id}-upper-back`,
        name: 'Upper back',
        bounds: { x: print.x, y: print.y, width: print.width, height: upperHeight },
      },
      {
        id: `${panel.id}-lower-back`,
        name: 'Lower back',
        bounds: {
          x: print.x,
          y: print.y + upperHeight,
          width: print.width,
          height: Math.max(8, print.height - upperHeight),
        },
      },
    ]
  }
  if (panel.type === 'sleeve') {
    const side = inferPanelSide(panel)
    return [
      {
        id: `${panel.id}-outer`,
        name: side === 'left' ? 'Left sleeve' : side === 'right' ? 'Right sleeve' : 'Sleeve',
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      },
      { id: `${panel.id}-center`, name: 'Sleeve center', bounds: print },
    ]
  }
  if (panel.type === 'leg') {
    const side = inferPanelSide(panel)
    const mid = print.y + print.height / 2
    return [
      {
        id: `${panel.id}-full`,
        name: side === 'left' ? 'Left leg' : side === 'right' ? 'Right leg' : 'Leg',
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      },
      {
        id: `${panel.id}-upper`,
        name: 'Upper leg',
        bounds: { x: print.x, y: print.y, width: print.width, height: print.height / 2 },
      },
      {
        id: `${panel.id}-lower`,
        name: 'Lower leg',
        bounds: { x: print.x, y: mid, width: print.width, height: print.height / 2 },
      },
    ]
  }

  return focused.id === full.id ? [full] : [full, focused]
}

export function panelDesignZones(panel: GarmentPanelDefinition): DesignZoneDefinition[] {
  return panel.designZones ?? defaultZonesForPanel(panel)
}

/** Bleed is a slight expansion of the printable area. Not stored on the document. */
export function panelBleedBounds(panel: GarmentPanelDefinition): PercentRect {
  const print = panelDesignBounds(panel)
  const pad = 5
  const x = Math.max(0, print.x - pad)
  const y = Math.max(0, print.y - pad)
  return {
    x,
    y,
    width: Math.min(100 - x, print.width + pad * 2),
    height: Math.min(100 - y, print.height + pad * 2),
  }
}

export function inferSupportedDesignZones(
  garment: Pick<GarmentDefinition, 'panels' | 'supportedDesignZones'>,
): GarmentDesignZoneId[] {
  if (garment.supportedDesignZones && garment.supportedDesignZones.length > 0) {
    return [...garment.supportedDesignZones]
  }
  const zones: GarmentDesignZoneId[] = []
  const seen = new Set<string>()
  for (const panel of garment.panels) {
    const zone = inferPlacementZone(panel)
    if (!zone || seen.has(zone)) {
      continue
    }
    seen.add(zone)
    zones.push(zone)
  }
  if (zones.length > 0) {
    return zones
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
    silhouette: panel.silhouette,
    placementZone: inferPlacementZone(panel),
    regionId: panel.regionId,
    regionLabel: panel.regionLabel,
  }
}

export function completeGarment(garment: GarmentDefinition): GarmentDefinition {
  return {
    ...garment,
    preview: { viewId: garmentPreviewView(garment) },
    supportedDesignZones: inferSupportedDesignZones(garment),
    panels: garment.panels.map(completePanel),
    regions: garment.regions,
    constructionDefaults: garment.constructionDefaults,
    constructionControls: garment.constructionControls,
  }
}
