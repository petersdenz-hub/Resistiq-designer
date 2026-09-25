import type { ReactNode } from 'react'

/** Shared fashion-flat stroke. Technical, not decorative. */
export const FLAT_STROKE = {
  width: 1.35,
  join: 'round' as const,
  opacity: 0.46,
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
      <path d={d} fill={fill} />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={FLAT_STROKE.width}
        strokeLinejoin={FLAT_STROKE.join}
        strokeLinecap="round"
        opacity={FLAT_STROKE.opacity}
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

export function seam(
  d: string,
  color: string,
  width = 1,
  opacity = 0.28,
) {
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
