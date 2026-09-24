import { hoodieGarment } from './hoodie'
import { jacketGarment } from './jacket'
import { pantsGarment } from './pants'
import { shortsGarment } from './shorts'
import { tshirtGarment } from './tshirt'
import type { GarmentDefinition } from './types'

const garments: Record<string, GarmentDefinition> = {
  [tshirtGarment.id]: tshirtGarment,
  [hoodieGarment.id]: hoodieGarment,
  [jacketGarment.id]: jacketGarment,
  [pantsGarment.id]: pantsGarment,
  [shortsGarment.id]: shortsGarment,
}

export const AVAILABLE_GARMENTS: GarmentDefinition[] = [
  tshirtGarment,
  hoodieGarment,
  jacketGarment,
  pantsGarment,
  shortsGarment,
]

/**
 * Future garment types belong in this registry.
 * Add a definition and a renderer, then register it here.
 */
export const PLANNED_GARMENT_LABELS = ['Leggings', 'Ski / snowboard'] as const

export function hasGarment(garmentType: string | undefined | null): boolean {
  return Boolean(garmentType && garments[garmentType])
}

/**
 * Unknown or missing types resolve to T-shirt so older documents keep opening.
 */
export function resolveGarmentType(garmentType?: string | null): string {
  if (garmentType && garments[garmentType]) {
    return garments[garmentType].id
  }
  return tshirtGarment.id
}

export function getGarment(garmentType: string | undefined | null): GarmentDefinition {
  return garments[resolveGarmentType(garmentType)] ?? tshirtGarment
}

export function registerGarment(definition: GarmentDefinition): void {
  garments[definition.id] = definition
}
