import type { ReactNode } from 'react'

const STROKE_WIDTH = 1.35
const STROKE_OPACITY = 0.46

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
      <path d={d} fill={fill} />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={STROKE_OPACITY}
      />
      {children}
    </>
  )
}

export function FlatShadow({ id }: { id: string }) {
  return (
    <filter id={`${id}-soft`} x="-6%" y="-3%" width="112%" height="108%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.12" />
    </filter>
  )
}

export function Seam({
  d,
  color,
  width = 1,
  opacity = 0.28,
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
    />
  )
}
