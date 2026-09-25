import { getGarment } from './registry'
import type { GarmentDefinition, GarmentPanelDefinition, GarmentRect } from './types'

/** Closed rectangle as an SVG path in viewBox units. */
export function rectPath(x: number, y: number, width: number, height: number): string {
  return `M${x} ${y} H${x + width} V${y + height} H${x} Z`
}

export function asSilhouettePaths(value: string | string[] | undefined): string[] {
  if (!value) {
    return []
  }
  return (Array.isArray(value) ? value : [value]).filter((path) => path.length > 0)
}

export function panelSilhouettePaths(panel: GarmentPanelDefinition | undefined): string[] {
  return panel ? asSilhouettePaths(panel.silhouette) : []
}

export function attachSilhouettes(
  panels: GarmentPanelDefinition[],
  paths: Record<string, string | string[]>,
): GarmentPanelDefinition[] {
  return panels.map((panel) => {
    const silhouette = panel.silhouette ?? paths[panel.id]
    return silhouette ? { ...panel, silhouette } : panel
  })
}

export function viewPanelSilhouettes(garment: GarmentDefinition, viewId: string): string[] {
  return garment.panels
    .filter((panel) => panel.viewId === viewId)
    .flatMap((panel) => panelSilhouettePaths(panel))
}

export function garmentSilhouettePaths(garmentType: string, viewId: string): string[] {
  return viewPanelSilhouettes(getGarment(garmentType), viewId)
}

export function panelSilhouetteFor(garmentType: string, panelId: string): string[] {
  const panel = getGarment(garmentType).panels.find((item) => item.id === panelId)
  return panelSilhouettePaths(panel)
}

export function silhouetteBounds(paths: string[]): GarmentRect | null {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const path of paths) {
    const numbers = path.match(/-?\d*\.?\d+/g)
    if (!numbers || numbers.length < 2) {
      continue
    }
    for (let index = 0; index + 1 < numbers.length; index += 2) {
      const x = Number(numbers[index])
      const y = Number(numbers[index + 1])
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        continue
      }
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || maxX <= minX || maxY <= minY) {
    return null
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

export function hasGarmentSilhouette(garmentType: string, viewId = 'front'): boolean {
  return garmentSilhouettePaths(garmentType, viewId).length > 0
}
