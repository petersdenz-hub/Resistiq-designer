import { getGarmentPanel } from '@/garments/coordinates'
import { localFromPercent, panelDesignBounds } from '@/garments/model'
import { getGarment } from '@/garments/registry'
import {
  garmentSilhouettePaths,
  panelSilhouettePaths,
} from '@/garments/topology'
import type { GarmentRect } from '@/garments/types'
import { defaultPanelIdForZone, type DesignObject } from './designObjects'
import { localRectToCanvas } from '@/garments/coordinates'
import type { DesignDocument } from './types'

/**
 * Printable clip box in garment viewBox units.
 * Placement/guide helper only — not the final artwork clip shape.
 */
export function objectClipBox(document: DesignDocument, object: DesignObject): GarmentRect | null {
  const panelId = object.anchor.panelId ?? defaultPanelIdForZone(document, object.zone)
  if (!panelId) {
    return null
  }
  const panel = getGarmentPanel(getGarment(document.garmentType), panelId)
  if (!panel) {
    return null
  }
  return localRectToCanvas(panel, localFromPercent(panelDesignBounds(panel), panel.local))
}

export function panelPrintBox(document: DesignDocument, panelId: string | undefined): GarmentRect | null {
  if (!panelId) {
    return null
  }
  const panel = getGarmentPanel(getGarment(document.garmentType), panelId)
  if (!panel) {
    return null
  }
  return localRectToCanvas(panel, localFromPercent(panelDesignBounds(panel), panel.local))
}

/**
 * True artwork clip: the panel/region silhouette, then the garment silhouette.
 * Never a generic print rectangle.
 */
export function objectClipPaths(document: DesignDocument, object: DesignObject): string[] {
  const panelId = object.anchor.panelId ?? defaultPanelIdForZone(document, object.zone)
  const panel = panelId ? getGarmentPanel(getGarment(document.garmentType), panelId) : null
  const panelPaths = panelSilhouettePaths(panel ?? undefined)
  if (panelPaths.length > 0) {
    return panelPaths
  }
  const viewId =
    panel?.viewId ??
    (object.zone === 'back' || object.zone === 'front' ? object.zone : document.activeView)
  return garmentSilhouettePaths(document.garmentType, viewId)
}

export function garmentViewClipPaths(document: DesignDocument, viewId: string): string[] {
  return garmentSilhouettePaths(document.garmentType, viewId)
}
