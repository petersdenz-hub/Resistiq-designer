import { getGarmentPanel, localRectToCanvas } from '@/garments/coordinates'
import { localFromPercent, panelDesignBounds } from '@/garments/model'
import { getGarment } from '@/garments/registry'
import type { GarmentRect } from '@/garments/types'
import { defaultPanelIdForZone, type DesignObject } from './designObjects'
import type { DesignDocument } from './types'

/**
 * Printable clip box in garment viewBox units.
 * Used only at render time — never written back onto the designObject.
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
