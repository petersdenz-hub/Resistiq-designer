import { rectPath } from '../topology'

/**
 * Small top plate around the button.
 * Kept separate from the front face so the crown does not read as a helmet lid.
 */
export const CROWN =
  'M280 198 C246 200 216 216 200 242 C232 226 328 226 360 242 C344 216 314 200 280 198 Z'

/**
 * Front face — both front gores as one printable region.
 * Wide enough for a logo, short enough that the overall cap stays a low crown.
 */
export const FRONT_PANEL =
  'M280 210 C255 218 238 250 228 310 L216 372 L344 372 L332 310 C322 250 305 218 280 210 Z'

/** Wearer's right side panel (drawn on the left). */
export const RIGHT_SIDE =
  'M148 372 C142 318 150 262 184 224 C206 204 238 206 262 212 L228 310 L216 372 Z'

/** Wearer's left side panel (drawn on the right). */
export const LEFT_SIDE =
  'M412 372 C418 318 410 262 376 224 C354 204 322 206 298 212 L332 310 L344 372 Z'

/**
 * Forward visor / bill — a wide crescent attached at the band.
 * Wider than the crown and clearly separated from it. Not a halo or thick ring.
 */
export const BRIM =
  'M162 368 C128 376 108 400 122 428 C148 460 412 460 438 428 C452 400 432 376 398 368 C358 394 222 394 162 368 Z'

/** Thin front lip so the visor has an edge, not a puck. */
export const BRIM_LIP =
  'M122 428 C148 460 412 460 438 428 C436 442 390 482 280 484 C170 482 124 442 122 428 Z'

/** Sweatband at the crown base. */
export const BAND =
  'M148 364 C180 382 380 382 412 364 L406 388 C376 402 184 402 154 388 Z'

/** Back gores with a snapback opening above the closure. */
export const BACK_PANEL =
  'M280 210 C255 218 238 250 228 310 L216 372 L246 372 C254 338 306 338 314 372 L344 372 L332 310 C322 250 305 218 280 210 Z'

/** Adjustable strap / closure window. */
export const CLOSURE =
  'M234 362 C250 348 310 348 326 362 L332 396 C318 408 242 408 228 396 Z'

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

export const BRIM_SEAM = 'M166 370 C222 394 338 394 394 370'
export const BRIM_EDGE = 'M122 428 C148 460 412 460 438 428'
export const BRIM_STITCH_INNER = 'M176 380 C222 400 338 400 384 380'
export const BRIM_STITCH_MID = 'M148 404 C196 430 364 430 412 404'
export const BRIM_STITCH_OUTER = 'M132 420 C176 448 384 448 428 420'
export const CROWN_CENTER_SEAM = 'M280 210 L280 372'
export const CROWN_FRONT_SEAM_LEFT = 'M262 212 L228 310 L216 372'
export const CROWN_FRONT_SEAM_RIGHT = 'M298 212 L332 310 L344 372'
export const CROWN_TOP_SEAM = 'M208 236 C240 216 320 216 352 236'
export const BAND_STITCH = 'M162 372 C196 386 364 386 398 372'
export const CLOSURE_STITCH = rectPath(236, 368, 88, 18)
export const CLOSURE_STRAP = 'M232 374 H328 V390 H232 Z'
export const EYELET_RIGHT = { cx: 176, cy: 268, r: 3 }
export const EYELET_LEFT = { cx: 384, cy: 268, r: 3 }
