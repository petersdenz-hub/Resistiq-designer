import { tshirtGarment } from './tshirt'
import type { GarmentDefinition } from './types'

const garments: Record<string, GarmentDefinition> = {
  [tshirtGarment.id]: tshirtGarment,
}

export const AVAILABLE_GARMENTS: GarmentDefinition[] = [tshirtGarment]

/**
 * Future garment types belong in this registry.
 * Do not rewrite the editor to add hoodie, jacket, pants, etc. — add a definition
 * and a renderer, then register it here.
 */
export const PLANNED_GARMENT_LABELS = [
  'Hoodie',
  'Jacket',
  'Pants',
  'Shorts',
  'Leggings',
  'Ski / snowboard',
] as const

export function getGarment(garmentType: string): GarmentDefinition {
  return garments[garmentType] ?? tshirtGarment
}

export function registerGarment(definition: GarmentDefinition): void {
  garments[definition.id] = definition
}
