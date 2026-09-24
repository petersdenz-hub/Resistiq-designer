import type { DesignDocument, DesignElementPatch } from '@/design/types'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import {
  clientToSvgPoint,
  getCenter,
  resizeRect,
  rotationFromPointer,
  snapAngle,
  type ResizeHandle,
} from './geometry'

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
      elementX: number
      elementY: number
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
        apiRef.current.updateElementById(
          gesture.elementId,
          {
            x: gesture.elementX + (pointer.x - gesture.startX),
            y: gesture.elementY + (pointer.y - gesture.startY),
          },
          'replace',
        )
        return
      }

      if (gesture.kind === 'resize') {
        const next = resizeRect(
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
        apiRef.current.updateElementById(gesture.elementId, next, 'replace')
        return
      }

      const rotation = rotationFromPointer(getCenter(element), pointer)
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
      apiRef.current.commitGesture(gesture.origin)
      gestureRef.current = null
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [svgRef])

  return {
    startMove(elementId: string, event: ReactPointerEvent<SVGElement>) {
      const svg = svgRef.current
      const document = apiRef.current.document
      const element = document.elements.find((item) => item.id === elementId)
      if (!svg || !element) {
        return
      }
      event.preventDefault()
      event.currentTarget.setPointerCapture?.(event.pointerId)
      const pointer = clientToSvgPoint(svg, event.clientX, event.clientY)
      gestureRef.current = {
        kind: 'move',
        elementId,
        origin: document,
        startX: pointer.x,
        startY: pointer.y,
        elementX: element.x,
        elementY: element.y,
      }
    },
    startResize(elementId: string, handle: ResizeHandle, event: ReactPointerEvent<SVGElement>) {
      const document = apiRef.current.document
      const element = document.elements.find((item) => item.id === elementId)
      if (!element) {
        return
      }
      event.preventDefault()
      event.currentTarget.setPointerCapture?.(event.pointerId)
      gestureRef.current = {
        kind: 'resize',
        elementId,
        origin: document,
        handle,
        startX: element.x,
        startY: element.y,
        startWidth: element.width,
        startHeight: element.height,
        startRotation: element.rotation,
      }
    },
    startRotate(elementId: string, event: ReactPointerEvent<SVGElement>) {
      event.preventDefault()
      event.currentTarget.setPointerCapture?.(event.pointerId)
      gestureRef.current = {
        kind: 'rotate',
        elementId,
        origin: apiRef.current.document,
      }
    },
  }
}
