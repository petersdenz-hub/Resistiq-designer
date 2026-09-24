import type { DesignElement } from '@/design/types'
import type { GarmentDefinition, GarmentPanelDefinition, GarmentRect } from './types'

export interface Point {
  x: number
  y: number
}

export function getGarmentPanel(
  garment: GarmentDefinition,
  panelId: string,
): GarmentPanelDefinition | null {
  return garment.panels.find((panel) => panel.id === panelId) ?? null
}

export function getPanelsForView(
  garment: GarmentDefinition,
  viewId: string,
): GarmentPanelDefinition[] {
  return garment.panels.filter((panel) => panel.viewId === viewId)
}

export function panelToCanvas(panel: GarmentPanelDefinition, local: Point): Point {
  return {
    x: panel.frame.x + (local.x / panel.local.width) * panel.frame.width,
    y: panel.frame.y + (local.y / panel.local.height) * panel.frame.height,
  }
}

export function canvasToPanel(panel: GarmentPanelDefinition, canvas: Point): Point {
  return {
    x: ((canvas.x - panel.frame.x) / panel.frame.width) * panel.local.width,
    y: ((canvas.y - panel.frame.y) / panel.frame.height) * panel.local.height,
  }
}

export function localRectToCanvas(panel: GarmentPanelDefinition, rect: GarmentRect): GarmentRect {
  const origin = panelToCanvas(panel, { x: rect.x, y: rect.y })
  return {
    x: origin.x,
    y: origin.y,
    width: (rect.width / panel.local.width) * panel.frame.width,
    height: (rect.height / panel.local.height) * panel.frame.height,
  }
}

export function canvasRectToLocal(panel: GarmentPanelDefinition, rect: GarmentRect): GarmentRect {
  const origin = canvasToPanel(panel, { x: rect.x, y: rect.y })
  return {
    x: origin.x,
    y: origin.y,
    width: (rect.width / panel.frame.width) * panel.local.width,
    height: (rect.height / panel.frame.height) * panel.local.height,
  }
}

export function elementToCanvasRect(
  element: Pick<DesignElement, 'x' | 'y' | 'width' | 'height'>,
  panel: GarmentPanelDefinition,
): GarmentRect {
  return localRectToCanvas(panel, {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  })
}

export function toDisplayElement<T extends DesignElement>(
  element: T,
  panel: GarmentPanelDefinition,
): T {
  const rect = elementToCanvasRect(element, panel)
  const scaleX = panel.frame.width / panel.local.width
  return {
    ...element,
    ...rect,
    ...(element.type === 'graphic'
      ? { cornerRadius: element.cornerRadius * scaleX }
      : {}),
    ...(element.type === 'text'
      ? {
          fontSize: element.fontSize * scaleX,
          letterSpacing: element.letterSpacing * scaleX,
        }
      : {}),
  }
}

export function minLocalSize(panel: GarmentPanelDefinition, minCanvasSize = 16): number {
  const scale = Math.min(
    panel.frame.width / panel.local.width,
    panel.frame.height / panel.local.height,
  )
  return minCanvasSize / scale
}
