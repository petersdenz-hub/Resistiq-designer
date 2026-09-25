import { getGarmentPanel, localRectToCanvas } from '@/garments/coordinates'
import { getGarment } from '@/garments/registry'
import { localFromPercent, panelDesignBounds, panelDesignZones } from '@/garments/model'
import type { GarmentRect } from '@/garments/types'
import { createId } from './ids'
import {
  DEFAULT_GRID_SIZE,
  defaultPanelIdForZone,
  getDesignObjectById,
  getDesignObjects,
  getDesignObjectsInZone,
  moveDesignObjectLayer,
  nextObjectZIndex,
  updateDesignObject,
  type DesignObject,
  type DesignObjectPatch,
  type PlacementZone,
} from './designObjects'
import { resolveObjectViewBox, storeObjectViewBox } from './objectPlacement'
import type { DesignDocument, LayerDirection } from './types'

export const ALIGNMENTS = ['left', 'center', 'right', 'top', 'middle', 'bottom'] as const
export type Alignment = (typeof ALIGNMENTS)[number]

export const DISTRIBUTIONS = ['horizontal', 'vertical'] as const
export type Distribution = (typeof DISTRIBUTIONS)[number]

function touch(document: DesignDocument): DesignDocument {
  return { ...document, updatedAt: new Date().toISOString() }
}

function replaceObjects(document: DesignDocument, objects: DesignObject[]): DesignDocument {
  return touch({ ...document, designObjects: objects })
}

export function boxesIntersect(a: GarmentRect, b: GarmentRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

export function unionBoxes(boxes: GarmentRect[]): GarmentRect | null {
  if (boxes.length === 0) {
    return null
  }
  const left = Math.min(...boxes.map((box) => box.x))
  const top = Math.min(...boxes.map((box) => box.y))
  const right = Math.max(...boxes.map((box) => box.x + box.width))
  const bottom = Math.max(...boxes.map((box) => box.y + box.height))
  return { x: left, y: top, width: right - left, height: bottom - top }
}

export function selectionViewBox(document: DesignDocument, objectIds: string[]): GarmentRect | null {
  return unionBoxes(
    objectIds
      .map((id) => getDesignObjectById(document, id))
      .filter((object): object is DesignObject => Boolean(object))
      .map((object) => resolveObjectViewBox(document, object)),
  )
}

export function objectsSharePlacement(objects: DesignObject[]): boolean {
  if (objects.length <= 1) {
    return true
  }
  const zone = objects[0].zone
  const panel = objects[0].anchor.panelId ?? ''
  const space = objects[0].anchor.space
  return objects.every((object) => {
    if (object.zone !== zone) {
      return false
    }
    if (space === 'panel' || object.anchor.space === 'panel') {
      return (object.anchor.panelId ?? '') === panel && object.anchor.space === space
    }
    return true
  })
}

export function selectableObjectIds(
  document: DesignDocument,
  zone: PlacementZone,
  includeLocked = false,
): string[] {
  return getDesignObjects(document)
    .filter(
      (object) =>
        object.zone === zone && object.visible && (includeLocked || !object.locked),
    )
    .map((object) => object.id)
}

export function groupMembers(
  document: DesignDocument,
  object: DesignObject,
  includeHidden = false,
): DesignObject[] {
  if (!object.groupId) {
    return [object]
  }
  return getDesignObjects(document).filter(
    (item) =>
      item.groupId === object.groupId &&
      item.zone === object.zone &&
      (includeHidden || item.visible),
  )
}

export function expandGroupIds(
  document: DesignDocument,
  objectId: string,
  includeHidden = false,
): string[] {
  const object = getDesignObjectById(document, objectId)
  if (!object) {
    return []
  }
  return groupMembers(document, object, includeHidden).map((item) => item.id)
}

export function selectionForEdit(document: DesignDocument, objectIds: string[]): string[] {
  const ids = new Set<string>()
  for (const id of objectIds) {
    for (const memberId of expandGroupIds(document, id, true)) {
      ids.add(memberId)
    }
  }
  return [...ids]
}

export function toggleSelectedIds(current: string[], nextIds: string[]): string[] {
  const selected = new Set(current)
  const removing = nextIds.length > 0 && nextIds.every((id) => selected.has(id))
  if (removing) {
    nextIds.forEach((id) => selected.delete(id))
  } else {
    nextIds.forEach((id) => selected.add(id))
  }
  return [...selected]
}

export function objectIdsInMarquee(
  document: DesignDocument,
  zone: PlacementZone,
  marquee: GarmentRect,
): string[] {
  return getDesignObjectsInZone(document, zone)
    .filter(
      (object) =>
        object.visible &&
        !object.locked &&
        boxesIntersect(resolveObjectViewBox(document, object), marquee),
    )
    .map((object) => object.id)
}

export function updateDesignObjects(
  document: DesignDocument,
  updates: Array<{ id: string; patch: DesignObjectPatch }>,
): DesignDocument {
  if (updates.length === 0) {
    return document
  }
  let next = document
  for (const update of updates) {
    next = updateDesignObject(next, update.id, update.patch)
  }
  return next
}

export function removeDesignObjects(document: DesignDocument, objectIds: string[]): DesignDocument {
  const blocked = new Set(objectIds)
  const next = getDesignObjects(document).filter((object) => !blocked.has(object.id) || object.locked)
  if (next.length === getDesignObjects(document).length) {
    return document
  }
  return replaceObjects(document, next)
}

export function duplicateDesignObjects(
  document: DesignDocument,
  objectIds: string[],
): { document: DesignDocument; objects: DesignObject[] } {
  const selected = objectIds
    .map((id) => getDesignObjectById(document, id))
    .filter((object): object is DesignObject => Boolean(object))
  if (selected.length === 0) {
    return { document, objects: [] }
  }

  const groupMap = new Map<string, string>()
  let zIndex = nextObjectZIndex(document)
  const copies = selected.map((object) => {
    let groupId = object.groupId
    if (groupId) {
      const mapped = groupMap.get(groupId) ?? createId()
      groupMap.set(groupId, mapped)
      groupId = mapped
    }
    const copy: DesignObject = {
      ...object,
      id: createId(),
      x: object.x + DEFAULT_GRID_SIZE,
      y: object.y + DEFAULT_GRID_SIZE,
      zIndex: zIndex++,
      groupId,
    }
    return copy
  })

  return {
    document: replaceObjects(document, [...getDesignObjects(document), ...copies]),
    objects: copies,
  }
}

export function groupDesignObjects(
  document: DesignDocument,
  objectIds: string[],
): DesignDocument {
  const selected = objectIds
    .map((id) => getDesignObjectById(document, id))
    .filter((object): object is DesignObject => object != null && !object.locked)
  if (selected.length < 2 || !objectsSharePlacement(selected)) {
    return document
  }
  const groupId = createId()
  const ids = new Set(selected.map((object) => object.id))
  return replaceObjects(
    document,
    getDesignObjects(document).map((object) =>
      ids.has(object.id) ? { ...object, groupId } : object,
    ),
  )
}

export function ungroupDesignObjects(
  document: DesignDocument,
  objectIds: string[],
): DesignDocument {
  const groupIds = new Set(
    objectIds
      .map((id) => getDesignObjectById(document, id)?.groupId)
      .filter((id): id is string => Boolean(id)),
  )
  if (groupIds.size === 0) {
    return document
  }
  return replaceObjects(
    document,
    getDesignObjects(document).map((object) =>
      object.groupId && groupIds.has(object.groupId) ? { ...object, groupId: undefined } : object,
    ),
  )
}

export function alignDesignObjects(
  document: DesignDocument,
  objectIds: string[],
  alignment: Alignment,
): DesignDocument {
  const selected = objectIds
    .map((id) => getDesignObjectById(document, id))
    .filter((object): object is DesignObject => object != null && !object.locked)
  if (selected.length < 2) {
    return document
  }

  const boxes = selected.map((object) => ({
    object,
    box: resolveObjectViewBox(document, object),
  }))
  const union = unionBoxes(boxes.map((item) => item.box))
  if (!union) {
    return document
  }

  const updates = boxes.map(({ object, box }) => {
    const next = { ...box }
    if (alignment === 'left') {
      next.x = union.x
    } else if (alignment === 'center') {
      next.x = union.x + (union.width - box.width) / 2
    } else if (alignment === 'right') {
      next.x = union.x + union.width - box.width
    } else if (alignment === 'top') {
      next.y = union.y
    } else if (alignment === 'middle') {
      next.y = union.y + (union.height - box.height) / 2
    } else {
      next.y = union.y + union.height - box.height
    }
    return { id: object.id, patch: storeObjectViewBox(document, object, next) }
  })

  return updateDesignObjects(document, updates)
}

export function distributeDesignObjects(
  document: DesignDocument,
  objectIds: string[],
  axis: Distribution,
): DesignDocument {
  const selected = objectIds
    .map((id) => getDesignObjectById(document, id))
    .filter((object): object is DesignObject => object != null && !object.locked)
  if (selected.length < 3) {
    return document
  }

  const items = selected
    .map((object) => ({ object, box: resolveObjectViewBox(document, object) }))
    .sort((a, b) => (axis === 'horizontal' ? a.box.x - b.box.x : a.box.y - b.box.y))

  const first = items[0].box
  const last = items[items.length - 1].box
  const span =
    axis === 'horizontal'
      ? last.x + last.width - first.x
      : last.y + last.height - first.y
  const totalSize = items.reduce(
    (sum, item) => sum + (axis === 'horizontal' ? item.box.width : item.box.height),
    0,
  )
  const gap = (span - totalSize) / (items.length - 1)
  let cursor = axis === 'horizontal' ? first.x : first.y

  const updates = items.map((item, index) => {
    const next = { ...item.box }
    if (index === 0) {
      cursor += axis === 'horizontal' ? item.box.width + gap : item.box.height + gap
      return { id: item.object.id, patch: storeObjectViewBox(document, item.object, next) }
    }
    if (axis === 'horizontal') {
      next.x = cursor
      cursor += item.box.width + gap
    } else {
      next.y = cursor
      cursor += item.box.height + gap
    }
    return { id: item.object.id, patch: storeObjectViewBox(document, item.object, next) }
  })

  return updateDesignObjects(document, updates)
}

export function nudgeDesignObjects(
  document: DesignDocument,
  objectIds: string[],
  dx: number,
  dy: number,
): DesignDocument {
  const updates = objectIds
    .map((id) => getDesignObjectById(document, id))
    .filter((object): object is DesignObject => object != null && !object.locked)
    .map((object) => {
      const box = resolveObjectViewBox(document, object)
      return {
        id: object.id,
        patch: storeObjectViewBox(document, object, { ...box, x: box.x + dx, y: box.y + dy }),
      }
    })
  return updateDesignObjects(document, updates)
}

export function scaleObjectsInViewBox(
  document: DesignDocument,
  objectIds: string[],
  start: GarmentRect,
  next: GarmentRect,
): Array<{ id: string; patch: DesignObjectPatch }> {
  const sx = next.width / Math.max(start.width, 1)
  const sy = next.height / Math.max(start.height, 1)
  return objectIds
    .map((id) => getDesignObjectById(document, id))
    .filter((object): object is DesignObject => object != null && !object.locked)
    .map((object) => {
      const box = resolveObjectViewBox(document, object)
      const scaled = {
        x: next.x + (box.x - start.x) * sx,
        y: next.y + (box.y - start.y) * sy,
        width: Math.max(8, box.width * sx),
        height: Math.max(8, box.height * sy),
      }
      return { id: object.id, patch: storeObjectViewBox(document, object, scaled) }
    })
}

export function rotateObjectsAround(
  document: DesignDocument,
  objectIds: string[],
  center: { x: number; y: number },
  delta: number,
): DesignDocument {
  const radians = (delta * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const updates = objectIds
    .map((id) => getDesignObjectById(document, id))
    .filter((object): object is DesignObject => object != null && !object.locked)
    .map((object) => {
      const box = resolveObjectViewBox(document, object)
      const cx = box.x + box.width / 2
      const cy = box.y + box.height / 2
      const dx = cx - center.x
      const dy = cy - center.y
      const next = {
        ...box,
        x: center.x + dx * cos - dy * sin - box.width / 2,
        y: center.y + dx * sin + dy * cos - box.height / 2,
      }
      return {
        id: object.id,
        patch: {
          ...storeObjectViewBox(document, object, next),
          rotation: object.rotation + delta,
        },
      }
    })
  return updateDesignObjects(document, updates)
}

export function moveDesignObjectsLayer(
  document: DesignDocument,
  objectIds: string[],
  direction: LayerDirection,
): DesignDocument {
  const objects = [...new Set(objectIds)]
    .map((id) => getDesignObjectById(document, id))
    .filter((object): object is DesignObject => Boolean(object))
    .sort((a, b) => a.zIndex - b.zIndex)
  const sequence =
    direction === 'front' || direction === 'forward' ? objects : [...objects].reverse()
  let next = document
  for (const object of sequence) {
    next = moveDesignObjectLayer(next, object.id, direction)
  }
  return next
}

export interface SnapGuides {
  vertical: number[]
  horizontal: number[]
}

function pushBoxEdges(xs: number[], ys: number[], box: GarmentRect) {
  xs.push(box.x, box.x + box.width / 2, box.x + box.width)
  ys.push(box.y, box.y + box.height / 2, box.y + box.height)
}

function garmentGuideBoxes(document: DesignDocument, zone: PlacementZone): GarmentRect[] {
  const garment = getGarment(document.garmentType)
  const boxes: GarmentRect[] = [
    { x: 0, y: 0, width: garment.viewBox.width, height: garment.viewBox.height },
  ]
  const panelId = defaultPanelIdForZone(document, zone)
  const panel = panelId ? getGarmentPanel(garment, panelId) : null
  if (panel) {
    boxes.push(panel.frame)
    if (panel.safeArea) {
      boxes.push(localRectToCanvas(panel, panel.safeArea))
    }
    boxes.push(localRectToCanvas(panel, localFromPercent(panelDesignBounds(panel), panel.local)))
    for (const zoneDef of panelDesignZones(panel)) {
      boxes.push(localRectToCanvas(panel, localFromPercent(zoneDef.bounds, panel.local)))
    }
  }
  return boxes
}

/** Visual guide boxes used by the editor overlay. Never stored on designObjects. */
export function collectSnapGuideBoxes(
  document: DesignDocument,
  zone: PlacementZone,
): GarmentRect[] {
  return garmentGuideBoxes(document, zone)
}

export function collectSnapTargets(
  document: DesignDocument,
  zone: PlacementZone,
  excludeIds: string[],
): { xs: number[]; ys: number[] } {
  const xs: number[] = []
  const ys: number[] = []
  for (const box of garmentGuideBoxes(document, zone)) {
    pushBoxEdges(xs, ys, box)
  }
  const excluded = new Set(excludeIds)
  for (const object of getDesignObjectsInZone(document, zone)) {
    if (excluded.has(object.id) || !object.visible) {
      continue
    }
    pushBoxEdges(xs, ys, resolveObjectViewBox(document, object))
  }
  return { xs, ys }
}

export function snapMovingBox(
  box: GarmentRect,
  targets: { xs: number[]; ys: number[] },
  threshold = 6,
  gridSize = DEFAULT_GRID_SIZE,
  snapToGrid = false,
): { box: GarmentRect; guides: SnapGuides } {
  const edges = {
    left: box.x,
    right: box.x + box.width,
    cx: box.x + box.width / 2,
    top: box.y,
    bottom: box.y + box.height,
    cy: box.y + box.height / 2,
  }
  const xs = targets.xs.slice()
  const ys = targets.ys.slice()
  if (snapToGrid && gridSize > 0) {
    for (const value of [edges.left, edges.cx, edges.right]) {
      xs.push(Math.round(value / gridSize) * gridSize)
    }
    for (const value of [edges.top, edges.cy, edges.bottom]) {
      ys.push(Math.round(value / gridSize) * gridSize)
    }
  }

  const nearest = (values: number[], axis: number[]) => {
    let best: { delta: number; target: number } | null = null
    for (const value of values) {
      for (const target of axis) {
        const delta = target - value
        if (Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta))) {
          best = { delta, target }
        }
      }
    }
    return best
  }

  const xSnap = nearest([edges.left, edges.right, edges.cx], xs)
  const ySnap = nearest([edges.top, edges.bottom, edges.cy], ys)
  return {
    box: {
      ...box,
      x: box.x + (xSnap?.delta ?? 0),
      y: box.y + (ySnap?.delta ?? 0),
    },
    guides: {
      vertical: xSnap ? [xSnap.target] : [],
      horizontal: ySnap ? [ySnap.target] : [],
    },
  }
}
