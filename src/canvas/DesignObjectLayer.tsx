import {
  imageKeepsAlpha,
  type DesignObject,
  type ImageDesignObject,
  type ShapeDesignObject,
  type TextDesignObject,
} from '@/design/designObjects'
import { useAsset } from '@/persistence/useAsset'
import type { GarmentRect } from '@/garments/types'
import type { PointerEvent as ReactPointerEvent } from 'react'

interface DesignObjectLayerProps {
  objects: DesignObject[]
  selectedObjectId?: string | null
  selectedObjectIds?: string[]
  clipBoxes?: Record<string, GarmentRect>
  clipEnabled?: boolean
  onSelect: (objectId: string, event: { shiftKey: boolean }) => void
  onMoveStart: (objectId: string, event: ReactPointerEvent<SVGElement>) => void
}

export function DesignObjectLayer({
  objects,
  selectedObjectId = null,
  selectedObjectIds,
  clipBoxes,
  clipEnabled = false,
  onSelect,
  onMoveStart,
}: DesignObjectLayerProps) {
  const selected = new Set(selectedObjectIds ?? (selectedObjectId ? [selectedObjectId] : []))

  return (
    <g data-design-object-layer="true" data-artwork-clip={clipEnabled ? 'true' : 'false'}>
      {objects.map((object) => {
        if (!object.visible) {
          return null
        }
        const isSelected = selected.has(object.id)
        const clip = clipEnabled ? clipBoxes?.[object.id] : undefined
        const clipId = `artwork-clip-${object.id}`
        const rotate = `rotate(${object.rotation} ${object.x + object.width / 2} ${object.y + object.height / 2})`
        const visuals = (
          <>
            {object.type === 'shape' ? <ObjectShape object={object} /> : null}
            {object.type === 'text' ? <ObjectText object={object} selected={isSelected} /> : null}
            {object.type === 'image' ? <ObjectImage object={object} selected={isSelected} /> : null}
          </>
        )
        return (
          <g
            key={object.id}
            data-design-object={object.id}
            data-design-object-type={object.type}
            data-shape-kind={object.type === 'shape' ? object.shape : undefined}
            data-placement-zone={object.zone}
            data-anchor-space={object.anchor.space}
            data-panel-id={object.anchor.panelId ?? ''}
            data-object-locked={object.locked ? 'true' : 'false'}
            data-object-selected={isSelected ? 'true' : 'false'}
            data-object-name={object.name ?? ''}
            data-object-clipped={clip ? 'true' : 'false'}
            opacity={object.opacity}
            style={{ cursor: object.locked ? 'default' : 'move' }}
            onPointerDown={(event) => {
              event.stopPropagation()
              event.preventDefault()
              if (object.locked) {
                return
              }
              onSelect(object.id, event)
              onMoveStart(object.id, event)
            }}
            onDoubleClick={(event) => {
              event.stopPropagation()
              if (object.locked || object.type !== 'text') {
                return
              }
              onSelect(object.id, event)
              window.dispatchEvent(new CustomEvent('resistq-edit-text', { detail: object.id }))
            }}
          >
            {clip ? (
              <>
                <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                  <rect x={clip.x} y={clip.y} width={clip.width} height={clip.height} />
                </clipPath>
                <g clipPath={`url(#${clipId})`} data-artwork-clip-box={object.id}>
                  <g transform={rotate}>{visuals}</g>
                </g>
              </>
            ) : (
              <g transform={rotate}>{visuals}</g>
            )}
            <g transform={rotate}>
              <rect
                x={object.x}
                y={object.y}
                width={object.width}
                height={object.height}
                fill="transparent"
              />
            </g>
          </g>
        )
      })}
    </g>
  )
}

function ObjectShape({ object }: { object: ShapeDesignObject }) {
  const stroke = object.strokeWidth > 0 ? object.stroke : undefined
  if (object.shape === 'circle') {
    return (
      <ellipse
        cx={object.x + object.width / 2}
        cy={object.y + object.height / 2}
        rx={object.width / 2}
        ry={object.height / 2}
        fill={object.fill === 'none' ? 'transparent' : object.fill}
        stroke={stroke}
        strokeWidth={object.strokeWidth}
      />
    )
  }
  if (object.shape === 'line') {
    const midY = object.y + object.height / 2
    return (
      <>
        <rect
          x={object.x}
          y={object.y}
          width={object.width}
          height={object.height}
          fill="transparent"
        />
        <line
          x1={object.x}
          y1={midY}
          x2={object.x + object.width}
          y2={midY}
          stroke={object.stroke}
          strokeWidth={Math.max(object.strokeWidth, 2)}
          strokeLinecap="round"
        />
      </>
    )
  }
  const radius = object.shape === 'rounded-rectangle' ? Math.min(object.width, object.height) * 0.18 : 0
  return (
    <rect
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      rx={radius}
      ry={radius}
      fill={object.fill === 'none' ? 'transparent' : object.fill}
      stroke={stroke}
      strokeWidth={object.strokeWidth}
    />
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
        fontStyle={object.italic ? 'italic' : 'normal'}
        letterSpacing={object.letterSpacing || undefined}
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
          preserveAspectRatio={object.aspectLocked !== false ? 'xMidYMid meet' : 'none'}
          data-image-alpha={imageKeepsAlpha(object.mimeType) ? 'true' : 'false'}
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
