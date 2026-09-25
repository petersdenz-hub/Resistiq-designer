import type { GarmentRenderProps } from '../types'
import { clothFor, clothShades } from '../render/cloth'
import {
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
import { FlatPart, FlatShadow, Seam } from '../render/flatStyle'

/**
 * Fashion-flat outdoor jacket. Front is two body panels plus a zipper.
 * The zipper is garment structure, not an editable design element.
 */

const FRONT_LEFT =
  'M162 206 L172 516 C172 528 186 538 208 538 L274 538 L274 166 L148 166 L162 206 Z'

const FRONT_LEFT_VNECK =
  'M162 206 L172 516 C172 528 186 538 208 538 L274 538 L274 200 L228 166 L148 166 L162 206 Z'

const FRONT_RIGHT =
  'M398 206 L388 516 C388 528 374 538 352 538 L286 538 L286 166 L412 166 L398 206 Z'

const FRONT_RIGHT_VNECK =
  'M398 206 L388 516 C388 528 374 538 352 538 L286 538 L286 200 L332 166 L412 166 L398 206 Z'

const BODY_BACK =
  'M162 206 L172 516 C172 528 186 538 208 538 L352 538 C374 538 388 528 388 516 L398 206 L412 160 L326 160 C316 182 244 182 234 160 L148 160 L162 206 Z'

const RIGHT_SLEEVE =
  'M148 166 C96 178 58 194 44 202 C38 236 54 300 68 332 C104 322 146 310 176 302 L164 208 L148 166 Z'
const LEFT_SLEEVE =
  'M412 166 C464 178 502 194 516 202 C522 236 506 300 492 332 C456 322 414 310 384 302 L396 208 L412 166 Z'

const COLLAR_STAND_FRONT =
  'M208 126 L230 166 L330 166 L352 126 C338 114 222 114 208 126 Z'

const COLLAR_STAND_BACK =
  'M218 128 L236 162 L324 162 L342 128 C330 118 230 118 218 128 Z'

const COLLAR_CREW_FRONT =
  'M226 146 C238 184 322 184 334 146 L324 160 C314 176 246 176 236 160 Z'

const COLLAR_CREW_BACK =
  'M232 146 C242 164 318 164 328 146 L320 160 C312 170 248 170 240 160 Z'

const COLLAR_RIB_FRONT =
  'M214 134 C230 186 330 186 346 134 L330 166 L230 166 Z'

const COLLAR_RIB_BACK =
  'M222 134 C236 170 324 170 338 134 L324 162 L236 162 Z'

const COLLAR_VNECK_FRONT =
  'M226 146 L280 198 L334 146 L324 160 L280 186 L236 160 Z'

const COLLAR_VNECK_BACK =
  'M232 146 C242 164 318 164 328 146 L320 160 C312 170 248 170 240 160 Z'

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
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template="jacket">
        <g data-garment-part={rightId} data-panel-color={right.cloth}>
          <FlatPart d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} stroke={right.stitch} />
          {cuffs ? (
            <path
              d="M70 328 L176 302"
              fill="none"
              stroke={cuffs === 'rib' ? right.rib : right.clothDeep}
              strokeWidth={cuffs === 'rib' ? 12 : 8}
              strokeLinecap="round"
              opacity="0.5"
              data-construction-kind="cuff"
              data-construction-style={cuffs}
            />
          ) : null}
          <Seam d="M86 248 L156 236" color={right.stitch} width={1} opacity={0.22} />
        </g>
        <g data-garment-part={leftId} data-panel-color={left.cloth}>
          <FlatPart d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} stroke={left.stitch} />
          {cuffs ? (
            <path
              d="M384 302 L490 328"
              fill="none"
              stroke={cuffs === 'rib' ? left.rib : left.clothDeep}
              strokeWidth={cuffs === 'rib' ? 12 : 8}
              strokeLinecap="round"
              opacity="0.5"
              data-construction-kind="cuff"
              data-construction-style={cuffs}
            />
          ) : null}
          <Seam d="M474 248 L404 236" color={left.stitch} width={1} opacity={0.22} />
        </g>

        {isBack ? (
          <g data-garment-part="back_body" data-panel-color={back.cloth}>
            <FlatPart d={BODY_BACK} fill={`url(#${id}-body-b)`} stroke={back.stitch} />
            <Seam d="M196 176 H364" color={back.stitch} width={1.1} opacity={0.28} />
          </g>
        ) : (
          <>
            <g data-garment-part="front_body_left" data-panel-color={leftBody.cloth}>
              <FlatPart
                d={collarStyle === 'vneck' ? FRONT_LEFT_VNECK : FRONT_LEFT}
                fill={`url(#${id}-body-l)`}
                stroke={leftBody.stitch}
              />
            </g>
            <g data-garment-part="front_body_right" data-panel-color={rightBody.cloth}>
              <FlatPart
                d={collarStyle === 'vneck' ? FRONT_RIGHT_VNECK : FRONT_RIGHT}
                fill={`url(#${id}-body-r)`}
                stroke={rightBody.stitch}
              />
            </g>
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
                fill={leftBody.detail}
                stitch={leftBody.stitch}
                highlight={leftBody.highlight}
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

      <Seam d="M170 214 L182 516" color={(isBack ? back : leftBody).stitch} width={1} opacity={0.2} />
      <Seam d="M390 214 L378 516" color={(isBack ? back : rightBody).stitch} width={1} opacity={0.2} />
      {hemStyle ? (
        <HemBand style={hemStyle} y={528} left={208} right={352} color={isBack ? back : leftBody} />
      ) : null}
      <FabricSheen id={id} materialId={materialId} path={isBack ? BODY_BACK : FRONT_LEFT} />
    </g>
  )
}
