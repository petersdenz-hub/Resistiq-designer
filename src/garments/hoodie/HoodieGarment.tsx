import type { GarmentRenderProps } from '../types'
import { clothFor, clothShades } from '../render/cloth'
import { CuffCap, FabricFinish, FabricSheen, HemBand, PocketSet } from '../render/constructionDraw'
import {
  constructionStyle,
  constructionVariant,
  cuffStyle,
  fabricFilter,
  pocketStyle,
} from '../render/constructionState'
import { ClothGradient, FlatPart, FlatShadow, Fold, Seam, Stitch } from '../render/flatStyle'
import {
  BODY_BACK,
  BODY_FRONT,
  HOOD_BACK,
  HOOD_SHELL,
  LEFT_CUFF,
  LEFT_SLEEVE,
  RIGHT_CUFF,
  RIGHT_SLEEVE,
} from './geometry'

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
  const waistId = isBack ? 'waistband_back' : 'waistband'
  const waist = clothFor(bodyColor, panelColors, waistId)
  const pocketCloth = clothFor(bodyColor, panelColors, 'pocket')
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
        <ClothGradient id={`${id}-body`} color={body} x1={280} y1={170} x2={280} y2={542} />
        <ClothGradient id={`${id}-hood`} color={hood} x1={280} y1={52} x2={280} y2={204} />
        <ClothGradient id={`${id}-sleeve-r`} color={right} x1={160} y1={184} x2={40} y2={360} />
        <ClothGradient id={`${id}-sleeve-l`} color={left} x1={400} y1={184} x2={520} y2={360} />
        <FlatShadow id={id} />
      </defs>
      <FabricFinish id={id} materialId={materialId} />

      <g filter={fabricFilter(id, materialId) ?? `url(#${id}-soft)`} data-garment-template="hoodie">
        <g data-garment-part={rightId} data-region-id="right-sleeve" data-panel-color={right.cloth}>
          <FlatPart d={RIGHT_SLEEVE} fill={`url(#${id}-sleeve-r)`} stroke={right.stitch} />
        </g>
        <g data-garment-part={leftId} data-region-id="left-sleeve" data-panel-color={left.cloth}>
          <FlatPart d={LEFT_SLEEVE} fill={`url(#${id}-sleeve-l)`} stroke={left.stitch} />
        </g>

        {hoodStyle ? (
          <g
            data-garment-part={hoodId}
            data-region-id="hood"
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
                <Stitch d="M214 198 C230 226 330 226 346 198" color={hood.stitch} />
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

        <g data-garment-part={bodyId} data-region-id={isBack ? 'back-body' : 'front-body'} data-panel-color={body.cloth}>
          <FlatPart d={isBack ? BODY_BACK : BODY_FRONT} fill={`url(#${id}-body)`} stroke={body.stitch} />
        </g>
        <Seam d="M168 224 L152 186" color={body.stitch} width={1.15} opacity={0.34} />
        <Seam d="M392 224 L408 186" color={body.stitch} width={1.15} opacity={0.34} />
        <Stitch d="M176 236 L186 512" color={body.stitch} />
        <Stitch d="M384 236 L374 512" color={body.stitch} />
        <Fold d="M188 248 C220 242 340 242 372 248" color={body.highlight} />
        <Fold d="M70 250 C110 280 148 312 168 326" color={right.highlight} opacity={0.16} />
        <Fold d="M490 250 C450 280 412 312 392 326" color={left.highlight} opacity={0.16} />

        {cuffs ? (
          <>
            <g data-garment-part={cuffRightId} data-region-id="right-cuff" data-panel-color={cuffRight.cloth}>
              <CuffCap
                d={RIGHT_CUFF}
                style={cuffs}
                color={cuffRight}
                stitchPath="M42 372 H72"
                ribBox={{ x: 34, y: 350, width: 44, height: 54 }}
              />
            </g>
            <g data-garment-part={cuffLeftId} data-region-id="left-cuff" data-panel-color={cuffLeft.cloth}>
              <CuffCap
                d={LEFT_CUFF}
                style={cuffs}
                color={cuffLeft}
                stitchPath="M488 372 H518"
                ribBox={{ x: 482, y: 350, width: 44, height: 54 }}
              />
            </g>
          </>
        ) : null}
      </g>

      <Seam d="M174 232 L184 516" color={body.stitch} width={1} opacity={0.22} />
      <Seam d="M386 232 L376 516" color={body.stitch} width={1} opacity={0.22} />
      {hemStyle ? <HemBand style={hemStyle} y={532} left={216} right={344} color={waist} partId={waistId} /> : null}

      {isBack ? (
        <Seam d="M232 196 C246 226 314 226 328 196" color={body.highlight} width={1.6} opacity={0.22} />
      ) : pocket ? (
        <PocketSet
          style={pocket}
          kind="hoodie"
          fill={pocketCloth.detail}
          stitch={pocketCloth.stitch}
          highlight={pocketCloth.highlight}
        />
      ) : null}
      <FabricSheen id={id} materialId={materialId} path={isBack ? BODY_BACK : BODY_FRONT} />
    </g>
  )
}
