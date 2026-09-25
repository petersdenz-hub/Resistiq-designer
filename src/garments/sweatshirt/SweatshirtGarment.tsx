import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import { FabricFinish, FabricSheen, HemBand } from '../render/constructionDraw'
import { constructionStyle, cuffStyle, fabricFilter } from '../render/constructionState'
import { FlatPart, FlatShadow, seam } from '../render/flatStyle'

/**
 * Fashion-flat crewneck sweatshirt. Set-in shoulders and a rib collar,
 * distinct from the hoodie shell.
 */

const BODY_FRONT =
  'M176 222 L184 510 C184 526 198 538 218 538 L342 538 C362 538 376 526 376 510 L384 222 L400 188 L328 188 C318 214 242 214 232 188 L160 188 L176 222 Z'

const BODY_BACK =
  'M176 222 L184 510 C184 526 198 538 218 538 L342 538 C362 538 376 526 376 510 L384 222 L400 188 L324 188 C316 204 244 204 236 188 L160 188 L176 222 Z'

const RIGHT_SLEEVE =
  'M160 188 C112 198 68 216 40 230 C34 258 48 332 60 368 C94 360 138 346 174 334 L168 224 L160 188 Z'
const LEFT_SLEEVE =
  'M400 188 C448 198 492 216 520 230 C526 258 512 332 500 368 C466 360 422 346 386 334 L392 224 L400 188 Z'

const RIGHT_CUFF =
  'M36 360 C28 362 26 372 28 382 L38 404 C42 412 56 412 64 404 L76 380 C78 370 70 360 60 360 Z'
const LEFT_CUFF =
  'M524 360 C532 362 534 372 532 382 L522 404 C518 412 504 412 496 404 L484 380 C482 370 490 360 500 360 Z'

const COLLAR_CREW_FRONT =
  'M226 180 C238 220 322 220 334 180 L324 188 C314 214 246 214 236 188 Z'
const COLLAR_CREW_BACK =
  'M232 180 C244 200 316 200 328 180 L320 188 C312 202 248 202 240 188 Z'
const COLLAR_RIB_FRONT =
  'M220 174 C234 226 326 226 340 174 L324 188 C314 214 246 214 236 188 Z'
const COLLAR_RIB_BACK =
  'M226 174 C238 206 322 206 334 174 L320 188 C312 202 248 202 240 188 Z'
const COLLAR_VNECK_FRONT =
  'M226 180 L280 226 L334 180 L324 188 L280 216 L236 188 Z'
const COLLAR_STAND_FRONT =
  'M214 158 L232 188 L328 188 L346 158 C332 146 228 146 214 158 Z'
const COLLAR_STAND_BACK =
  'M222 160 L238 186 L322 186 L338 160 C326 150 234 150 222 160 Z'

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
        <linearGradient id={`${id}-collar`} x1="280" y1="158" x2="280" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={collar.highlight} />
          <stop offset="1" stopColor={collar.rib} />
        </linearGradient>
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template="sweatshirt">
        <g data-garment-part={rightId} data-panel-color={right.cloth}>
          <FlatPart d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} stroke={right.stitch} />
        </g>
        <g data-garment-part={leftId} data-panel-color={left.cloth}>
          <FlatPart d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} stroke={left.stitch} />
        </g>
        <g data-garment-part={bodyId} data-panel-color={body.cloth}>
          <FlatPart d={isBack ? BODY_BACK : BODY_FRONT} fill={`url(#${id}-body)`} stroke={body.stitch} />
        </g>
        {collarStyle && collarStyle !== 'none' ? (
          <g
            data-garment-part={collarId}
            data-panel-color={collar.cloth}
            data-construction-kind="collar"
            data-construction-style={collarStyle}
          >
            <FlatPart
              d={collarPath}
              fill={collarStyle === 'rib' ? collar.rib : `url(#${id}-collar)`}
              stroke={collar.stitch}
            />
            {seam(
              isBack ? 'M240 184 C250 198 310 198 320 184' : 'M236 186 C248 210 312 210 324 186',
              collar.highlight,
              1.5,
              0.32,
            )}
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
              <FlatPart
                d={RIGHT_CUFF}
                fill={cuffs === 'rib' ? cuffRight.rib : cuffRight.clothDeep}
                stroke={cuffRight.stitch}
              />
              {seam('M40 380 H70', cuffRight.stitch, 1.6, 0.4)}
            </g>
            <g
              data-garment-part={cuffLeftId}
              data-panel-color={cuffLeft.cloth}
              data-construction-kind="cuff"
              data-construction-style={cuffs}
            >
              <FlatPart
                d={LEFT_CUFF}
                fill={cuffs === 'rib' ? cuffLeft.rib : cuffLeft.clothDeep}
                stroke={cuffLeft.stitch}
              />
              {seam('M490 380 H520', cuffLeft.stitch, 1.6, 0.4)}
            </g>
          </>
        ) : null}
      </g>

      {seam('M178 230 L186 514', body.stitch, 1, 0.2)}
      {seam('M382 230 L374 514', body.stitch, 1, 0.2)}
      {hemStyle ? <HemBand style={hemStyle} y={530} left={218} right={342} color={body} /> : null}
      <FabricSheen id={id} materialId={materialId} path={isBack ? BODY_BACK : BODY_FRONT} />
    </g>
  )
}
