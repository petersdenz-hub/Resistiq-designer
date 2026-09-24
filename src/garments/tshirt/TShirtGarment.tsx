import { shadeHex } from '@/ui/color'
import type { GarmentRenderProps } from '../types'

/**
 * Fashion-flat T-shirt. Body, sleeves, and collar are separate parts so
 * panels can sit on real garment structure.
 *
 * Coordinates assume viewBox 560×640, center x=280.
 */

const BODY_FRONT =
  'M176 228 L188 486 C188 500 200 508 216 508 L344 508 C360 508 372 500 372 486 L384 228 L398 148 L324 148 C314 184 246 184 236 148 L162 148 L176 228 Z'

const BODY_BACK =
  'M176 228 L188 486 C188 500 200 508 216 508 L344 508 C360 508 372 500 372 486 L384 228 L398 148 L318 148 C310 164 250 164 242 148 L162 148 L176 228 Z'

const RIGHT_SLEEVE =
  'M162 148 L68 172 L86 230 L176 228 L162 148 Z'

const LEFT_SLEEVE =
  'M398 148 L492 172 L474 230 L384 228 L398 148 Z'

const COLLAR_FRONT =
  'M228 146 C240 188 320 188 332 146 L324 148 C314 184 246 184 236 148 Z'

const COLLAR_BACK =
  'M234 146 C244 166 316 166 326 146 L318 148 C310 164 250 164 242 148 Z'

export function TShirtGarment({ viewId, bodyColor }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const cloth = bodyColor
  const clothDeep = shadeHex(cloth, -0.1)
  const clothDark = shadeHex(cloth, -0.18)
  const stitch = shadeHex(cloth, -0.28)
  const highlight = shadeHex(cloth, 0.12)
  const rib = shadeHex(cloth, -0.07)
  const id = `tshirt-${viewId}`

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-body`} x1="280" y1="140" x2="280" y2="510" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={highlight} />
          <stop offset="0.4" stopColor={cloth} />
          <stop offset="1" stopColor={clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-r`} x1="170" y1="148" x2="70" y2="230" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cloth} />
          <stop offset="1" stopColor={clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-l`} x1="390" y1="148" x2="490" y2="230" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cloth} />
          <stop offset="1" stopColor={clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-collar`} x1="280" y1="146" x2="280" y2="188" gradientUnits="userSpaceOnUse">
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
          <path
            d="M72 226 L170 224"
            fill="none"
            stroke={stitch}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>

        <g data-garment-part="left_sleeve">
          <path d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} />
          <path
            d="M390 224 L488 226"
            fill="none"
            stroke={stitch}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>

        <g data-garment-part={isBack ? 'back_body' : 'front_body'}>
          <path d={isBack ? BODY_BACK : BODY_FRONT} fill={`url(#${id}-body)`} />
        </g>

        <path d="M180 236 L190 492" fill="none" stroke={stitch} strokeWidth="1" opacity="0.22" />
        <path d="M380 236 L370 492" fill="none" stroke={stitch} strokeWidth="1" opacity="0.22" />
        <path
          d="M216 500 H344"
          fill="none"
          stroke={stitch}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M216 492 H344"
          fill="none"
          stroke={highlight}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.22"
        />

        <g data-garment-part="collar">
          <path d={isBack ? COLLAR_BACK : COLLAR_FRONT} fill={`url(#${id}-collar)`} />
          <path
            d={
              isBack
                ? 'M244 148 C254 162 306 162 316 148'
                : 'M238 148 C250 180 310 180 322 148'
            }
            fill="none"
            stroke={highlight}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.35"
          />
        </g>
      </g>

      {isBack ? (
        <g data-garment-part="neck-tape">
          <rect x="269" y="158" width="22" height="9" rx="1.2" fill={clothDark} opacity="0.8" />
        </g>
      ) : (
        <path
          d="M168 160 C210 152 350 152 392 160"
          fill="none"
          stroke={highlight}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.16"
        />
      )}
    </g>
  )
}
