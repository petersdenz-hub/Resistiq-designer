import { rectPath } from '../topology'

/** Top of the crown / button plate. */
export const CROWN =
  'M280 168 C232 172 196 204 184 248 C218 228 342 228 376 248 C364 204 328 172 280 168 Z'

/** Front gore — the print face of the cap. */
export const FRONT_PANEL =
  'M280 176 C250 184 238 228 234 274 L238 352 L322 352 L326 274 C322 228 310 184 280 176 Z'

/** Wearer's right side panel (drawn on the left). */
export const RIGHT_SIDE =
  'M160 344 C152 282 172 208 236 180 L232 274 L236 352 L174 362 C160 356 158 348 160 344 Z'

/** Wearer's left side panel (drawn on the right). */
export const LEFT_SIDE =
  'M400 344 C408 282 388 208 324 180 L328 274 L324 352 L386 362 C400 356 402 348 400 344 Z'

/** Curved visor / brim. */
export const BRIM =
  'M174 354 C124 368 104 416 146 448 C194 486 366 486 414 448 C456 416 436 368 386 354 C348 378 212 378 174 354 Z'

/** Sweatband at the crown base. */
export const BAND =
  'M168 342 C186 356 374 356 392 342 L388 368 C370 380 190 380 172 368 Z'

/** Back gore. */
export const BACK_PANEL =
  'M280 176 C250 184 238 228 234 274 L238 352 L322 352 L326 274 C322 228 310 184 280 176 Z'

/** Adjustable closure / strap window. */
export const CLOSURE =
  'M228 358 H332 V394 H228 Z'

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

export const BRIM_SEAM = 'M176 356 C214 380 346 380 384 356'
export const CROWN_FRONT_SEAM_LEFT = 'M236 182 L234 274 L238 352'
export const CROWN_FRONT_SEAM_RIGHT = 'M324 182 L326 274 L322 352'
export const CROWN_TOP_SEAM = 'M210 232 C240 214 320 214 350 232'
export const BAND_STITCH = 'M176 350 C194 362 366 362 384 350'
export const CLOSURE_STITCH = rectPath(232, 362, 96, 24)
