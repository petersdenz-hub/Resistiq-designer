import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import { FabricFinish, FabricSheen } from '../render/constructionDraw'
import { constructionStyle, fabricFilter, visibleParts } from '../render/constructionState'
import { ClothWash, FlatPart, FlatShadow, Fold, RibMarks, Seam, Stitch } from '../render/flatStyle'
import {
  BACK_PANEL,
  BAND,
  BAND_BACK,
  BAND_STITCH,
  BRIM,
  BRIM_EDGE,
  BRIM_LIP,
  BRIM_SEAM,
  BRIM_STITCH_INNER,
  BRIM_STITCH_MID,
  BRIM_STITCH_OUTER,
  CLOSURE,
  CLOSURE_STRAP,
  CLOSURE_STITCH,
  CROWN,
  CROWN_BACK,
  CROWN_CENTER_SEAM,
  CROWN_FRONT_SEAM_LEFT,
  CROWN_FRONT_SEAM_RIGHT,
  CROWN_TOP_SEAM,
  EYELET_LEFT,
  EYELET_RIGHT,
  FRONT_PANEL,
  LEFT_SIDE,
  LEFT_SIDE_BACK,
  RIGHT_SIDE,
  RIGHT_SIDE_BACK,
} from './geometry'

function Eyelet({
  cx,
  cy,
  r,
  fill,
  stroke,
}: {
  cx: number
  cy: number
  r: number
  fill: string
  stroke: string
}) {
  return (
    <g data-construction-detail="eyelet">
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx} cy={cy} r={r - 1.2} fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
    </g>
  )
}

export function CapGarment({ viewId, bodyColor, panelColors, construction }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const crownId = isBack ? 'crown_back' : 'crown'
  const rightId = isBack ? 'right_side_back' : 'right_side'
  const leftId = isBack ? 'left_side_back' : 'left_side'
  const bandId = isBack ? 'band_back' : 'band'
  const faceId = isBack ? 'back_panel' : 'front_panel'
  const faceRegion = isBack ? 'back-panel' : 'front-panel'
  const crown = clothFor(bodyColor, panelColors, crownId)
  const face = clothFor(bodyColor, panelColors, faceId)
  const right = clothFor(bodyColor, panelColors, rightId)
  const left = clothFor(bodyColor, panelColors, leftId)
  const brim = clothFor(bodyColor, panelColors, 'brim')
  const band = clothFor(bodyColor, panelColors, bandId)
  const closure = clothFor(bodyColor, panelColors, 'closure')
  const id = `cap-${viewId}`
  const brimFinish = construction ? constructionStyle(construction, 'hem') : 'coverstitch'
  const bandStyle = construction ? constructionStyle(construction, 'waistband') : 'faced'
  const closureStyle = construction ? (visibleParts(construction.buttons)[0]?.style ?? null) : 'snap'
  const materialId = construction?.materialId
  const facePath = isBack ? BACK_PANEL : FRONT_PANEL
  const crownPath = isBack ? CROWN_BACK : CROWN
  const rightPath = isBack ? RIGHT_SIDE_BACK : RIGHT_SIDE
  const leftPath = isBack ? LEFT_SIDE_BACK : LEFT_SIDE
  const bandPath = isBack ? BAND_BACK : BAND

  return (
    <g pointerEvents="none">
      <defs>
        <ClothWash id={`${id}-crown`} color={crown} x1={280} y1={198} x2={280} y2={248} />
        <ClothWash id={`${id}-face`} color={face} x1={280} y1={210} x2={280} y2={372} />
        <ClothWash id={`${id}-right`} color={right} x1={220} y1={210} x2={148} y2={372} />
        <ClothWash id={`${id}-left`} color={left} x1={340} y1={210} x2={412} y2={372} />
        <ClothWash id={`${id}-brim`} color={brim} x1={280} y1={368} x2={280} y2={484} />
        <ClothWash id={`${id}-band`} color={band} x1={280} y1={364} x2={280} y2={402} />
        <ClothWash id={`${id}-closure`} color={closure} x1={280} y1={348} x2={280} y2={408} />
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template="cap">
        {!isBack ? (
          <g data-garment-part="brim" data-region-id="brim" data-panel-color={brim.cloth}>
            <FlatPart d={BRIM_LIP} fill={brim.clothDeep} stroke={brim.stitch} />
            <FlatPart d={BRIM} fill={`url(#${id}-brim)`} stroke={brim.stitch} />
            {brimFinish ? (
              <g data-construction-kind="hem" data-construction-style={brimFinish}>
                <Seam
                  d={BRIM_SEAM}
                  color={brimFinish === 'rib' ? brim.rib : brim.stitch}
                  width={brimFinish === 'rib' ? 3.6 : brimFinish === 'raw' ? 1 : 1.5}
                  opacity={brimFinish === 'raw' ? 0.22 : 0.46}
                />
                <Seam d={BRIM_EDGE} color={brim.stitch} width={1.2} opacity={0.38} />
                {brimFinish === 'coverstitch' ? (
                  <>
                    <Stitch d={BRIM_STITCH_INNER} color={brim.highlight} width={0.85} opacity={0.48} />
                    <Stitch d={BRIM_STITCH_MID} color={brim.highlight} width={0.85} opacity={0.42} />
                    <Stitch d={BRIM_STITCH_OUTER} color={brim.highlight} width={0.85} opacity={0.38} />
                  </>
                ) : null}
              </g>
            ) : null}
          </g>
        ) : null}

        <g data-garment-part={rightId} data-region-id="right-side" data-panel-color={right.cloth}>
          <FlatPart d={rightPath} fill={`url(#${id}-right)`} stroke={right.stitch} />
          {!isBack ? (
            <Eyelet
              cx={EYELET_RIGHT.cx}
              cy={EYELET_RIGHT.cy}
              r={EYELET_RIGHT.r}
              fill={right.clothDark}
              stroke={right.highlight}
            />
          ) : null}
        </g>
        <g data-garment-part={leftId} data-region-id="left-side" data-panel-color={left.cloth}>
          <FlatPart d={leftPath} fill={`url(#${id}-left)`} stroke={left.stitch} />
          {!isBack ? (
            <Eyelet
              cx={EYELET_LEFT.cx}
              cy={EYELET_LEFT.cy}
              r={EYELET_LEFT.r}
              fill={left.clothDark}
              stroke={left.highlight}
            />
          ) : null}
        </g>
        <g data-garment-part={faceId} data-region-id={faceRegion} data-panel-color={face.cloth}>
          <FlatPart d={facePath} fill={`url(#${id}-face)`} stroke={face.stitch} />
        </g>
        <g data-garment-part={crownId} data-region-id="crown" data-panel-color={crown.cloth}>
          <FlatPart d={crownPath} fill={`url(#${id}-crown)`} stroke={crown.stitch} />
        </g>

        {!isBack ? <Seam d={CROWN_CENTER_SEAM} color={face.stitch} width={1.15} opacity={0.4} /> : null}
        <Seam d={CROWN_FRONT_SEAM_LEFT} color={face.stitch} width={1.2} opacity={0.4} />
        <Seam d={CROWN_FRONT_SEAM_RIGHT} color={face.stitch} width={1.2} opacity={0.4} />
        <Seam d={CROWN_TOP_SEAM} color={crown.stitch} width={1.05} opacity={0.32} />
        <Stitch d={CROWN_FRONT_SEAM_LEFT} color={face.highlight} />
        <Stitch d={CROWN_FRONT_SEAM_RIGHT} color={face.highlight} />
        {!isBack ? <Stitch d={CROWN_CENTER_SEAM} color={face.highlight} /> : null}
        <Fold d="M248 236 C268 222 292 222 312 236" color={crown.highlight} opacity={0.14} />
        {!isBack ? <Fold d="M210 400 C248 418 312 418 350 400" color={brim.highlight} opacity={0.12} /> : null}

        {bandStyle ? (
          <g
            data-garment-part={bandId}
            data-region-id="band"
            data-panel-color={band.cloth}
            data-construction-kind="waistband"
            data-construction-style={bandStyle}
          >
            <FlatPart d={bandPath} fill={bandStyle === 'rib' ? band.rib : `url(#${id}-band)`} stroke={band.stitch} />
            {bandStyle === 'rib' ? <RibMarks x={164} y={352} width={232} height={28} color={band.stitch} /> : null}
            <Stitch d={BAND_STITCH} color={band.highlight} />
          </g>
        ) : (
          <g data-garment-part={bandId} data-region-id="band" data-panel-color={band.cloth}>
            <FlatPart d={bandPath} fill={`url(#${id}-band)`} stroke={band.stitch} />
          </g>
        )}

        {isBack ? (
          <g
            data-garment-part="closure"
            data-region-id="closure"
            data-panel-color={closure.cloth}
            data-construction-kind="button"
            data-construction-style={closureStyle ?? 'none'}
          >
            <FlatPart d={CLOSURE} fill={`url(#${id}-closure)`} stroke={closure.stitch} />
            <Stitch d={CLOSURE_STITCH} color={closure.highlight} />
            {closureStyle ? (
              <>
                <path d={CLOSURE_STRAP} fill={closure.tape} opacity="0.92" />
                {closureStyle === 'snap' ? (
                  <>
                    <circle cx="248" cy="382" r="3.6" fill={closure.metal} />
                    <circle cx="312" cy="382" r="3.6" fill={closure.metal} />
                  </>
                ) : (
                  <circle cx="280" cy="382" r="4.2" fill={closure.metal} />
                )}
              </>
            ) : null}
          </g>
        ) : null}

        {!isBack ? (
          <g data-garment-part="top_button" data-construction-kind="button" data-construction-style={closureStyle ?? 'none'}>
            <circle cx="280" cy="206" r="4.2" fill={crown.clothDark} />
            <circle cx="280" cy="206" r="2.1" fill={crown.metal} />
          </g>
        ) : null}
      </g>

      <FabricSheen id={id} materialId={materialId} path={isBack ? BACK_PANEL : FRONT_PANEL} />
    </g>
  )
}
