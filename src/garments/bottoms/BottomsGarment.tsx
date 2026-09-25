import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import { BeltLoops, FabricFinish, FabricSheen, HemBand, PocketSet } from '../render/constructionDraw'
import { constructionStyle, fabricFilter, pocketStyle } from '../render/constructionState'
import { ClothGradient, FlatPart, FlatShadow, Fold, Seam, Stitch } from '../render/flatStyle'
import type { BottomsKind } from './definition'
import {
  LEFT_LEG_PANTS,
  LEFT_LEG_SHORTS,
  RIGHT_LEG_PANTS,
  RIGHT_LEG_SHORTS,
  INSEAM_PANTS,
  INSEAM_SHORTS,
  OUTSEAM_PANTS,
  OUTSEAM_SHORTS,
  WAISTBAND,
} from './geometry'

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
  const pocketLeft = clothFor(bodyColor, panelColors, isBack ? 'pocket_left_back' : 'pocket_left')
  const pocketRight = clothFor(bodyColor, panelColors, isBack ? 'pocket_right_back' : 'pocket_right')
  const inseam = clothFor(bodyColor, panelColors, isBack ? 'inseam_back' : 'inseam')
  const outseam = clothFor(bodyColor, panelColors, isBack ? 'outseam_back' : 'outseam')
  const id = `${kind}-${viewId}`
  const waistStyle = construction ? constructionStyle(construction, 'waistband') : 'faced'
  const beltLoops = construction ? constructionStyle(construction, 'beltLoops') : null
  const frontPocket = construction ? pocketStyle(construction, 'front', kind) : 'slash'
  const backPocket = construction ? pocketStyle(construction, 'back', kind) : 'patch'
  const cargoPocket = construction ? pocketStyle(construction, 'cargo', kind) : null
  const hemStyle = construction ? constructionStyle(construction, 'hem') : 'coverstitch'
  const materialId = construction?.materialId
  const hemY = long ? 542 : 306

  const leftLeg = long ? LEFT_LEG_PANTS : LEFT_LEG_SHORTS
  const rightLeg = long ? RIGHT_LEG_PANTS : RIGHT_LEG_SHORTS
  const inseamPaths = long ? INSEAM_PANTS : INSEAM_SHORTS
  const outseamPaths = long ? OUTSEAM_PANTS : OUTSEAM_SHORTS

  return (
    <g pointerEvents="none">
      <defs>
        <ClothGradient id={`${id}-leg-l`} color={left} x1={220} y1={70} x2={220} y2={hem} />
        <ClothGradient id={`${id}-leg-r`} color={right} x1={340} y1={70} x2={340} y2={hem} />
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template={kind}>
        <g data-garment-part={leftId} data-region-id="left-leg" data-panel-color={left.cloth}>
          <FlatPart d={leftLeg} fill={`url(#${id}-leg-l)`} stroke={left.stitch} />
        </g>
        <g data-garment-part={rightId} data-region-id="right-leg" data-panel-color={right.cloth}>
          <FlatPart d={rightLeg} fill={`url(#${id}-leg-r)`} stroke={right.stitch} />
        </g>
        <g data-garment-part={isBack ? 'outseam_back' : 'outseam'} data-region-id="outseam" data-construction-kind="seam" data-construction-style="outseam" data-panel-color={outseam.cloth}>
          {outseamPaths.map((path) => (
            <path key={path} d={path} fill={outseam.clothDeep} opacity="0.18" data-region-shading="true" />
          ))}
        </g>
        <g data-garment-part={isBack ? 'inseam_back' : 'inseam'} data-region-id="inseam" data-construction-kind="seam" data-construction-style="inseam" data-panel-color={inseam.cloth}>
          {inseamPaths.map((path) => (
            <path key={path} d={path} fill={inseam.clothDeep} opacity="0.16" data-region-shading="true" />
          ))}
        </g>
        <Stitch d={long ? 'M206 130 C188 220 186 360 196 520' : 'M206 130 C188 180 190 240 204 292'} color={left.stitch} />
        <Stitch d={long ? 'M354 130 C372 220 374 360 364 520' : 'M354 130 C372 180 370 240 356 292'} color={right.stitch} />
        {long ? (
          <>
            <Seam d="M188 330 L248 330" color={left.stitch} width={1} opacity={0.18} />
            <Seam d="M372 330 L312 330" color={right.stitch} width={1} opacity={0.18} />
            <Fold d="M214 180 C204 260 206 360 216 500" color={left.highlight} opacity={0.14} />
            <Fold d="M346 180 C356 260 354 360 344 500" color={right.highlight} opacity={0.14} />
          </>
        ) : (
          <>
            <Fold d="M214 140 C206 190 210 240 220 286" color={left.highlight} opacity={0.14} />
            <Fold d="M346 140 C354 190 350 240 340 286" color={right.highlight} opacity={0.14} />
          </>
        )}
        {waistStyle ? (
          <g
            data-garment-part={waistId}
            data-region-id="waistband"
            data-panel-color={waist.cloth}
            data-construction-kind="waistband"
            data-construction-style={waistStyle}
          >
            <FlatPart
              d={WAISTBAND}
              fill={waistStyle === 'rib' ? waist.rib : waistStyle === 'elastic' ? waist.clothDeep : waist.rib}
              stroke={waist.stitch}
            />
            <Seam d="M214 80 H346" color={waist.stitch} width={1.5} opacity={0.4} />
            {waistStyle === 'elastic' ? (
              <path
                d="M206 70 Q220 86 234 70 Q248 86 262 70 Q276 86 290 70 Q304 86 318 70 Q332 86 346 70"
                fill="none"
                stroke={waist.highlight}
                strokeWidth="1.3"
                opacity="0.45"
              />
            ) : (
              <Seam d="M218 56 V110 M280 56 V110 M342 56 V110" color={waist.stitch} width={1.3} opacity={0.3} />
            )}
            {beltLoops ? <BeltLoops color={waist} /> : null}
          </g>
        ) : null}
        {!waistStyle && beltLoops ? <BeltLoops color={waist} /> : null}
      </g>

      {isBack ? (
        <>
          <Seam d="M216 128 H344" color={waist.stitch} width={1.5} opacity={0.3} />
          {backPocket ? (
            <PocketSet
              style={backPocket}
              kind="bottoms-back"
              fill={pocketLeft.detail}
              leftFill={pocketLeft.detail}
              rightFill={pocketRight.detail}
              stitch={pocketLeft.stitch}
              highlight={pocketLeft.highlight}
            />
          ) : null}
        </>
      ) : (
        <>
          <Seam d="M280 110 L280 198" color={waist.stitch} width={1.8} opacity={0.45} />
          <Seam d="M268 140 C274 150 274 176 268 190" color={left.highlight} width={1.3} opacity={0.22} />
          {frontPocket ? (
            <PocketSet
              style={frontPocket}
              kind="bottoms-front"
              fill={pocketLeft.detail}
              leftFill={pocketLeft.detail}
              rightFill={pocketRight.detail}
              stitch={pocketLeft.stitch}
              highlight={pocketLeft.highlight}
            />
          ) : null}
          {cargoPocket ? (
            <PocketSet
              style={cargoPocket}
              kind="cargo"
              fill={pocketLeft.detail}
              leftFill={pocketLeft.detail}
              rightFill={pocketRight.detail}
              stitch={pocketLeft.stitch}
              highlight={pocketLeft.highlight}
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
