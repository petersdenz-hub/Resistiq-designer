import { canvasRectToLocal, getGarmentPanel, localRectToCanvas } from '@/garments/coordinates'
import { inferPlacementZone } from '@/garments/model'
import { AVAILABLE_GARMENTS, getGarment } from '@/garments/registry'
import type { GarmentPanelType, GarmentRect } from '@/garments/types'
import {
  defaultPanelIdForZone,
  getDesignObjectById,
  getDesignObjects,
  isPlacementZone,
  type DesignObject,
  type DesignObjectAnchor,
  type PlacementZone,
} from './designObjects'
import type { DesignDocument } from './types'

export interface ArtworkPanelBounds {
  id: string
  label: string
  viewId: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  localWidth: number
  localHeight: number
}

export interface RelativeBox {
  x: number
  y: number
  width: number
  height: number
}

export function isPanelAnchored(object: Pick<DesignObject, 'anchor'>): boolean {
  return object.anchor.space === 'panel' && typeof object.anchor.panelId === 'string' && object.anchor.panelId.length > 0
}

export function getArtworkPanelBounds(
  document: DesignDocument,
  panelId: string | undefined,
): ArtworkPanelBounds | null {
  if (!panelId) {
    return null
  }
  const geometry = getGarmentPanel(getGarment(document.garmentType), panelId)
  if (!geometry) {
    return null
  }
  const meta = document.panels.find((panel) => panel.id === panelId)
  return {
    id: geometry.id,
    label: meta?.label ?? geometry.label,
    viewId: geometry.viewId,
    x: geometry.frame.x,
    y: geometry.frame.y,
    width: geometry.frame.width,
    height: geometry.frame.height,
    rotation: 0,
    localWidth: geometry.local.width,
    localHeight: geometry.local.height,
  }
}

export function panelsForZone(document: DesignDocument, zone: PlacementZone) {
  const garment = getGarment(document.garmentType)
  return document.panels.filter((panel) => {
    const definition = garment.panels.find((item) => item.id === panel.id)
    if (definition) {
      return inferPlacementZone(definition) === zone
    }
    return (
      inferPlacementZone({
        id: panel.id,
        viewId: panel.viewId,
        type: (panel.type as GarmentPanelType) ?? 'body',
      }) === zone
    )
  })
}

export function panelScale(document: DesignDocument, panelId: string | undefined): number {
  const bounds = getArtworkPanelBounds(document, panelId)
  if (!bounds) {
    return 1
  }
  return bounds.width / Math.max(bounds.localWidth, 1)
}

export function resolveObjectViewBox(
  document: DesignDocument,
  object: DesignObject,
): GarmentRect {
  if (!isPanelAnchored(object)) {
    return { x: object.x, y: object.y, width: object.width, height: object.height }
  }
  const geometry = getGarmentPanel(getGarment(document.garmentType), object.anchor.panelId!)
  if (!geometry) {
    return { x: object.x, y: object.y, width: object.width, height: object.height }
  }
  return localRectToCanvas(geometry, {
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
  })
}

export function storeObjectViewBox(
  document: DesignDocument,
  object: DesignObject,
  viewBox: GarmentRect,
): GarmentRect {
  if (!isPanelAnchored(object)) {
    return viewBox
  }
  const geometry = getGarmentPanel(getGarment(document.garmentType), object.anchor.panelId!)
  if (!geometry) {
    return viewBox
  }
  return canvasRectToLocal(geometry, viewBox)
}

export function paintDesignObject(document: DesignDocument, object: DesignObject): DesignObject {
  const box = resolveObjectViewBox(document, object)
  if (!isPanelAnchored(object)) {
    return box.x === object.x && box.y === object.y && box.width === object.width && box.height === object.height
      ? object
      : { ...object, ...box }
  }
  const scale = panelScale(document, object.anchor.panelId)
  if (object.type === 'text') {
    return { ...object, ...box, fontSize: object.fontSize * scale }
  }
  if (object.type === 'shape') {
    return { ...object, ...box, strokeWidth: object.strokeWidth * scale }
  }
  return { ...object, ...box }
}

export function objectRelativeBox(document: DesignDocument, object: DesignObject): RelativeBox {
  if (isPanelAnchored(object)) {
    const bounds = getArtworkPanelBounds(document, object.anchor.panelId)
    if (bounds) {
      return {
        x: object.x / Math.max(bounds.localWidth, 1),
        y: object.y / Math.max(bounds.localHeight, 1),
        width: object.width / Math.max(bounds.localWidth, 1),
        height: object.height / Math.max(bounds.localHeight, 1),
      }
    }
  }
  const viewBox = getGarment(document.garmentType).viewBox
  return {
    x: object.x / Math.max(viewBox.width, 1),
    y: object.y / Math.max(viewBox.height, 1),
    width: object.width / Math.max(viewBox.width, 1),
    height: object.height / Math.max(viewBox.height, 1),
  }
}

export function localBoxFromRelative(
  document: DesignDocument,
  panelId: string,
  relative: RelativeBox,
): GarmentRect {
  const bounds = getArtworkPanelBounds(document, panelId)
  if (!bounds) {
    return { x: relative.x, y: relative.y, width: relative.width, height: relative.height }
  }
  return {
    x: relative.x * bounds.localWidth,
    y: relative.y * bounds.localHeight,
    width: Math.max(8, relative.width * bounds.localWidth),
    height: Math.max(8, relative.height * bounds.localHeight),
  }
}

export function attachObjectToPanel(
  document: DesignDocument,
  object: DesignObject,
  panelId: string,
  mode: 'visual' | 'relative' = 'visual',
): DesignObject {
  const bounds = getArtworkPanelBounds(document, panelId)
  if (!bounds) {
    return {
      ...object,
      anchor: { space: 'panel', panelId },
    }
  }

  if (mode === 'relative' && isPanelAnchored(object)) {
    return {
      ...object,
      ...localBoxFromRelative(document, panelId, objectRelativeBox(document, object)),
      anchor: { space: 'panel', panelId },
    }
  }

  const viewBox = resolveObjectViewBox(document, object)
  const geometry = getGarmentPanel(getGarment(document.garmentType), panelId)
  if (!geometry) {
    return { ...object, anchor: { space: 'panel', panelId } }
  }
  return {
    ...object,
    ...canvasRectToLocal(geometry, viewBox),
    anchor: { space: 'panel', panelId },
  }
}

export function detachObjectToZone(document: DesignDocument, object: DesignObject): DesignObject {
  const viewBox = resolveObjectViewBox(document, object)
  return {
    ...object,
    ...viewBox,
    anchor: { space: 'zone', panelId: object.anchor.panelId ?? defaultPanelIdForZone(document, object.zone) },
  }
}

export function attachObjectToZonePanel(
  document: DesignDocument,
  object: DesignObject,
  zone?: PlacementZone,
): DesignObject {
  const resolvedZone = zone ?? object.zone
  const panelId = defaultPanelIdForZone(document, resolvedZone)
  if (!panelId) {
    return { ...object, zone: resolvedZone, anchor: { space: 'zone', panelId: object.anchor.panelId } }
  }
  return { ...attachObjectToPanel(document, { ...object, zone: resolvedZone }, panelId, 'visual'), zone: resolvedZone }
}

function touch(document: DesignDocument): DesignDocument {
  return { ...document, updatedAt: new Date().toISOString() }
}

export function setDesignObjectAnchor(
  document: DesignDocument,
  objectId: string,
  anchor: DesignObjectAnchor,
  mode: 'visual' | 'relative' = 'visual',
): DesignDocument {
  const current = getDesignObjectById(document, objectId)
  if (!current) {
    return document
  }

  const nextObject =
    anchor.space === 'panel' && anchor.panelId
      ? attachObjectToPanel(document, current, anchor.panelId, mode)
      : detachObjectToZone(document, current)

  if (
    nextObject.anchor.space === current.anchor.space &&
    nextObject.anchor.panelId === current.anchor.panelId &&
    nextObject.x === current.x &&
    nextObject.y === current.y
  ) {
    return document
  }

  return touch({
    ...document,
    designObjects: getDesignObjects(document).map((object) =>
      object.id === objectId ? nextObject : object,
    ),
  })
}

export function setDesignObjectPanel(
  document: DesignDocument,
  objectId: string,
  panelId: string,
): DesignDocument {
  const current = getDesignObjectById(document, objectId)
  if (!current) {
    return document
  }
  const panel = document.panels.find((item) => item.id === panelId)
  const zone = zoneForPanel(panelId, current.zone, panel?.viewId)
  const next = setDesignObjectAnchor(document, objectId, { space: 'panel', panelId }, 'relative')
  if (zone === current.zone) {
    return next
  }
  return touch({
    ...next,
    designObjects: getDesignObjects(next).map((object) =>
      object.id === objectId ? { ...object, zone } : object,
    ),
    activeZone: zone,
    activeView: zone === 'back' ? 'back' : zone === 'front' ? 'front' : next.activeView,
  })
}

export function assignDesignObjectZone(
  document: DesignDocument,
  objectId: string,
  zone: PlacementZone,
): DesignDocument {
  const current = getDesignObjectById(document, objectId)
  if (!current || !isPlacementZone(zone)) {
    return document
  }

  let nextObject: DesignObject = { ...current, zone }
  if (isPanelAnchored(current)) {
    const panelId = defaultPanelIdForZone(document, zone)
    nextObject = panelId
      ? attachObjectToPanel(document, { ...current, zone }, panelId, 'relative')
      : { ...current, zone, anchor: { space: 'panel', panelId: current.anchor.panelId } }
  } else {
    nextObject = {
      ...current,
      zone,
      anchor: { space: 'zone', panelId: defaultPanelIdForZone(document, zone) },
    }
  }

  return touch({
    ...document,
    designObjects: getDesignObjects(document).map((object) =>
      object.id === objectId ? nextObject : object,
    ),
    activeZone: zone,
    activeView: zone === 'back' ? 'back' : zone === 'front' ? 'front' : document.activeView,
  })
}

function guessPanelType(panelId: string): GarmentPanelType {
  if (panelId.includes('sleeve')) return 'sleeve'
  if (panelId.includes('leg')) return 'leg'
  if (panelId.includes('hood')) return 'hood'
  if (panelId.includes('crown')) return 'crown'
  if (panelId.includes('brim')) return 'brim'
  if (panelId.includes('band')) return 'band'
  if (panelId.includes('hand')) return 'hand'
  if (panelId.includes('foot')) return 'foot'
  if (panelId.includes('shell')) return 'shell'
  if (panelId.includes('strap')) return 'strap'
  if (panelId.includes('flap')) return 'flap'
  return 'body'
}

export function zoneForPanel(
  panelId: string,
  fallback: PlacementZone,
  viewId?: string,
): PlacementZone {
  for (const garment of AVAILABLE_GARMENTS) {
    const panel = garment.panels.find((item) => item.id === panelId)
    if (panel) {
      return inferPlacementZone(panel) ?? fallback
    }
  }
  const inferred = inferPlacementZone({
    id: panelId,
    viewId: viewId ?? '',
    type: guessPanelType(panelId),
  })
  return inferred ?? (isPlacementZone(fallback) ? fallback : 'front')
}
