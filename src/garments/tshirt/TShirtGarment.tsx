import type { GarmentRenderProps } from '../types'
import { clothFor } from '../render/cloth'
import { FabricFinish, FabricSheen, HemBand } from '../render/constructionDraw'
import { constructionStyle, cuffStyle, fabricFilter } from '../render/constructionState'
import { FlatPart, FlatShadow, Fold, Seam } from '../render/flatStyle'

/**
 * Fashion-flat T-shirt. Body, sleeves, and collar are separate parts so
 * panels can sit on real garment structure.
 *
 * Coordinates assume viewBox 560×640, center x=280.
 */

const BODY_FRONT =
  'M176 228 L188 486 C188 500 200 508 216 508 L344 508 C360 508 372 500 372 486 L384 228 L398 148 L324 148 C314 184 246 184 236 148 L162 148 L176 228 Z'

const BODY_FRONT_VNECK =
  'M176 228 L188 486 C188 500 200 508 216 508 L344 508 C360 508 372 500 372 486 L384 228 L398 148 L324 148 L280 214 L236 148 L162 148 L176 228 Z'

const BODY_BACK =
  'M176 228 L188 486 C188 500 200 508 216 508 L344 508 C360 508 372 500 372 486 L384 228 L398 148 L318 148 C310 164 250 164 242 148 L162 148 L176 228 Z'

const RIGHT_SLEEVE =
  'M162 148 L68 172 L86 230 L176 228 L162 148 Z'

const LEFT_SLEEVE =
  'M398 148 L492 172 L474 230 L384 228 L398 148 Z'

const COLLAR_CREW_FRONT =
  'M228 146 C240 188 320 188 332 146 L324 148 C314 184 246 184 236 148 Z'

const COLLAR_CREW_BACK =
  'M234 146 C244 166 316 166 326 146 L318 148 C310 164 250 164 242 148 Z'

const COLLAR_RIB_FRONT =
  'M222 140 C236 196 324 196 338 140 L324 148 C314 184 246 184 236 148 Z'

const COLLAR_RIB_BACK =
  'M228 140 C240 174 320 174 332 140 L318 148 C310 164 250 164 242 148 Z'

const COLLAR_STAND_FRONT =
  'M216 124 L236 168 L324 168 L344 124 C330 112 230 112 216 124 Z'

const COLLAR_STAND_BACK =
  'M224 126 L240 164 L320 164 L336 126 C324 116 236 116 224 126 Z'

const COLLAR_VNECK_FRONT =
  'M228 146 L280 208 L332 146 L324 148 L280 196 L236 148 Z'

const COLLAR_VNECK_BACK =
  'M234 146 C244 166 316 166 326 146 L318 148 C310 164 250 164 242 148 Z'

export function TShirtGarment({ viewId, bodyColor, panelColors, construction }: GarmentRenderProps) {
  const isBack = viewId === 'back'
  const bodyId = isBack ? 'back_body' : 'front_body'
  const rightId = isBack ? 'right_sleeve_back' : 'right_sleeve'
  const leftId = isBack ? 'left_sleeve_back' : 'left_sleeve'
  const collarId = isBack ? 'collar_back' : 'collar'
  const body = clothFor(bodyColor, panelColors, bodyId)
  const right = clothFor(bodyColor, panelColors, rightId)
  const left = clothFor(bodyColor, panelColors, leftId)
  const collar = clothFor(bodyColor, panelColors, collarId)
  const id = `tshirt-${viewId}`
  const collarStyle = construction
    ? constructionStyle(construction, 'collar')
    : 'crew'
  const hemStyle = construction ? constructionStyle(construction, 'hem') : 'coverstitch'
  const sleeveHem = construction ? cuffStyle(construction) : 'coverstitch'
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
            ? COLLAR_VNECK_BACK
            : COLLAR_VNECK_FRONT
          : isBack
            ? COLLAR_CREW_BACK
            : COLLAR_CREW_FRONT

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-body`} x1="280" y1="140" x2="280" y2="510" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={body.highlight} />
          <stop offset="0.4" stopColor={body.cloth} />
          <stop offset="1" stopColor={body.clothDeep} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-r`} x1="170" y1="148" x2="70" y2="230" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={right.cloth} />
          <stop offset="1" stopColor={right.clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-sleeve-l`} x1="390" y1="148" x2="490" y2="230" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={left.cloth} />
          <stop offset="1" stopColor={left.clothDark} />
        </linearGradient>
        <linearGradient id={`${id}-collar`} x1="280" y1="146" x2="280" y2="188" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={collar.highlight} />
          <stop offset="1" stopColor={collar.rib} />
        </linearGradient>
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template="tshirt">
        <g data-garment-part={rightId} data-panel-color={right.cloth}>
          <FlatPart d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} stroke={right.stitch} />
          {sleeveHem ? (
            <path
              d="M72 226 L170 224"
              fill="none"
              stroke={sleeveHem === 'rib' ? right.rib : right.stitch}
              strokeWidth={sleeveHem === 'rib' ? 5 : sleeveHem === 'raw' ? 1.1 : 2}
              strokeLinecap="round"
              opacity="0.5"
              data-construction-kind="cuff"
              data-construction-style={sleeveHem}
            />
          ) : null}
        </g>

        <g data-garment-part={leftId} data-panel-color={left.cloth}>
          <FlatPart d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} stroke={left.stitch} />
          {sleeveHem ? (
            <path
              d="M390 224 L488 226"
              fill="none"
              stroke={sleeveHem === 'rib' ? left.rib : left.stitch}
              strokeWidth={sleeveHem === 'rib' ? 5 : sleeveHem === 'raw' ? 1.1 : 2}
              strokeLinecap="round"
              opacity="0.5"
              data-construction-kind="cuff"
              data-construction-style={sleeveHem}
            />
          ) : null}
        </g>

        <g data-garment-part={bodyId} data-panel-color={body.cloth}>
          <FlatPart
            d={isBack ? BODY_BACK : collarStyle === 'vneck' ? BODY_FRONT_VNECK : BODY_FRONT}
            fill={`url(#${id}-body)`}
            stroke={body.stitch}
          />
        </g>

        <Seam d="M180 236 L190 492" color={body.stitch} />
        <Seam d="M380 236 L370 492" color={body.stitch} />
        <Seam d="M176 228 L384 228" color={body.stitch} width={1.05} opacity={0.22} />
        <Fold d="M196 250 C220 246 340 246 364 250" color={body.highlight} />
        <Fold d="M80 188 C110 204 148 216 168 220" color={right.highlight} />
        <Fold d="M480 188 C450 204 412 216 392 220" color={left.highlight} />
        {hemStyle ? <HemBand style={hemStyle} y={500} left={216} right={344} color={body} /> : null}

        {collarStyle ? (
          <g
            data-garment-part={collarId}
            data-panel-color={collar.cloth}
            data-construction-kind="collar"
            data-construction-style={collarStyle}
          >
            <FlatPart
              d={collarPath}
              fill={collarStyle === 'vneck' ? collar.rib : `url(#${id}-collar)`}
              stroke={collar.stitch}
            />
            <path
              d={
                collarStyle === 'stand'
                  ? isBack
                    ? 'M244 146 H316'
                    : 'M230 148 H330'
                  : collarStyle === 'vneck'
                    ? isBack
                      ? 'M244 148 C254 162 306 162 316 148'
                      : 'M238 150 L280 196 L322 150'
                    : isBack
                      ? 'M244 148 C254 162 306 162 316 148'
                      : 'M238 148 C250 180 310 180 322 148'
              }
              fill="none"
              stroke={collar.highlight}
              strokeWidth={collarStyle === 'rib' ? 2.2 : 1.6}
              strokeLinecap="round"
              opacity="0.35"
            />
          </g>
        ) : null}
      </g>

      {isBack ? (
        <g data-garment-part="neck-tape">
          <rect x="269" y="158" width="22" height="9" rx="1.2" fill={body.clothDark} opacity="0.8" />
        </g>
      ) : (
        <path
          d="M168 160 C210 152 350 152 392 160"
          fill="none"
          stroke={body.highlight}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.16"
        />
      )}
      <FabricSheen
        id={id}
        materialId={materialId}
        path={isBack ? BODY_BACK : collarStyle === 'vneck' ? BODY_FRONT_VNECK : BODY_FRONT}
      />
    </g>
  )
}
