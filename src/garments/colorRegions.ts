import { getPanelColor } from '@/design/selectors'
import type { DesignDocument } from '@/design/types'
import { inferPanelSide, panelName } from './model'
import { getGarment } from './registry'
import type { GarmentDefinition, GarmentPanelDefinition, GarmentPanelType, GarmentRegionDefinition } from './types'

/**
 * A colorable garment region backed by one or more real panels.
 * Regions come from the garment definition, or are derived from its panels.
 */
export interface ColorRegion {
  id: string
  label: string
  panelIds: string[]
}

const REGION_ALIASES: Record<string, string> = {
  body: 'front-body',
  'sleeve-left': 'left-sleeve',
  'sleeve-right': 'right-sleeve',
  'leg-left': 'left-leg',
  'leg-right': 'right-leg',
  cuffs: 'left-cuff',
}

function ids(panels: GarmentPanelDefinition[]): string[] {
  return [...new Set(panels.map((panel) => panel.id))]
}

function splitRegionId(type: string, side: 'left' | 'right'): string {
  if (type === 'sleeve') {
    return side === 'left' ? 'left-sleeve' : 'right-sleeve'
  }
  if (type === 'leg') {
    return side === 'left' ? 'left-leg' : 'right-leg'
  }
  if (type === 'cuff') {
    return side === 'left' ? 'left-cuff' : 'right-cuff'
  }
  if (type === 'pocket') {
    return side === 'left' ? 'left-pocket' : 'right-pocket'
  }
  if (type === 'hand') {
    return side === 'left' ? 'left-hand' : 'right-hand'
  }
  if (type === 'foot') {
    return side === 'left' ? 'left-foot' : 'right-foot'
  }
  return `${type}-${side}`
}

function titleType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function addTypedRegions(
  regions: ColorRegion[],
  panels: GarmentPanelDefinition[],
  type: GarmentPanelType,
  splitLabel: (side: 'left' | 'right') => string,
  groupedLabel: string,
  groupedId: string,
) {
  const matching = panels.filter((panel) => panel.type === type && !panel.regionId)
  if (matching.length === 0) {
    return
  }
  const left = matching.filter((panel) => inferPanelSide(panel) === 'left')
  const right = matching.filter((panel) => inferPanelSide(panel) === 'right')
  if (left.length > 0 && right.length > 0) {
    regions.push({ id: splitRegionId(type, 'left'), label: splitLabel('left'), panelIds: ids(left) })
    regions.push({ id: splitRegionId(type, 'right'), label: splitLabel('right'), panelIds: ids(right) })
    return
  }
  regions.push({ id: groupedId, label: groupedLabel, panelIds: ids(matching) })
}

function addGroup(
  regions: ColorRegion[],
  panels: GarmentPanelDefinition[],
  type: GarmentPanelType,
  id: string,
  label: string,
) {
  const matching = panels.filter((panel) => panel.type === type && !panel.regionId)
  if (matching.length === 0) {
    return
  }
  regions.push({ id, label, panelIds: ids(matching) })
}

function explicitPanelRegions(panels: GarmentPanelDefinition[]): ColorRegion[] {
  const grouped = new Map<string, GarmentPanelDefinition[]>()
  for (const panel of panels) {
    if (!panel.regionId) {
      continue
    }
    const list = grouped.get(panel.regionId) ?? []
    list.push(panel)
    grouped.set(panel.regionId, list)
  }
  return [...grouped.entries()].map(([id, members]) => ({
    id,
    label: members[0]?.regionLabel ?? titleType(id),
    panelIds: ids(members),
  }))
}

export function deriveRegionsFromPanels(panels: GarmentPanelDefinition[]): ColorRegion[] {
  const unlabeled = panels.filter((panel) => !panel.regionId)
  const regions: ColorRegion[] = []

  const body = unlabeled.filter((panel) => panel.type === 'body')
  const leftBodies = body.filter((panel) => inferPanelSide(panel) === 'left')
  const rightBodies = body.filter((panel) => inferPanelSide(panel) === 'right')
  if (leftBodies.length > 0 && rightBodies.length > 0) {
    regions.push({ id: 'front-left', label: 'Left front', panelIds: ids(leftBodies) })
    regions.push({ id: 'front-right', label: 'Right front', panelIds: ids(rightBodies) })
    const remainder = body.filter(
      (panel) => inferPanelSide(panel) !== 'left' && inferPanelSide(panel) !== 'right',
    )
    if (remainder.length > 0) {
      regions.push({
        id: remainder.every((panel) => inferPanelSide(panel) === 'back') ? 'back' : 'body-other',
        label: remainder.every((panel) => inferPanelSide(panel) === 'back') ? 'Back' : 'Body',
        panelIds: ids(remainder),
      })
    }
  } else {
    const front = body.filter((panel) => inferPanelSide(panel) === 'front')
    const back = body.filter((panel) => inferPanelSide(panel) === 'back')
    if (front.length > 0) {
      regions.push({ id: 'front-body', label: 'Front body', panelIds: ids(front) })
    }
    if (back.length > 0) {
      regions.push({ id: 'back-body', label: 'Back body', panelIds: ids(back) })
    }
  }

  addTypedRegions(regions, unlabeled, 'sleeve', (side) => (side === 'left' ? 'Left sleeve' : 'Right sleeve'), 'Sleeves', 'sleeves')
  addTypedRegions(regions, unlabeled, 'leg', (side) => (side === 'left' ? 'Left leg' : 'Right leg'), 'Legs', 'legs')
  addGroup(regions, unlabeled, 'hood', 'hood', 'Hood')
  addGroup(regions, unlabeled, 'collar', 'collar', 'Collar')
  addTypedRegions(regions, unlabeled, 'cuff', (side) => (side === 'left' ? 'Left cuff' : 'Right cuff'), 'Cuffs', 'cuffs')
  addGroup(regions, unlabeled, 'hem', 'hem', 'Hem')
  addGroup(regions, unlabeled, 'waistband', 'waistband', 'Waistband')
  addTypedRegions(regions, unlabeled, 'pocket', (side) => (side === 'left' ? 'Left pocket' : 'Right pocket'), 'Pockets', 'pockets')
  addGroup(regions, unlabeled, 'zipper', 'zipper', 'Zipper')
  addGroup(regions, unlabeled, 'crown', 'crown', 'Crown')
  addGroup(regions, unlabeled, 'brim', 'brim', 'Brim')
  addGroup(regions, unlabeled, 'band', 'band', 'Band')
  addTypedRegions(
    regions,
    unlabeled,
    'side_panel',
    (side) => (side === 'left' ? 'Left side' : 'Right side'),
    'Sides',
    'sides',
  )
  addGroup(regions, unlabeled, 'structure', 'structure', 'Structure')
  addTypedRegions(regions, unlabeled, 'hand', (side) => (side === 'left' ? 'Left hand' : 'Right hand'), 'Hands', 'hands')
  addTypedRegions(regions, unlabeled, 'foot', (side) => (side === 'left' ? 'Left foot' : 'Right foot'), 'Feet', 'feet')
  addGroup(regions, unlabeled, 'shell', 'shell', 'Shell')
  addGroup(regions, unlabeled, 'strap', 'strap', 'Strap')
  addGroup(regions, unlabeled, 'flap', 'flap', 'Flap')

  const seams = unlabeled.filter((panel) => panel.type === 'seam')
  const inseam = seams.filter((panel) => panel.id.includes('inseam'))
  const outseam = seams.filter((panel) => panel.id.includes('outseam'))
  if (inseam.length > 0) {
    regions.push({ id: 'inseam', label: 'Inseam', panelIds: ids(inseam) })
  }
  if (outseam.length > 0) {
    regions.push({ id: 'outseam', label: 'Outseam', panelIds: ids(outseam) })
  }

  regions.push(...explicitPanelRegions(panels))
  return regions
}

export function regionsForDefinition(garment: GarmentDefinition): ColorRegion[] {
  if (garment.regions && garment.regions.length > 0) {
    return garment.regions.map((region: GarmentRegionDefinition) => ({
      id: region.id,
      label: region.label,
      panelIds: [...region.panelIds],
    }))
  }
  return deriveRegionsFromPanels(garment.panels)
}

export function colorRegionsFor(garmentType: string): ColorRegion[] {
  return regionsForDefinition(getGarment(garmentType))
}

export function colorRegionById(garmentType: string, id: string): ColorRegion | undefined {
  const resolved = REGION_ALIASES[id] ?? id
  return colorRegionsFor(garmentType).find((region) => region.id === resolved || region.id === id)
}

export function regionForPanel(garmentType: string, panelId: string): ColorRegion | null {
  return colorRegionsFor(garmentType).find((region) => region.panelIds.includes(panelId)) ?? null
}

export function regionColor(document: DesignDocument, region: ColorRegion): string {
  const values = region.panelIds.map((panelId) => getPanelColor(document, panelId))
  if (values.length === 0) {
    return getPanelColor(document, document.activePanelId)
  }
  return values.every((value) => value === values[0]) ? values[0] : values[0]
}

export function regionLabelForPanel(garmentType: string, panelId: string): string | null {
  const region = regionForPanel(garmentType, panelId)
  if (region) {
    return region.label
  }
  const panel = getGarment(garmentType).panels.find((item) => item.id === panelId)
  return panel ? panelName(panel) : null
}
