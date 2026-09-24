import type { DesignDocument, DesignElementPatch } from '@/design/types'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import {
  canvasOffsetToLocal,
  canvasPatchToLocal,
  canvasRectOf,
} from './project'
import {
  clientToSvgPoint,
  getCenter,
  resizeRect,
  rotationFromPointer,
  snapAngle,
  type ResizeHandle,
} from './geometry'

export interface DragPreview {
  elementId: string
  x: number
  y: number
}

interface GestureApi {
  document: DesignDocument
  updateElementById: (
    elementId: string,
    patch: DesignElementPatch,
    history?: 'record' | 'replace',
  ) => void
  commitGesture: (previous: DesignDocument) => void
}

type Gesture =
  | {
      kind: 'move'
      elementId: string
      origin: DesignDocument
      startX: number
      startY: number
      lastDx: number
      lastDy: number
    }
  | {
      kind: 'resize'
      elementId: string
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
      elementId: string
      origin: DesignDocument
    }

export function useElementGesture(svgRef: RefObject<SVGSVGElement | null>, api: GestureApi) {
  const gestureRef = useRef<Gesture | null>(null)
  const apiRef = useRef(api)
  const [preview, setPreview] = useState<DragPreview | null>(null)

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
      const element = apiRef.current.document.elements.find((item) => item.id === gesture.elementId)
      if (!element) {
        return
      }

      if (gesture.kind === 'move') {
        gesture.lastDx = pointer.x - gesture.startX
        gesture.lastDy = pointer.y - gesture.startY
        setPreview({
          elementId: gesture.elementId,
          x: gesture.lastDx,
          y: gesture.lastDy,
        })
        return
      }

      if (gesture.kind === 'resize') {
        const nextCanvas = resizeRect(
          {
            x: gesture.startX,
            y: gesture.startY,
            width: gesture.startWidth,
            height: gesture.startHeight,
          },
          gesture.startRotation,
          gesture.handle,
          pointer,
        )
        const local = canvasPatchToLocal(apiRef.current.document, element, nextCanvas)
        if (local) {
          apiRef.current.updateElementById(gesture.elementId, local, 'replace')
        }
        return
      }

      const canvasRect = canvasRectOf(apiRef.current.document, element)
      const rotation = rotationFromPointer(getCenter(canvasRect), pointer)
      apiRef.current.updateElementById(
        gesture.elementId,
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
        const element = apiRef.current.document.elements.find((item) => item.id === gesture.elementId)
        if (element && (gesture.lastDx !== 0 || gesture.lastDy !== 0)) {
          const local = canvasOffsetToLocal(
            apiRef.current.document,
            element,
            gesture.lastDx,
            gesture.lastDy,
          )
          if (local) {
            apiRef.current.updateElementById(gesture.elementId, local, 'record')
          }
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
    startMove(elementId: string, event: ReactPointerEvent<SVGElement>) {
      const svg = svgRef.current
      const document = apiRef.current.document
      const element = document.elements.find((item) => item.id === elementId)
      if (!svg || !element) {
        return
      }
      event.preventDefault()
      const pointer = clientToSvgPoint(svg, event.clientX, event.clientY)
      gestureRef.current = {
        kind: 'move',
        elementId,
        origin: document,
        startX: pointer.x,
        startY: pointer.y,
        lastDx: 0,
        lastDy: 0,
      }
    },
    startResize(elementId: string, handle: ResizeHandle, event: ReactPointerEvent<SVGElement>) {
      const document = apiRef.current.document
      const element = document.elements.find((item) => item.id === elementId)
      if (!element) {
        return
      }
      event.preventDefault()
      const canvas = canvasRectOf(document, element)
      gestureRef.current = {
        kind: 'resize',
        elementId,
        origin: document,
        handle,
        startX: canvas.x,
        startY: canvas.y,
        startWidth: canvas.width,
        startHeight: canvas.height,
        startRotation: element.rotation,
      }
    },
    startRotate(elementId: string, event: ReactPointerEvent<SVGElement>) {
      event.preventDefault()
      gestureRef.current = {
        kind: 'rotate',
        elementId,
        origin: apiRef.current.document,
      }
    },
  }
}

export function applyPreview<T extends { id: string; x: number; y: number }>(
  element: T,
  preview: DragPreview | null,
): T {
  if (!preview || preview.elementId !== element.id) {
    return element
  }
  return {
    ...element,
    x: element.x + preview.x,
    y: element.y + preview.y,
  }
}
