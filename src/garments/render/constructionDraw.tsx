import { getCatalogMaterial } from '../materialCatalog'
import type { ClothShades } from './cloth'
import { clothShades } from './cloth'
import { FlatPart, RibMarks, Seam, Stitch } from './flatStyle'

function fabricFrequency(material: NonNullable<ReturnType<typeof getCatalogMaterial>>): string {
  if (material.finish === 'napped') {
    return '0.72'
  }
  if (material.finish === 'twill') {
    return '0.48 0.1'
  }
  if (material.finish === 'technical') {
    return '0.28'
  }
  if (material.finish === 'smooth') {
    return '0.18'
  }
  if (material.sheen > 0.2) {
    return '0.16'
  }
  return '0.42'
}

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
          type={material.finish === 'napped' || material.finish === 'matte' ? 'fractalNoise' : 'turbulence'}
          baseFrequency={fabricFrequency(material)}
          numOctaves={material.finish === 'napped' ? 4 : material.finish === 'twill' ? 3 : 2}
          result="noise"
        />
        <feColorMatrix in="noise" type="saturate" values="0" result="grain" />
        <feComponentTransfer in="grain" result="soft">
          <feFuncA
            type="linear"
            slope={
              material.finish === 'napped'
                ? 0.22
                : material.finish === 'twill'
                  ? 0.2
                  : material.finish === 'technical'
                    ? 0.16
                    : Math.min(0.28, material.grain + 0.04)
            }
          />
        </feComponentTransfer>
        <feBlend
          in="SourceGraphic"
          in2="soft"
          mode={material.finish === 'sheen' || material.finish === 'smooth' ? 'overlay' : 'multiply'}
        />
      </filter>
      <linearGradient id={`${id}-sheen`} x1="160" y1="70" x2="420" y2="540" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" stopOpacity={material.sheen} />
        <stop offset="0.45" stopColor="#fff" stopOpacity={material.sheen * 0.12} />
        <stop offset="1" stopColor="#000" stopOpacity={material.sheen * 0.36} />
      </linearGradient>
      {material.finish === 'twill' ? (
        <pattern id={`${id}-twill`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
          <path d="M0 0 H8" fill="none" stroke="#000" strokeWidth="0.6" opacity="0.12" />
        </pattern>
      ) : null}
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
    <g data-fabric={material.id} data-material-finish={material.finish} pointerEvents="none">
      {path ? (
        <path d={path} fill={`url(#${id}-sheen)`} />
      ) : (
        <rect x="40" y="40" width="480" height="560" fill={`url(#${id}-sheen)`} />
      )}
      {material.finish === 'twill' && path ? (
        <path d={path} fill={`url(#${id}-twill)`} data-material-twill="true" />
      ) : null}
    </g>
  )
}

export function ZipperPart({
  style,
  finish = 'metal',
  tape,
  metal,
}: {
  style: string
  finish?: string
  tape: string
  metal: string
}) {
  const quarter = style === 'quarter'
  const length = quarter ? 148 : 368
  const teethCount = quarter ? 11 : 28
  const coil = finish === 'coil'
  const contrast = finish === 'contrast'
  const tooth = contrast ? '#c9a36a' : coil ? tape : metal
  const tapeFill = contrast ? metal : tape

  const teeth = Array.from({ length: teethCount }, (_, index) => {
    const y = 172 + index * 12.6
    if (coil) {
      return <circle key={y} cx={index % 2 === 0 ? 277 : 283} cy={y + 3} r="1.7" fill={tooth} />
    }
    return (
      <rect
        key={y}
        x={index % 2 === 0 ? 274.5 : 280.5}
        y={y}
        width="5"
        height="6"
        rx="0.6"
        fill={tooth}
      />
    )
  })

  return (
    <g
      data-garment-part="zipper"
      data-construction-kind="zipper"
      data-construction-style={style}
      data-construction-variant={finish}
      data-flat-zipper="true"
      data-region-id="zipper"
    >
      <path d={`M280 166 V${166 + length}`} fill="none" stroke={tapeFill} strokeWidth="12" strokeLinecap="round" />
      <path d={`M280 166 V${166 + length}`} fill="none" stroke={tooth} strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      {teeth}
      <rect x="271" y="176" width="18" height="20" rx="2.4" fill={contrast ? '#c9a36a' : metal} />
      <path d="M280 196 L280 214" fill="none" stroke={metal} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  )
}

export function HemBand({
  style,
  y,
  left,
  right,
  color,
  height = 16,
  partId = 'hem',
}: {
  style: string
  y: number
  left: number
  right: number
  color: ReturnType<typeof clothShades>
  height?: number
  partId?: string
}) {
  if (style === 'rib') {
    return (
      <g data-garment-part={partId} data-region-id={partId.includes('waist') ? 'waistband' : 'hem'} data-construction-kind="hem" data-construction-style="rib" data-rib="true" data-panel-color={color.cloth}>
        <path
          d={`M${left} ${y - height} H${right} V${y} H${left} Z`}
          fill={color.rib}
          stroke={color.stitch}
          strokeWidth="1"
          opacity="0.92"
        />
        <RibMarks x={left} y={y - height} width={right - left} height={height} color={color.stitch} />
        <Stitch d={`M${left + 4} ${y - 3} H${right - 4}`} color={color.highlight} />
      </g>
    )
  }

  if (style === 'raw') {
    const ticks = []
    for (let x = left; x <= right; x += 7) {
      ticks.push(
        <path
          key={x}
          d={`M${x} ${y + 1} L${x + 2} ${y + 6}`}
          fill="none"
          stroke={color.stitch}
          strokeWidth="1"
          opacity="0.4"
        />,
      )
    }
    return (
      <g data-garment-part={partId} data-region-id={partId.includes('waist') ? 'waistband' : 'hem'} data-construction-kind="hem" data-construction-style="raw" data-panel-color={color.cloth}>
        <path d={`M${left} ${y} H${right}`} fill="none" stroke={color.stitch} strokeWidth="1.15" opacity="0.55" />
        {ticks}
      </g>
    )
  }

  return (
    <g data-garment-part={partId} data-region-id={partId.includes('waist') ? 'waistband' : 'hem'} data-construction-kind="hem" data-construction-style="coverstitch" data-panel-color={color.cloth}>
      <path
        d={`M${left} ${y} H${right}`}
        fill="none"
        stroke={color.stitch}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.48"
      />
      <Stitch d={`M${left} ${y - 7} H${right}`} color={color.highlight} opacity={0.3} />
    </g>
  )
}

export function CuffCap({
  d,
  style,
  color,
  stitchPath,
  ribBox,
}: {
  d: string
  style: string
  color: ClothShades
  stitchPath?: string
  ribBox?: { x: number; y: number; width: number; height: number }
}) {
  const rib = style === 'rib'
  return (
    <g data-construction-kind="cuff" data-construction-style={style} data-rib={rib ? 'true' : 'false'} data-flat-cuff="true">
      <FlatPart d={d} fill={rib ? color.rib : color.clothDeep} stroke={color.stitch} />
      {rib && ribBox ? (
        <RibMarks x={ribBox.x} y={ribBox.y} width={ribBox.width} height={ribBox.height} color={color.stitch} step={4} />
      ) : null}
      {stitchPath ? <Stitch d={stitchPath} color={color.stitch} /> : null}
    </g>
  )
}

export function BeltLoops({
  color,
}: {
  color: ReturnType<typeof clothShades>
}) {
  const xs = [214, 248, 280, 312, 346]
  return (
    <g data-garment-part="belt_loops" data-construction-kind="belt_loop" data-construction-style="loops">
      {xs.map((x) => (
        <rect
          key={x}
          x={x - 3}
          y="62"
          width="6"
          height="42"
          rx="1.2"
          fill={color.tape}
          stroke={color.stitch}
          strokeWidth="0.8"
          opacity="0.85"
        />
      ))}
    </g>
  )
}

export function PocketSet({
  style,
  kind = 'hoodie',
  fill,
  stitch,
  highlight,
  leftFill,
  rightFill,
}: {
  style: string
  kind?: 'hoodie' | 'jacket' | 'bottoms-front' | 'bottoms-back' | 'cargo'
  fill: string
  stitch: string
  highlight: string
  leftFill?: string
  rightFill?: string
}) {
  const left = leftFill ?? fill
  const right = rightFill ?? fill
  if (kind === 'hoodie' && style === 'kangaroo') {
    return (
      <g data-garment-part="pocket" data-region-id="kangaroo-pocket" data-construction-kind="pocket" data-construction-style="kangaroo" data-flat-pocket="true" data-panel-color={fill}>
        <path
          d="M214 348 C214 336 224 328 238 328 L322 328 C336 328 346 336 346 348 L346 430 C342 446 324 454 304 454 L256 454 C236 454 218 446 214 430 Z"
          fill={left}
          stroke={stitch}
          strokeWidth="1.45"
          opacity="0.55"
        />
        <Stitch d="M226 350 V428 M334 350 V428" color={stitch} />
        <Seam d="M238 334 H322" color={highlight} width={1.1} opacity={0.28} />
      </g>
    )
  }

  if (kind === 'hoodie' && style === 'patch') {
    return (
      <g data-garment-part="patch_pockets" data-construction-kind="pocket" data-construction-style="patch" data-flat-pocket="true">
        <path d="M200 360 L252 360 C258 360 262 364 262 370 L262 424 C262 432 254 438 246 438 L206 438 C198 438 192 432 192 424 L192 370 C192 364 196 360 200 360 Z" fill={left} stroke={stitch} strokeWidth="1.4" opacity="0.7" />
        <path d="M308 360 L360 360 C366 360 370 364 370 370 L370 424 C370 432 362 438 354 438 L314 438 C306 438 300 432 300 424 L300 370 C300 364 304 360 308 360 Z" fill={right} stroke={stitch} strokeWidth="1.4" opacity="0.7" />
      </g>
    )
  }

  if (kind === 'jacket') {
    if (style === 'patch') {
      return (
        <g data-garment-part="jacket_pockets" data-region-id="left-pocket" data-construction-kind="pocket" data-construction-style="patch" data-flat-pocket="true">
          <path d="M178 392 L234 392 C240 392 244 396 244 402 L244 458 C244 466 236 472 228 472 L184 472 C176 472 170 466 170 458 L170 402 C170 396 174 392 178 392 Z" fill={left} stroke={stitch} strokeWidth="1.4" opacity="0.72" />
          <path d="M326 392 L382 392 C388 392 392 396 392 402 L392 458 C392 466 384 472 376 472 L332 472 C324 472 318 466 318 458 L318 402 C318 396 322 392 326 392 Z" fill={right} stroke={stitch} strokeWidth="1.4" opacity="0.72" />
        </g>
      )
    }
    if (style === 'welt') {
      return (
        <g data-garment-part="jacket_pockets" data-construction-kind="pocket" data-construction-style="welt" data-flat-pocket="true">
          <path d="M178 406 L246 406 L244 418 L176 418 Z" fill={left} stroke={stitch} strokeWidth="0.8" />
          <path d="M314 406 L382 406 L384 418 L316 418 Z" fill={right} stroke={stitch} strokeWidth="0.8" />
        </g>
      )
    }
    return (
      <g data-garment-part="jacket_pockets" data-construction-kind="pocket" data-construction-style="slash" data-flat-pocket="true">
        <path d="M180 388 L244 428" fill="none" stroke={stitch} strokeWidth="3" strokeLinecap="round" opacity="0.62" />
        <path d="M180 385 L244 425" fill="none" stroke={highlight} strokeWidth="1" opacity="0.32" />
        <path d="M380 388 L316 428" fill="none" stroke={stitch} strokeWidth="3" strokeLinecap="round" opacity="0.62" />
        <path d="M380 385 L316 425" fill="none" stroke={highlight} strokeWidth="1" opacity="0.32" />
      </g>
    )
  }

  if (kind === 'cargo') {
    return (
      <g data-garment-part="cargo_pockets" data-construction-kind="pocket" data-construction-style="cargo" data-construction-slot="cargo" data-flat-pocket="true">
        <path d="M178 252 L228 252 C234 252 238 256 238 262 L238 328 C238 336 230 342 222 342 L184 342 C176 342 170 336 170 328 L170 262 C170 256 174 252 178 252 Z" fill={left} stroke={stitch} strokeWidth="1.6" opacity="0.78" />
        <path d="M332 252 L382 252 C388 252 392 256 392 262 L392 328 C392 336 384 342 376 342 L338 342 C330 342 324 336 324 328 L324 262 C324 256 328 252 332 252 Z" fill={right} stroke={stitch} strokeWidth="1.6" opacity="0.78" />
        <Stitch d="M178 268 H238 M332 268 H392" color={stitch} />
      </g>
    )
  }

  if (kind === 'bottoms-back') {
    if (style === 'welt') {
      return (
        <g data-garment-part="back_pockets" data-construction-kind="pocket" data-construction-style="welt" data-construction-slot="back" data-flat-pocket="true">
          <path d="M206 166 L262 166 L260 178 L204 178 Z" fill={left} />
          <path d="M298 166 L354 166 L356 178 L300 178 Z" fill={right} />
        </g>
      )
    }
    if (style === 'slash') {
      return (
        <g data-garment-part="back_pockets" data-construction-kind="pocket" data-construction-style="slash" data-construction-slot="back" data-flat-pocket="true">
          <path d="M208 154 L252 198" fill="none" stroke={stitch} strokeWidth="2.4" strokeLinecap="round" opacity="0.65" />
          <path d="M352 154 L308 198" fill="none" stroke={stitch} strokeWidth="2.4" strokeLinecap="round" opacity="0.65" />
        </g>
      )
    }
    return (
      <g data-garment-part="back_pockets" data-construction-kind="pocket" data-construction-style="patch" data-construction-slot="back" data-flat-pocket="true">
        <path d="M204 150 L258 150 C264 150 268 154 268 160 L268 214 C268 222 260 228 252 228 L210 228 C202 228 196 222 196 214 L196 160 C196 154 200 150 204 150 Z" fill="none" stroke={fill} strokeWidth="2" opacity="0.7" />
        <path d="M302 150 L356 150 C362 150 366 154 366 160 L366 214 C366 222 358 228 350 228 L308 228 C300 228 294 222 294 214 L294 160 C294 154 298 150 302 150 Z" fill="none" stroke={fill} strokeWidth="2" opacity="0.7" />
      </g>
    )
  }

  if (style === 'welt') {
    return (
        <g data-garment-part="front_pockets" data-region-id="left-pocket" data-construction-kind="pocket" data-construction-style="welt" data-construction-slot="front" data-flat-pocket="true">
          <path d="M204 132 L244 168 L242 178 L200 142 Z" fill={left} opacity="0.7" />
          <path d="M356 132 L316 168 L318 178 L360 142 Z" fill={right} opacity="0.7" />
      </g>
    )
  }

  return (
    <g data-garment-part="front_pockets" data-region-id="left-pocket" data-construction-kind="pocket" data-construction-style={style} data-construction-slot="front" data-flat-pocket="true">
      <path d="M206 124 L244 166 L244 206" fill="none" stroke={stitch} strokeWidth="2.1" strokeLinecap="round" opacity="0.48" />
      <path d="M354 124 L316 166 L316 206" fill="none" stroke={stitch} strokeWidth="2.1" strokeLinecap="round" opacity="0.48" />
    </g>
  )
}

export function JacketHood({
  style,
  opening = 'standard',
  drawstring,
  color,
}: {
  style: string
  opening?: string
  drawstring?: boolean
  color: ReturnType<typeof clothShades>
}) {
  const width = opening === 'tight' ? 18 : opening === 'wide' ? -16 : 0
  return (
    <g data-garment-part="hood" data-construction-kind="hood" data-construction-style={style} data-construction-variant={opening}>
      <path
        d={`M${168 + width} 168 C${156 + width} 72 ${404 - width} 72 ${392 - width} 168 L${340 - width} 176 C${332 - width} 108 ${228 + width} 108 ${220 + width} 176 Z`}
        fill={color.rib}
        stroke={color.stitch}
        strokeWidth="1.1"
      />
      {style === 'zip' ? (
        <rect x="276" y="168" width="8" height="40" rx="1.5" fill={color.tape} />
      ) : null}
      {drawstring ? (
        <>
          <path d={`M${238 + width} 176 L${226 + width} 214`} fill="none" stroke={color.stitch} strokeWidth="2" />
          <path d={`M${322 - width} 176 L${334 - width} 214`} fill="none" stroke={color.stitch} strokeWidth="2" />
        </>
      ) : null}
    </g>
  )
}
