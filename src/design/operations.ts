import { getGarment } from '@/garments/registry'
import { getGarmentPanel } from '@/garments/coordinates'
import { constrainElementInDocument, getConstraintBounds } from './constraints'
import {
  clearConstructionPart as writeClearConstructionPart,
  patchConstruction as writePatchConstruction,
  setConstructionPart as writeSetConstructionPart,
  upsertMaterial as writeUpsertMaterial,
} from './construction'
import {
  setConstructionStyle as writeSetConstructionStyle,
  setConstructionVariant as writeSetConstructionVariant,
  setGarmentMaterial as writeSetGarmentMaterial,
} from './constructionEdits'
import { createId } from './ids'
import { DEFAULT_TEXT_FONT } from './typography'
import type {
  ConstructionKind,
  DesignConstruction,
  DesignConstructionPart,
  DesignDocument,
  DesignElement,
  DesignElementPatch,
  DesignMaterial,
  GraphicElement,
  ImageElement,
  LayerDirection,
  LogoElement,
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
    activeZone: viewId === 'back' || viewId === 'front' ? viewId : document.activeZone,
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

export function setPanelColor(
  document: DesignDocument,
  panelId: string,
  value: string,
): DesignDocument {
  const index = document.colors.findIndex(
    (color) => color.role === 'panel' && color.id === panelId,
  )
  if (index >= 0) {
    return touch({
      ...document,
      colors: document.colors.map((color, colorIndex) =>
        colorIndex === index ? { ...color, value } : color,
      ),
    })
  }

  return touch({
    ...document,
    colors: [...document.colors, { id: panelId, role: 'panel', value }],
  })
}

export function patchConstruction(
  document: DesignDocument,
  patch: DesignConstruction,
): DesignDocument {
  return writePatchConstruction(document, patch)
}

export function setConstructionPart(
  document: DesignDocument,
  part: DesignConstructionPart,
): DesignDocument {
  return writeSetConstructionPart(document, part)
}

export function clearConstructionPart(
  document: DesignDocument,
  kind: ConstructionKind,
  partId?: string,
): DesignDocument {
  return writeClearConstructionPart(document, kind, partId)
}

export function upsertMaterial(
  document: DesignDocument,
  material: DesignMaterial,
): DesignDocument {
  return writeUpsertMaterial(document, material)
}

export function setConstructionStyle(
  document: DesignDocument,
  kind: ConstructionKind,
  style: string,
  slot?: string,
): DesignDocument {
  return writeSetConstructionStyle(document, kind, style, slot)
}

export function setConstructionVariant(
  document: DesignDocument,
  kind: 'zipper' | 'hood',
  variant: string,
): DesignDocument {
  return writeSetConstructionVariant(document, kind, variant)
}

export function setGarmentMaterial(
  document: DesignDocument,
  materialId: string,
): DesignDocument {
  return writeSetGarmentMaterial(document, materialId)
}

export function addElement(
  document: DesignDocument,
  element: DesignElement,
): DesignDocument {
  return touch({
    ...document,
    elements: [...document.elements, constrainElementInDocument(document, element)],
  })
}

export function removeElement(document: DesignDocument, elementId: string): DesignDocument {
  return touch({
    ...document,
    elements: document.elements.filter((element) => element.id !== elementId),
  })
}

function patchTouchesBox(patch: DesignElementPatch): boolean {
  return (
    patch.x !== undefined ||
    patch.y !== undefined ||
    patch.width !== undefined ||
    patch.height !== undefined
  )
}

export function updateElement(
  document: DesignDocument,
  elementId: string,
  patch: DesignElementPatch,
): DesignDocument {
  return touch({
    ...document,
    elements: document.elements.map((element) => {
      if (element.id !== elementId) {
        return element
      }
      const next = { ...element, ...patch } as DesignElement
      return patchTouchesBox(patch) ? constrainElementInDocument(document, next) : next
    }),
  })
}

export function moveElementLayer(
  document: DesignDocument,
  elementId: string,
  direction: LayerDirection,
): DesignDocument {
  const current = document.elements.find((element) => element.id === elementId)
  if (!current) {
    return document
  }

  const siblings = document.elements
    .filter((element) => element.viewId === current.viewId)
    .sort((a, b) => a.zIndex - b.zIndex)

  const index = siblings.findIndex((element) => element.id === elementId)
  if (index < 0) {
    return document
  }

  const nextOrder = siblings.slice()
  if (direction === 'forward') {
    if (index >= nextOrder.length - 1) {
      return document
    }
    ;[nextOrder[index], nextOrder[index + 1]] = [nextOrder[index + 1], nextOrder[index]]
  } else if (direction === 'backward') {
    if (index <= 0) {
      return document
    }
    ;[nextOrder[index - 1], nextOrder[index]] = [nextOrder[index], nextOrder[index - 1]]
  } else if (direction === 'front') {
    if (index >= nextOrder.length - 1) {
      return document
    }
    nextOrder.push(...nextOrder.splice(index, 1))
  } else if (index <= 0) {
    return document
  } else {
    nextOrder.unshift(...nextOrder.splice(index, 1))
  }

  const zById = new Map(nextOrder.map((element, order) => [element.id, order + 1]))

  return touch({
    ...document,
    elements: document.elements.map((element) => {
      const zIndex = zById.get(element.id)
      return zIndex === undefined || zIndex === element.zIndex
        ? element
        : { ...element, zIndex }
    }),
  })
}

function defaultPlacement(
  document: DesignDocument,
  panelId: string,
  kind: 'graphic' | 'text',
) {
  const bounds = getConstraintBounds(document, panelId)

  if (!bounds) {
    return kind === 'text'
      ? { x: 16, y: 80, width: 140, height: 36 }
      : { x: 40, y: 32, width: 64, height: 64 }
  }

  if (kind === 'text') {
    const width = bounds.width * 0.78
    const height = Math.max(24, bounds.height * 0.18)
    return {
      x: bounds.x + (bounds.width - width) / 2,
      y: bounds.y + bounds.height * 0.28,
      width,
      height,
    }
  }

  const width = bounds.width * 0.42
  const height = width
  return {
    x: bounds.x + (bounds.width - width) / 2,
    y: bounds.y + bounds.height * 0.16,
    width,
    height,
  }
}

function placeInSafeArea(
  document: DesignDocument,
  panelId: string,
  aspect: number,
) {
  const bounds = getConstraintBounds(document, panelId)
  if (!bounds) {
    const width = 96
    const height = width / Math.max(aspect, 0.2)
    return { x: 24, y: 24, width, height }
  }

  const maxWidth = bounds.width * 0.72
  const maxHeight = bounds.height * 0.72
  let width = maxWidth
  let height = width / Math.max(aspect, 0.2)
  if (height > maxHeight) {
    height = maxHeight
    width = height * aspect
  }

  return {
    x: bounds.x + (bounds.width - width) / 2,
    y: bounds.y + (bounds.height - height) / 2,
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
  const box = defaultPlacement(document, resolvedPanelId, 'graphic')

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
  const box = defaultPlacement(document, resolvedPanelId, 'text')
  const fontSize = geometry ? Math.max(10, Math.round(geometry.local.height * 0.085)) : 16

  return {
    id: createId(),
    type: 'text',
    panelId: resolvedPanelId,
    viewId: panel?.viewId ?? document.activeView,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    rotation: 0,
    opacity: 1,
    zIndex: nextZIndex(document),
    content: 'Text',
    color: '#1a1a1a',
    fontFamily: DEFAULT_TEXT_FONT,
    fontSize,
    fontWeight: 500,
    italic: false,
    textAlign: 'center',
    letterSpacing: 0,
  }
}

export function createImageElement(
  document: DesignDocument,
  input: {
    type?: 'image' | 'logo'
    source: string
    fileName: string
    mimeType: string
    naturalWidth: number
    naturalHeight: number
    panelId?: string
  },
): ImageElement | LogoElement {
  const resolvedPanelId = resolvePanelId(document, input.panelId)
  const panel = getDocumentPanel(document, resolvedPanelId)
  const box = placeInSafeArea(
    document,
    resolvedPanelId,
    input.naturalWidth / Math.max(input.naturalHeight, 1),
  )
  const shared = {
    id: createId(),
    panelId: resolvedPanelId,
    viewId: panel?.viewId ?? document.activeView,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    rotation: 0,
    opacity: 1,
    zIndex: nextZIndex(document),
    source: input.source,
    fileName: input.fileName,
    mimeType: input.mimeType,
    locked: false,
  }

  return input.type === 'logo'
    ? { ...shared, type: 'logo' }
    : { ...shared, type: 'image' }
}
