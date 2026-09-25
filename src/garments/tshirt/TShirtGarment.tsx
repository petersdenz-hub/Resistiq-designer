import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import { FabricFinish, FabricSheen, HemBand } from '../render/constructionDraw'
import { constructionStyle, cuffStyle, fabricFilter } from '../render/constructionState'
import { ClothGradient, FlatPart, FlatShadow, Fold, Seam, Stitch } from '../render/flatStyle'
import {
  BODY_BACK,
  BODY_FRONT,
  BODY_FRONT_VNECK,
  COLLAR_CREW_BACK,
  COLLAR_CREW_FRONT,
  COLLAR_RIB_BACK,
  COLLAR_RIB_FRONT,
  COLLAR_STAND_BACK,
  COLLAR_STAND_FRONT,
  COLLAR_VNECK_BACK,
  COLLAR_VNECK_FRONT,
  LEFT_SLEEVE,
  RIGHT_SLEEVE,
} from './geometry'

export function TShirtGarment({ viewId, bodyColor, panelColors, construction }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const bodyId = isBack ? 'back_body' : 'front_body'
  const rightId = isBack ? 'right_sleeve_back' : 'right_sleeve'
  const leftId = isBack ? 'left_sleeve_back' : 'left_sleeve'
  const collarId = isBack ? 'collar_back' : 'collar'
  const hemId = isBack ? 'hem_back' : 'hem'
  const body = clothFor(bodyColor, panelColors, bodyId)
  const hem = clothFor(bodyColor, panelColors, hemId)
  const right = clothFor(bodyColor, panelColors, rightId)
  const left = clothFor(bodyColor, panelColors, leftId)
  const collar = clothFor(bodyColor, panelColors, collarId)
  const id = `tshirt-${viewId}`
  const collarStyle = construction
    ? constructionStyle(construction, 'collar')
    : 'crew'
  const hemStyle = construction ? constructionStyle(construction, 'hem') : 'coverstitch'
  const sleeveHem = construction ? cuffStyle(construction) : 'coverstitch'
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
            ? COLLAR_VNECK_BACK
            : COLLAR_VNECK_FRONT
          : isBack
            ? COLLAR_CREW_BACK
            : COLLAR_CREW_FRONT

  return (
    <g pointerEvents="none">
      <defs>
        <ClothGradient id={`${id}-body`} color={body} x1={280} y1={140} x2={280} y2={510} />
        <ClothGradient id={`${id}-sleeve-r`} color={right} x1={170} y1={148} x2={70} y2={230} />
        <ClothGradient id={`${id}-sleeve-l`} color={left} x1={390} y1={148} x2={490} y2={230} />
        <ClothGradient id={`${id}-collar`} color={collar} x1={280} y1={146} x2={280} y2={188} />
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template="tshirt">
        <g data-garment-part={rightId} data-region-id="right-sleeve" data-panel-color={right.cloth}>
          <FlatPart d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} stroke={right.stitch} />
          {sleeveHem ? (
            <path
              d="M72 226 L170 224"
              fill="none"
              stroke={sleeveHem === 'rib' ? right.rib : right.stitch}
              strokeWidth={sleeveHem === 'rib' ? 5 : sleeveHem === 'raw' ? 1.1 : 2}
              strokeLinecap="round"
              opacity="0.5"
              data-construction-kind="cuff"
              data-construction-style={sleeveHem}
            />
          ) : null}
        </g>

        <g data-garment-part={leftId} data-region-id="left-sleeve" data-panel-color={left.cloth}>
          <FlatPart d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} stroke={left.stitch} />
          {sleeveHem ? (
            <path
              d="M390 224 L488 226"
              fill="none"
              stroke={sleeveHem === 'rib' ? left.rib : left.stitch}
              strokeWidth={sleeveHem === 'rib' ? 5 : sleeveHem === 'raw' ? 1.1 : 2}
              strokeLinecap="round"
              opacity="0.5"
              data-construction-kind="cuff"
              data-construction-style={sleeveHem}
            />
          ) : null}
        </g>

        <g data-garment-part={bodyId} data-region-id={isBack ? 'back-body' : 'front-body'} data-panel-color={body.cloth}>
          <FlatPart
            d={isBack ? BODY_BACK : collarStyle === 'vneck' ? BODY_FRONT_VNECK : BODY_FRONT}
            fill={`url(#${id}-body)`}
            stroke={body.stitch}
          />
        </g>

        <Seam d="M180 236 L190 492" color={body.stitch} />
        <Seam d="M380 236 L370 492" color={body.stitch} />
        <Seam d="M176 226 L384 226" color={body.stitch} width={1.1} opacity={0.28} />
        <Stitch d="M184 250 L194 486" color={body.stitch} />
        <Stitch d="M376 250 L366 486" color={body.stitch} />
        <Fold d="M196 250 C220 246 340 246 364 250" color={body.highlight} />
        <Fold d="M80 188 C110 204 148 216 168 220" color={right.highlight} />
        <Fold d="M480 188 C450 204 412 216 392 220" color={left.highlight} />
        {hemStyle ? <HemBand style={hemStyle} y={500} left={216} right={344} color={hem} partId={hemId} /> : null}

        {collarStyle ? (
          <g
            data-garment-part={collarId}
            data-region-id="collar"
            data-panel-color={collar.cloth}
            data-construction-kind="collar"
            data-construction-style={collarStyle}
          >
            <FlatPart
              d={collarPath}
              fill={collarStyle === 'vneck' ? collar.rib : `url(#${id}-collar)`}
              stroke={collar.stitch}
            />
            <path
              d={
                collarStyle === 'stand'
                  ? isBack
                    ? 'M244 146 H316'
                    : 'M230 148 H330'
                  : collarStyle === 'vneck'
                    ? isBack
                      ? 'M244 148 C254 162 306 162 316 148'
                      : 'M238 150 L280 196 L322 150'
                    : isBack
                      ? 'M244 148 C254 162 306 162 316 148'
                      : 'M238 148 C250 180 310 180 322 148'
              }
              fill="none"
              stroke={collar.highlight}
              strokeWidth={collarStyle === 'rib' ? 2.2 : 1.6}
              strokeLinecap="round"
              opacity="0.35"
            />
          </g>
        ) : null}
      </g>

      {isBack ? (
        <g data-garment-part="neck-tape">
          <rect x="269" y="158" width="22" height="9" rx="1.2" fill={body.clothDark} opacity="0.8" />
        </g>
      ) : (
        <path
          d="M168 160 C210 152 350 152 392 160"
          fill="none"
          stroke={body.highlight}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.16"
        />
      )}
      <FabricSheen
        id={id}
        materialId={materialId}
        path={isBack ? BODY_BACK : collarStyle === 'vneck' ? BODY_FRONT_VNECK : BODY_FRONT}
      />
    </g>
  )
}
