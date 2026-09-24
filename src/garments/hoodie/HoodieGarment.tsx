import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'

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

const HOOD_LINING =
  'M222 190 C232 108 328 108 338 190 C314 224 246 224 222 190 Z'

const HOOD_BACK =
  'M168 188 C156 64 404 64 392 188 L348 202 C340 100 220 100 212 202 Z'

const RIGHT_SLEEVE = 'M148 184 L36 222 L62 368 L174 332 L166 222 L148 184 Z'
const LEFT_SLEEVE = 'M412 184 L524 222 L498 368 L386 332 L394 222 L412 184 Z'

const RIGHT_CUFF =
  'M34 360 C28 360 26 368 28 378 L40 404 C44 412 56 412 64 404 L78 378 C80 368 72 360 62 360 Z'
const LEFT_CUFF =
  'M526 360 C532 360 534 368 532 378 L520 404 C516 412 504 412 496 404 L482 378 C480 368 488 360 498 360 Z'

const POCKET =
  'M206 348 C206 340 214 334 224 334 L336 334 C346 334 354 340 354 348 L354 430 C354 440 344 448 332 448 L228 448 C216 448 206 440 206 430 Z'

export function HoodieGarment({ viewId, bodyColor, panelColors }: GarmentRenderProps) {
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

      <g filter={`url(#${id}-soft)`}>
        <g data-garment-part={rightId} data-panel-color={right.cloth}>
          <path d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} />
        </g>
        <g data-garment-part={leftId} data-panel-color={left.cloth}>
          <path d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} />
        </g>

        <g data-garment-part={hoodId} data-panel-color={hood.cloth}>
          <path d={isBack ? HOOD_BACK : HOOD_SHELL} fill={`url(#${id}-hood)`} />
          {isBack ? (
            <path d="M280 82 L280 190" fill="none" stroke={hood.stitch} strokeWidth="1.6" opacity="0.4" />
          ) : (
            <>
              <path d={HOOD_LINING} fill={hood.tape} />
              <path
                d="M230 192 C240 164 320 164 330 192"
                fill="none"
                stroke={hood.highlight}
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.3"
              />
              <path d="M250 204 L238 248" fill="none" stroke={hood.stitch} strokeWidth="2.2" strokeLinecap="round" />
              <path d="M310 204 L322 248" fill="none" stroke={hood.stitch} strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="238" cy="250" r="3" fill={hood.clothDark} />
              <circle cx="322" cy="250" r="3" fill={hood.clothDark} />
            </>
          )}
        </g>

        <g data-garment-part={bodyId} data-panel-color={body.cloth}>
          <path d={isBack ? BODY_BACK : BODY_FRONT} fill={`url(#${id}-body)`} />
        </g>

        <g data-garment-part={cuffRightId} data-panel-color={cuffRight.cloth}>
          <path d={RIGHT_CUFF} fill={cuffRight.rib} />
          <path d="M40 380 H70" fill="none" stroke={cuffRight.stitch} strokeWidth="1.6" opacity="0.4" />
        </g>
        <g data-garment-part={cuffLeftId} data-panel-color={cuffLeft.cloth}>
          <path d={LEFT_CUFF} fill={cuffLeft.rib} />
          <path d="M490 380 H520" fill="none" stroke={cuffLeft.stitch} strokeWidth="1.6" opacity="0.4" />
        </g>
      </g>

      <path d="M172 230 L182 516" fill="none" stroke={body.stitch} strokeWidth="1" opacity="0.2" />
      <path d="M388 230 L378 516" fill="none" stroke={body.stitch} strokeWidth="1" opacity="0.2" />
      <path d="M214 534 H346" fill="none" stroke={body.rib} strokeWidth="10" strokeLinecap="round" opacity="0.55" />
      <path d="M214 528 H346" fill="none" stroke={body.highlight} strokeWidth="1.2" strokeLinecap="round" opacity="0.22" />

      {isBack ? (
        <path
          d="M232 196 C246 226 314 226 328 196"
          fill="none"
          stroke={body.highlight}
          strokeWidth="1.6"
          opacity="0.22"
        />
      ) : (
        <g data-garment-part="kangaroo_pocket">
          <path d={POCKET} fill={body.clothDark} opacity="0.62" />
          <path d="M218 348 L218 434 M342 348 L342 434" fill="none" stroke={body.stitch} strokeWidth="1.8" opacity="0.5" />
          <path d="M224 340 H336" fill="none" stroke={body.highlight} strokeWidth="1.3" opacity="0.2" />
        </g>
      )}
    </g>
  )
}
