import type { DesignElement } from '@/design/types'
import { isGraphicElement, isTextElement } from '@/design/types'
import type { PointerEvent as ReactPointerEvent } from 'react'

interface DesignElementsProps {
  elements: DesignElement[]
  selectedElementId: string | null
  onSelect: (elementId: string) => void
  onMoveStart: (elementId: string, event: ReactPointerEvent<SVGElement>) => void
}

export function DesignElements({
  elements,
  selectedElementId,
  onSelect,
  onMoveStart,
}: DesignElementsProps) {
  return (
    <g>
      {elements.map((element) => (
        <g
          key={element.id}
          transform={`rotate(${element.rotation} ${element.x + element.width / 2} ${element.y + element.height / 2})`}
          opacity={element.opacity}
          style={{ cursor: 'move' }}
          onPointerDown={(event) => {
            event.stopPropagation()
            event.preventDefault()
            onSelect(element.id)
            onMoveStart(element.id, event)
          }}
        >
          {isGraphicElement(element) ? (
            element.shape === 'ellipse' ? (
              <ellipse
                cx={element.x + element.width / 2}
                cy={element.y + element.height / 2}
                rx={element.width / 2}
                ry={element.height / 2}
                fill={element.color}
              />
            ) : (
              <rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                rx={element.cornerRadius}
                fill={element.color}
              />
            )
          ) : null}

          {isTextElement(element) ? (
            <>
              <rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fill={selectedElementId === element.id ? 'rgba(201,163,106,0.06)' : 'transparent'}
              />
              <text
                x={element.x + element.width / 2}
                y={element.y + element.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={element.color}
                fontFamily={element.fontFamily}
                fontSize={Math.max(12, element.height * 0.52)}
                style={{ userSelect: 'none' }}
              >
                {element.content}
              </text>
            </>
          ) : null}

          {element.type === 'image' || element.type === 'logo' ? (
            <rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill="#2a3040"
              stroke="#c9a36a"
              strokeDasharray="4 3"
            />
          ) : null}
        </g>
      ))}
    </g>
  )
}
