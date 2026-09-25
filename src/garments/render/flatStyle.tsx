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
    <filter id={`${id}-soft`} x="-8%" y="-4%" width="116%" height="114%">
      <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#000" floodOpacity="0.1" />
      <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.08" />
    </filter>
  )
}

export function Fold({
  d,
  color,
  opacity = 0.14,
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
      strokeWidth="1.15"
      strokeLinecap="round"
      opacity={opacity}
    />
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
