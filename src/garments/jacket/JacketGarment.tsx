import type { GarmentRenderProps } from '../types'
import { clothShades } from '../render/cloth'

/**
 * Fashion-flat jacket. Front is two body panels plus a zipper.
 * The zipper is garment structure, not an editable design element.
 */

const FRONT_LEFT =
  'M164 208 L176 508 C176 524 190 534 210 534 L274 534 L274 168 L150 168 L164 208 Z'

const FRONT_RIGHT =
  'M396 208 L384 508 C384 524 370 534 350 534 L286 534 L286 168 L410 168 L396 208 Z'

const BODY_BACK =
  'M164 208 L176 508 C176 524 190 534 210 534 L350 534 C370 534 384 524 384 508 L396 208 L410 160 L324 160 C316 184 244 184 236 160 L150 160 L164 208 Z'

const RIGHT_SLEEVE = 'M150 168 L46 196 L72 330 L178 304 L164 208 L150 168 Z'
const LEFT_SLEEVE = 'M410 168 L514 196 L488 330 L382 304 L396 208 L410 168 Z'

const COLLAR_FRONT =
  'M208 128 L230 168 L330 168 L352 128 C338 116 222 116 208 128 Z'

const COLLAR_BACK =
  'M218 130 L236 164 L324 164 L342 130 C330 120 230 120 218 130 Z'

export function JacketGarment({ viewId, bodyColor }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const { cloth, clothDeep, clothDark, stitch, highlight, rib, tape, metal } = clothShades(bodyColor)
  const id = `jacket-${viewId}`

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-body`} x1="280" y1="150" x2="280" y2="534" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={highlight} />
          <stop offset="0.45" stopColor={cloth} />
          <stop offset="1" stopColor={clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-r`} x1="168" y1="168" x2="52" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cloth} />
          <stop offset="1" stopColor={clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-l`} x1="392" y1="168" x2="508" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cloth} />
          <stop offset="1" stopColor={clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-collar`} x1="280" y1="118" x2="280" y2="168" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={highlight} />
          <stop offset="1" stopColor={rib} />
        </linearGradient>
        <filter id={`${id}-soft`} x="-8%" y="-4%" width="116%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.22" />
        </filter>
      </defs>

      <g filter={`url(#${id}-soft)`}>
        <g data-garment-part="right_sleeve">
          <path d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} />
          <path d="M58 318 L170 296" fill="none" stroke={rib} strokeWidth="7" strokeLinecap="round" opacity="0.45" />
        </g>
        <g data-garment-part="left_sleeve">
          <path d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} />
          <path d="M390 296 L502 318" fill="none" stroke={rib} strokeWidth="7" strokeLinecap="round" opacity="0.45" />
        </g>

        {isBack ? (
          <g data-garment-part="back_body">
            <path d={BODY_BACK} fill={`url(#${id}-body)`} />
          </g>
        ) : (
          <>
            <g data-garment-part="front_body_left">
              <path d={FRONT_LEFT} fill={`url(#${id}-body)`} />
            </g>
            <g data-garment-part="front_body_right">
              <path d={FRONT_RIGHT} fill={`url(#${id}-body)`} />
            </g>
            <Zipper tape={tape} metal={metal} />
          </>
        )}

        <g data-garment-part={isBack ? 'collar_back' : 'collar'}>
          <path d={isBack ? COLLAR_BACK : COLLAR_FRONT} fill={`url(#${id}-collar)`} />
          <path
            d={isBack ? 'M240 146 H320' : 'M226 148 H334'}
            fill="none"
            stroke={highlight}
            strokeWidth="1.6"
            opacity="0.32"
          />
        </g>
      </g>

      <path d="M170 216 L182 516" fill="none" stroke={stitch} strokeWidth="1" opacity="0.2" />
      <path d="M390 216 L378 516" fill="none" stroke={stitch} strokeWidth="1" opacity="0.2" />
      <path d="M210 526 H350" fill="none" stroke={stitch} strokeWidth="3.5" strokeLinecap="round" opacity="0.4" />
    </g>
  )
}

function Zipper({ tape, metal }: { tape: string; metal: string }) {
  const teeth = Array.from({ length: 27 }, (_, index) => {
    const y = 176 + index * 13
    return (
      <rect
        key={y}
        x={index % 2 === 0 ? 273 : 281}
        y={y}
        width="6"
        height="7"
        rx="0.8"
        fill={metal}
      />
    )
  })

  return (
    <g data-garment-part="zipper">
      <rect x="273" y="168" width="14" height="366" rx="2" fill={tape} />
      {teeth}
      <rect x="269" y="184" width="22" height="24" rx="3" fill={metal} />
      <path d="M280 208 L280 230" fill="none" stroke={metal} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  )
}
