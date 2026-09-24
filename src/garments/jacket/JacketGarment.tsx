import type { GarmentRenderProps } from '../types'
import { clothShades } from '../render/cloth'

/**
 * Fashion-flat jacket. Front is two body panels plus a zipper.
 * The zipper is garment structure, not an editable design element.
 */

const FRONT_LEFT =
  'M172 206 L184 508 C184 522 196 530 214 530 L276 530 L276 168 L160 168 L172 206 Z'

const FRONT_RIGHT =
  'M388 206 L376 508 C376 522 364 530 346 530 L284 530 L284 168 L400 168 L388 206 Z'

const BODY_BACK =
  'M172 206 L184 508 C184 522 196 530 214 530 L346 530 C364 530 376 522 376 508 L388 206 L400 160 L328 160 C320 180 240 180 232 160 L160 160 L172 206 Z'

const RIGHT_SLEEVE = 'M160 168 L56 188 L78 308 L178 292 L160 168 Z'
const LEFT_SLEEVE = 'M400 168 L504 188 L482 308 L382 292 L400 168 Z'

const COLLAR_FRONT =
  'M214 136 L232 168 L328 168 L346 136 C336 128 224 128 214 136 Z'

const COLLAR_BACK =
  'M222 138 L236 166 L324 166 L338 138 C328 130 232 130 222 138 Z'

export function JacketGarment({ viewId, bodyColor }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const { cloth, clothDeep, clothDark, stitch, highlight, rib, tape, metal } = clothShades(bodyColor)
  const id = `jacket-${viewId}`

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-body`} x1="280" y1="150" x2="280" y2="530" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={highlight} />
          <stop offset="0.45" stopColor={cloth} />
          <stop offset="1" stopColor={clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-r`} x1="168" y1="168" x2="60" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cloth} />
          <stop offset="1" stopColor={clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-l`} x1="392" y1="168" x2="500" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cloth} />
          <stop offset="1" stopColor={clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-collar`} x1="280" y1="128" x2="280" y2="168" gradientUnits="userSpaceOnUse">
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
        </g>
        <g data-garment-part="left_sleeve">
          <path d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} />
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
            d={isBack ? 'M238 148 H322' : 'M228 150 H332'}
            fill="none"
            stroke={highlight}
            strokeWidth="1.4"
            opacity="0.3"
          />
        </g>
      </g>

      <path d="M178 214 L188 512" fill="none" stroke={stitch} strokeWidth="1" opacity="0.2" />
      <path d="M382 214 L372 512" fill="none" stroke={stitch} strokeWidth="1" opacity="0.2" />
      <path
        d="M214 522 H346"
        fill="none"
        stroke={stitch}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
    </g>
  )
}

function Zipper({ tape, metal }: { tape: string; metal: string }) {
  const teeth = Array.from({ length: 26 }, (_, index) => {
    const y = 178 + index * 13
    return (
      <rect
        key={y}
        x={index % 2 === 0 ? 274 : 280}
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
      <rect x="274" y="168" width="12" height="362" rx="2" fill={tape} />
      {teeth}
      <rect x="271" y="186" width="18" height="22" rx="3" fill={metal} />
      <path d="M280 208 L280 226" fill="none" stroke={metal} strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}
