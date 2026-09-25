import { getPanelColor } from '@/design/selectors'
import type { DesignDocument } from '@/design/types'
import { inferPanelSide, panelName } from './model'
import { getGarment } from './registry'
import type { GarmentPanelDefinition, GarmentPanelType } from './types'

/**
 * A colorable garment region backed by one or more real panels.
 * Regions are derived from GarmentDefinition panels — never invented.
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

function splitRegionId(type: GarmentPanelType, side: 'left' | 'right'): string {
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
  return `${type}-${side}`
}

function addTypedRegions(
  regions: ColorRegion[],
  panels: GarmentPanelDefinition[],
  type: GarmentPanelType,
  splitLabel: (side: 'left' | 'right') => string,
  groupedLabel: string,
  groupedId: string,
) {
  const matching = panels.filter((panel) => panel.type === type)
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
  const matching = panels.filter((panel) => panel.type === type)
  if (matching.length === 0) {
    return
  }
  regions.push({ id, label, panelIds: ids(matching) })
}

export function colorRegionsFor(garmentType: string): ColorRegion[] {
  const garment = getGarment(garmentType)
  const panels = garment.panels
  const regions: ColorRegion[] = []

  const body = panels.filter((panel) => panel.type === 'body')
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

  addTypedRegions(regions, panels, 'sleeve', (side) => (side === 'left' ? 'Left sleeve' : 'Right sleeve'), 'Sleeves', 'sleeves')
  addTypedRegions(regions, panels, 'leg', (side) => (side === 'left' ? 'Left leg' : 'Right leg'), 'Legs', 'legs')
  addGroup(regions, panels, 'hood', 'hood', 'Hood')
  addGroup(regions, panels, 'collar', 'collar', 'Collar')
  addTypedRegions(regions, panels, 'cuff', (side) => (side === 'left' ? 'Left cuff' : 'Right cuff'), 'Cuffs', 'cuffs')
  addGroup(regions, panels, 'hem', 'hem', 'Hem')
  addGroup(regions, panels, 'waistband', 'waistband', 'Waistband')

  const pockets = panels.filter((panel) => panel.type === 'pocket')
  if (pockets.length > 0) {
    const left = pockets.filter((panel) => inferPanelSide(panel) === 'left')
    const right = pockets.filter((panel) => inferPanelSide(panel) === 'right')
    if (garmentType === 'shorts' && left.length > 0 && right.length > 0) {
      regions.push({ id: 'pockets', label: 'Pockets', panelIds: ids(pockets) })
    } else if (left.length > 0 && right.length > 0) {
      regions.push({ id: 'left-pocket', label: 'Left pocket', panelIds: ids(left) })
      regions.push({ id: 'right-pocket', label: 'Right pocket', panelIds: ids(right) })
    } else {
      regions.push({
        id: garmentType === 'hoodie' ? 'kangaroo-pocket' : 'pockets',
        label: garmentType === 'hoodie' ? 'Kangaroo pocket' : 'Pockets',
        panelIds: ids(pockets),
      })
    }
  }

  addGroup(regions, panels, 'zipper', 'zipper', 'Zipper')

  const seams = panels.filter((panel) => panel.type === 'seam')
  const inseam = seams.filter((panel) => panel.id.includes('inseam'))
  const outseam = seams.filter((panel) => panel.id.includes('outseam'))
  if (inseam.length > 0) {
    regions.push({ id: 'inseam', label: 'Inseam', panelIds: ids(inseam) })
  }
  if (outseam.length > 0) {
    regions.push({ id: 'outseam', label: 'Outseam', panelIds: ids(outseam) })
  }

  return regions
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
