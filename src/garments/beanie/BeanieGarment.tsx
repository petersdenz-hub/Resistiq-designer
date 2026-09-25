import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import { FabricFinish, FabricSheen } from '../render/constructionDraw'
import { constructionStyle, fabricFilter } from '../render/constructionState'
import { ClothWash, FlatPart, FlatShadow, Fold, RibMarks, Seam, Stitch } from '../render/flatStyle'
import {
  BACK_CROWN,
  CROWN,
  CROWN_BACK,
  CROWN_CENTER_SEAM,
  CROWN_SEAM_LEFT,
  CROWN_SEAM_RIGHT,
  CROWN_TOP_DART,
  CUFF,
  CUFF_BACK,
  CUFF_FOLD,
  CUFF_LIP,
  CUFF_RIB_BOX,
  CUFF_SEAM,
  CUFF_STITCH,
  FRONT_CROWN,
  KNIT_LEFT,
  KNIT_RIGHT,
  LEFT_SIDE,
  LEFT_SIDE_BACK,
  RIGHT_SIDE,
  RIGHT_SIDE_BACK,
} from './geometry'

export function BeanieGarment({ viewId, bodyColor, panelColors, construction }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const peakId = isBack ? 'crown_back' : 'crown'
  const faceId = isBack ? 'back_crown' : 'front_crown'
  const rightId = isBack ? 'right_side_back' : 'right_side'
  const leftId = isBack ? 'left_side_back' : 'left_side'
  const cuffId = isBack ? 'cuff_back' : 'cuff'
  const faceRegion = isBack ? 'back' : 'crown'
  const peak = clothFor(bodyColor, panelColors, peakId)
  const face = clothFor(bodyColor, panelColors, faceId)
  const right = clothFor(bodyColor, panelColors, rightId)
  const left = clothFor(bodyColor, panelColors, leftId)
  const cuff = clothFor(bodyColor, panelColors, cuffId)
  const id = `beanie-${viewId}`
  const cuffStyle = construction ? constructionStyle(construction, 'waistband') : 'rib'
  const cuffFinish = construction ? constructionStyle(construction, 'hem') : 'coverstitch'
  const materialId = construction?.materialId
  const facePath = isBack ? BACK_CROWN : FRONT_CROWN
  const peakPath = isBack ? CROWN_BACK : CROWN
  const rightPath = isBack ? RIGHT_SIDE_BACK : RIGHT_SIDE
  const leftPath = isBack ? LEFT_SIDE_BACK : LEFT_SIDE
  const cuffPath = isBack ? CUFF_BACK : CUFF

  return (
    <g pointerEvents="none">
      <defs>
        <ClothWash id={`${id}-peak`} color={peak} x1={280} y1={156} x2={280} y2={196} />
        <ClothWash id={`${id}-face`} color={face} x1={280} y1={168} x2={280} y2={404} />
        <ClothWash id={`${id}-right`} color={right} x1={220} y1={168} x2={156} y2={404} />
        <ClothWash id={`${id}-left`} color={left} x1={340} y1={168} x2={404} y2={404} />
        <ClothWash id={`${id}-cuff`} color={cuff} x1={280} y1={394} x2={280} y2={510} />
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template="beanie">
        <g data-garment-part={rightId} data-region-id="right-side" data-panel-color={right.cloth}>
          <FlatPart d={rightPath} fill={`url(#${id}-right)`} stroke={right.stitch} />
        </g>
        <g data-garment-part={leftId} data-region-id="left-side" data-panel-color={left.cloth}>
          <FlatPart d={leftPath} fill={`url(#${id}-left)`} stroke={left.stitch} />
        </g>
        <g data-garment-part={faceId} data-region-id={faceRegion} data-panel-color={face.cloth}>
          <FlatPart d={facePath} fill={`url(#${id}-face)`} stroke={face.stitch} />
        </g>
        <g data-garment-part={peakId} data-region-id={isBack ? 'back' : 'crown'} data-panel-color={peak.cloth}>
          <FlatPart d={peakPath} fill={`url(#${id}-peak)`} stroke={peak.stitch} />
        </g>

        <Seam d={CROWN_CENTER_SEAM} color={face.stitch} width={1.15} opacity={0.38} />
        <Seam d={CROWN_SEAM_LEFT} color={face.stitch} width={1.1} opacity={0.36} />
        <Seam d={CROWN_SEAM_RIGHT} color={face.stitch} width={1.1} opacity={0.36} />
        <Seam d={CROWN_TOP_DART} color={peak.stitch} width={1.05} opacity={0.3} />
        <g data-construction-detail="knit">
          <Stitch d={KNIT_LEFT} color={face.highlight} width={0.75} opacity={0.28} />
          <Stitch d={KNIT_RIGHT} color={face.highlight} width={0.75} opacity={0.28} />
          <Stitch d={CROWN_CENTER_SEAM} color={face.highlight} />
          <Stitch d={CROWN_SEAM_LEFT} color={face.highlight} />
          <Stitch d={CROWN_SEAM_RIGHT} color={face.highlight} />
        </g>
        <Fold d="M248 220 C268 204 292 204 312 220" color={peak.highlight} opacity={0.14} />

        {cuffStyle ? (
          <g
            data-garment-part={cuffId}
            data-region-id="cuff"
            data-panel-color={cuff.cloth}
            data-construction-kind="waistband"
            data-construction-style={cuffStyle}
          >
            <FlatPart d={CUFF_LIP} fill={cuff.clothDeep} stroke={cuff.stitch} />
            <FlatPart d={cuffPath} fill={cuffStyle === 'rib' ? cuff.rib : `url(#${id}-cuff)`} stroke={cuff.stitch} />
            {cuffStyle === 'rib' ? (
              <RibMarks
                x={CUFF_RIB_BOX.x}
                y={CUFF_RIB_BOX.y}
                width={CUFF_RIB_BOX.width}
                height={CUFF_RIB_BOX.height}
                color={cuff.stitch}
                step={6}
              />
            ) : null}
            <Seam d={CUFF_SEAM} color={cuff.stitch} width={1.2} opacity={0.4} />
            <Stitch d={CUFF_FOLD} color={cuff.highlight} />
            {cuffFinish ? (
              <g data-construction-kind="hem" data-construction-style={cuffFinish}>
                <Stitch d={CUFF_STITCH} color={cuff.highlight} width={0.85} opacity={0.4} />
              </g>
            ) : null}
          </g>
        ) : (
          <g data-garment-part={cuffId} data-region-id="cuff" data-panel-color={cuff.cloth}>
            <FlatPart d={cuffPath} fill={`url(#${id}-cuff)`} stroke={cuff.stitch} />
          </g>
        )}
      </g>

      <FabricSheen id={id} materialId={materialId} path={facePath} />
    </g>
  )
}
