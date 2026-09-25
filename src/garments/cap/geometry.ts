import { rectPath } from '../topology'

/** Upper crown / top gores meeting at the button. */
export const CROWN =
  'M280 148 C234 150 190 176 174 226 C212 204 348 204 386 226 C370 176 326 150 280 148 Z'

/** Front gore — the print face of a 5-panel cap. */
export const FRONT_PANEL =
  'M280 162 C250 172 238 216 234 270 L228 332 L332 332 L326 270 C322 216 310 172 280 162 Z'

/** Wearer's right side panel (drawn on the left). */
export const RIGHT_SIDE =
  'M164 330 C150 268 168 194 226 158 L234 270 L228 332 L176 344 C162 338 158 332 164 330 Z'

/** Wearer's left side panel (drawn on the right). */
export const LEFT_SIDE =
  'M396 330 C410 268 392 194 334 158 L326 270 L332 332 L384 344 C398 338 402 332 396 330 Z'

/** Forward visor / bill — attached at the front of the band, not a halo. */
export const BRIM =
  'M210 328 C168 346 140 384 162 418 C196 448 364 448 398 418 C420 384 392 346 350 328 C318 346 242 346 210 328 Z'

/** Front lip of the visor so the brim reads with thickness. */
export const BRIM_LIP =
  'M162 418 C196 448 364 448 398 418 C398 430 364 458 280 458 C196 458 162 430 162 418 Z'

/** Sweatband at the crown base. */
export const BAND =
  'M162 322 C184 340 376 340 398 322 L392 356 C370 370 190 370 168 356 Z'

/** Back gore. */
export const BACK_PANEL =
  'M280 162 C250 172 238 216 234 270 L228 332 L248 332 C256 306 304 306 312 332 L332 332 L326 270 C322 216 310 172 280 162 Z'

/** Adjustable closure / strap window on the back. */
export const CLOSURE =
  'M226 336 C244 324 316 324 334 336 L338 380 L222 380 Z'

export const CROWN_BACK = CROWN
export const RIGHT_SIDE_BACK = LEFT_SIDE
export const LEFT_SIDE_BACK = RIGHT_SIDE
export const BAND_BACK = BAND

export const CAP_PATHS: Record<string, string> = {
  crown: CROWN,
  crown_back: CROWN_BACK,
  front_panel: FRONT_PANEL,
  back_panel: BACK_PANEL,
  right_side: RIGHT_SIDE,
  left_side: LEFT_SIDE,
  right_side_back: RIGHT_SIDE_BACK,
  left_side_back: LEFT_SIDE_BACK,
  brim: BRIM,
  band: BAND,
  band_back: BAND_BACK,
  closure: CLOSURE,
}

export const BRIM_SEAM = 'M212 330 C244 346 316 346 348 330'
export const BRIM_EDGE = 'M162 418 C196 448 364 448 398 418'
export const BRIM_STITCH_INNER = 'M218 338 C246 352 314 352 342 338'
export const BRIM_STITCH_MID = 'M196 368 C228 392 332 392 364 368'
export const BRIM_STITCH_OUTER = 'M174 400 C206 426 354 426 386 400'
export const CROWN_FRONT_SEAM_LEFT = 'M226 160 L234 270 L228 332'
export const CROWN_FRONT_SEAM_RIGHT = 'M334 160 L326 270 L332 332'
export const CROWN_TOP_SEAM = 'M196 214 C230 192 330 192 364 214'
export const BAND_STITCH = 'M176 334 C196 348 364 348 384 334'
export const CLOSURE_STITCH = rectPath(228, 348, 104, 22)
export const EYELET_RIGHT = { cx: 198, cy: 214, r: 3.4 }
export const EYELET_LEFT = { cx: 362, cy: 214, r: 3.4 }
