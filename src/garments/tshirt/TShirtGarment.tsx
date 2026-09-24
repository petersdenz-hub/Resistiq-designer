import { shadeHex } from '@/ui/color'
import type { GarmentRenderProps } from '../types'

const BODY =
  'M172 232 L180 532 C180 548 194 558 214 558 L346 558 C366 558 380 548 380 532 L388 232 L402 132 C368 116 324 104 280 104 C236 104 192 116 158 132 L172 232 Z'

const FRONT_NECK =
  'M237 104 C248 156 312 156 323 104 C308 98 252 98 237 104 Z'

const BACK_NECK =
  'M237 104 C246 128 314 128 323 104 C308 98 252 98 237 104 Z'

const RIGHT_SLEEVE =
  'M158 132 L56 176 C42 192 48 224 70 240 L172 232 C166 200 160 160 158 132 Z'

const LEFT_SLEEVE =
  'M402 132 L504 176 C518 192 512 224 490 240 L388 232 C394 200 400 160 402 132 Z'

export function TShirtGarment({ viewId, bodyColor }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const cloth = bodyColor
  const clothDeep = shadeHex(cloth, -0.1)
  const clothDark = shadeHex(cloth, -0.2)
  const stitch = shadeHex(cloth, -0.3)
  const highlight = shadeHex(cloth, 0.14)
  const rib = shadeHex(cloth, -0.08)
  const id = `tshirt-${viewId}`

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-body`} x1="280" y1="100" x2="280" y2="560" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={highlight} />
          <stop offset="0.38" stopColor={cloth} />
          <stop offset="1" stopColor={clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-l`} x1="400" y1="120" x2="500" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cloth} />
          <stop offset="1" stopColor={clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-r`} x1="160" y1="120" x2="60" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cloth} />
          <stop offset="1" stopColor={clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-collar`} x1="280" y1="88" x2="280" y2="164" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={highlight} />
          <stop offset="1" stopColor={rib} />
        </linearGradient>
        <filter id={`${id}-soft`} x="-8%" y="-4%" width="116%" height="110%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.28" />
        </filter>
      </defs>

      <g filter={`url(#${id}-soft)`}>
        <g data-garment-part="right_sleeve">
          <path d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} />
          <path
            d="M74 232 L166 226"
            fill="none"
            stroke={stitch}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>

        <g data-garment-part="left_sleeve">
          <path d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} />
          <path
            d="M394 226 L486 232"
            fill="none"
            stroke={stitch}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>

        <g data-garment-part="front_body" fill={`url(#${id}-body)`} fillRule="evenodd">
          <path d={`${BODY} ${isBack ? BACK_NECK : FRONT_NECK}`} />
        </g>

        <path d="M176 240 L184 536" fill="none" stroke={stitch} strokeWidth="1.1" opacity="0.28" />
        <path d="M384 240 L376 536" fill="none" stroke={stitch} strokeWidth="1.1" opacity="0.28" />
        <path
          d="M214 548 H346"
          fill="none"
          stroke={stitch}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M214 540 H346"
          fill="none"
          stroke={highlight}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.25"
        />

        <g data-garment-part="collar">
          <path
            d={isBack ? BACK_NECK : FRONT_NECK}
            fill="none"
            stroke={`url(#${id}-collar)`}
            strokeWidth="13"
            strokeLinejoin="round"
          />
          <path
            d={isBack ? BACK_NECK : FRONT_NECK}
            fill="none"
            stroke={clothDark}
            strokeWidth="2.2"
            opacity="0.4"
          />
          <path
            d={isBack ? 'M242 112 C254 124 306 124 318 112' : 'M240 118 C254 146 306 146 320 118'}
            fill="none"
            stroke={highlight}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.35"
          />
        </g>
      </g>

      {isBack ? (
        <g data-garment-part="neck-tape">
          <rect x="268" y="132" width="24" height="10" rx="1.5" fill={clothDark} opacity="0.75" />
          <rect x="271" y="134" width="18" height="6" rx="1" fill={rib} opacity="0.9" />
        </g>
      ) : (
        <path
          d="M168 148 C210 136 350 136 392 148"
          fill="none"
          stroke={highlight}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.18"
        />
      )}
    </g>
  )
}
