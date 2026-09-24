import type { DesignObject, ImageDesignObject, TextDesignObject } from '@/design/designObjects'
import { useAsset } from '@/persistence/useAsset'
import type { PointerEvent as ReactPointerEvent } from 'react'

interface DesignObjectLayerProps {
  objects: DesignObject[]
  selectedObjectId: string | null
  onSelect: (objectId: string) => void
  onMoveStart: (objectId: string, event: ReactPointerEvent<SVGElement>) => void
}

export function DesignObjectLayer({
  objects,
  selectedObjectId,
  onSelect,
  onMoveStart,
}: DesignObjectLayerProps) {
  return (
    <g data-design-object-layer="true">
      {objects.map((object) => {
        if (!object.visible) {
          return null
        }
        const selected = object.id === selectedObjectId
        return (
          <g
            key={object.id}
            data-design-object={object.id}
            data-design-object-type={object.type}
            data-placement-zone={object.zone}
            data-object-locked={object.locked ? 'true' : 'false'}
            transform={`rotate(${object.rotation} ${object.x + object.width / 2} ${object.y + object.height / 2})`}
            opacity={object.opacity}
            style={{ cursor: object.locked ? 'default' : 'move' }}
            onPointerDown={(event) => {
              event.stopPropagation()
              event.preventDefault()
              onSelect(object.id)
              if (!object.locked) {
                onMoveStart(object.id, event)
              }
            }}
          >
            {object.type === 'shape' ? (
              <rect
                x={object.x}
                y={object.y}
                width={object.width}
                height={object.height}
                fill={object.fill}
                stroke={object.strokeWidth > 0 ? object.stroke : undefined}
                strokeWidth={object.strokeWidth}
              />
            ) : null}
            {object.type === 'text' ? <ObjectText object={object} selected={selected} /> : null}
            {object.type === 'image' ? <ObjectImage object={object} selected={selected} /> : null}
          </g>
        )
      })}
    </g>
  )
}

function ObjectText({ object, selected }: { object: TextDesignObject; selected: boolean }) {
  const lines = object.content.split('\n')
  const fontSize = Math.max(6, object.fontSize)
  const lineHeight = fontSize * 1.2
  const textX =
    object.textAlign === 'left'
      ? object.x
      : object.textAlign === 'right'
        ? object.x + object.width
        : object.x + object.width / 2
  const blockHeight = lineHeight * lines.length
  const textY = object.y + (object.height - blockHeight) / 2 + fontSize * 0.82
  const anchor =
    object.textAlign === 'left' ? 'start' : object.textAlign === 'right' ? 'end' : 'middle'

  return (
    <>
      <rect
        x={object.x}
        y={object.y}
        width={object.width}
        height={object.height}
        fill={selected ? 'rgba(201,163,106,0.08)' : 'transparent'}
      />
      <text
        x={textX}
        y={textY}
        textAnchor={anchor}
        fill={object.color}
        fontFamily={object.fontFamily}
        fontSize={fontSize}
        fontWeight={object.fontWeight}
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

function ObjectImage({ object, selected }: { object: ImageDesignObject; selected: boolean }) {
  const asset = useAsset(object.source)
  return (
    <>
      {asset ? (
        <image
          href={asset.dataUrl}
          x={object.x}
          y={object.y}
          width={object.width}
          height={object.height}
          preserveAspectRatio="none"
          style={{ pointerEvents: 'none' }}
        />
      ) : (
        <rect
          x={object.x}
          y={object.y}
          width={object.width}
          height={object.height}
          fill="#2a3040"
          stroke="#c9a36a"
          strokeDasharray="4 3"
        />
      )}
      <rect
        x={object.x}
        y={object.y}
        width={object.width}
        height={object.height}
        fill={selected ? 'rgba(201,163,106,0.06)' : 'transparent'}
      />
    </>
  )
}
