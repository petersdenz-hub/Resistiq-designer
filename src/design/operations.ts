import { getGarment } from '@/garments/registry'
import { getGarmentPanel } from '@/garments/coordinates'
import { createId } from './ids'
import type {
  DesignDocument,
  DesignElement,
  DesignElementPatch,
  GraphicElement,
  TextElement,
} from './types'

function touch(document: DesignDocument): DesignDocument {
  return {
    ...document,
    updatedAt: new Date().toISOString(),
  }
}

export function nextZIndex(document: DesignDocument): number {
  return document.elements.reduce((max, element) => Math.max(max, element.zIndex), 0) + 1
}

export function getDocumentPanel(document: DesignDocument, panelId: string) {
  return document.panels.find((panel) => panel.id === panelId) ?? null
}

export function resolvePanelId(document: DesignDocument, panelId?: string): string {
  if (panelId && document.panels.some((panel) => panel.id === panelId)) {
    return panelId
  }
  const garment = getGarment(document.garmentType)
  return garment.defaultPanelId(document.activeView)
}

export function setDesignName(document: DesignDocument, name: string): DesignDocument {
  return touch({
    ...document,
    name,
  })
}

export function setActiveView(document: DesignDocument, viewId: string): DesignDocument {
  if (!document.views.some((view) => view.id === viewId)) {
    return document
  }
  const garment = getGarment(document.garmentType)
  const panelStillValid = document.panels.some(
    (panel) => panel.id === document.activePanelId && panel.viewId === viewId,
  )
  return touch({
    ...document,
    activeView: viewId,
    activePanelId: panelStillValid
      ? document.activePanelId
      : garment.defaultPanelId(viewId),
  })
}

export function setActivePanel(document: DesignDocument, panelId: string): DesignDocument {
  const panel = getDocumentPanel(document, panelId)
  if (!panel) {
    return document
  }
  return touch({
    ...document,
    activePanelId: panelId,
    activeView: panel.viewId,
  })
}

export function setColorValue(
  document: DesignDocument,
  colorId: string,
  value: string,
): DesignDocument {
  return touch({
    ...document,
    colors: document.colors.map((color) =>
      color.id === colorId ? { ...color, value } : color,
    ),
  })
}

export function addElement(
  document: DesignDocument,
  element: DesignElement,
): DesignDocument {
  return touch({
    ...document,
    elements: [...document.elements, element],
  })
}

export function removeElement(document: DesignDocument, elementId: string): DesignDocument {
  return touch({
    ...document,
    elements: document.elements.filter((element) => element.id !== elementId),
  })
}

export function updateElement(
  document: DesignDocument,
  elementId: string,
  patch: DesignElementPatch,
): DesignDocument {
  return touch({
    ...document,
    elements: document.elements.map((element) =>
      element.id === elementId ? ({ ...element, ...patch } as DesignElement) : element,
    ),
  })
}

export function moveElementLayer(
  document: DesignDocument,
  elementId: string,
  direction: 'forward' | 'backward',
): DesignDocument {
  const current = document.elements.find((element) => element.id === elementId)
  if (!current) {
    return document
  }

  const siblings = document.elements
    .filter((element) => element.panelId === current.panelId)
    .sort((a, b) => a.zIndex - b.zIndex)

  const index = siblings.findIndex((element) => element.id === elementId)
  const swapWith = direction === 'forward' ? siblings[index + 1] : siblings[index - 1]
  if (!swapWith) {
    return document
  }

  return touch({
    ...document,
    elements: document.elements.map((element) => {
      if (element.id === current.id) {
        return { ...element, zIndex: swapWith.zIndex }
      }
      if (element.id === swapWith.id) {
        return { ...element, zIndex: current.zIndex }
      }
      return element
    }),
  })
}

function defaultPlacement(document: DesignDocument, panelId: string) {
  const garment = getGarment(document.garmentType)
  const panel = getGarmentPanel(garment, panelId)
  if (!panel) {
    return { x: 40, y: 32, width: 64, height: 64 }
  }

  const width = panel.local.width * 0.34
  const height = width
  return {
    x: (panel.local.width - width) / 2,
    y: panel.local.height * 0.12,
    width,
    height,
  }
}

export function createGraphicElement(
  document: DesignDocument,
  panelId?: string,
): GraphicElement {
  const resolvedPanelId = resolvePanelId(document, panelId)
  const panel = getDocumentPanel(document, resolvedPanelId)
  const box = defaultPlacement(document, resolvedPanelId)

  return {
    id: createId(),
    type: 'graphic',
    panelId: resolvedPanelId,
    viewId: panel?.viewId ?? document.activeView,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    rotation: 0,
    opacity: 1,
    zIndex: nextZIndex(document),
    color: '#1a1a1a',
    shape: 'rect',
    cornerRadius: 8,
  }
}

export function createTextElement(document: DesignDocument, panelId?: string): TextElement {
  const resolvedPanelId = resolvePanelId(document, panelId)
  const panel = getDocumentPanel(document, resolvedPanelId)
  const garment = getGarment(document.garmentType)
  const geometry = getGarmentPanel(garment, resolvedPanelId)
  const width = geometry ? geometry.local.width * 0.72 : 140
  const height = geometry ? Math.max(28, geometry.local.height * 0.12) : 36

  return {
    id: createId(),
    type: 'text',
    panelId: resolvedPanelId,
    viewId: panel?.viewId ?? document.activeView,
    x: geometry ? (geometry.local.width - width) / 2 : 16,
    y: geometry ? geometry.local.height * 0.42 : 80,
    width,
    height,
    rotation: 0,
    opacity: 1,
    zIndex: nextZIndex(document),
    content: 'Text',
    color: '#1a1a1a',
    fontFamily: 'IBM Plex Sans, sans-serif',
  }
}
