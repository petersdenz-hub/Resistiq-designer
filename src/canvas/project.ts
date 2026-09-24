import type { DesignDocument, DesignElement } from '@/design/types'
import {
  canvasRectToLocal,
  elementToCanvasRect,
  getGarmentPanel,
  toDisplayElement,
} from '@/garments/coordinates'
import { getGarment } from '@/garments/registry'
import type { GarmentPanelDefinition, GarmentRect } from '@/garments/types'

export function panelForElement(
  document: DesignDocument,
  element: Pick<DesignElement, 'panelId'>,
): GarmentPanelDefinition | null {
  const garment = getGarment(document.garmentType)
  return getGarmentPanel(garment, element.panelId)
}

export function toCanvasElement(
  document: DesignDocument,
  element: DesignElement,
): DesignElement {
  const panel = panelForElement(document, element)
  return panel ? toDisplayElement(element, panel) : element
}

export function canvasPatchToLocal(
  document: DesignDocument,
  element: DesignElement,
  canvasRect: GarmentRect,
): GarmentRect | null {
  const panel = panelForElement(document, element)
  if (!panel) {
    return null
  }
  return canvasRectToLocal(panel, canvasRect)
}

export function canvasOffsetToLocal(
  document: DesignDocument,
  element: DesignElement,
  dx: number,
  dy: number,
): { x: number; y: number } | null {
  const panel = panelForElement(document, element)
  if (!panel) {
    return null
  }
  return {
    x: element.x + (dx / panel.frame.width) * panel.local.width,
    y: element.y + (dy / panel.frame.height) * panel.local.height,
  }
}

export function canvasRectOf(
  document: DesignDocument,
  element: DesignElement,
): GarmentRect {
  const panel = panelForElement(document, element)
  if (!panel) {
    return { x: element.x, y: element.y, width: element.width, height: element.height }
  }
  return elementToCanvasRect(element, panel)
}
