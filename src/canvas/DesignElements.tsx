import type { DesignElement, ImageElement, LogoElement, TextElement } from '@/design/types'
import { isGraphicElement, isPlacedImage, isTextElement } from '@/design/types'
import { useAsset } from '@/persistence/useAsset'
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
          style={{ cursor: isPlacedImage(element) && element.locked ? 'default' : 'move' }}
          onPointerDown={(event) => {
            event.stopPropagation()
            event.preventDefault()
            onSelect(element.id)
            if (!(isPlacedImage(element) && element.locked)) {
              onMoveStart(element.id, event)
            }
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
            <TextGraphic
              element={element}
              selected={selectedElementId === element.id}
            />
          ) : null}

          {isPlacedImage(element) ? (
            <PlacedImageGraphic
              element={element}
              selected={selectedElementId === element.id}
            />
          ) : null}
        </g>
      ))}
    </g>
  )
}

function PlacedImageGraphic({
  element,
  selected,
}: {
  element: ImageElement | LogoElement
  selected: boolean
}) {
  const asset = useAsset(element.source)

  return (
    <>
      {asset ? (
        <image
          href={asset.dataUrl}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          preserveAspectRatio="none"
          style={{ pointerEvents: 'none' }}
        />
      ) : (
        <rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill="#2a3040"
          stroke="#c9a36a"
          strokeDasharray="4 3"
        />
      )}
      <rect
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        fill={selected ? 'rgba(201,163,106,0.06)' : 'transparent'}
      />
    </>
  )
}

function TextGraphic({
  element,
  selected,
}: {
  element: TextElement
  selected: boolean
}) {
  const lines = element.content.split('\n')
  const fontSize = Math.max(6, element.fontSize)
  const lineHeight = fontSize * 1.2
  const textX =
    element.textAlign === 'left'
      ? element.x
      : element.textAlign === 'right'
        ? element.x + element.width
        : element.x + element.width / 2
  const blockHeight = lineHeight * lines.length
  const textY = element.y + (element.height - blockHeight) / 2 + fontSize * 0.82
  const anchor =
    element.textAlign === 'left' ? 'start' : element.textAlign === 'right' ? 'end' : 'middle'

  return (
    <>
      <rect
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        fill={selected ? 'rgba(201,163,106,0.06)' : 'transparent'}
      />
      <text
        x={textX}
        y={textY}
        textAnchor={anchor}
        fill={element.color}
        fontFamily={element.fontFamily}
        fontSize={fontSize}
        fontWeight={element.fontWeight}
        fontStyle={element.italic ? 'italic' : 'normal'}
        letterSpacing={element.letterSpacing}
        style={{ userSelect: 'none' }}
      >
        {lines.map((line, index) => (
          <tspan key={`${index}-${line}`} x={textX} dy={index === 0 ? 0 : lineHeight}>
            {line.length > 0 ? line : ' '}
          </tspan>
        ))}
      </text>
    </>
  )
}
