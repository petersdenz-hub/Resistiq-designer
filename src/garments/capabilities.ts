/**
 * Feature flags on a garment definition.
 *
 * These describe what the garment can support later (pockets, zippers,
 * materials, lining) without requiring the editor to implement every
 * feature now. A zipper on a jacket is garment structure. A logo next
 * to that zipper is a design element.
 */
export interface GarmentCapabilities {
  hood: boolean
  sleeves: boolean
  collar: boolean
  zipper: boolean
  pockets: boolean
  printAreas: boolean
  frontBack: boolean
  cuffs: boolean
  legs: boolean
  buttons: boolean
  waistband: boolean
  hem: boolean
  materials: boolean
}

export const DEFAULT_GARMENT_CAPABILITIES: GarmentCapabilities = {
  hood: false,
  sleeves: false,
  collar: false,
  zipper: false,
  pockets: false,
  printAreas: true,
  frontBack: true,
  cuffs: false,
  legs: false,
  buttons: false,
  waistband: false,
  hem: false,
  materials: true,
}

export function garmentCapabilities(
  overrides: Partial<GarmentCapabilities> = {},
): GarmentCapabilities {
  return { ...DEFAULT_GARMENT_CAPABILITIES, ...overrides }
}
