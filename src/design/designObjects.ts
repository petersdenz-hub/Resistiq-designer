import { createId } from './ids'
import { DEFAULT_TEXT_FONT, type FontWeight, type TextAlign } from './typography'
import type { DesignDocument, LayerDirection } from './types'

export const PLACEMENT_ZONES = [
  'front',
  'back',
  'left-sleeve',
  'right-sleeve',
  'left-leg',
  'right-leg',
] as const
export type PlacementZone = (typeof PLACEMENT_ZONES)[number]

export const DESIGN_OBJECT_TYPES = ['text', 'image', 'shape'] as const
export type DesignObjectType = (typeof DESIGN_OBJECT_TYPES)[number]

export const SHAPE_KINDS = ['rectangle'] as const
export type ShapeKind = (typeof SHAPE_KINDS)[number]

export interface DesignObjectBase {
  id: string
  type: DesignObjectType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  zIndex: number
  zone: PlacementZone
}

export interface TextDesignObject extends DesignObjectBase {
  type: 'text'
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: FontWeight
  textAlign: TextAlign
  color: string
}

export interface ImageDesignObject extends DesignObjectBase {
  type: 'image'
  source: string
  fileName: string
}

export interface ShapeDesignObject extends DesignObjectBase {
  type: 'shape'
  shape: ShapeKind
  fill: string
  stroke: string
  strokeWidth: number
}

export type DesignObject = TextDesignObject | ImageDesignObject | ShapeDesignObject

export type DesignObjectPatch = Partial<
  Omit<TextDesignObject, 'type' | 'id'> &
    Omit<ImageDesignObject, 'type' | 'id'> &
    Omit<ShapeDesignObject, 'type' | 'id'>
>

export const DEFAULT_GRID_SIZE = 16

export const PLACEMENT_ZONE_LABELS: Record<PlacementZone, string> = {
  front: 'Front',
  back: 'Back',
  'left-sleeve': 'Left sleeve',
  'right-sleeve': 'Right sleeve',
  'left-leg': 'Left leg',
  'right-leg': 'Right leg',
}

export function zonesForGarment(garmentType: string): PlacementZone[] {
  if (garmentType === 'pants' || garmentType === 'shorts') {
    return ['front', 'back', 'left-leg', 'right-leg']
  }
  return ['front', 'back', 'left-sleeve', 'right-sleeve']
}

export function defaultZoneForView(viewId: string): PlacementZone {
  return viewId === 'back' ? 'back' : 'front'
}

export function isPlacementZone(value: unknown): value is PlacementZone {
  return typeof value === 'string' && (PLACEMENT_ZONES as readonly string[]).includes(value)
}

export function getDesignObjects(document: DesignDocument): DesignObject[] {
  return document.designObjects ?? []
}

export function getDesignObjectById(
  document: DesignDocument,
  objectId: string | null,
): DesignObject | null {
  if (!objectId) {
    return null
  }
  return getDesignObjects(document).find((object) => object.id === objectId) ?? null
}

export function getDesignObjectsInZone(
  document: DesignDocument,
  zone: PlacementZone,
  includeHidden = false,
): DesignObject[] {
  return getDesignObjects(document)
    .filter((object) => object.zone === zone && (includeHidden || object.visible))
    .sort((a, b) => a.zIndex - b.zIndex)
}

export function nextObjectZIndex(document: DesignDocument): number {
  return getDesignObjects(document).reduce((max, object) => Math.max(max, object.zIndex), 0) + 1
}

function touch(document: DesignDocument): DesignDocument {
  return { ...document, updatedAt: new Date().toISOString() }
}

function defaultBox(kind: DesignObjectType) {
  if (kind === 'text') {
    return { x: 180, y: 220, width: 200, height: 48 }
  }
  if (kind === 'shape') {
    return { x: 208, y: 248, width: 144, height: 96 }
  }
  return { x: 192, y: 224, width: 176, height: 176 }
}

function sharedDefaults(
  document: DesignDocument,
  type: DesignObjectType,
  zone: PlacementZone,
): DesignObjectBase {
  const box = defaultBox(type)
  return {
    id: createId(),
    type,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: nextObjectZIndex(document),
    zone,
  }
}

export function resolveActiveZone(document: DesignDocument): PlacementZone {
  if (isPlacementZone(document.activeZone)) {
    return document.activeZone
  }
  return defaultZoneForView(document.activeView)
}

export function createTextObject(document: DesignDocument, zone?: PlacementZone): TextDesignObject {
  return {
    ...sharedDefaults(document, 'text', zone ?? resolveActiveZone(document)),
    type: 'text',
    content: 'Text',
    fontFamily: DEFAULT_TEXT_FONT,
    fontSize: 22,
    fontWeight: 500,
    textAlign: 'center',
    color: '#1a1a1a',
  }
}

export function createShapeObject(document: DesignDocument, zone?: PlacementZone): ShapeDesignObject {
  return {
    ...sharedDefaults(document, 'shape', zone ?? resolveActiveZone(document)),
    type: 'shape',
    shape: 'rectangle',
    fill: '#c9a36a',
    stroke: '#1a1a1a',
    strokeWidth: 0,
  }
}

export function createImageObject(
  document: DesignDocument,
  input: { source: string; fileName: string; naturalWidth?: number; naturalHeight?: number },
  zone?: PlacementZone,
): ImageDesignObject {
  const object = {
    ...sharedDefaults(document, 'image', zone ?? resolveActiveZone(document)),
    type: 'image' as const,
    source: input.source,
    fileName: input.fileName,
  }
  if (input.naturalWidth && input.naturalHeight) {
    const aspect = input.naturalWidth / Math.max(input.naturalHeight, 1)
    const width = 176
    const height = width / aspect
    return { ...object, width, height }
  }
  return object
}

export function addDesignObject(
  document: DesignDocument,
  object: DesignObject,
): DesignDocument {
  return touch({
    ...document,
    designObjects: [...getDesignObjects(document), object],
  })
}

export function removeDesignObject(
  document: DesignDocument,
  objectId: string,
): DesignDocument {
  return touch({
    ...document,
    designObjects: getDesignObjects(document).filter((object) => object.id !== objectId),
  })
}

export function updateDesignObject(
  document: DesignDocument,
  objectId: string,
  patch: DesignObjectPatch,
): DesignDocument {
  return touch({
    ...document,
    designObjects: getDesignObjects(document).map((object) =>
      object.id === objectId ? ({ ...object, ...patch } as DesignObject) : object,
    ),
  })
}

export function duplicateDesignObject(
  document: DesignDocument,
  objectId: string,
): { document: DesignDocument; object: DesignObject } | null {
  const current = getDesignObjectById(document, objectId)
  if (!current) {
    return null
  }
  const copy: DesignObject = {
    ...current,
    id: createId(),
    x: current.x + DEFAULT_GRID_SIZE,
    y: current.y + DEFAULT_GRID_SIZE,
    zIndex: nextObjectZIndex(document),
  }
  return { document: addDesignObject(document, copy), object: copy }
}

export function moveDesignObjectLayer(
  document: DesignDocument,
  objectId: string,
  direction: LayerDirection,
): DesignDocument {
  const current = getDesignObjectById(document, objectId)
  if (!current) {
    return document
  }

  const siblings = getDesignObjects(document)
    .filter((object) => object.zone === current.zone)
    .sort((a, b) => a.zIndex - b.zIndex)

  const index = siblings.findIndex((object) => object.id === objectId)
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

  const zById = new Map(nextOrder.map((object, order) => [object.id, order + 1]))
  return touch({
    ...document,
    designObjects: getDesignObjects(document).map((object) => {
      const zIndex = zById.get(object.id)
      return zIndex === undefined || zIndex === object.zIndex ? object : { ...object, zIndex }
    }),
  })
}

export function setActiveZone(
  document: DesignDocument,
  zone: PlacementZone,
): DesignDocument {
  if (!isPlacementZone(zone)) {
    return document
  }
  return touch({
    ...document,
    activeZone: zone,
    activeView: zone === 'back' ? 'back' : zone === 'front' ? 'front' : document.activeView,
  })
}

export function snapValue(value: number, gridSize: number, enabled: boolean): number {
  if (!enabled || gridSize <= 0) {
    return value
  }
  return Math.round(value / gridSize) * gridSize
}

export function snapBox<T extends { x: number; y: number; width: number; height: number }>(
  box: T,
  gridSize: number,
  enabled: boolean,
): T {
  return {
    ...box,
    x: snapValue(box.x, gridSize, enabled),
    y: snapValue(box.y, gridSize, enabled),
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function sanitizeBase(raw: Record<string, unknown>): DesignObjectBase | null {
  if (typeof raw.id !== 'string' || raw.id.length === 0) {
    return null
  }
  if (!DESIGN_OBJECT_TYPES.includes(raw.type as DesignObjectType)) {
    return null
  }
  if (
    !isFiniteNumber(raw.x) ||
    !isFiniteNumber(raw.y) ||
    !isFiniteNumber(raw.width) ||
    !isFiniteNumber(raw.height)
  ) {
    return null
  }
  return {
    id: raw.id,
    type: raw.type as DesignObjectType,
    x: raw.x,
    y: raw.y,
    width: Math.max(8, raw.width),
    height: Math.max(8, raw.height),
    rotation: isFiniteNumber(raw.rotation) ? raw.rotation : 0,
    opacity: isFiniteNumber(raw.opacity) ? clamp(raw.opacity, 0, 1) : 1,
    visible: raw.visible === false ? false : true,
    locked: raw.locked === true,
    zIndex: isFiniteNumber(raw.zIndex) ? raw.zIndex : 1,
    zone: isPlacementZone(raw.zone) ? raw.zone : 'front',
  }
}

function sanitizeOne(value: unknown): DesignObject | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const raw = value as Record<string, unknown>
  const base = sanitizeBase(raw)
  if (!base) {
    return null
  }
  if (base.type === 'text') {
    return {
      ...base,
      type: 'text',
      content: typeof raw.content === 'string' ? raw.content : 'Text',
      fontFamily: typeof raw.fontFamily === 'string' ? raw.fontFamily : DEFAULT_TEXT_FONT,
      fontSize: isFiniteNumber(raw.fontSize) ? raw.fontSize : 22,
      fontWeight: ([400, 500, 700] as const).includes(raw.fontWeight as FontWeight)
        ? (raw.fontWeight as FontWeight)
        : 500,
      textAlign: (['left', 'center', 'right'] as const).includes(raw.textAlign as TextAlign)
        ? (raw.textAlign as TextAlign)
        : 'center',
      color: typeof raw.color === 'string' ? raw.color : '#1a1a1a',
    }
  }
  if (base.type === 'image') {
    if (typeof raw.source !== 'string' || raw.source.length === 0) {
      return null
    }
    return {
      ...base,
      type: 'image',
      source: raw.source,
      fileName: typeof raw.fileName === 'string' ? raw.fileName : 'image',
    }
  }
  return {
    ...base,
    type: 'shape',
    shape: 'rectangle',
    fill: typeof raw.fill === 'string' ? raw.fill : '#c9a36a',
    stroke: typeof raw.stroke === 'string' ? raw.stroke : '#1a1a1a',
    strokeWidth: isFiniteNumber(raw.strokeWidth) ? Math.max(0, raw.strokeWidth) : 0,
  }
}

export function sanitizeDesignObjects(value: unknown): DesignObject[] | undefined {
  if (value === undefined) {
    return undefined
  }
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => sanitizeOne(item))
    .filter((item): item is DesignObject => item !== null)
}

export function sanitizeActiveZone(value: unknown): PlacementZone | undefined {
  return isPlacementZone(value) ? value : undefined
}
