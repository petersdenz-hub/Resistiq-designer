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
          type={material.finish === 'napped' ? 'fractalNoise' : 'turbulence'}
          baseFrequency={
            material.finish === 'napped'
              ? '0.85'
              : material.finish === 'twill'
                ? '0.55 0.12'
                : material.finish === 'dense'
                ? '0.7'
                : material.finish === 'technical'
                  ? '0.35'
                  : material.sheen > 0.14
                    ? '0.22'
                    : '0.5'
          }
          numOctaves={material.finish === 'napped' ? 4 : material.finish === 'dense' ? 3 : 2}
          result="noise"
        />
        <feColorMatrix in="noise" type="saturate" values="0" result="grain" />
        <feComponentTransfer in="grain" result="soft">
          <feFuncA type="linear" slope={Math.min(0.34, material.grain + 0.05)} />
        </feComponentTransfer>
        <feBlend in="SourceGraphic" in2="soft" mode="multiply" />
      </filter>
      <linearGradient id={`${id}-sheen`} x1="160" y1="70" x2="420" y2="540" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" stopOpacity={material.sheen} />
        <stop offset="0.4" stopColor="#fff" stopOpacity={material.sheen * 0.15} />
        <stop offset="1" stopColor="#000" stopOpacity={material.sheen * 0.4} />
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
  const length = quarter ? 148 : 366
  const teethCount = quarter ? 10 : 27
  const coil = finish === 'coil'
  const contrast = finish === 'contrast'
  const tooth = contrast ? '#c9a36a' : coil ? tape : metal
  const tapeFill = contrast ? metal : tape

  const teeth = Array.from({ length: teethCount }, (_, index) => {
    const y = 176 + index * 13
    if (coil) {
      return <circle key={y} cx={index % 2 === 0 ? 276 : 284} cy={y + 3} r="2.1" fill={tooth} />
    }
    return (
      <rect
        key={y}
        x={index % 2 === 0 ? 273 : 281}
        y={y}
        width="6"
        height="7"
        rx="0.8"
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
    >
      <path d={`M280 168 V${168 + length}`} fill="none" stroke={tapeFill} strokeWidth="16" strokeLinecap="round" />
      <path d={`M280 168 V${168 + length}`} fill="none" stroke={tooth} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      {teeth}
      <rect x="269" y="184" width="22" height="24" rx="3" fill={contrast ? '#c9a36a' : metal} />
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

  if (style === 'raw') {
    const ticks = []
    for (let x = left; x <= right; x += 7) {
      ticks.push(
        <path
          key={x}
          d={`M${x} ${y + 1} L${x + 2} ${y + 7}`}
          fill="none"
          stroke={color.stitch}
          strokeWidth="1"
          opacity="0.45"
        />,
      )
    }
    return (
      <g data-garment-part="hem" data-construction-kind="hem" data-construction-style="raw">
        <path
          d={`M${left} ${y} H${right}`}
          fill="none"
          stroke={color.stitch}
          strokeWidth="1.2"
          opacity="0.55"
        />
        {ticks}
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
}: {
  style: string
  kind?: 'hoodie' | 'jacket' | 'bottoms-front' | 'bottoms-back' | 'cargo'
  fill: string
  stitch: string
  highlight: string
}) {
  if (kind === 'hoodie' && style === 'kangaroo') {
    return (
      <g data-garment-part="kangaroo_pocket" data-construction-kind="pocket" data-construction-style="kangaroo">
        <path
          d="M208 352 C208 338 220 328 236 328 L324 328 C340 328 352 338 352 352 L352 428 C348 446 328 456 304 456 L256 456 C232 456 212 446 208 428 Z"
          fill={fill}
          stroke={stitch}
          strokeWidth="1.6"
          opacity="0.82"
        />
        <path d="M220 350 C220 350 220 430 220 430 M340 350 L340 430" fill="none" stroke={stitch} strokeWidth="2" opacity="0.75" />
        <path d="M236 334 H324" fill="none" stroke={highlight} strokeWidth="1.3" opacity="0.35" />
      </g>
    )
  }

  if (kind === 'hoodie' && style === 'patch') {
    return (
      <g data-garment-part="patch_pockets" data-construction-kind="pocket" data-construction-style="patch">
        <path d="M198 358 L254 358 C260 358 264 362 264 368 L264 426 C264 434 256 440 248 440 L204 440 C196 440 190 434 190 426 L190 368 C190 362 194 358 198 358 Z" fill={fill} stroke={stitch} strokeWidth="1.6" opacity="0.85" />
        <path d="M306 358 L362 358 C368 358 372 362 372 368 L372 426 C372 434 364 440 356 440 L312 440 C304 440 298 434 298 426 L298 368 C298 362 302 358 306 358 Z" fill={fill} stroke={stitch} strokeWidth="1.6" opacity="0.85" />
      </g>
    )
  }

  if (kind === 'jacket') {
    if (style === 'patch') {
      return (
        <g data-garment-part="jacket_pockets" data-construction-kind="pocket" data-construction-style="patch">
          <path d="M176 388 L236 388 C242 388 246 392 246 398 L246 456 C246 464 238 470 230 470 L182 470 C174 470 168 464 168 456 L168 398 C168 392 172 388 176 388 Z" fill={fill} stroke={stitch} strokeWidth="1.6" opacity="0.85" />
          <path d="M324 388 L384 388 C390 388 394 392 394 398 L394 456 C394 464 386 470 378 470 L330 470 C322 470 316 464 316 456 L316 398 C316 392 320 388 324 388 Z" fill={fill} stroke={stitch} strokeWidth="1.6" opacity="0.85" />
        </g>
      )
    }
    if (style === 'welt') {
      return (
        <g data-garment-part="jacket_pockets" data-construction-kind="pocket" data-construction-style="welt">
          <path d="M176 404 L248 404 L246 416 L174 416 Z" fill={fill} />
          <path d="M312 404 L384 404 L386 416 L314 416 Z" fill={fill} />
        </g>
      )
    }
    return (
      <g data-garment-part="jacket_pockets" data-construction-kind="pocket" data-construction-style="slash">
        <path d="M178 386 L244 428" fill="none" stroke={stitch} strokeWidth="3.2" strokeLinecap="round" opacity="0.7" />
        <path d="M178 382 L244 424" fill="none" stroke={highlight} strokeWidth="1.1" opacity="0.35" />
        <path d="M382 386 L316 428" fill="none" stroke={stitch} strokeWidth="3.2" strokeLinecap="round" opacity="0.7" />
        <path d="M382 382 L316 424" fill="none" stroke={highlight} strokeWidth="1.1" opacity="0.35" />
      </g>
    )
  }

  if (kind === 'cargo') {
    return (
      <g data-garment-part="cargo_pockets" data-construction-kind="pocket" data-construction-style="cargo" data-construction-slot="cargo">
        <path d="M176 250 L230 250 C236 250 240 254 240 260 L240 330 C240 338 232 344 224 344 L182 344 C174 344 168 338 168 330 L168 260 C168 254 172 250 176 250 Z" fill={fill} stroke={stitch} strokeWidth="1.8" opacity="0.88" />
        <path d="M330 250 L384 250 C390 250 394 254 394 260 L394 330 C394 338 386 344 378 344 L336 344 C328 344 322 338 322 330 L322 260 C322 254 326 250 330 250 Z" fill={fill} stroke={stitch} strokeWidth="1.8" opacity="0.88" />
        <path d="M176 268 H240 M330 268 H394" fill="none" stroke={stitch} strokeWidth="1.6" opacity="0.7" />
      </g>
    )
  }

  if (kind === 'bottoms-back') {
    if (style === 'welt') {
      return (
        <g data-garment-part="back_pockets" data-construction-kind="pocket" data-construction-style="welt" data-construction-slot="back">
          <path d="M206 166 L262 166 L260 178 L204 178 Z" fill={fill} />
          <path d="M298 166 L354 166 L356 178 L300 178 Z" fill={fill} />
        </g>
      )
    }
    if (style === 'slash') {
      return (
        <g data-garment-part="back_pockets" data-construction-kind="pocket" data-construction-style="slash" data-construction-slot="back">
          <path d="M208 154 L252 198" fill="none" stroke={stitch} strokeWidth="2.6" strokeLinecap="round" opacity="0.7" />
          <path d="M352 154 L308 198" fill="none" stroke={stitch} strokeWidth="2.6" strokeLinecap="round" opacity="0.7" />
        </g>
      )
    }
    return (
      <g data-garment-part="back_pockets" data-construction-kind="pocket" data-construction-style="patch" data-construction-slot="back">
        <path d="M204 150 L258 150 C264 150 268 154 268 160 L268 214 C268 222 260 228 252 228 L210 228 C202 228 196 222 196 214 L196 160 C196 154 200 150 204 150 Z" fill="none" stroke={fill} strokeWidth="2.2" opacity="0.7" />
        <path d="M302 150 L356 150 C362 150 366 154 366 160 L366 214 C366 222 358 228 350 228 L308 228 C300 228 294 222 294 214 L294 160 C294 154 298 150 302 150 Z" fill="none" stroke={fill} strokeWidth="2.2" opacity="0.7" />
      </g>
    )
  }

  if (style === 'welt') {
    return (
      <g data-garment-part="front_pockets" data-construction-kind="pocket" data-construction-style="welt" data-construction-slot="front">
        <path d="M204 132 L244 168 L242 178 L200 142 Z" fill={fill} opacity="0.7" />
        <path d="M356 132 L316 168 L318 178 L360 142 Z" fill={fill} opacity="0.7" />
      </g>
    )
  }

  return (
    <g data-garment-part="front_pockets" data-construction-kind="pocket" data-construction-style={style} data-construction-slot="front">
      <path d="M206 124 L244 166 L244 206" fill="none" stroke={stitch} strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
      <path d="M354 124 L316 166 L316 206" fill="none" stroke={stitch} strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
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
