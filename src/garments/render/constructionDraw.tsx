import { getCatalogMaterial } from '../materialCatalog'
import { clothShades } from './cloth'

export function FabricFinish({
  id,
  materialId,
}: {
  id: string
  materialId?: string
}) {
  const material = getCatalogMaterial(materialId)
  if (!material) {
    return null
  }

  return (
    <defs>
      <filter id={`${id}-fabric`} x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={material.grain > 0.1 ? '0.9' : '0.55'}
          numOctaves={material.finish === 'napped' ? 3 : 2}
          result="noise"
        />
        <feColorMatrix
          in="noise"
          type="saturate"
          values="0"
          result="grain"
        />
        <feComponentTransfer in="grain" result="soft">
          <feFuncA type="linear" slope={Math.min(0.28, material.grain + 0.04)} />
        </feComponentTransfer>
        <feBlend in="SourceGraphic" in2="soft" mode="multiply" />
      </filter>
      <linearGradient id={`${id}-sheen`} x1="180" y1="80" x2="400" y2="520" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" stopOpacity={material.sheen} />
        <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity={material.sheen * 0.35} />
      </linearGradient>
    </defs>
  )
}

export function FabricSheen({
  id,
  materialId,
  path,
}: {
  id: string
  materialId?: string
  path?: string
}) {
  const material = getCatalogMaterial(materialId)
  if (!material) {
    return null
  }
  return (
    <g data-fabric={material.id} pointerEvents="none">
      {path ? (
        <path d={path} fill={`url(#${id}-sheen)`} />
      ) : (
        <rect x="40" y="40" width="480" height="560" fill={`url(#${id}-sheen)`} />
      )}
    </g>
  )
}

export function ZipperPart({
  style,
  tape,
  metal,
}: {
  style: string
  tape: string
  metal: string
}) {
  const quarter = style === 'quarter'
  const length = quarter ? 148 : 366
  const teethCount = quarter ? 10 : 27

  const teeth = Array.from({ length: teethCount }, (_, index) => {
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
    <g data-garment-part="zipper" data-construction-kind="zipper" data-construction-style={style}>
      <rect x="273" y="168" width="14" height={length} rx="2" fill={tape} />
      {teeth}
      <rect x="269" y="184" width="22" height="24" rx="3" fill={metal} />
      <path d="M280 208 L280 230" fill="none" stroke={metal} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  )
}

export function HemBand({
  style,
  y,
  left,
  right,
  color,
}: {
  style: string
  y: number
  left: number
  right: number
  color: ReturnType<typeof clothShades>
}) {
  if (style === 'rib') {
    return (
      <g data-garment-part="hem" data-construction-kind="hem" data-construction-style="rib">
        <path
          d={`M${left} ${y} H${right}`}
          fill="none"
          stroke={color.rib}
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d={`M${left} ${y - 6} H${right}`}
          fill="none"
          stroke={color.highlight}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.22"
        />
      </g>
    )
  }

  return (
    <g data-garment-part="hem" data-construction-kind="hem" data-construction-style="coverstitch">
      <path
        d={`M${left} ${y} H${right}`}
        fill="none"
        stroke={color.stitch}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d={`M${left} ${y - 8} H${right}`}
        fill="none"
        stroke={color.highlight}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.22"
      />
    </g>
  )
}

export function PocketSet({
  style,
  kind = 'hoodie',
  fill,
  stitch,
  highlight,
}: {
  style: string
  kind?: 'hoodie' | 'jacket' | 'bottoms-front' | 'bottoms-back'
  fill: string
  stitch: string
  highlight: string
}) {
  if (kind === 'hoodie' && style === 'kangaroo') {
    return (
      <g data-garment-part="kangaroo_pocket" data-construction-kind="pocket" data-construction-style="kangaroo">
        <path
          d="M206 348 C206 340 214 334 224 334 L336 334 C346 334 354 340 354 348 L354 430 C354 440 344 448 332 448 L228 448 C216 448 206 440 206 430 Z"
          fill={fill}
          opacity="0.62"
        />
        <path d="M218 348 L218 434 M342 348 L342 434" fill="none" stroke={stitch} strokeWidth="1.8" opacity="0.5" />
        <path d="M224 340 H336" fill="none" stroke={highlight} strokeWidth="1.3" opacity="0.2" />
      </g>
    )
  }

  if (kind === 'hoodie' && style === 'patch') {
    return (
      <g data-garment-part="patch_pockets" data-construction-kind="pocket" data-construction-style="patch">
        <rect x="196" y="360" width="58" height="72" rx="8" fill={fill} opacity="0.7" />
        <rect x="306" y="360" width="58" height="72" rx="8" fill={fill} opacity="0.7" />
        <rect x="196" y="360" width="58" height="72" rx="8" fill="none" stroke={stitch} strokeWidth="1.6" opacity="0.55" />
        <rect x="306" y="360" width="58" height="72" rx="8" fill="none" stroke={stitch} strokeWidth="1.6" opacity="0.55" />
      </g>
    )
  }

  if (kind === 'jacket') {
    if (style === 'patch') {
      return (
        <g data-garment-part="jacket_pockets" data-construction-kind="pocket" data-construction-style="patch">
          <rect x="178" y="390" width="62" height="70" rx="7" fill={fill} opacity="0.55" />
          <rect x="320" y="390" width="62" height="70" rx="7" fill={fill} opacity="0.55" />
        </g>
      )
    }
    if (style === 'welt') {
      return (
        <g data-garment-part="jacket_pockets" data-construction-kind="pocket" data-construction-style="welt">
          <rect x="178" y="408" width="70" height="10" rx="2" fill={fill} />
          <rect x="312" y="408" width="70" height="10" rx="2" fill={fill} />
        </g>
      )
    }
    return (
      <g data-garment-part="jacket_pockets" data-construction-kind="pocket" data-construction-style="slash">
        <path d="M186 392 L246 430" fill="none" stroke={stitch} strokeWidth="2.2" opacity="0.7" />
        <path d="M374 392 L314 430" fill="none" stroke={stitch} strokeWidth="2.2" opacity="0.7" />
      </g>
    )
  }

  if (kind === 'bottoms-back') {
    if (style === 'welt') {
      return (
        <g data-garment-part="back_pockets" data-construction-kind="pocket" data-construction-style="welt">
          <rect x="206" y="168" width="56" height="10" rx="2" fill={fill} />
          <rect x="298" y="168" width="56" height="10" rx="2" fill={fill} />
        </g>
      )
    }
    if (style === 'slash') {
      return (
        <g data-garment-part="back_pockets" data-construction-kind="pocket" data-construction-style="slash">
          <path d="M210 156 L250 196" fill="none" stroke={stitch} strokeWidth="2" opacity="0.7" />
          <path d="M350 156 L310 196" fill="none" stroke={stitch} strokeWidth="2" opacity="0.7" />
        </g>
      )
    }
    return (
      <g data-garment-part="back_pockets" data-construction-kind="pocket" data-construction-style="patch">
        <rect x="206" y="152" width="56" height="64" rx="8" fill="none" stroke={fill} strokeWidth="2.2" opacity="0.65" />
        <rect x="298" y="152" width="56" height="64" rx="8" fill="none" stroke={fill} strokeWidth="2.2" opacity="0.65" />
      </g>
    )
  }

  return (
    <g data-garment-part="front_pockets" data-construction-kind="pocket" data-construction-style={style}>
      <path d="M208 126 L242 162 L242 204" fill="none" stroke={stitch} strokeWidth="1.4" opacity="0.35" />
      <path d="M352 126 L318 162 L318 204" fill="none" stroke={stitch} strokeWidth="1.4" opacity="0.35" />
    </g>
  )
}

