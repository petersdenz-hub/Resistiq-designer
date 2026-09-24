import { getGarment } from '@/garments/registry'
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
  return touch({
    ...document,
    activeView: viewId,
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
    .filter((element) => element.viewId === current.viewId)
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

function printAreaFor(document: DesignDocument, viewId: string) {
  const garment = getGarment(document.garmentType)
  const fallbackViewId = garment.views[0]?.id
  return (
    garment.printArea[viewId] ??
    (fallbackViewId ? garment.printArea[fallbackViewId] : undefined) ?? {
      x: 140,
      y: 160,
      width: 120,
      height: 160,
    }
  )
}

export function createGraphicElement(
  document: DesignDocument,
  viewId: string,
): GraphicElement {
  const area = printAreaFor(document, viewId)
  return {
    id: createId(),
    type: 'graphic',
    viewId,
    x: area.x + (area.width - 72) / 2,
    y: area.y + 28,
    width: 72,
    height: 72,
    rotation: 0,
    opacity: 1,
    zIndex: nextZIndex(document),
    color: '#1a1a1a',
    shape: 'rect',
    cornerRadius: 10,
  }
}

export function createTextElement(document: DesignDocument, viewId: string): TextElement {
  const area = printAreaFor(document, viewId)
  return {
    id: createId(),
    type: 'text',
    viewId,
    x: area.x + 8,
    y: area.y + area.height / 2 - 18,
    width: area.width - 16,
    height: 36,
    rotation: 0,
    opacity: 1,
    zIndex: nextZIndex(document),
    content: 'Text',
    color: '#1a1a1a',
    fontFamily: 'IBM Plex Sans, sans-serif',
  }
}
