import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  RESIZE_HANDLES,
  getCenter,
  handleLocalPoint,
  type ResizeHandle,
} from './geometry'

export interface TransformBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

interface TransformControlsProps {
  element: TransformBox
  zoom: number
  onResizeStart: (handle: ResizeHandle, event: ReactPointerEvent<SVGElement>) => void
  onRotateStart: (event: ReactPointerEvent<SVGElement>) => void
}

const CURSORS: Record<ResizeHandle, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
}

export function TransformControls({
  element,
  zoom,
  onResizeStart,
  onRotateStart,
}: TransformControlsProps) {
  const handleSize = 10 / zoom
  const stroke = 1.55 / zoom
  const rotateOffset = 30 / zoom
  const center = getCenter(element)
  const top = handleLocalPoint(element, 'n')

  return (
    <g
      data-editor-chrome="true"
      data-multi-selection={element.id === 'selection' ? 'true' : undefined}
      transform={`rotate(${element.rotation} ${center.x} ${center.y})`}
    >
      <rect
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        data-selection-bounds="true"
        fill="rgba(201,163,106,0.05)"
        stroke="#c9a36a"
        strokeWidth={stroke}
        pointerEvents="none"
      />
      <line
        x1={top.x}
        y1={top.y}
        x2={top.x}
        y2={top.y - rotateOffset}
        stroke="#c9a36a"
        strokeWidth={stroke}
        pointerEvents="none"
      />
      <circle
        cx={top.x}
        cy={top.y - rotateOffset}
        r={handleSize * 0.62}
        fill="#0b0d11"
        stroke="#c9a36a"
        strokeWidth={stroke}
        style={{ cursor: 'grab' }}
        onPointerDown={(event) => {
          event.stopPropagation()
          onRotateStart(event)
        }}
      />
      {RESIZE_HANDLES.map((handle) => {
        const point = handleLocalPoint(element, handle)
        return (
          <rect
            key={handle}
            x={point.x - handleSize / 2}
            y={point.y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="#eef0f4"
            stroke="#c9a36a"
            strokeWidth={stroke}
            style={{ cursor: CURSORS[handle] }}
            onPointerDown={(event) => {
              event.stopPropagation()
              onResizeStart(handle, event)
            }}
          />
        )
      })}
    </g>
  )
}
