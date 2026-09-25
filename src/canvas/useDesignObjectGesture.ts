import {
  getDesignObjectById,
  isImageAspectLocked,
  objectAspect,
  snapBox,
  snapValue,
  type DesignObjectPatch,
} from '@/design/designObjects'
import type { DesignDocument } from '@/design/types'
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
  objectId: string
  x: number
  y: number
}

interface ObjectGestureApi {
  document: DesignDocument
  snapToGrid: boolean
  gridSize: number
  updateObjectById: (objectId: string, patch: DesignObjectPatch, history?: 'record' | 'replace') => void
  commitGesture: (previous: DesignDocument) => void
}

type Gesture =
  | {
      kind: 'move'
      objectId: string
      origin: DesignDocument
      startX: number
      startY: number
      lastDx: number
      lastDy: number
    }
  | {
      kind: 'resize'
      objectId: string
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
      objectId: string
      origin: DesignDocument
    }

export function useDesignObjectGesture(
  svgRef: RefObject<SVGSVGElement | null>,
  api: ObjectGestureApi,
) {
  const gestureRef = useRef<Gesture | null>(null)
  const apiRef = useRef(api)
  const [preview, setPreview] = useState<ObjectDragPreview | null>(null)

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
      const object = getDesignObjectById(apiRef.current.document, gesture.objectId)
      if (!object || object.locked) {
        return
      }

      if (gesture.kind === 'move') {
        gesture.lastDx = pointer.x - gesture.startX
        gesture.lastDy = pointer.y - gesture.startY
        setPreview({ objectId: gesture.objectId, x: gesture.lastDx, y: gesture.lastDy })
        return
      }

      if (gesture.kind === 'resize') {
        const start = {
          x: gesture.startX,
          y: gesture.startY,
          width: gesture.startWidth,
          height: gesture.startHeight,
        }
        const next = isImageAspectLocked(object)
          ? resizeRectKeepAspect(start, gesture.startRotation, gesture.handle, pointer, objectAspect(object))
          : resizeRect(start, gesture.startRotation, gesture.handle, pointer)
        const snapped = snapBox(next, apiRef.current.gridSize, apiRef.current.snapToGrid)
        apiRef.current.updateObjectById(
          gesture.objectId,
          { x: snapped.x, y: snapped.y, width: Math.max(8, snapped.width), height: Math.max(8, snapped.height) },
          'replace',
        )
        return
      }

      const rotation = rotationFromPointer(getCenter(object), pointer)
      apiRef.current.updateObjectById(
        gesture.objectId,
        { rotation: event.shiftKey ? snapAngle(rotation) : rotation },
        'replace',
      )
    }

    const onUp = () => {
      const gesture = gestureRef.current
      if (!gesture) {
        return
      }
      if (gesture.kind === 'move') {
        const object = getDesignObjectById(apiRef.current.document, gesture.objectId)
        if (object && (gesture.lastDx !== 0 || gesture.lastDy !== 0)) {
          const next = {
            x: snapValue(object.x + gesture.lastDx, apiRef.current.gridSize, apiRef.current.snapToGrid),
            y: snapValue(object.y + gesture.lastDy, apiRef.current.gridSize, apiRef.current.snapToGrid),
          }
          apiRef.current.updateObjectById(gesture.objectId, next, 'record')
        }
        setPreview(null)
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
    startMove(objectId: string, event: ReactPointerEvent<SVGElement>) {
      const svg = svgRef.current
      const document = apiRef.current.document
      const object = getDesignObjectById(document, objectId)
      if (!svg || !object || object.locked) {
        return
      }
      event.preventDefault()
      const pointer = clientToSvgPoint(svg, event.clientX, event.clientY)
      gestureRef.current = {
        kind: 'move',
        objectId,
        origin: document,
        startX: pointer.x,
        startY: pointer.y,
        lastDx: 0,
        lastDy: 0,
      }
    },
    startResize(objectId: string, handle: ResizeHandle, event: ReactPointerEvent<SVGElement>) {
      const object = getDesignObjectById(apiRef.current.document, objectId)
      if (!object || object.locked) {
        return
      }
      event.preventDefault()
      gestureRef.current = {
        kind: 'resize',
        objectId,
        origin: apiRef.current.document,
        handle,
        startX: object.x,
        startY: object.y,
        startWidth: object.width,
        startHeight: object.height,
        startRotation: object.rotation,
      }
    },
    startRotate(objectId: string, event: ReactPointerEvent<SVGElement>) {
      event.preventDefault()
      gestureRef.current = {
        kind: 'rotate',
        objectId,
        origin: apiRef.current.document,
      }
    },
  }
}

export function applyObjectPreview<T extends { id: string; x: number; y: number }>(
  object: T,
  preview: ObjectDragPreview | null,
): T {
  if (!preview || preview.objectId !== object.id) {
    return object
  }
  return { ...object, x: object.x + preview.x, y: object.y + preview.y }
}
