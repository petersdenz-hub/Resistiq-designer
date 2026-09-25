import type { ReactNode } from 'react'
import type { ClothShades } from './cloth'

const STROKE_WIDTH = 1.35
const STROKE_OPACITY = 0.5

export function ClothGradient({
  id,
  color,
  x1,
  y1,
  x2,
  y2,
}: {
  id: string
  color: ClothShades
  x1: number
  y1: number
  x2: number
  y2: number
}) {
  return (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor={color.highlight} />
      <stop offset="0.38" stopColor={color.cloth} />
      <stop offset="1" stopColor={color.clothDeep} />
    </linearGradient>
  )
}

/** Gentle two-stop wash for technical flats. No highlight pole / spherical lighting. */
export function ClothWash({
  id,
  color,
  x1,
  y1,
  x2,
  y2,
}: {
  id: string
  color: ClothShades
  x1: number
  y1: number
  x2: number
  y2: number
}) {
  return (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor={color.cloth} />
      <stop offset="1" stopColor={color.clothDeep} />
    </linearGradient>
  )
}

export function FlatPart({
  d,
  fill,
  stroke,
  children,
}: {
  d: string
  fill: string
  stroke: string
  children?: ReactNode
}) {
  return (
    <>
      <path d={d} fill={fill} data-region-shading="true" />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={STROKE_OPACITY}
        data-flat-outline="true"
      />
      {children}
    </>
  )
}

export function FlatShadow({ id }: { id: string }) {
  return (
    <filter id={`${id}-soft`} x="-8%" y="-4%" width="116%" height="114%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.8" floodColor="#000" floodOpacity="0.09" />
      <feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#000" floodOpacity="0.07" />
    </filter>
  )
}

export function Fold({
  d,
  color,
  opacity = 0.16,
}: {
  d: string
  color: string
  opacity?: number
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      opacity={opacity}
      data-flat-fold="true"
    />
  )
}

export function Seam({
  d,
  color,
  width = 1.05,
  opacity = 0.32,
}: {
  d: string
  color: string
  width?: number
  opacity?: number
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      data-flat-seam="true"
    />
  )
}

export function Stitch({
  d,
  color,
  width = 0.85,
  opacity = 0.42,
}: {
  d: string
  color: string
  width?: number
  opacity?: number
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeDasharray="2.4 2.1"
      strokeLinecap="round"
      opacity={opacity}
      data-flat-stitch="true"
    />
  )
}

export function PanelBoundary({
  d,
  color,
}: {
  d: string
  color: string
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.38"
      data-flat-boundary="true"
    />
  )
}

export function RibMarks({
  x,
  y,
  width,
  height,
  color,
  step = 5,
}: {
  x: number
  y: number
  width: number
  height: number
  color: string
  step?: number
}) {
  const lines = []
  for (let cursor = x + 3; cursor < x + width - 2; cursor += step) {
    lines.push(
      <path
        key={cursor}
        d={`M${cursor} ${y + 2} V${y + height - 2}`}
        fill="none"
        stroke={color}
        strokeWidth="0.7"
        opacity="0.28"
      />,
    )
  }
  return (
    <g data-rib="true" data-flat-rib="true">
      {lines}
    </g>
  )
}
