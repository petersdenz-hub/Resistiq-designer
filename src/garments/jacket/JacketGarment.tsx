import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import {
  CuffCap,
  FabricFinish,
  FabricSheen,
  HemBand,
  JacketHood,
  PocketSet,
  ZipperPart,
} from '../render/constructionDraw'
import {
  constructionStyle,
  constructionVariant,
  cuffStyle,
  fabricFilter,
  pocketStyle,
} from '../render/constructionState'
import { ClothGradient, FlatPart, FlatShadow, Fold, PanelBoundary, Seam, Stitch } from '../render/flatStyle'
import {
  BODY_BACK,
  COLLAR_CREW_BACK,
  COLLAR_CREW_FRONT,
  COLLAR_RIB_BACK,
  COLLAR_RIB_FRONT,
  COLLAR_STAND_BACK,
  COLLAR_STAND_FRONT,
  COLLAR_VNECK_BACK,
  COLLAR_VNECK_FRONT,
  FRONT_LEFT,
  FRONT_LEFT_VNECK,
  FRONT_RIGHT,
  FRONT_RIGHT_VNECK,
  LEFT_CUFF,
  LEFT_SLEEVE,
  RIGHT_CUFF,
  RIGHT_SLEEVE,
} from './geometry'

export function JacketGarment({ viewId, bodyColor, panelColors, construction }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const leftBody = clothFor(bodyColor, panelColors, 'front_body_left')
  const rightBody = clothFor(bodyColor, panelColors, 'front_body_right')
  const back = clothFor(bodyColor, panelColors, 'back_body')
  const rightId = isBack ? 'right_sleeve_back' : 'right_sleeve'
  const leftId = isBack ? 'left_sleeve_back' : 'left_sleeve'
  const collarId = isBack ? 'collar_back' : 'collar'
  const right = clothFor(bodyColor, panelColors, rightId)
  const left = clothFor(bodyColor, panelColors, leftId)
  const collar = clothFor(bodyColor, panelColors, collarId)
  const cuffRightId = isBack ? 'cuff_left_back' : 'cuff_right'
  const cuffLeftId = isBack ? 'cuff_right_back' : 'cuff_left'
  const cuffRight = clothFor(bodyColor, panelColors, cuffRightId)
  const cuffLeft = clothFor(bodyColor, panelColors, cuffLeftId)
  const zipper = clothFor(bodyColor, panelColors, 'zipper')
  const pocketLeft = clothFor(bodyColor, panelColors, 'pocket_left')
  const pocketRight = clothFor(bodyColor, panelColors, 'pocket_right')
  const id = `jacket-${viewId}`
  const collarStyle = construction ? constructionStyle(construction, 'collar') : 'stand'
  const zipperStyle = construction ? constructionStyle(construction, 'zipper') : 'center_front'
  const zipperFinish = construction ? constructionVariant(construction, 'zipper', 'metal') : 'metal'
  const hoodStyle = construction ? constructionStyle(construction, 'hood') : null
  const hoodOpening = construction ? constructionVariant(construction, 'hood', 'standard') : 'standard'
  const pocket = construction ? pocketStyle(construction, 'body', 'jacket') : null
  const cuffs = construction ? cuffStyle(construction) : 'hem'
  const hemStyle = construction ? constructionStyle(construction, 'hem') : 'coverstitch'
  const materialId = construction?.materialId
  const collarPath =
    collarStyle === 'crew'
      ? isBack
        ? COLLAR_CREW_BACK
        : COLLAR_CREW_FRONT
      : collarStyle === 'rib'
        ? isBack
          ? COLLAR_RIB_BACK
          : COLLAR_RIB_FRONT
        : collarStyle === 'vneck'
          ? isBack
            ? COLLAR_VNECK_BACK
            : COLLAR_VNECK_FRONT
          : isBack
            ? COLLAR_STAND_BACK
            : COLLAR_STAND_FRONT

  return (
    <g pointerEvents="none">
      <defs>
        <ClothGradient id={`${id}-body-l`} color={leftBody} x1={220} y1={150} x2={220} y2={534} />
        <ClothGradient id={`${id}-body-r`} color={rightBody} x1={340} y1={150} x2={340} y2={534} />
        <ClothGradient id={`${id}-body-b`} color={back} x1={280} y1={150} x2={280} y2={534} />
        <ClothGradient id={`${id}-sleeve-r`} color={right} x1={168} y1={168} x2={52} y2={320} />
        <ClothGradient id={`${id}-sleeve-l`} color={left} x1={392} y1={168} x2={508} y2={320} />
        <ClothGradient id={`${id}-collar`} color={collar} x1={280} y1={118} x2={280} y2={168} />
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template="jacket">
        <g data-garment-part={rightId} data-region-id="right-sleeve" data-panel-color={right.cloth}>
          <FlatPart d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} stroke={right.stitch} />
          {cuffs ? (
            <g data-garment-part={cuffRightId} data-region-id="right-cuff" data-panel-color={cuffRight.cloth}>
              <CuffCap
                d={RIGHT_CUFF}
                style={cuffs}
                color={cuffRight}
                stitchPath="M52 338 H86"
                ribBox={{ x: 42, y: 312, width: 50, height: 52 }}
              />
            </g>
          ) : null}
          <Seam d="M86 248 L156 236" color={right.stitch} width={1} opacity={0.22} />
        </g>
        <g data-garment-part={leftId} data-region-id="left-sleeve" data-panel-color={left.cloth}>
          <FlatPart d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} stroke={left.stitch} />
          {cuffs ? (
            <g data-garment-part={cuffLeftId} data-region-id="left-cuff" data-panel-color={cuffLeft.cloth}>
              <CuffCap
                d={LEFT_CUFF}
                style={cuffs}
                color={cuffLeft}
                stitchPath="M474 338 H508"
                ribBox={{ x: 468, y: 312, width: 50, height: 52 }}
              />
            </g>
          ) : null}
          <Seam d="M474 248 L404 236" color={left.stitch} width={1} opacity={0.22} />
        </g>

        {isBack ? (
          <g data-garment-part="back_body" data-region-id="back" data-panel-color={back.cloth}>
            <FlatPart d={BODY_BACK} fill={`url(#${id}-body-b)`} stroke={back.stitch} />
            <Seam d="M196 176 H364" color={back.stitch} width={1.1} opacity={0.28} />
          </g>
        ) : (
          <>
            <g data-garment-part="front_body_left" data-region-id="front-left" data-panel-color={leftBody.cloth}>
              <FlatPart
                d={collarStyle === 'vneck' ? FRONT_LEFT_VNECK : FRONT_LEFT}
                fill={`url(#${id}-body-l)`}
                stroke={leftBody.stitch}
              />
            </g>
            <g data-garment-part="front_body_right" data-region-id="front-right" data-panel-color={rightBody.cloth}>
              <FlatPart
                d={collarStyle === 'vneck' ? FRONT_RIGHT_VNECK : FRONT_RIGHT}
                fill={`url(#${id}-body-r)`}
                stroke={rightBody.stitch}
              />
            </g>
            <PanelBoundary d="M274 168 V538" color={leftBody.stitch} />
            <PanelBoundary d="M286 168 V538" color={rightBody.stitch} />
            {zipperStyle ? (
              <ZipperPart
                style={zipperStyle}
                finish={zipperFinish}
                tape={zipper.tape}
                metal={zipper.metal}
              />
            ) : null}
            {pocket ? (
              <PocketSet
                style={pocket}
                kind="jacket"
                fill={pocketLeft.detail}
                leftFill={pocketLeft.detail}
                rightFill={pocketRight.detail}
                stitch={pocketLeft.stitch}
                highlight={pocketLeft.highlight}
              />
            ) : null}
          </>
        )}

        {hoodStyle ? (
          <JacketHood
            style={hoodStyle}
            opening={hoodOpening}
            color={collar}
          />
        ) : null}

        {collarStyle ? (
          <g
            data-garment-part={collarId}
            data-region-id="collar"
            data-panel-color={collar.cloth}
            data-construction-kind="collar"
            data-construction-style={collarStyle}
          >
            <FlatPart d={collarPath} fill={`url(#${id}-collar)`} stroke={collar.stitch} />
            <path
              d={
                collarStyle === 'vneck'
                  ? isBack
                    ? 'M240 148 C250 162 310 162 320 148'
                    : 'M230 150 L280 188 L330 150'
                  : isBack
                    ? 'M240 146 H320'
                    : 'M226 148 H334'
              }
              fill="none"
              stroke={collar.highlight}
              strokeWidth={collarStyle === 'rib' ? 2.2 : 1.6}
              strokeLinecap="round"
              opacity="0.32"
            />
          </g>
        ) : null}
      </g>

      <Seam d="M170 214 L182 516" color={(isBack ? back : leftBody).stitch} width={1} opacity={0.24} />
      <Seam d="M390 214 L378 516" color={(isBack ? back : rightBody).stitch} width={1} opacity={0.24} />
      <Stitch d="M176 220 L188 512" color={(isBack ? back : leftBody).stitch} />
      <Stitch d="M384 220 L372 512" color={(isBack ? back : rightBody).stitch} />
      <Seam d={isBack ? 'M196 176 H364' : 'M168 206 H274 M286 206 H392'} color={(isBack ? back : leftBody).stitch} width={1} opacity={0.22} />
      <Fold
        d={isBack ? 'M196 220 C230 214 330 214 364 220' : 'M176 220 C210 214 246 214 268 220'}
        color={(isBack ? back : leftBody).highlight}
      />
      {!isBack ? <Fold d="M292 220 C314 214 350 214 384 220" color={rightBody.highlight} /> : null}
      <Fold d="M62 230 C96 258 132 286 164 300" color={right.highlight} opacity={0.16} />
      <Fold d="M498 230 C464 258 428 286 396 300" color={left.highlight} opacity={0.16} />
      {hemStyle ? (
        <HemBand style={hemStyle} y={528} left={208} right={352} color={isBack ? back : leftBody} />
      ) : null}
      <FabricSheen id={id} materialId={materialId} path={isBack ? BODY_BACK : FRONT_LEFT} />
    </g>
  )
}
