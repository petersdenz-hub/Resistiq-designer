import { shadeHex } from '@/ui/color'
import type { GarmentRenderProps } from './types'

const BODY_PATH =
  'M168 78 C176 56 188 46 200 46 C212 46 224 56 232 78 L274 90 L352 132 L328 186 L278 160 L278 452 C278 462 270 470 258 470 L142 470 C130 470 122 462 122 452 L122 160 L72 186 L48 132 L126 90 Z'

const FRONT_NECK =
  'M168 78 C176 104 188 122 200 122 C212 122 224 104 232 78 C224 72 212 68 200 68 C188 68 176 72 168 78 Z'

const BACK_NECK =
  'M168 78 C176 92 188 98 200 98 C212 98 224 92 232 78 C224 72 212 68 200 68 C188 68 176 72 168 78 Z'

export function TShirtArtwork({ viewId, bodyColor }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const clothDeep = shadeHex(bodyColor, -0.1)
  const clothDark = shadeHex(bodyColor, -0.18)
  const stitch = shadeHex(bodyColor, -0.28)
  const highlight = shadeHex(bodyColor, 0.12)

  return (
    <g>
      <defs>
        <linearGradient id="tshirt-body" x1="200" y1="46" x2="200" y2="470" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={highlight} />
          <stop offset="0.45" stopColor={bodyColor} />
          <stop offset="1" stopColor={clothDeep} />
        </linearGradient>
      </defs>

      <g fill="url(#tshirt-body)" fillRule="evenodd">
        <path d={`${BODY_PATH} ${isBack ? BACK_NECK : FRONT_NECK}`} />
      </g>

      <path d="M126 90 L72 186 L122 160" fill={clothDark} opacity="0.28" />
      <path d="M274 90 L328 186 L278 160" fill={clothDark} opacity="0.28" />

      <path
        d={isBack ? BACK_NECK : FRONT_NECK}
        fill={clothDeep}
        stroke={stitch}
        strokeWidth="1.2"
      />

      <path
        d="M142 454 H258"
        fill="none"
        stroke={stitch}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M70 172 L118 154"
        fill="none"
        stroke={stitch}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M330 172 L282 154"
        fill="none"
        stroke={stitch}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />

      {isBack ? (
        <rect x="194" y="104" width="12" height="7" rx="1" fill={clothDark} opacity="0.7" />
      ) : (
        <path
          d="M186 86 C192 96 208 96 214 86"
          fill="none"
          stroke={highlight}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />
      )}
    </g>
  )
}
