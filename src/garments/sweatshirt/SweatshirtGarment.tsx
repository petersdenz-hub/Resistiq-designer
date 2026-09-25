import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import { FabricFinish, FabricSheen, HemBand } from '../render/constructionDraw'
import { constructionStyle, cuffStyle, fabricFilter } from '../render/constructionState'

/**
 * Fashion-flat crewneck sweatshirt. Longer sleeves and rib cuffs than the
 * T-shirt, without a hoodie shell. Placeholder silhouette for the catalog.
 */

const BODY_FRONT =
  'M166 222 L176 512 C176 530 192 542 214 542 L346 542 C368 542 384 530 384 512 L394 222 L412 184 L328 184 C318 222 242 222 232 184 L148 184 L166 222 Z'

const BODY_BACK =
  'M166 222 L176 512 C176 530 192 542 214 542 L346 542 C368 542 384 530 384 512 L394 222 L412 184 L324 184 C316 208 244 208 236 184 L148 184 L166 222 Z'

const RIGHT_SLEEVE = 'M148 184 L36 222 L62 368 L174 332 L166 222 L148 184 Z'
const LEFT_SLEEVE = 'M412 184 L524 222 L498 368 L386 332 L394 222 L412 184 Z'

const RIGHT_CUFF =
  'M34 360 C28 360 26 368 28 378 L40 404 C44 412 56 412 64 404 L78 378 C80 368 72 360 62 360 Z'
const LEFT_CUFF =
  'M526 360 C532 360 534 368 532 378 L520 404 C516 412 504 412 496 404 L482 378 C480 368 488 360 498 360 Z'

const COLLAR_CREW_FRONT =
  'M228 182 C240 224 320 224 332 182 L324 184 C314 220 246 220 236 184 Z'
const COLLAR_CREW_BACK =
  'M234 182 C244 202 316 202 326 182 L318 184 C310 200 250 200 242 184 Z'

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
  const id = `sweatshirt-${viewId}`
  const collarStyle = construction ? constructionStyle(construction, 'collar') : 'crew'
  const hemStyle = construction ? constructionStyle(construction, 'hem') : 'rib'
  const cuffs = construction ? cuffStyle(construction) : 'rib'
  const materialId = construction?.materialId

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-body`} x1="280" y1="170" x2="280" y2="542" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={body.highlight} />
          <stop offset="0.42" stopColor={body.cloth} />
          <stop offset="1" stopColor={body.clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-r`} x1="160" y1="184" x2="40" y2="368" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={right.cloth} />
          <stop offset="1" stopColor={right.clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-l`} x1="400" y1="184" x2="520" y2="368" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={left.cloth} />
          <stop offset="1" stopColor={left.clothDark} />
        </linearGradient>
        <filter id={`${id}-soft`} x="-8%" y="-4%" width="116%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.22" />
        </filter>
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`}>
        <g data-garment-part={rightId} data-panel-color={right.cloth}>
          <path d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} />
        </g>
        <g data-garment-part={leftId} data-panel-color={left.cloth}>
          <path d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} />
        </g>
        <g data-garment-part={bodyId} data-panel-color={body.cloth}>
          <path d={isBack ? BODY_BACK : BODY_FRONT} fill={`url(#${id}-body)`} />
        </g>
        {collarStyle && collarStyle !== 'none' ? (
          <g data-garment-part={collarId} data-panel-color={collar.cloth} data-construction-kind="collar">
            <path
              d={isBack ? COLLAR_CREW_BACK : COLLAR_CREW_FRONT}
              fill={collarStyle === 'rib' ? collar.rib : collar.clothDeep}
            />
          </g>
        ) : null}
        {cuffs ? (
          <>
            <g
              data-garment-part={cuffRightId}
              data-panel-color={cuffRight.cloth}
              data-construction-kind="cuff"
              data-construction-style={cuffs}
            >
              <path d={RIGHT_CUFF} fill={cuffs === 'rib' ? cuffRight.rib : cuffRight.clothDeep} />
            </g>
            <g
              data-garment-part={cuffLeftId}
              data-panel-color={cuffLeft.cloth}
              data-construction-kind="cuff"
              data-construction-style={cuffs}
            >
              <path d={LEFT_CUFF} fill={cuffs === 'rib' ? cuffLeft.rib : cuffLeft.clothDeep} />
            </g>
          </>
        ) : null}
      </g>

      {hemStyle ? <HemBand style={hemStyle} y={534} left={214} right={346} color={body} /> : null}
      <FabricSheen id={id} materialId={materialId} path={isBack ? BODY_BACK : BODY_FRONT} />
    </g>
  )
}
