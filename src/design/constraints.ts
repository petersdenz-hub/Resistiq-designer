import { getGarment } from '@/garments/registry'
import { getGarmentPanel, minLocalSize } from '@/garments/coordinates'
import type { DesignDocument, DesignElement, DesignSafeArea } from './types'

export interface LocalRect {
  x: number
  y: number
  width: number
  height: number
}

/** How far an element may sit outside the safe area / panel. */
const SLACK = 0.08

export function getSafeAreaForPanel(
  document: DesignDocument,
  panelId: string,
): DesignSafeArea | null {
  return document.safeAreas.find((area) => area.panelId === panelId) ?? null
}

/**
 * Soft bounds for an element: the panel's safe area when it has one,
 * otherwise the full panel. A little overflow is allowed so placement
 * does not feel locked to the guide.
 */
export function getConstraintBounds(
  document: DesignDocument,
  panelId: string,
): LocalRect | null {
  const garment = getGarment(document.garmentType)
  const panel = getGarmentPanel(garment, panelId)
  if (!panel) {
    return null
  }

  const safe = getSafeAreaForPanel(document, panelId)
  if (safe) {
    return { x: safe.x, y: safe.y, width: safe.width, height: safe.height }
  }

  return { x: 0, y: 0, width: panel.local.width, height: panel.local.height }
}

export function constrainRect(bounds: LocalRect, rect: LocalRect, minSize: number): LocalRect {
  const slackX = bounds.width * SLACK
  const slackY = bounds.height * SLACK
  const minX = bounds.x - slackX
  const minY = bounds.y - slackY
  const maxRight = bounds.x + bounds.width + slackX
  const maxBottom = bounds.y + bounds.height + slackY

  const width = clamp(rect.width, minSize, Math.max(minSize, maxRight - minX))
  const height = clamp(rect.height, minSize, Math.max(minSize, maxBottom - minY))
  const x = clamp(rect.x, minX, maxRight - width)
  const y = clamp(rect.y, minY, maxBottom - height)

  return { x, y, width, height }
}

export function constrainElementInDocument<T extends DesignElement>(
  document: DesignDocument,
  element: T,
): T {
  const bounds = getConstraintBounds(document, element.panelId)
  if (!bounds) {
    return element
  }

  const garment = getGarment(document.garmentType)
  const panel = getGarmentPanel(garment, element.panelId)
  const minSize = panel ? minLocalSize(panel) : 8
  const next = constrainRect(bounds, element, minSize)

  if (
    next.x === element.x &&
    next.y === element.y &&
    next.width === element.width &&
    next.height === element.height
  ) {
    return element
  }

  return { ...element, ...next }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
