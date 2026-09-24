import type { GarmentRenderProps } from '../types'
import { clothFor, clothShades } from '../render/cloth'

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

export function JacketGarment({ viewId, bodyColor, panelColors }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const leftBody = clothFor(bodyColor, panelColors, 'front_body_left')
  const rightBody = clothFor(bodyColor, panelColors, 'front_body_right')
  const back = clothFor(bodyColor, panelColors, 'back_body')
  const rightId = isBack ? 'right_sleeve_back' : 'right_sleeve'
  const leftId = isBack ? 'left_sleeve_back' : 'left_sleeve'
  const collarId = isBack ? 'collar_back' : 'collar'
  const right = clothFor(bodyColor, panelColors, rightId)
  const left = clothFor(bodyColor, panelColors, leftId)
  const collar = clothFor(bodyColor, panelColors, collarId)
  const zipper = clothShades(bodyColor)
  const id = `jacket-${viewId}`

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-body-l`} x1="220" y1="150" x2="220" y2="534" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={leftBody.highlight} />
          <stop offset="0.45" stopColor={leftBody.cloth} />
          <stop offset="1" stopColor={leftBody.clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-body-r`} x1="340" y1="150" x2="340" y2="534" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={rightBody.highlight} />
          <stop offset="0.45" stopColor={rightBody.cloth} />
          <stop offset="1" stopColor={rightBody.clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-body-b`} x1="280" y1="150" x2="280" y2="534" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={back.highlight} />
          <stop offset="0.45" stopColor={back.cloth} />
          <stop offset="1" stopColor={back.clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-r`} x1="168" y1="168" x2="52" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={right.cloth} />
          <stop offset="1" stopColor={right.clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-l`} x1="392" y1="168" x2="508" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={left.cloth} />
          <stop offset="1" stopColor={left.clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-collar`} x1="280" y1="118" x2="280" y2="168" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={collar.highlight} />
          <stop offset="1" stopColor={collar.rib} />
        </linearGradient>
        <filter id={`${id}-soft`} x="-8%" y="-4%" width="116%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.22" />
        </filter>
      </defs>

      <g filter={`url(#${id}-soft)`}>
        <g data-garment-part={rightId} data-panel-color={right.cloth}>
          <path d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} />
          <path d="M58 318 L170 296" fill="none" stroke={right.rib} strokeWidth="7" strokeLinecap="round" opacity="0.45" />
        </g>
        <g data-garment-part={leftId} data-panel-color={left.cloth}>
          <path d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} />
          <path d="M390 296 L502 318" fill="none" stroke={left.rib} strokeWidth="7" strokeLinecap="round" opacity="0.45" />
        </g>

        {isBack ? (
          <g data-garment-part="back_body" data-panel-color={back.cloth}>
            <path d={BODY_BACK} fill={`url(#${id}-body-b)`} />
          </g>
        ) : (
          <>
            <g data-garment-part="front_body_left" data-panel-color={leftBody.cloth}>
              <path d={FRONT_LEFT} fill={`url(#${id}-body-l)`} />
            </g>
            <g data-garment-part="front_body_right" data-panel-color={rightBody.cloth}>
              <path d={FRONT_RIGHT} fill={`url(#${id}-body-r)`} />
            </g>
            <Zipper tape={zipper.tape} metal={zipper.metal} />
          </>
        )}

        <g data-garment-part={collarId} data-panel-color={collar.cloth}>
          <path d={isBack ? COLLAR_BACK : COLLAR_FRONT} fill={`url(#${id}-collar)`} />
          <path
            d={isBack ? 'M240 146 H320' : 'M226 148 H334'}
            fill="none"
            stroke={collar.highlight}
            strokeWidth="1.6"
            opacity="0.32"
          />
        </g>
      </g>

      <path d="M170 216 L182 516" fill="none" stroke={(isBack ? back : leftBody).stitch} strokeWidth="1" opacity="0.2" />
      <path d="M390 216 L378 516" fill="none" stroke={(isBack ? back : rightBody).stitch} strokeWidth="1" opacity="0.2" />
      <path d="M210 526 H350" fill="none" stroke={(isBack ? back : leftBody).stitch} strokeWidth="3.5" strokeLinecap="round" opacity="0.4" />
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
