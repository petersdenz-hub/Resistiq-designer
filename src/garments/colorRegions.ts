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

function ids(panels: GarmentPanelDefinition[]): string[] {
  return [...new Set(panels.map((panel) => panel.id))]
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
    regions.push({ id: `${type}-left`, label: splitLabel('left'), panelIds: ids(left) })
    regions.push({ id: `${type}-right`, label: splitLabel('right'), panelIds: ids(right) })
    return
  }
  regions.push({ id: groupedId, label: groupedLabel, panelIds: ids(matching) })
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
        id: 'body-other',
        label: remainder.every((panel) => inferPanelSide(panel) === 'back') ? 'Back' : 'Body',
        panelIds: ids(remainder),
      })
    }
  } else if (body.length > 0) {
    regions.push({ id: 'body', label: 'Body', panelIds: ids(body) })
  }

  addTypedRegions(regions, panels, 'sleeve', (side) => (side === 'left' ? 'Left sleeve' : 'Right sleeve'), 'Sleeves', 'sleeves')
  addTypedRegions(regions, panels, 'leg', (side) => (side === 'left' ? 'Left leg' : 'Right leg'), 'Legs', 'legs')

  const hood = panels.filter((panel) => panel.type === 'hood')
  if (hood.length > 0) {
    regions.push({ id: 'hood', label: 'Hood', panelIds: ids(hood) })
  }
  const collar = panels.filter((panel) => panel.type === 'collar')
  if (collar.length > 0) {
    regions.push({ id: 'collar', label: 'Collar', panelIds: ids(collar) })
  }
  const cuffs = panels.filter((panel) => panel.type === 'cuff')
  if (cuffs.length > 0) {
    regions.push({ id: 'cuffs', label: 'Cuffs', panelIds: ids(cuffs) })
  }
  const waistband = panels.filter((panel) => panel.type === 'waistband')
  if (waistband.length > 0) {
    regions.push({ id: 'waistband', label: 'Waistband', panelIds: ids(waistband) })
  }

  return regions
}

export function regionColor(document: DesignDocument, region: ColorRegion): string {
  const values = region.panelIds.map((panelId) => getPanelColor(document, panelId))
  if (values.length === 0) {
    return getPanelColor(document, document.activePanelId)
  }
  return values.every((value) => value === values[0]) ? values[0] : values[0]
}

export function regionLabelForPanel(garmentType: string, panelId: string): string | null {
  const region = colorRegionsFor(garmentType).find((item) => item.panelIds.includes(panelId))
  if (region) {
    return region.label
  }
  const panel = getGarment(garmentType).panels.find((item) => item.id === panelId)
  return panel ? panelName(panel) : null
}
