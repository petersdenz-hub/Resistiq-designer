import type { GarmentRenderProps } from '../types'
import { clothFor, clothShades } from '../render/cloth'
import { FabricFinish, FabricSheen, HemBand, PocketSet } from '../render/constructionDraw'
import {
  constructionStyle,
  constructionVariant,
  cuffStyle,
  fabricFilter,
  pocketStyle,
} from '../render/constructionState'
import { FlatPart, FlatShadow, Seam } from '../render/flatStyle'

/**
 * Fashion-flat hoodie. Hood, body, sleeves, and cuffs are separate parts.
 * The kangaroo pocket is garment structure, not a design element.
 */

const BODY_FRONT =
  'M168 224 L178 508 C178 526 194 540 216 540 L344 540 C366 540 382 526 382 508 L392 224 L408 186 L330 186 C318 220 242 220 230 186 L152 186 L168 224 Z'

const BODY_BACK =
  'M168 224 L178 508 C178 526 194 540 216 540 L344 540 C366 540 382 526 382 508 L392 224 L408 186 L326 186 C316 206 244 206 234 186 L152 186 L168 224 Z'

const HOOD_SHELL =
  'M172 188 C160 118 176 58 280 52 C384 58 400 118 388 188 L348 204 C340 108 220 108 212 204 Z'

const HOOD_BACK =
  'M172 188 C160 118 176 56 280 50 C384 56 400 118 388 188 L346 202 C338 112 222 112 214 202 Z'

const RIGHT_SLEEVE =
  'M152 186 C110 198 62 214 38 228 C32 260 46 332 58 368 C92 360 138 346 172 334 L166 224 L152 186 Z'
const LEFT_SLEEVE =
  'M408 186 C450 198 498 214 522 228 C528 260 514 332 502 368 C468 360 422 346 388 334 L394 224 L408 186 Z'

const RIGHT_CUFF =
  'M36 360 C28 362 26 372 28 382 L38 404 C42 412 56 412 64 404 L76 380 C78 370 70 360 60 360 Z'
const LEFT_CUFF =
  'M524 360 C532 362 534 372 532 382 L522 404 C518 412 504 412 496 404 L484 380 C482 370 490 360 500 360 Z'

export function HoodieGarment({ viewId, bodyColor, panelColors, construction }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const bodyId = isBack ? 'back_body' : 'front_body'
  const hoodId = isBack ? 'hood_back' : 'hood'
  const rightId = isBack ? 'right_sleeve_back' : 'right_sleeve'
  const leftId = isBack ? 'left_sleeve_back' : 'left_sleeve'
  const cuffRightId = isBack ? 'cuff_left_back' : 'cuff_right'
  const cuffLeftId = isBack ? 'cuff_right_back' : 'cuff_left'
  const body = clothFor(bodyColor, panelColors, bodyId)
  const hood = clothFor(bodyColor, panelColors, hoodId)
  const right = clothFor(bodyColor, panelColors, rightId)
  const left = clothFor(bodyColor, panelColors, leftId)
  const cuffRight = clothFor(bodyColor, panelColors, cuffRightId)
  const cuffLeft = clothFor(bodyColor, panelColors, cuffLeftId)
  const id = `hoodie-${viewId}`
  const hoodStyle = construction ? constructionStyle(construction, 'hood') : 'pullover'
  const hoodOpening = construction ? constructionVariant(construction, 'hood', 'standard') : 'standard'
  const drawstring = construction ? constructionStyle(construction, 'drawstring') : 'cord'
  const pocket = construction ? pocketStyle(construction, 'body', 'hoodie') : 'kangaroo'
  const cuffs = construction ? cuffStyle(construction) : 'rib'
  const hemStyle = construction ? constructionStyle(construction, 'hem') : 'rib'
  const materialId = construction?.materialId
  const zipper = clothShades(bodyColor)
  const opening = hoodOpening === 'tight' ? 14 : hoodOpening === 'wide' ? -12 : 0

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-body`} x1="280" y1="170" x2="280" y2="542" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={body.highlight} />
          <stop offset="0.42" stopColor={body.cloth} />
          <stop offset="1" stopColor={body.clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-hood`} x1="280" y1="52" x2="280" y2="204" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={hood.highlight} />
          <stop offset="1" stopColor={hood.rib} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-r`} x1="160" y1="184" x2="40" y2="368" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={right.cloth} />
          <stop offset="1" stopColor={right.clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-l`} x1="400" y1="184" x2="520" y2="368" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={left.cloth} />
          <stop offset="1" stopColor={left.clothDark} />
        </linearGradient>
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template="hoodie">
        <g data-garment-part={rightId} data-panel-color={right.cloth}>
          <FlatPart d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} stroke={right.stitch} />
        </g>
        <g data-garment-part={leftId} data-panel-color={left.cloth}>
          <FlatPart d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} stroke={left.stitch} />
        </g>

        {hoodStyle ? (
          <g
            data-garment-part={hoodId}
            data-panel-color={hood.cloth}
            data-construction-kind="hood"
            data-construction-style={hoodStyle}
            data-construction-variant={hoodOpening}
          >
            <FlatPart d={isBack ? HOOD_BACK : HOOD_SHELL} fill={`url(#${id}-hood)`} stroke={hood.stitch} />
            {isBack ? (
              <Seam d="M280 78 L280 192" color={hood.stitch} width={1.4} opacity={0.38} />
            ) : (
              <>
                <path
                  d={`M${224 + opening} 190 C${232 + opening} 108 ${328 - opening} 108 ${336 - opening} 190 C${314 - opening} 226 ${246 + opening} 226 ${224 + opening} 190 Z`}
                  fill={hood.tape}
                  opacity="0.92"
                />
                <Seam
                  d={`M${230 + opening} 192 C${240 + opening} 164 ${320 - opening} 164 ${330 - opening} 192`}
                  color={hood.highlight}
                  width={1.6}
                  opacity={0.32}
                />
                {hoodStyle === 'zip' ? (
                  <g data-garment-part="hood_zipper">
                    <rect x="276" y="188" width="8" height="52" rx="1.5" fill={zipper.tape} />
                    <rect x="274" y="196" width="12" height="14" rx="2" fill={zipper.metal} />
                  </g>
                ) : null}
                {drawstring ? (
                  <g data-construction-kind="drawstring" data-construction-style={drawstring}>
                    <path
                      d={`M${250 + opening} 204 L${238 + opening} 248`}
                      fill="none"
                      stroke={hood.stitch}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M${310 - opening} 204 L${322 - opening} 248`}
                      fill="none"
                      stroke={hood.stitch}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <circle cx={238 + opening} cy="250" r="3" fill={hood.clothDark} />
                    <circle cx={322 - opening} cy="250" r="3" fill={hood.clothDark} />
                  </g>
                ) : null}
              </>
            )}
          </g>
        ) : (
          <g data-garment-part={hoodId} data-construction-kind="hood" data-construction-style="none">
            <path
              d={isBack ? 'M236 184 C250 206 310 206 324 184' : 'M232 184 C248 214 312 214 328 184'}
              fill="none"
              stroke={body.rib}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.45"
            />
          </g>
        )}

        <g data-garment-part={bodyId} data-panel-color={body.cloth}>
          <FlatPart d={isBack ? BODY_BACK : BODY_FRONT} fill={`url(#${id}-body)`} stroke={body.stitch} />
        </g>
        <Seam d="M168 224 L152 186" color={body.stitch} width={1.1} opacity={0.3} />
        <Seam d="M392 224 L408 186" color={body.stitch} width={1.1} opacity={0.3} />

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
              <Seam d="M40 380 H70" color={cuffRight.stitch} width={cuffs === 'rib' ? 1.6 : 2.4} opacity={0.4} />
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
              <Seam d="M490 380 H520" color={cuffLeft.stitch} width={cuffs === 'rib' ? 1.6 : 2.4} opacity={0.4} />
            </g>
          </>
        ) : null}
      </g>

      <Seam d="M174 232 L184 516" color={body.stitch} width={1} opacity={0.22} />
      <Seam d="M386 232 L376 516" color={body.stitch} width={1} opacity={0.22} />
      {hemStyle ? <HemBand style={hemStyle} y={532} left={216} right={344} color={body} /> : null}

      {isBack ? (
        <Seam d="M232 196 C246 226 314 226 328 196" color={body.highlight} width={1.6} opacity={0.22} />
      ) : pocket ? (
        <PocketSet
          style={pocket}
          kind="hoodie"
          fill={body.detail}
          stitch={body.stitch}
          highlight={body.highlight}
        />
      ) : null}
      <FabricSheen id={id} materialId={materialId} path={isBack ? BODY_BACK : BODY_FRONT} />
    </g>
  )
}
