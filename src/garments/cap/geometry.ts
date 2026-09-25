import { rectPath } from '../topology'

/**
 * Top gores only — the small plate around the button.
 * Kept separate from the front shield so the crown does not read as a helmet lid.
 */
export const CROWN =
  'M280 166 C248 168 218 182 202 210 C232 196 328 196 358 210 C342 182 312 168 280 166 Z'

/**
 * Front shield — both front gores as one printable region.
 * Wider at the band so a logo sits on a cap face, not a tall rectangle.
 */
export const FRONT_PANEL =
  'M280 176 C254 184 234 214 222 262 L208 358 L352 358 L338 262 C326 214 306 184 280 176 Z'

/** Wearer's right side panel (drawn on the left). */
export const RIGHT_SIDE =
  'M150 358 C146 302 156 238 184 198 C204 176 236 170 264 176 L222 262 L208 358 Z'

/** Wearer's left side panel (drawn on the right). */
export const LEFT_SIDE =
  'M410 358 C414 302 404 238 376 198 C356 176 324 170 296 176 L338 262 L352 358 Z'

/**
 * Forward visor / bill — a thin crescent attached at the band.
 * Not a halo or thick ring.
 */
export const BRIM =
  'M188 356 C150 368 138 388 158 406 C190 426 370 426 402 406 C422 388 410 368 372 356 C332 374 228 374 188 356 Z'

/** Thin front lip so the visor has an edge, not a puck. */
export const BRIM_LIP =
  'M158 406 C190 426 370 426 402 406 C400 414 366 434 280 434 C194 434 160 414 158 406 Z'

/** Sweatband at the crown base. */
export const BAND =
  'M150 350 C174 366 386 366 410 350 L406 376 C382 390 178 390 154 376 Z'

/** Back gores with a snapback opening above the closure. */
export const BACK_PANEL =
  'M280 176 C254 184 234 214 222 262 L208 358 L236 358 C246 322 314 322 324 358 L352 358 L338 262 C326 214 306 184 280 176 Z'

/** Adjustable strap / closure window. */
export const CLOSURE =
  'M230 350 C246 336 314 336 330 350 L336 384 C322 394 238 394 224 384 Z'

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

export const BRIM_SEAM = 'M190 358 C228 374 332 374 370 358'
export const BRIM_EDGE = 'M158 406 C190 426 370 426 402 406'
export const BRIM_STITCH_INNER = 'M200 366 C232 380 328 380 360 366'
export const BRIM_STITCH_MID = 'M180 384 C216 400 344 400 380 384'
export const BRIM_STITCH_OUTER = 'M166 398 C202 416 358 416 394 398'
export const CROWN_CENTER_SEAM = 'M280 176 L280 358'
export const CROWN_FRONT_SEAM_LEFT = 'M264 176 L222 262 L208 358'
export const CROWN_FRONT_SEAM_RIGHT = 'M296 176 L338 262 L352 358'
export const CROWN_TOP_SEAM = 'M214 206 C242 186 318 186 346 206'
export const BAND_STITCH = 'M164 360 C190 372 370 372 396 360'
export const CLOSURE_STITCH = rectPath(232, 356, 96, 20)
export const CLOSURE_STRAP = 'M228 362 H332 V378 H228 Z'
export const EYELET_RIGHT = { cx: 184, cy: 228, r: 3 }
export const EYELET_LEFT = { cx: 376, cy: 228, r: 3 }
