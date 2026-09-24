import type { GarmentRenderProps } from '../types'
import { clothShades } from '../render/cloth'

/**
 * Fashion-flat hoodie. Hood, body, sleeves, and cuffs are separate parts.
 * The kangaroo pocket is garment structure, not a design element.
 */

const BODY_FRONT =
  'M170 214 L184 508 C184 524 198 534 216 534 L344 534 C362 534 376 524 376 508 L390 214 L404 178 L332 178 C322 214 238 214 228 178 L156 178 L170 214 Z'

const BODY_BACK =
  'M170 214 L184 508 C184 524 198 534 216 534 L344 534 C362 534 376 524 376 508 L390 214 L404 178 L328 178 C320 200 240 200 232 178 L156 178 L170 214 Z'

const HOOD_SHELL =
  'M176 186 C168 70 392 70 384 186 L356 200 C348 108 212 108 204 200 Z'

const HOOD_LINING =
  'M214 186 C222 112 338 112 346 186 C318 214 242 214 214 186 Z'

const HOOD_BACK =
  'M176 186 C168 70 392 70 384 186 L348 198 C340 112 220 112 212 198 Z'

const RIGHT_SLEEVE = 'M156 178 L44 208 L66 340 L176 314 L156 178 Z'
const LEFT_SLEEVE = 'M404 178 L516 208 L494 340 L384 314 L404 178 Z'

const RIGHT_CUFF = 'M42 332 C38 332 36 338 38 348 L48 376 C52 382 62 382 68 376 L78 348 C80 338 74 332 66 332 Z'
const LEFT_CUFF = 'M518 332 C522 332 524 338 522 348 L512 376 C508 382 498 382 492 376 L482 348 C480 338 486 332 494 332 Z'

const POCKET =
  'M208 352 C208 346 214 342 222 342 L338 342 C346 342 352 346 352 352 L352 428 C352 436 344 442 334 442 L226 442 C216 442 208 436 208 428 Z'

export function HoodieGarment({ viewId, bodyColor }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const { cloth, clothDeep, clothDark, stitch, highlight, rib, tape } = clothShades(bodyColor)
  const id = `hoodie-${viewId}`

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-body`} x1="280" y1="170" x2="280" y2="534" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={highlight} />
          <stop offset="0.42" stopColor={cloth} />
          <stop offset="1" stopColor={clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-hood`} x1="280" y1="70" x2="280" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={highlight} />
          <stop offset="1" stopColor={rib} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-r`} x1="160" y1="178" x2="50" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cloth} />
          <stop offset="1" stopColor={clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-l`} x1="400" y1="178" x2="510" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cloth} />
          <stop offset="1" stopColor={clothDark} />
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

        <g data-garment-part={isBack ? 'hood_back' : 'hood'}>
          <path d={isBack ? HOOD_BACK : HOOD_SHELL} fill={`url(#${id}-hood)`} />
          {isBack ? (
            <path
              d="M280 86 L280 186"
              fill="none"
              stroke={stitch}
              strokeWidth="1.4"
              opacity="0.35"
            />
          ) : (
            <>
              <path d={HOOD_LINING} fill={tape} opacity="0.92" />
              <path
                d="M226 188 C236 168 324 168 334 188"
                fill="none"
                stroke={highlight}
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.28"
              />
              <path d="M248 198 L242 228" fill="none" stroke={stitch} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
              <path d="M312 198 L318 228" fill="none" stroke={stitch} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
            </>
          )}
        </g>

        <g data-garment-part={isBack ? 'back_body' : 'front_body'}>
          <path d={isBack ? BODY_BACK : BODY_FRONT} fill={`url(#${id}-body)`} />
        </g>

        <g data-garment-part={isBack ? 'cuff_left_back' : 'cuff_right'}>
          <path d={RIGHT_CUFF} fill={rib} />
          <path d="M44 352 H72" fill="none" stroke={stitch} strokeWidth="1.4" opacity="0.35" />
        </g>
        <g data-garment-part={isBack ? 'cuff_right_back' : 'cuff_left'}>
          <path d={LEFT_CUFF} fill={rib} />
          <path d="M488 352 H516" fill="none" stroke={stitch} strokeWidth="1.4" opacity="0.35" />
        </g>
      </g>

      <path d="M176 222 L188 508" fill="none" stroke={stitch} strokeWidth="1" opacity="0.2" />
      <path d="M384 222 L372 508" fill="none" stroke={stitch} strokeWidth="1" opacity="0.2" />
      <path
        d="M216 526 H344"
        fill="none"
        stroke={stitch}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.28"
      />
      <path
        d="M216 518 H344"
        fill="none"
        stroke={highlight}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.2"
      />

      {isBack ? (
        <path
          d="M236 198 C248 220 312 220 324 198"
          fill="none"
          stroke={highlight}
          strokeWidth="1.4"
          opacity="0.2"
        />
      ) : (
        <g data-garment-part="kangaroo_pocket">
          <path d={POCKET} fill={clothDark} opacity="0.55" />
          <path
            d="M216 352 L216 430 M344 352 L344 430"
            fill="none"
            stroke={stitch}
            strokeWidth="1.6"
            opacity="0.45"
          />
          <path
            d="M222 348 H338"
            fill="none"
            stroke={highlight}
            strokeWidth="1.2"
            opacity="0.18"
          />
        </g>
      )}
    </g>
  )
}
