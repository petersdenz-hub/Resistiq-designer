import {
  getStoredConstruction,
  resolveConstruction,
  type ResolvedConstruction,
} from './construction'
import {
  getDesignObjectById as readDesignObjectById,
  getDesignObjects,
  getDesignObjectsInZone,
  resolveActiveZone,
} from './designObjects'
import type { DesignDocument, DesignElement, DesignPanel, DesignSafeArea } from './types'

export function getBodyColor(document: DesignDocument): string {
  return document.colors.find((color) => color.role === 'body')?.value ?? '#e8e4dc'
}

/** Explicit panel overrides only. Missing panels fall back to body color. */
export function getPanelColorMap(document: DesignDocument): Record<string, string> {
  const map: Record<string, string> = {}
  for (const color of document.colors) {
    if (color.role === 'panel') {
      map[color.id] = color.value
    }
  }
  return map
}

export function getPanelColor(document: DesignDocument, panelId: string): string {
  return getPanelColorMap(document)[panelId] ?? getBodyColor(document)
}

/** Reserved for later trim/structure colors. Falls back to body. */
export function getTrimColor(document: DesignDocument, trimId: string): string {
  return (
    document.colors.find((color) => color.role === 'trim' && color.id === trimId)?.value ??
    getBodyColor(document)
  )
}

export function getPanelById(
  document: DesignDocument,
  panelId: string,
): DesignPanel | null {
  return document.panels.find((panel) => panel.id === panelId) ?? null
}

export function getPanelsInView(document: DesignDocument, viewId: string): DesignPanel[] {
  return document.panels.filter((panel) => panel.viewId === viewId)
}

export function getSafeAreasInView(
  document: DesignDocument,
  viewId: string,
): DesignSafeArea[] {
  const panelIds = new Set(getPanelsInView(document, viewId).map((panel) => panel.id))
  return document.safeAreas.filter((area) => panelIds.has(area.panelId))
}

export function getElementsInView(
  document: DesignDocument,
  viewId: string,
  order: 'paint' | 'stack' = 'paint',
): DesignElement[] {
  const elements = document.elements.filter((element) => {
    const panel = getPanelById(document, element.panelId)
    return (panel?.viewId ?? element.viewId) === viewId
  })

  return elements.sort((a, b) =>
    order === 'stack' ? b.zIndex - a.zIndex : a.zIndex - b.zIndex,
  )
}

export function getElementById(
  document: DesignDocument,
  elementId: string | null,
): DesignElement | null {
  if (!elementId) {
    return null
  }
  return document.elements.find((element) => element.id === elementId) ?? null
}

export function getConstruction(document: DesignDocument) {
  return getStoredConstruction(document)
}

export function getResolvedConstruction(document: DesignDocument): ResolvedConstruction {
  return resolveConstruction(document)
}

export { getDesignObjects, getDesignObjectsInZone, readDesignObjectById as getDesignObjectById, resolveActiveZone }
