import type { GarmentRenderProps } from '../types'
import { clothShades } from '../render/cloth'
import type { BottomsKind } from './definition'

/**
 * Shared fashion-flat for pants and shorts. Length is the only visual
 * difference. Back pockets and the fly are garment structure.
 */

const WAISTBAND = 'M196 70 C196 64 204 62 214 62 L346 62 C356 62 364 64 364 70 L364 108 L196 108 Z'

export function BottomsGarment({
  viewId,
  bodyColor,
  kind,
}: GarmentRenderProps & { kind: BottomsKind }) {
  const isBack = viewId === 'back'
  const long = kind === 'pants'
  const hem = long ? 548 : 308
  const { cloth, clothDeep, clothDark, stitch, highlight, rib } = clothShades(bodyColor)
  const id = `${kind}-${viewId}`

  const leftLeg = long
    ? `M196 108 L196 ${hem - 16} C196 ${hem + 10} 220 ${hem + 16} 238 ${hem - 8} L268 ${hem - 8} L276 108 Z`
    : `M196 108 L200 ${hem - 8} C204 ${hem + 8} 230 ${hem + 8} 246 ${hem - 4} L270 ${hem - 4} L276 108 Z`

  const rightLeg = long
    ? `M364 108 L364 ${hem - 16} C364 ${hem + 10} 340 ${hem + 16} 322 ${hem - 8} L292 ${hem - 8} L284 108 Z`
    : `M364 108 L360 ${hem - 8} C356 ${hem + 8} 330 ${hem + 8} 314 ${hem - 4} L290 ${hem - 4} L284 108 Z`

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-leg`} x1="280" y1="70" x2="280" y2={hem} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={highlight} />
          <stop offset="0.35" stopColor={cloth} />
          <stop offset="1" stopColor={clothDeep} />
        </linearGradient>
        <filter id={`${id}-soft`} x="-8%" y="-4%" width="116%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.22" />
        </filter>
      </defs>

      <g filter={`url(#${id}-soft)`}>
        <g data-garment-part={isBack ? 'left_leg_back' : 'left_leg'}>
          <path d={leftLeg} fill={`url(#${id}-leg)`} />
        </g>
        <g data-garment-part={isBack ? 'right_leg_back' : 'right_leg'}>
          <path d={rightLeg} fill={`url(#${id}-leg)`} />
        </g>
        <g data-garment-part={isBack ? 'waistband_back' : 'waistband'}>
          <path d={WAISTBAND} fill={rib} />
          <path d="M210 84 H350" fill="none" stroke={stitch} strokeWidth="1.4" opacity="0.35" />
          <path d="M214 70 V108 M280 70 V108 M346 70 V108" fill="none" stroke={stitch} strokeWidth="1.2" opacity="0.28" />
        </g>
      </g>

      <path d="M276 108 L276 200" fill="none" stroke={stitch} strokeWidth="1.2" opacity="0.22" />
      <path d="M284 108 L284 200" fill="none" stroke={stitch} strokeWidth="1.2" opacity="0.22" />

      {isBack ? (
        <>
          <path d="M214 124 H346" fill="none" stroke={stitch} strokeWidth="1.4" opacity="0.28" />
          <rect x="208" y="148" width="52" height="58" rx="6" fill="none" stroke={clothDark} strokeWidth="2" opacity="0.55" />
          <rect x="300" y="148" width="52" height="58" rx="6" fill="none" stroke={clothDark} strokeWidth="2" opacity="0.55" />
        </>
      ) : (
        <>
          <path d="M280 108 L280 196" fill="none" stroke={stitch} strokeWidth="1.6" opacity="0.4" />
          <path d="M268 140 C274 148 274 168 268 178" fill="none" stroke={highlight} strokeWidth="1.2" opacity="0.2" />
          <path d="M208 124 L236 154 L236 196" fill="none" stroke={stitch} strokeWidth="1.3" opacity="0.32" />
          <path d="M352 124 L324 154 L324 196" fill="none" stroke={stitch} strokeWidth="1.3" opacity="0.32" />
        </>
      )}

      <path
        d={long ? `M208 ${hem - 10} H252` : `M208 ${hem - 6} H252`}
        fill="none"
        stroke={stitch}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d={long ? `M308 ${hem - 10} H352` : `M308 ${hem - 6} H352`}
        fill="none"
        stroke={stitch}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.3"
      />
    </g>
  )
}
