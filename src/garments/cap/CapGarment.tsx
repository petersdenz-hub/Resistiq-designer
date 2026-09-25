import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import { FabricFinish, FabricSheen } from '../render/constructionDraw'
import { constructionStyle, fabricFilter, visibleParts } from '../render/constructionState'
import { ClothGradient, FlatPart, FlatShadow, Fold, RibMarks, Seam, Stitch } from '../render/flatStyle'
import {
  BACK_PANEL,
  BAND,
  BAND_BACK,
  BAND_STITCH,
  BRIM,
  BRIM_SEAM,
  CLOSURE,
  CROWN,
  CROWN_BACK,
  CROWN_FRONT_SEAM_LEFT,
  CROWN_FRONT_SEAM_RIGHT,
  CROWN_TOP_SEAM,
  FRONT_PANEL,
  LEFT_SIDE,
  LEFT_SIDE_BACK,
  RIGHT_SIDE,
  RIGHT_SIDE_BACK,
} from './geometry'

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
        <ClothGradient id={`${id}-crown`} color={crown} x1={280} y1={168} x2={280} y2={250} />
        <ClothGradient id={`${id}-face`} color={face} x1={280} y1={176} x2={280} y2={352} />
        <ClothGradient id={`${id}-right`} color={right} x1={220} y1={180} x2={160} y2={360} />
        <ClothGradient id={`${id}-left`} color={left} x1={340} y1={180} x2={400} y2={360} />
        <ClothGradient id={`${id}-brim`} color={brim} x1={280} y1={354} x2={280} y2={486} />
        <ClothGradient id={`${id}-band`} color={band} x1={280} y1={342} x2={280} y2={380} />
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template="cap">
        {!isBack ? (
          <g data-garment-part="brim" data-region-id="brim" data-panel-color={brim.cloth}>
            <FlatPart d={BRIM} fill={`url(#${id}-brim)`} stroke={brim.stitch} />
            {brimFinish ? (
              <g data-construction-kind="hem" data-construction-style={brimFinish}>
                <Seam
                  d={BRIM_SEAM}
                  color={brimFinish === 'rib' ? brim.rib : brim.stitch}
                  width={brimFinish === 'rib' ? 4.2 : brimFinish === 'raw' ? 1 : 1.6}
                  opacity={brimFinish === 'raw' ? 0.22 : 0.4}
                />
                {brimFinish === 'coverstitch' ? <Stitch d={BRIM_SEAM} color={brim.highlight} /> : null}
              </g>
            ) : null}
          </g>
        ) : null}

        <g data-garment-part={rightId} data-region-id="right-side" data-panel-color={right.cloth}>
          <FlatPart d={rightPath} fill={`url(#${id}-right)`} stroke={right.stitch} />
        </g>
        <g data-garment-part={leftId} data-region-id="left-side" data-panel-color={left.cloth}>
          <FlatPart d={leftPath} fill={`url(#${id}-left)`} stroke={left.stitch} />
        </g>
        <g data-garment-part={faceId} data-region-id={faceRegion} data-panel-color={face.cloth}>
          <FlatPart d={facePath} fill={`url(#${id}-face)`} stroke={face.stitch} />
        </g>
        <g data-garment-part={crownId} data-region-id="crown" data-panel-color={crown.cloth}>
          <FlatPart d={crownPath} fill={`url(#${id}-crown)`} stroke={crown.stitch} />
        </g>

        <Seam d={CROWN_FRONT_SEAM_LEFT} color={face.stitch} width={1.15} opacity={0.36} />
        <Seam d={CROWN_FRONT_SEAM_RIGHT} color={face.stitch} width={1.15} opacity={0.36} />
        <Seam d={CROWN_TOP_SEAM} color={crown.stitch} width={1.05} opacity={0.3} />
        <Stitch d={CROWN_FRONT_SEAM_LEFT} color={face.highlight} />
        <Stitch d={CROWN_FRONT_SEAM_RIGHT} color={face.highlight} />
        <Fold d="M248 220 C268 208 292 208 312 220" color={crown.highlight} />

        {bandStyle ? (
          <g
            data-garment-part={bandId}
            data-region-id="band"
            data-panel-color={band.cloth}
            data-construction-kind="waistband"
            data-construction-style={bandStyle}
          >
            <FlatPart d={bandPath} fill={bandStyle === 'rib' ? band.rib : `url(#${id}-band)`} stroke={band.stitch} />
            {bandStyle === 'rib' ? <RibMarks x={176} y={344} width={208} height={28} color={band.stitch} /> : null}
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
            <FlatPart d={CLOSURE} fill={closure.tape} stroke={closure.stitch} />
            {closureStyle ? (
              <>
                <rect x="236" y="366" width="88" height="18" rx="3" fill={closure.clothDark} opacity="0.85" />
                {closureStyle === 'snap' ? (
                  <>
                    <circle cx="248" cy="375" r="4" fill={closure.metal} />
                    <circle cx="312" cy="375" r="4" fill={closure.metal} />
                  </>
                ) : (
                  <circle cx="280" cy="375" r="5" fill={closure.metal} />
                )}
              </>
            ) : null}
          </g>
        ) : null}

        {!isBack ? (
          <g data-garment-part="top_button" data-construction-kind="button" data-construction-style={closureStyle ?? 'none'}>
            <circle cx="280" cy="186" r="6" fill={crown.clothDark} />
            <circle cx="280" cy="186" r="3.2" fill={crown.metal} />
          </g>
        ) : null}
      </g>

      <FabricSheen id={id} materialId={materialId} path={isBack ? BACK_PANEL : FRONT_PANEL} />
    </g>
  )
}
