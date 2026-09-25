import { getGarmentPanel } from '@/garments/coordinates'
import { getGarment } from '@/garments/registry'
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

export const SHAPE_KINDS = ['rectangle', 'circle', 'line', 'rounded-rectangle'] as const
export type ShapeKind = (typeof SHAPE_KINDS)[number]

export const SHAPE_KIND_LABELS: Record<ShapeKind, string> = {
  rectangle: 'Rectangle',
  circle: 'Circle',
  line: 'Line',
  'rounded-rectangle': 'Rounded rectangle',
}

export function isShapeKind(value: unknown): value is ShapeKind {
  return typeof value === 'string' && (SHAPE_KINDS as readonly string[]).includes(value)
}

export const ANCHOR_SPACES = ['zone', 'panel'] as const
export type AnchorSpace = (typeof ANCHOR_SPACES)[number]

/**
 * Placement space for artwork.
 * `zone` — x/y/width/height are garment viewBox units for the placement zone.
 * `panel` — x/y/width/height are panel-local units for `panelId`.
 * Neither space uses browser/screen pixels.
 */
export interface DesignObjectAnchor {
  space: AnchorSpace
  /** Garment panel this object is attached to when space is `panel`. */
  panelId?: string
}

export interface DesignObjectBase {
  id: string
  type: DesignObjectType
  /**
   * Position and size in garment viewBox units for `zone`.
   * These are not browser/screen pixels.
   */
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
  anchor: DesignObjectAnchor
  /** Optional editor name. Missing on older documents. */
  name?: string
  /** Lightweight group membership. Missing means ungrouped. */
  groupId?: string
}

export interface TextDesignObject extends DesignObjectBase {
  type: 'text'
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: FontWeight
  textAlign: TextAlign
  color: string
  italic: boolean
  letterSpacing: number
}

export interface ImageDesignObject extends DesignObjectBase {
  type: 'image'
  /** Asset id in the local (or future persistent) asset store. */
  source: string
  fileName: string
  mimeType: string
  aspectLocked: boolean
  naturalWidth?: number
  naturalHeight?: number
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
  const garment = getGarment(garmentType)
  const zones = garment.supportedDesignZones ?? []
  return zones.filter((zone): zone is PlacementZone => isPlacementZone(zone))
}

export function defaultZoneForView(viewId: string): PlacementZone {
  return viewId === 'back' ? 'back' : 'front'
}

export function isPlacementZone(value: unknown): value is PlacementZone {
  return typeof value === 'string' && (PLACEMENT_ZONES as readonly string[]).includes(value)
}

const ZONE_PANEL_CANDIDATES: Record<PlacementZone, string[]> = {
  front: ['front_body', 'front_body_left', 'front_body_right'],
  back: ['back_body'],
  'left-sleeve': ['left_sleeve'],
  'right-sleeve': ['right_sleeve'],
  'left-leg': ['left_leg'],
  'right-leg': ['right_leg'],
}

export function defaultPanelIdForZone(
  document: DesignDocument,
  zone: PlacementZone,
): string | undefined {
  const ids = new Set(document.panels.map((panel) => panel.id))
  for (const id of ZONE_PANEL_CANDIDATES[zone]) {
    if (ids.has(id)) {
      return id
    }
  }

  if (zone === 'front' || zone === 'back') {
    return (
      document.panels.find((panel) => panel.viewId === zone && panel.type === 'body')?.id ??
      document.panels.find((panel) => panel.viewId === zone)?.id
    )
  }

  const needle = zone.replace('-', '_')
  return document.panels.find((panel) => panel.id === needle || panel.id.startsWith(needle))?.id
}

export function resolveObjectAnchor(
  document: DesignDocument,
  zone: PlacementZone,
  current?: DesignObjectAnchor,
): DesignObjectAnchor {
  return {
    space: current?.space === 'panel' ? 'panel' : 'zone',
    panelId: current?.panelId ?? defaultPanelIdForZone(document, zone),
  }
}

export function imageKeepsAlpha(mimeType?: string): boolean {
  return mimeType !== 'image/jpeg' && mimeType !== 'image/jpg'
}

export function objectAspect(object: {
  width: number
  height: number
  naturalWidth?: number
  naturalHeight?: number
}): number {
  if (object.naturalWidth && object.naturalHeight) {
    return object.naturalWidth / Math.max(object.naturalHeight, 1)
  }
  return object.width / Math.max(object.height, 1)
}

export function isImageAspectLocked(object: DesignObject): boolean {
  return object.type === 'image' && object.aspectLocked !== false
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

function defaultSize(kind: DesignObjectType, shape?: ShapeKind) {
  if (kind === 'text') {
    return { width: 200, height: 48 }
  }
  if (kind === 'shape') {
    if (shape === 'circle') {
      return { width: 120, height: 120 }
    }
    if (shape === 'line') {
      return { width: 176, height: 12 }
    }
    return { width: 144, height: 96 }
  }
  return { width: 176, height: 176 }
}

function defaultBox(
  document: DesignDocument,
  kind: DesignObjectType,
  zone: PlacementZone,
  shape?: ShapeKind,
) {
  const size = defaultSize(kind, shape)
  const cascade = getDesignObjectsInZone(document, zone, true).length * 40
  const panelId = defaultPanelIdForZone(document, zone)
  if (panelId) {
    const geometry = getGarmentPanel(getGarment(document.garmentType), panelId)
    if (geometry) {
      let width = Math.min(size.width, Math.max(48, geometry.frame.width * 0.72))
      let height = Math.min(size.height, Math.max(24, geometry.frame.height * 0.72))
      if (shape === 'circle') {
        const side = Math.min(width, height)
        width = side
        height = side
      }
      const x = geometry.frame.x + (geometry.frame.width - width) / 2 + cascade
      const y = geometry.frame.y + (geometry.frame.height - height) / 2 + cascade
      return {
        x: Math.min(geometry.frame.x + geometry.frame.width - width, Math.max(geometry.frame.x, x)),
        y: Math.min(geometry.frame.y + geometry.frame.height - height, Math.max(geometry.frame.y, y)),
        width,
        height,
      }
    }
  }
  return { x: 180 + cascade, y: 220 + cascade, ...size }
}

function sharedDefaults(
  document: DesignDocument,
  type: DesignObjectType,
  zone: PlacementZone,
  detail?: string,
): DesignObjectBase {
  const box = defaultBox(document, type, zone, isShapeKind(detail) ? detail : undefined)
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
    anchor: resolveObjectAnchor(document, zone),
    name: defaultObjectName(type, detail),
  }
}

export function defaultObjectName(
  type: DesignObjectType,
  detail?: string,
): string {
  if (type === 'text') {
    const preview = detail?.trim() || 'New Text'
    return `Text — ${preview.length > 24 ? `${preview.slice(0, 24)}…` : preview}`
  }
  if (type === 'image') {
    const preview = (detail ?? 'Image').replace(/\.[^.]+$/, '') || 'Image'
    return /logo/i.test(detail ?? '') ? `Logo — ${preview}` : `Image — ${preview}`
  }
  const kind = isShapeKind(detail) ? detail : 'rectangle'
  return `Shape — ${SHAPE_KIND_LABELS[kind]}`
}

export function objectDisplayName(object: DesignObject): string {
  if (object.name?.trim()) {
    return object.name.trim()
  }
  if (object.type === 'text') {
    return defaultObjectName('text', object.content)
  }
  if (object.type === 'image') {
    return defaultObjectName('image', object.fileName)
  }
  return defaultObjectName('shape', object.shape)
}

export function resolveActiveZone(document: DesignDocument): PlacementZone {
  if (isPlacementZone(document.activeZone)) {
    return document.activeZone
  }
  return defaultZoneForView(document.activeView)
}

export function createTextObject(document: DesignDocument, zone?: PlacementZone): TextDesignObject {
  const content = 'New Text'
  return {
    ...sharedDefaults(document, 'text', zone ?? resolveActiveZone(document)),
    type: 'text',
    content,
    fontFamily: DEFAULT_TEXT_FONT,
    fontSize: 22,
    fontWeight: 500,
    textAlign: 'center',
    color: '#1a1a1a',
    italic: false,
    letterSpacing: 0,
    name: defaultObjectName('text', content),
  }
}

export function createShapeObject(
  document: DesignDocument,
  zone?: PlacementZone,
  kind: ShapeKind = 'rectangle',
): ShapeDesignObject {
  const shape = isShapeKind(kind) ? kind : 'rectangle'
  return {
    ...sharedDefaults(document, 'shape', zone ?? resolveActiveZone(document), shape),
    type: 'shape',
    shape,
    fill: shape === 'line' ? 'none' : '#c9a36a',
    stroke: '#1a1a1a',
    strokeWidth: shape === 'line' ? 4 : 0,
  }
}

export function createImageObject(
  document: DesignDocument,
  input: {
    source: string
    fileName: string
    mimeType?: string
    naturalWidth?: number
    naturalHeight?: number
    aspectLocked?: boolean
  },
  zone?: PlacementZone,
): ImageDesignObject {
  const resolvedZone = zone ?? resolveActiveZone(document)
  const object: ImageDesignObject = {
    ...sharedDefaults(document, 'image', resolvedZone),
    type: 'image',
    source: input.source,
    fileName: input.fileName,
    mimeType: input.mimeType ?? 'image/png',
    aspectLocked: input.aspectLocked !== false,
    naturalWidth: input.naturalWidth,
    naturalHeight: input.naturalHeight,
    name: defaultObjectName('image', input.fileName),
  }
  if (input.naturalWidth && input.naturalHeight) {
    const aspect = input.naturalWidth / Math.max(input.naturalHeight, 1)
    const width = object.width
    const height = Math.max(8, width / aspect)
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
  const current = getDesignObjectById(document, objectId)
  if (!current || current.locked) {
    return document
  }
  return touch({
    ...document,
    designObjects: getDesignObjects(document).filter((object) => object.id !== objectId),
  })
}

const LOCKED_SAFE_KEYS = new Set(['locked', 'visible', 'name'])

function sanitizePatch(object: DesignObject, patch: DesignObjectPatch): DesignObjectPatch {
  if (!object.locked) {
    return patch
  }
  const next: DesignObjectPatch = {}
  for (const key of Object.keys(patch) as (keyof DesignObjectPatch)[]) {
    if (LOCKED_SAFE_KEYS.has(key)) {
      ;(next as Record<string, unknown>)[key] = patch[key]
    }
  }
  return next
}

function applyObjectPatch(document: DesignDocument, object: DesignObject, patch: DesignObjectPatch): DesignObject {
  const allowed = sanitizePatch(object, patch)
  const next = { ...object, ...allowed } as DesignObject
  if (allowed.zone && isPlacementZone(allowed.zone) && allowed.zone !== object.zone) {
    next.anchor = {
      space: patch.anchor?.space ?? (object.anchor.space === 'panel' ? 'panel' : 'zone'),
      panelId: patch.anchor?.panelId ?? defaultPanelIdForZone(document, allowed.zone),
    }
    next.zone = allowed.zone
  }
  if (next.type === 'image' && next.aspectLocked !== false) {
    const widthChanged = allowed.width !== undefined && allowed.height === undefined
    const heightChanged = allowed.height !== undefined && allowed.width === undefined
    if (widthChanged || heightChanged) {
      const aspect = objectAspect({
        width: object.width,
        height: object.height,
        naturalWidth: next.naturalWidth,
        naturalHeight: next.naturalHeight,
      })
      if (widthChanged) {
        next.height = Math.max(8, next.width / aspect)
      } else {
        next.width = Math.max(8, next.height * aspect)
      }
    }
  }
  return next
}

export function updateDesignObject(
  document: DesignDocument,
  objectId: string,
  patch: DesignObjectPatch,
): DesignDocument {
  return touch({
    ...document,
    designObjects: getDesignObjects(document).map((object) =>
      object.id === objectId ? applyObjectPatch(document, object, patch) : object,
    ),
  })
}

export function setDesignObjectZone(
  document: DesignDocument,
  objectId: string,
  zone: PlacementZone,
): DesignDocument {
  const current = getDesignObjectById(document, objectId)
  if (!current || !isPlacementZone(zone)) {
    return document
  }
  return setActiveZone(updateDesignObject(document, objectId, { zone }), zone)
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

function sanitizeAnchor(value: unknown): DesignObjectAnchor {
  if (!value || typeof value !== 'object') {
    return { space: 'zone' }
  }
  const raw = value as Record<string, unknown>
  return {
    space: raw.space === 'panel' ? 'panel' : 'zone',
    panelId: typeof raw.panelId === 'string' && raw.panelId.length > 0 ? raw.panelId : undefined,
  }
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
  const zone = isPlacementZone(raw.zone) ? raw.zone : 'front'
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
    zone,
    anchor: sanitizeAnchor(raw.anchor),
    name: typeof raw.name === 'string' && raw.name.length > 0 ? raw.name : undefined,
    groupId: typeof raw.groupId === 'string' && raw.groupId.length > 0 ? raw.groupId : undefined,
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
      italic: raw.italic === true,
      letterSpacing: isFiniteNumber(raw.letterSpacing) ? raw.letterSpacing : 0,
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
      mimeType: typeof raw.mimeType === 'string' && raw.mimeType.length > 0 ? raw.mimeType : 'image/png',
      aspectLocked: raw.aspectLocked === false ? false : true,
      naturalWidth: isFiniteNumber(raw.naturalWidth) ? raw.naturalWidth : undefined,
      naturalHeight: isFiniteNumber(raw.naturalHeight) ? raw.naturalHeight : undefined,
    }
  }
  return {
    ...base,
    type: 'shape',
    shape: isShapeKind(raw.shape) ? raw.shape : 'rectangle',
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
