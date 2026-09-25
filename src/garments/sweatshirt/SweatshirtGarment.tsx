import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import { CuffCap, FabricFinish, FabricSheen, HemBand } from '../render/constructionDraw'
import { constructionStyle, cuffStyle, fabricFilter } from '../render/constructionState'
import { ClothGradient, FlatPart, FlatShadow, Fold, Seam, Stitch } from '../render/flatStyle'
import {
  BODY_BACK,
  BODY_FRONT,
  COLLAR_CREW_BACK,
  COLLAR_CREW_FRONT,
  COLLAR_RIB_BACK,
  COLLAR_RIB_FRONT,
  COLLAR_STAND_BACK,
  COLLAR_STAND_FRONT,
  COLLAR_VNECK_FRONT,
  LEFT_CUFF,
  LEFT_SLEEVE,
  RIGHT_CUFF,
  RIGHT_SLEEVE,
} from './geometry'

export function SweatshirtGarment({
  viewId,
  bodyColor,
  panelColors,
  construction,
}: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const bodyId = isBack ? 'back_body' : 'front_body'
  const rightId = isBack ? 'right_sleeve_back' : 'right_sleeve'
  const leftId = isBack ? 'left_sleeve_back' : 'left_sleeve'
  const collarId = isBack ? 'collar_back' : 'collar'
  const cuffRightId = isBack ? 'cuff_left_back' : 'cuff_right'
  const cuffLeftId = isBack ? 'cuff_right_back' : 'cuff_left'
  const body = clothFor(bodyColor, panelColors, bodyId)
  const right = clothFor(bodyColor, panelColors, rightId)
  const left = clothFor(bodyColor, panelColors, leftId)
  const collar = clothFor(bodyColor, panelColors, collarId)
  const cuffRight = clothFor(bodyColor, panelColors, cuffRightId)
  const cuffLeft = clothFor(bodyColor, panelColors, cuffLeftId)
  const waistId = isBack ? 'waistband_back' : 'waistband'
  const waist = clothFor(bodyColor, panelColors, waistId)
  const id = `sweatshirt-${viewId}`
  const collarStyle = construction ? constructionStyle(construction, 'collar') : 'crew'
  const hemStyle = construction ? constructionStyle(construction, 'hem') : 'rib'
  const cuffs = construction ? cuffStyle(construction) : 'rib'
  const materialId = construction?.materialId
  const collarPath =
    collarStyle === 'stand'
      ? isBack
        ? COLLAR_STAND_BACK
        : COLLAR_STAND_FRONT
      : collarStyle === 'rib'
        ? isBack
          ? COLLAR_RIB_BACK
          : COLLAR_RIB_FRONT
        : collarStyle === 'vneck'
          ? isBack
            ? COLLAR_CREW_BACK
            : COLLAR_VNECK_FRONT
          : isBack
            ? COLLAR_CREW_BACK
            : COLLAR_CREW_FRONT

  return (
    <g pointerEvents="none">
      <defs>
        <ClothGradient id={`${id}-body`} color={body} x1={280} y1={170} x2={280} y2={542} />
        <ClothGradient id={`${id}-sleeve-r`} color={right} x1={160} y1={184} x2={40} y2={360} />
        <ClothGradient id={`${id}-sleeve-l`} color={left} x1={400} y1={184} x2={520} y2={360} />
        <ClothGradient id={`${id}-collar`} color={collar} x1={280} y1={158} x2={280} y2={220} />
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template="sweatshirt">
        <g data-garment-part={rightId} data-region-id="right-sleeve" data-panel-color={right.cloth}>
          <FlatPart d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} stroke={right.stitch} />
        </g>
        <g data-garment-part={leftId} data-region-id="left-sleeve" data-panel-color={left.cloth}>
          <FlatPart d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} stroke={left.stitch} />
        </g>
        <g data-garment-part={bodyId} data-region-id={isBack ? 'back-body' : 'front-body'} data-panel-color={body.cloth}>
          <FlatPart d={isBack ? BODY_BACK : BODY_FRONT} fill={`url(#${id}-body)`} stroke={body.stitch} />
        </g>
        {collarStyle && collarStyle !== 'none' ? (
          <g
            data-garment-part={collarId}
            data-region-id="collar"
            data-panel-color={collar.cloth}
            data-construction-kind="collar"
            data-construction-style={collarStyle}
          >
            <FlatPart
              d={collarPath}
              fill={collarStyle === 'rib' ? collar.rib : `url(#${id}-collar)`}
              stroke={collar.stitch}
            />
            <Seam
              d={isBack ? 'M240 184 C250 198 310 198 320 184' : 'M236 186 C248 210 312 210 324 186'}
              color={collar.highlight}
              width={1.5}
              opacity={0.32}
            />
          </g>
        ) : null}
        {cuffs ? (
          <>
            <g data-garment-part={cuffRightId} data-region-id="right-cuff" data-panel-color={cuffRight.cloth}>
              <CuffCap
                d={RIGHT_CUFF}
                style={cuffs}
                color={cuffRight}
                stitchPath="M42 372 H72"
                ribBox={{ x: 34, y: 350, width: 44, height: 54 }}
              />
            </g>
            <g data-garment-part={cuffLeftId} data-region-id="left-cuff" data-panel-color={cuffLeft.cloth}>
              <CuffCap
                d={LEFT_CUFF}
                style={cuffs}
                color={cuffLeft}
                stitchPath="M488 372 H518"
                ribBox={{ x: 482, y: 350, width: 44, height: 54 }}
              />
            </g>
          </>
        ) : null}
      </g>

      <Seam d="M178 230 L186 514" color={body.stitch} width={1} opacity={0.26} />
      <Seam d="M382 230 L374 514" color={body.stitch} width={1} opacity={0.26} />
      <Stitch d="M182 246 L190 506" color={body.stitch} />
      <Stitch d="M378 246 L370 506" color={body.stitch} />
      <Fold d="M196 246 C224 240 336 240 364 246" color={body.highlight} />
      <Fold d="M70 248 C108 280 146 314 168 328" color={right.highlight} opacity={0.16} />
      <Fold d="M490 248 C452 280 414 314 392 328" color={left.highlight} opacity={0.16} />
      {hemStyle ? <HemBand style={hemStyle} y={530} left={218} right={342} color={waist} partId={waistId} /> : null}
      <FabricSheen id={id} materialId={materialId} path={isBack ? BODY_BACK : BODY_FRONT} />
    </g>
  )
}
