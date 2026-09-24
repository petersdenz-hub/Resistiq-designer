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

/**
 * Fashion-flat hoodie. Hood, body, sleeves, and cuffs are separate parts.
 * The kangaroo pocket is garment structure, not a design element.
 */

const BODY_FRONT =
  'M166 222 L176 512 C176 530 192 542 214 542 L346 542 C368 542 384 530 384 512 L394 222 L412 184 L328 184 C318 222 242 222 232 184 L148 184 L166 222 Z'

const BODY_BACK =
  'M166 222 L176 512 C176 530 192 542 214 542 L346 542 C368 542 384 530 384 512 L394 222 L412 184 L324 184 C316 208 244 208 236 184 L148 184 L166 222 Z'

const HOOD_SHELL =
  'M168 188 C156 64 404 64 392 188 L352 204 C344 96 216 96 208 204 Z'

const HOOD_BACK =
  'M168 188 C156 64 404 64 392 188 L348 202 C340 100 220 100 212 202 Z'

const RIGHT_SLEEVE = 'M148 184 L36 222 L62 368 L174 332 L166 222 L148 184 Z'
const LEFT_SLEEVE = 'M412 184 L524 222 L498 368 L386 332 L394 222 L412 184 Z'

const RIGHT_CUFF =
  'M34 360 C28 360 26 368 28 378 L40 404 C44 412 56 412 64 404 L78 378 C80 368 72 360 62 360 Z'
const LEFT_CUFF =
  'M526 360 C532 360 534 368 532 378 L520 404 C516 412 504 412 496 404 L482 378 C480 368 488 360 498 360 Z'

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
        <linearGradient id={`${id}-hood`} x1="280" y1="64" x2="280" y2="204" gradientUnits="userSpaceOnUse">
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

        {hoodStyle ? (
          <g
            data-garment-part={hoodId}
            data-panel-color={hood.cloth}
            data-construction-kind="hood"
            data-construction-style={hoodStyle}
            data-construction-variant={hoodOpening}
          >
            <path d={isBack ? HOOD_BACK : HOOD_SHELL} fill={`url(#${id}-hood)`} />
            {isBack ? (
              <path d="M280 82 L280 190" fill="none" stroke={hood.stitch} strokeWidth="1.6" opacity="0.4" />
            ) : (
              <>
                <path
                  d={`M${222 + opening} 190 C${232 + opening} 108 ${328 - opening} 108 ${338 - opening} 190 C${314 - opening} 224 ${246 + opening} 224 ${222 + opening} 190 Z`}
                  fill={hood.tape}
                />
                <path
                  d={`M${230 + opening} 192 C${240 + opening} 164 ${320 - opening} 164 ${330 - opening} 192`}
                  fill="none"
                  stroke={hood.highlight}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.3"
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
          <path d={isBack ? BODY_BACK : BODY_FRONT} fill={`url(#${id}-body)`} />
        </g>

        {cuffs ? (
          <>
            <g
              data-garment-part={cuffRightId}
              data-panel-color={cuffRight.cloth}
              data-construction-kind="cuff"
              data-construction-style={cuffs}
            >
              <path d={RIGHT_CUFF} fill={cuffs === 'rib' ? cuffRight.rib : cuffRight.clothDeep} />
              <path
                d="M40 380 H70"
                fill="none"
                stroke={cuffRight.stitch}
                strokeWidth={cuffs === 'rib' ? 1.6 : 2.4}
                opacity="0.4"
              />
            </g>
            <g
              data-garment-part={cuffLeftId}
              data-panel-color={cuffLeft.cloth}
              data-construction-kind="cuff"
              data-construction-style={cuffs}
            >
              <path d={LEFT_CUFF} fill={cuffs === 'rib' ? cuffLeft.rib : cuffLeft.clothDeep} />
              <path
                d="M490 380 H520"
                fill="none"
                stroke={cuffLeft.stitch}
                strokeWidth={cuffs === 'rib' ? 1.6 : 2.4}
                opacity="0.4"
              />
            </g>
          </>
        ) : null}
      </g>

      <path d="M172 230 L182 516" fill="none" stroke={body.stitch} strokeWidth="1" opacity="0.2" />
      <path d="M388 230 L378 516" fill="none" stroke={body.stitch} strokeWidth="1" opacity="0.2" />
      {hemStyle ? <HemBand style={hemStyle} y={534} left={214} right={346} color={body} /> : null}

      {isBack ? (
        <path
          d="M232 196 C246 226 314 226 328 196"
          fill="none"
          stroke={body.highlight}
          strokeWidth="1.6"
          opacity="0.22"
        />
      ) : pocket ? (
        <PocketSet
          style={pocket}
          kind="hoodie"
          fill={body.clothDark}
          stitch={body.stitch}
          highlight={body.highlight}
        />
      ) : null}
      <FabricSheen id={id} materialId={materialId} path={isBack ? BODY_BACK : BODY_FRONT} />
    </g>
  )
}
