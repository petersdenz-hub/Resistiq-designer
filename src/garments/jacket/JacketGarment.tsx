import type { GarmentRenderProps } from '../types'
import { clothFor, clothShades } from '../render/cloth'
import {
  FabricFinish,
  FabricSheen,
  HemBand,
  PocketSet,
  ZipperPart,
} from '../render/constructionDraw'
import { constructionStyle, cuffStyle, fabricFilter, pocketStyle } from '../render/constructionState'

/**
 * Fashion-flat jacket. Front is two body panels plus a zipper.
 * The zipper is garment structure, not an editable design element.
 */

const FRONT_LEFT =
  'M164 208 L176 508 C176 524 190 534 210 534 L274 534 L274 168 L150 168 L164 208 Z'

const FRONT_RIGHT =
  'M396 208 L384 508 C384 524 370 534 350 534 L286 534 L286 168 L410 168 L396 208 Z'

const BODY_BACK =
  'M164 208 L176 508 C176 524 190 534 210 534 L350 534 C370 534 384 524 384 508 L396 208 L410 160 L324 160 C316 184 244 184 236 160 L150 160 L164 208 Z'

const RIGHT_SLEEVE = 'M150 168 L46 196 L72 330 L178 304 L164 208 L150 168 Z'
const LEFT_SLEEVE = 'M410 168 L514 196 L488 330 L382 304 L396 208 L410 168 Z'

const COLLAR_STAND_FRONT =
  'M208 128 L230 168 L330 168 L352 128 C338 116 222 116 208 128 Z'

const COLLAR_STAND_BACK =
  'M218 130 L236 164 L324 164 L342 130 C330 120 230 120 218 130 Z'

const COLLAR_CREW_FRONT =
  'M226 148 C238 186 322 186 334 148 L324 160 C314 176 246 176 236 160 Z'

const COLLAR_CREW_BACK =
  'M232 148 C242 166 318 166 328 148 L320 160 C312 170 248 170 240 160 Z'

const COLLAR_RIB_FRONT =
  'M214 136 C230 188 330 188 346 136 L330 168 L230 168 Z'

const COLLAR_RIB_BACK =
  'M222 136 C236 172 324 172 338 136 L324 164 L236 164 Z'

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
  const zipper = clothShades(bodyColor)
  const id = `jacket-${viewId}`
  const collarStyle = construction ? constructionStyle(construction, 'collar') : 'stand'
  const zipperStyle = construction ? constructionStyle(construction, 'zipper') : 'center_front'
  const pocket = construction ? pocketStyle(construction) : null
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
        : isBack
          ? COLLAR_STAND_BACK
          : COLLAR_STAND_FRONT

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-body-l`} x1="220" y1="150" x2="220" y2="534" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={leftBody.highlight} />
          <stop offset="0.45" stopColor={leftBody.cloth} />
          <stop offset="1" stopColor={leftBody.clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-body-r`} x1="340" y1="150" x2="340" y2="534" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={rightBody.highlight} />
          <stop offset="0.45" stopColor={rightBody.cloth} />
          <stop offset="1" stopColor={rightBody.clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-body-b`} x1="280" y1="150" x2="280" y2="534" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={back.highlight} />
          <stop offset="0.45" stopColor={back.cloth} />
          <stop offset="1" stopColor={back.clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-r`} x1="168" y1="168" x2="52" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={right.cloth} />
          <stop offset="1" stopColor={right.clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-l`} x1="392" y1="168" x2="508" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={left.cloth} />
          <stop offset="1" stopColor={left.clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-collar`} x1="280" y1="118" x2="280" y2="168" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={collar.highlight} />
          <stop offset="1" stopColor={collar.rib} />
        </linearGradient>
        <filter id={`${id}-soft`} x="-8%" y="-4%" width="116%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.22" />
        </filter>
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`}>
        <g data-garment-part={rightId} data-panel-color={right.cloth}>
          <path d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} />
          {cuffs ? (
            <path
              d="M58 318 L170 296"
              fill="none"
              stroke={cuffs === 'rib' ? right.rib : right.clothDeep}
              strokeWidth={cuffs === 'rib' ? 10 : 7}
              strokeLinecap="round"
              opacity="0.45"
              data-construction-kind="cuff"
              data-construction-style={cuffs}
            />
          ) : null}
        </g>
        <g data-garment-part={leftId} data-panel-color={left.cloth}>
          <path d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} />
          {cuffs ? (
            <path
              d="M390 296 L502 318"
              fill="none"
              stroke={cuffs === 'rib' ? left.rib : left.clothDeep}
              strokeWidth={cuffs === 'rib' ? 10 : 7}
              strokeLinecap="round"
              opacity="0.45"
              data-construction-kind="cuff"
              data-construction-style={cuffs}
            />
          ) : null}
        </g>

        {isBack ? (
          <g data-garment-part="back_body" data-panel-color={back.cloth}>
            <path d={BODY_BACK} fill={`url(#${id}-body-b)`} />
          </g>
        ) : (
          <>
            <g data-garment-part="front_body_left" data-panel-color={leftBody.cloth}>
              <path d={FRONT_LEFT} fill={`url(#${id}-body-l)`} />
            </g>
            <g data-garment-part="front_body_right" data-panel-color={rightBody.cloth}>
              <path d={FRONT_RIGHT} fill={`url(#${id}-body-r)`} />
            </g>
            {zipperStyle ? <ZipperPart style={zipperStyle} tape={zipper.tape} metal={zipper.metal} /> : null}
            {pocket ? (
              <PocketSet
                style={pocket}
                kind="jacket"
                fill={leftBody.clothDark}
                stitch={leftBody.stitch}
                highlight={leftBody.highlight}
              />
            ) : null}
          </>
        )}

        {collarStyle ? (
          <g
            data-garment-part={collarId}
            data-panel-color={collar.cloth}
            data-construction-kind="collar"
            data-construction-style={collarStyle}
          >
            <path d={collarPath} fill={`url(#${id}-collar)`} />
            <path
              d={isBack ? 'M240 146 H320' : 'M226 148 H334'}
              fill="none"
              stroke={collar.highlight}
              strokeWidth={collarStyle === 'rib' ? 2.2 : 1.6}
              opacity="0.32"
            />
          </g>
        ) : null}
      </g>

      <path d="M170 216 L182 516" fill="none" stroke={(isBack ? back : leftBody).stitch} strokeWidth="1" opacity="0.2" />
      <path d="M390 216 L378 516" fill="none" stroke={(isBack ? back : rightBody).stitch} strokeWidth="1" opacity="0.2" />
      {hemStyle ? (
        <HemBand style={hemStyle} y={526} left={210} right={350} color={isBack ? back : leftBody} />
      ) : null}
      <FabricSheen id={id} materialId={materialId} path={isBack ? BODY_BACK : FRONT_LEFT} />
    </g>
  )
}
