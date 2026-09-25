import { rectPath } from '../topology'

/**
 * Soft crown peak — gathered knit, not a cap button.
 * Kept as a small plate so the top reads as beanie shaping.
 */
export const CROWN =
  'M280 162 C246 164 216 182 200 214 C230 194 330 194 360 214 C344 182 314 164 280 162 Z'

/**
 * Front face — printable knit panel.
 * Taller than a cap front so marks sit on a hat body, not a visor.
 */
export const FRONT_CROWN =
  'M280 178 C246 190 226 232 216 304 L204 404 L356 404 L344 304 C334 232 314 190 280 178 Z'

/** Wearer's right side gore (drawn on the left). */
export const RIGHT_SIDE =
  'M160 404 C150 338 156 268 188 214 C210 188 242 176 266 180 L216 304 L204 404 Z'

/** Wearer's left side gore (drawn on the right). */
export const LEFT_SIDE =
  'M400 404 C410 338 404 268 372 214 C350 188 318 176 294 180 L344 304 L356 404 Z'

/**
 * Folded rib cuff — the part that makes this a beanie, not a dome.
 * Wider and thicker than a cap sweatband. No visor.
 */
export const CUFF =
  'M148 396 C176 418 384 418 412 396 L406 470 C376 492 184 492 154 470 Z'

/** Bottom fold so the cuff has an edge, not a flat strip. */
export const CUFF_LIP =
  'M154 470 C184 492 376 492 406 470 C404 480 360 504 280 506 C200 504 156 480 154 470 Z'

export const BACK_CROWN = FRONT_CROWN
export const CROWN_BACK = CROWN
export const RIGHT_SIDE_BACK = LEFT_SIDE
export const LEFT_SIDE_BACK = RIGHT_SIDE
export const CUFF_BACK = CUFF

export const BEANIE_PATHS: Record<string, string> = {
  crown: CROWN,
  crown_back: CROWN_BACK,
  front_crown: FRONT_CROWN,
  back_crown: BACK_CROWN,
  right_side: RIGHT_SIDE,
  left_side: LEFT_SIDE,
  right_side_back: RIGHT_SIDE_BACK,
  left_side_back: LEFT_SIDE_BACK,
  cuff: CUFF,
  cuff_back: CUFF_BACK,
}

export const CROWN_CENTER_SEAM = 'M280 178 L280 404'
export const CROWN_SEAM_LEFT = 'M266 180 L216 304 L204 404'
export const CROWN_SEAM_RIGHT = 'M294 180 L344 304 L356 404'
export const CROWN_TOP_DART = 'M218 214 C246 184 314 184 342 214'
export const KNIT_LEFT = 'M246 198 L232 404'
export const KNIT_RIGHT = 'M314 198 L328 404'
export const CUFF_SEAM = 'M156 402 C186 420 374 420 404 402'
export const CUFF_FOLD = 'M162 428 C190 444 370 444 398 428'
export const CUFF_STITCH = 'M160 454 C190 470 370 470 400 454'
export const CUFF_RIB_BOX = { x: 156, y: 404, width: 248, height: 72 }
export const CUFF_RIB_PATH = rectPath(156, 404, 248, 72)
