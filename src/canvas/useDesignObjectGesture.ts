import {
  getDesignObjectById,
  isImageAspectLocked,
  objectAspect,
} from '@/design/designObjects'
import {
  collectSnapTargets,
  nudgeDesignObjects,
  rotateObjectsAround,
  scaleObjectsInViewBox,
  selectionForEdit,
  selectionViewBox,
  snapMovingBox,
  updateDesignObjects,
  type SnapGuides,
} from '@/design/objectEditing'
import type { DesignDocument } from '@/design/types'
import { resolveActiveZone } from '@/design/designObjects'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import {
  clientToSvgPoint,
  getCenter,
  resizeRect,
  resizeRectKeepAspect,
  rotationFromPointer,
  snapAngle,
  type ResizeHandle,
} from './geometry'

export interface ObjectDragPreview {
  objectIds: string[]
  x: number
  y: number
}

interface ObjectGestureApi {
  document: DesignDocument
  snapToGrid: boolean
  gridSize: number
  applyDocument: (document: DesignDocument, history?: 'record' | 'replace') => void
  commitGesture: (previous: DesignDocument) => void
}

type Gesture =
  | {
      kind: 'move'
      objectIds: string[]
      origin: DesignDocument
      startX: number
      startY: number
      lastDx: number
      lastDy: number
    }
  | {
      kind: 'resize'
      objectIds: string[]
      origin: DesignDocument
      handle: ResizeHandle
      startX: number
      startY: number
      startWidth: number
      startHeight: number
      startRotation: number
    }
  | {
      kind: 'rotate'
      objectIds: string[]
      origin: DesignDocument
      centerX: number
      centerY: number
      startAngle: number
    }

export function useDesignObjectGesture(
  svgRef: RefObject<SVGSVGElement | null>,
  api: ObjectGestureApi,
) {
  const gestureRef = useRef<Gesture | null>(null)
  const apiRef = useRef(api)
  const [preview, setPreview] = useState<ObjectDragPreview | null>(null)
  const [guides, setGuides] = useState<SnapGuides | null>(null)

  useLayoutEffect(() => {
    apiRef.current = api
  }, [api])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const gesture = gestureRef.current
      const svg = svgRef.current
      if (!gesture || !svg) {
        return
      }
      const pointer = clientToSvgPoint(svg, event.clientX, event.clientY)

      if (gesture.kind === 'move') {
        const originUnion = selectionViewBox(gesture.origin, gesture.objectIds)
        if (!originUnion) {
          return
        }
        const raw = {
          ...originUnion,
          x: originUnion.x + (pointer.x - gesture.startX),
          y: originUnion.y + (pointer.y - gesture.startY),
        }
        const snapped = snapMovingBox(
          raw,
          collectSnapTargets(gesture.origin, resolveActiveZone(gesture.origin), gesture.objectIds),
          6,
          apiRef.current.gridSize,
          apiRef.current.snapToGrid,
        )
        gesture.lastDx = snapped.box.x - originUnion.x
        gesture.lastDy = snapped.box.y - originUnion.y
        setPreview({ objectIds: gesture.objectIds, x: gesture.lastDx, y: gesture.lastDy })
        setGuides(snapped.guides.vertical.length || snapped.guides.horizontal.length ? snapped.guides : null)
        return
      }

      if (gesture.kind === 'resize') {
        const start = {
          x: gesture.startX,
          y: gesture.startY,
          width: gesture.startWidth,
          height: gesture.startHeight,
        }
        const primary = getDesignObjectById(gesture.origin, gesture.objectIds[0])
        const next =
          gesture.objectIds.length === 1 && primary && isImageAspectLocked(primary)
            ? resizeRectKeepAspect(start, gesture.startRotation, gesture.handle, pointer, objectAspect(primary))
            : resizeRect(start, gesture.startRotation, gesture.handle, pointer)
        const updates = scaleObjectsInViewBox(gesture.origin, gesture.objectIds, start, {
          x: next.x,
          y: next.y,
          width: Math.max(8, next.width),
          height: Math.max(8, next.height),
        })
        apiRef.current.applyDocument(updateDesignObjects(gesture.origin, updates), 'replace')
        return
      }

      const angle = rotationFromPointer({ x: gesture.centerX, y: gesture.centerY }, pointer)
      const delta = event.shiftKey ? snapAngle(angle - gesture.startAngle) : angle - gesture.startAngle
      apiRef.current.applyDocument(
        rotateObjectsAround(
          gesture.origin,
          gesture.objectIds,
          { x: gesture.centerX, y: gesture.centerY },
          delta,
        ),
        'replace',
      )
    }

    const onUp = () => {
      const gesture = gestureRef.current
      if (!gesture) {
        return
      }
      if (gesture.kind === 'move') {
        if (gesture.lastDx !== 0 || gesture.lastDy !== 0) {
          apiRef.current.applyDocument(
            nudgeDesignObjects(gesture.origin, gesture.objectIds, gesture.lastDx, gesture.lastDy),
            'record',
          )
        }
        setPreview(null)
        setGuides(null)
      } else {
        apiRef.current.commitGesture(gesture.origin)
      }
      gestureRef.current = null
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [svgRef])

  return {
    preview,
    guides,
    startMove(objectId: string, selectedIds: string[], event: ReactPointerEvent<SVGElement>) {
      const svg = svgRef.current
      const document = apiRef.current.document
      const object = getDesignObjectById(document, objectId)
      if (!svg || !object || object.locked) {
        return
      }
      event.preventDefault()
      const pointer = clientToSvgPoint(svg, event.clientX, event.clientY)
      const ids = selectionForEdit(document, selectedIds.includes(objectId) ? selectedIds : [objectId]).filter(
        (id) => !getDesignObjectById(document, id)?.locked,
      )
      gestureRef.current = {
        kind: 'move',
        objectIds: ids.length > 0 ? ids : [objectId],
        origin: document,
        startX: pointer.x,
        startY: pointer.y,
        lastDx: 0,
        lastDy: 0,
      }
    },
    startResize(objectIds: string[], handle: ResizeHandle, event: ReactPointerEvent<SVGElement>) {
      const document = apiRef.current.document
      const ids = objectIds.filter((id) => !getDesignObjectById(document, id)?.locked)
      const union = selectionViewBox(document, ids)
      if (!union || ids.length === 0) {
        return
      }
      event.preventDefault()
      const primary = getDesignObjectById(document, ids[0])
      gestureRef.current = {
        kind: 'resize',
        objectIds: ids,
        origin: document,
        handle,
        startX: union.x,
        startY: union.y,
        startWidth: union.width,
        startHeight: union.height,
        startRotation: ids.length === 1 ? (primary?.rotation ?? 0) : 0,
      }
    },
    startRotate(objectIds: string[], event: ReactPointerEvent<SVGElement>) {
      const document = apiRef.current.document
      const ids = objectIds.filter((id) => !getDesignObjectById(document, id)?.locked)
      const union = selectionViewBox(document, ids)
      const svg = svgRef.current
      if (!union || !svg || ids.length === 0) {
        return
      }
      event.preventDefault()
      const pointer = clientToSvgPoint(svg, event.clientX, event.clientY)
      const center = getCenter(union)
      gestureRef.current = {
        kind: 'rotate',
        objectIds: ids,
        origin: document,
        centerX: center.x,
        centerY: center.y,
        startAngle: rotationFromPointer(center, pointer),
      }
    },
  }
}

export function applyObjectPreview<T extends { id: string; x: number; y: number }>(
  object: T,
  preview: ObjectDragPreview | null,
): T {
  if (!preview || !preview.objectIds.includes(object.id)) {
    return object
  }
  return { ...object, x: object.x + preview.x, y: object.y + preview.y }
}
