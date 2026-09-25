import { canvasRectToLocal, getGarmentPanel, localRectToCanvas } from '@/garments/coordinates'
import { getGarment } from '@/garments/registry'
import type { GarmentRect } from '@/garments/types'
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
  return document.panels.filter((panel) => panelMatchesZone(panel.id, panel.viewId, panel.type, zone))
}

function panelMatchesZone(
  id: string,
  viewId: string,
  type: string | undefined,
  zone: PlacementZone,
): boolean {
  if (zone === 'front') {
    return viewId === 'front' && (type === 'body' || id.startsWith('front_body'))
  }
  if (zone === 'back') {
    return viewId === 'back' && (type === 'body' || id.startsWith('back_body'))
  }
  if (zone === 'left-sleeve') {
    return id.includes('left_sleeve')
  }
  if (zone === 'right-sleeve') {
    return id.includes('right_sleeve')
  }
  if (zone === 'left-leg') {
    return id.includes('left_leg')
  }
  return id.includes('right_leg')
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

export function zoneForPanel(
  panelId: string,
  fallback: PlacementZone,
  viewId?: string,
): PlacementZone {
  if (panelId.includes('left_sleeve')) {
    return 'left-sleeve'
  }
  if (panelId.includes('right_sleeve')) {
    return 'right-sleeve'
  }
  if (panelId.includes('left_leg')) {
    return 'left-leg'
  }
  if (panelId.includes('right_leg')) {
    return 'right-leg'
  }
  if (panelId.includes('back') || viewId === 'back') {
    return 'back'
  }
  if (panelId.includes('front') || viewId === 'front') {
    return 'front'
  }
  return isPlacementZone(fallback) ? fallback : 'front'
}
