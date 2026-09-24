import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import type { BottomsKind } from './definition'

/**
 * Shared fashion-flat for pants and shorts. Length is the only visual
 * difference. Back pockets and the fly are garment structure.
 */

export function BottomsGarment({
  viewId,
  bodyColor,
  panelColors,
  kind,
}: GarmentRenderProps & { kind: BottomsKind }) {
  const isBack = viewId === 'back'
  const long = kind === 'pants'
  const hem = long ? 560 : 322
  const leftId = isBack ? 'left_leg_back' : 'left_leg'
  const rightId = isBack ? 'right_leg_back' : 'right_leg'
  const waistId = isBack ? 'waistband_back' : 'waistband'
  const left = clothFor(bodyColor, panelColors, leftId)
  const right = clothFor(bodyColor, panelColors, rightId)
  const waist = clothFor(bodyColor, panelColors, waistId)
  const id = `${kind}-${viewId}`

  const leftLeg = long
    ? 'M198 110 C176 168 164 250 172 380 L178 528 C180 552 206 562 230 548 L256 548 L268 260 C272 186 274 136 280 110 Z'
    : 'M198 110 C176 150 168 200 176 250 L184 300 C188 318 214 324 236 312 L258 304 L270 200 C274 150 276 124 280 110 Z'

  const rightLeg = long
    ? 'M362 110 C384 168 396 250 388 380 L382 528 C380 552 354 562 330 548 L304 548 L292 260 C288 186 286 136 280 110 Z'
    : 'M362 110 C384 150 392 200 384 250 L376 300 C372 318 346 324 324 312 L302 304 L290 200 C286 150 284 124 280 110 Z'

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-leg-l`} x1="220" y1="70" x2="220" y2={hem} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={left.highlight} />
          <stop offset="0.35" stopColor={left.cloth} />
          <stop offset="1" stopColor={left.clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-leg-r`} x1="340" y1="70" x2="340" y2={hem} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={right.highlight} />
          <stop offset="0.35" stopColor={right.cloth} />
          <stop offset="1" stopColor={right.clothDeep} />
        </linearGradient>
        <filter id={`${id}-soft`} x="-8%" y="-4%" width="116%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.22" />
        </filter>
      </defs>

      <g filter={`url(#${id}-soft)`}>
        <g data-garment-part={leftId} data-panel-color={left.cloth}>
          <path d={leftLeg} fill={`url(#${id}-leg-l)`} />
        </g>
        <g data-garment-part={rightId} data-panel-color={right.cloth}>
          <path d={rightLeg} fill={`url(#${id}-leg-r)`} />
        </g>
        <g data-garment-part={waistId} data-panel-color={waist.cloth}>
          <path
            d="M196 66 C196 58 208 54 222 54 L338 54 C352 54 364 58 364 66 L364 110 L196 110 Z"
            fill={waist.rib}
          />
          <path d="M214 80 H346" fill="none" stroke={waist.stitch} strokeWidth="1.5" opacity="0.4" />
          <path
            d="M218 56 V110 M280 56 V110 M342 56 V110"
            fill="none"
            stroke={waist.stitch}
            strokeWidth="1.3"
            opacity="0.3"
          />
        </g>
      </g>

      {isBack ? (
        <>
          <path d="M216 128 H344" fill="none" stroke={waist.stitch} strokeWidth="1.5" opacity="0.3" />
          <rect x="206" y="152" width="56" height="64" rx="8" fill="none" stroke={left.clothDark} strokeWidth="2.2" opacity="0.65" />
          <rect x="298" y="152" width="56" height="64" rx="8" fill="none" stroke={right.clothDark} strokeWidth="2.2" opacity="0.65" />
        </>
      ) : (
        <>
          <path d="M280 110 L280 198" fill="none" stroke={waist.stitch} strokeWidth="1.8" opacity="0.45" />
          <path d="M268 140 C274 150 274 176 268 190" fill="none" stroke={left.highlight} strokeWidth="1.3" opacity="0.22" />
          <path d="M208 126 L242 162 L242 204" fill="none" stroke={left.stitch} strokeWidth="1.4" opacity="0.35" />
          <path d="M352 126 L318 162 L318 204" fill="none" stroke={right.stitch} strokeWidth="1.4" opacity="0.35" />
        </>
      )}

      <path
        d={long ? 'M204 542 H248' : 'M206 306 H248'}
        fill="none"
        stroke={left.rib}
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d={long ? 'M312 542 H356' : 'M312 306 H354'}
        fill="none"
        stroke={right.rib}
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.5"
      />
    </g>
  )
}
