import { rectPath } from '../topology'

/**
 * Soft gathered peak — knit shaping, not a cap button or helmet lid.
 */
export const CROWN =
  'M280 156 C252 158 226 172 214 196 C242 180 318 180 346 196 C334 172 308 158 280 156 Z'

/**
 * Front face — printable knit panel.
 * Taller and more vertical than a dome so it reads as a watch-cap body.
 */
export const FRONT_CROWN =
  'M280 168 C244 180 224 228 214 300 L202 404 L358 404 L346 300 C336 228 316 180 280 168 Z'

/** Wearer's right side gore (drawn on the left). */
export const RIGHT_SIDE =
  'M156 404 C148 330 150 250 174 198 C196 172 230 164 262 172 L214 300 L202 404 Z'

/** Wearer's left side gore (drawn on the right). */
export const LEFT_SIDE =
  'M404 404 C412 330 410 250 386 198 C364 172 330 164 298 172 L346 300 L358 404 Z'

/**
 * Folded rib cuff — the part that makes this a beanie, not a dome.
 * Wider and thicker than a cap sweatband. No visor.
 */
export const CUFF =
  'M144 394 C174 420 386 420 416 394 L408 474 C376 498 184 498 152 474 Z'

/** Bottom fold so the cuff has an edge, not a flat strip. */
export const CUFF_LIP =
  'M152 474 C184 498 376 498 408 474 C406 484 360 508 280 510 C200 508 154 484 152 474 Z'

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

export const CROWN_CENTER_SEAM = 'M280 168 L280 404'
export const CROWN_SEAM_LEFT = 'M262 172 L214 300 L202 404'
export const CROWN_SEAM_RIGHT = 'M298 172 L346 300 L358 404'
export const CROWN_TOP_DART = 'M214 196 C246 172 314 172 346 196'
export const KNIT_LEFT = 'M246 188 L230 404'
export const KNIT_RIGHT = 'M314 188 L330 404'
export const CUFF_SEAM = 'M152 400 C184 422 376 422 408 400'
export const CUFF_FOLD = 'M160 430 C190 448 370 448 400 430'
export const CUFF_STITCH = 'M158 456 C190 474 370 474 402 456'
export const CUFF_RIB_BOX = { x: 152, y: 404, width: 256, height: 76 }
export const CUFF_RIB_PATH = rectPath(152, 404, 256, 76)
