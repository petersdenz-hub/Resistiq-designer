import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import { BeltLoops, FabricFinish, FabricSheen, HemBand, PocketSet } from '../render/constructionDraw'
import { constructionStyle, fabricFilter, pocketStyle } from '../render/constructionState'
import { FlatPart, FlatShadow, seam } from '../render/flatStyle'
import type { BottomsKind } from './definition'

/**
 * Shared fashion-flat for pants and shorts. Length is the only visual
 * difference. Back pockets and the fly are garment structure.
 */

export function BottomsGarment({
  viewId,
  bodyColor,
  panelColors,
  construction,
  kind,
}: GarmentRenderProps & { kind: BottomsKind }) {
  const isBack = viewId === 'back'
  const long = kind === 'pants'
  const hem = long ? 560 : 322
  const leftId = isBack ? 'left_leg_back' : 'left_leg'
  const rightId = isBack ? 'right_leg_back' : 'right_leg'
  const waistId = isBack ? 'waistband_back' : 'waistband'
  const left = clothFor(bodyColor, panelColors, leftId)
  const right = clothFor(bodyColor, panelColors, rightId)
  const waist = clothFor(bodyColor, panelColors, waistId)
  const id = `${kind}-${viewId}`
  const waistStyle = construction ? constructionStyle(construction, 'waistband') : 'faced'
  const beltLoops = construction ? constructionStyle(construction, 'beltLoops') : null
  const frontPocket = construction ? pocketStyle(construction, 'front', kind) : 'slash'
  const backPocket = construction ? pocketStyle(construction, 'back', kind) : 'patch'
  const cargoPocket = construction ? pocketStyle(construction, 'cargo', kind) : null
  const hemStyle = construction ? constructionStyle(construction, 'hem') : 'coverstitch'
  const materialId = construction?.materialId
  const hemY = long ? 542 : 306

  const leftLeg = long
    ? 'M200 110 C176 168 166 250 170 360 L176 524 C178 548 204 556 228 546 L254 546 L266 268 C272 186 276 136 280 110 Z'
    : 'M200 110 C176 148 168 196 176 248 L184 298 C188 316 214 322 236 310 L258 302 L270 198 C274 150 276 124 280 110 Z'

  const rightLeg = long
    ? 'M360 110 C384 168 394 250 390 360 L384 524 C382 548 356 556 332 546 L306 546 L294 268 C288 186 284 136 280 110 Z'
    : 'M360 110 C384 148 392 196 384 248 L376 298 C372 316 346 322 324 310 L302 302 L290 198 C286 150 284 124 280 110 Z'

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-leg-l`} x1="220" y1="70" x2="220" y2={hem} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={left.highlight} />
          <stop offset="0.35" stopColor={left.cloth} />
          <stop offset="1" stopColor={left.clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-leg-r`} x1="340" y1="70" x2="340" y2={hem} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={right.highlight} />
          <stop offset="0.35" stopColor={right.cloth} />
          <stop offset="1" stopColor={right.clothDeep} />
        </linearGradient>
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template={kind}>
        <g data-garment-part={leftId} data-panel-color={left.cloth}>
          <FlatPart d={leftLeg} fill={`url(#${id}-leg-l)`} stroke={left.stitch} />
        </g>
        <g data-garment-part={rightId} data-panel-color={right.cloth}>
          <FlatPart d={rightLeg} fill={`url(#${id}-leg-r)`} stroke={right.stitch} />
        </g>
        {long ? (
          <>
            {seam('M188 330 L248 330', left.stitch, 1, 0.16)}
            {seam('M372 330 L312 330', right.stitch, 1, 0.16)}
          </>
        ) : null}
        {waistStyle ? (
          <g
            data-garment-part={waistId}
            data-panel-color={waist.cloth}
            data-construction-kind="waistband"
            data-construction-style={waistStyle}
          >
            <FlatPart
              d="M196 66 C196 58 208 54 222 54 L338 54 C352 54 364 58 364 66 L364 110 L196 110 Z"
              fill={waistStyle === 'rib' ? waist.rib : waistStyle === 'elastic' ? waist.clothDeep : waist.rib}
              stroke={waist.stitch}
            />
            {seam('M214 80 H346', waist.stitch, 1.5, 0.4)}
            {waistStyle === 'elastic' ? (
              <path
                d="M206 70 Q220 86 234 70 Q248 86 262 70 Q276 86 290 70 Q304 86 318 70 Q332 86 346 70"
                fill="none"
                stroke={waist.highlight}
                strokeWidth="1.3"
                opacity="0.45"
              />
            ) : (
              seam('M218 56 V110 M280 56 V110 M342 56 V110', waist.stitch, 1.3, 0.3)
            )}
            {beltLoops ? <BeltLoops color={waist} /> : null}
          </g>
        ) : null}
        {!waistStyle && beltLoops ? <BeltLoops color={waist} /> : null}
      </g>

      {isBack ? (
        <>
          {seam('M216 128 H344', waist.stitch, 1.5, 0.3)}
          {backPocket ? (
            <PocketSet
              style={backPocket}
              kind="bottoms-back"
              fill={left.detail}
              stitch={left.stitch}
              highlight={left.highlight}
            />
          ) : null}
        </>
      ) : (
        <>
          {seam('M280 110 L280 198', waist.stitch, 1.8, 0.45)}
          {seam('M268 140 C274 150 274 176 268 190', left.highlight, 1.3, 0.22)}
          {frontPocket ? (
            <PocketSet
              style={frontPocket}
              kind="bottoms-front"
              fill={left.detail}
              stitch={left.stitch}
              highlight={left.highlight}
            />
          ) : null}
          {cargoPocket ? (
            <PocketSet
              style={cargoPocket}
              kind="cargo"
              fill={left.detail}
              stitch={left.stitch}
              highlight={left.highlight}
            />
          ) : null}
        </>
      )}

      {hemStyle ? (
        <>
          <HemBand style={hemStyle} y={hemY} left={204} right={248} color={left} />
          <HemBand style={hemStyle} y={hemY} left={312} right={356} color={right} />
        </>
      ) : null}
      <FabricSheen id={id} materialId={materialId} path={leftLeg} />
    </g>
  )
}
