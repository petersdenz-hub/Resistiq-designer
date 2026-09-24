import type { DesignDocument, DesignElement, DesignPanel, DesignSafeArea } from './types'

export function getBodyColor(document: DesignDocument): string {
  return document.colors.find((color) => color.role === 'body')?.value ?? '#e8e4dc'
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
