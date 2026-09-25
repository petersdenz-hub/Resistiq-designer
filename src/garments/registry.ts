import { hoodieGarment } from './hoodie'
import { jacketGarment } from './jacket'
import { completeGarment } from './model'
import { pantsGarment } from './pants'
import { shortsGarment } from './shorts'
import { sweatshirtGarment } from './sweatshirt'
import { tshirtGarment } from './tshirt'
import type { GarmentCategory, GarmentDefinition } from './types'
import { GARMENT_CATEGORY_LABELS } from './types'

const garments: Record<string, GarmentDefinition> = {
  [tshirtGarment.id]: completeGarment(tshirtGarment),
  [hoodieGarment.id]: completeGarment(hoodieGarment),
  [sweatshirtGarment.id]: completeGarment(sweatshirtGarment),
  [jacketGarment.id]: completeGarment(jacketGarment),
  [pantsGarment.id]: completeGarment(pantsGarment),
  [shortsGarment.id]: completeGarment(shortsGarment),
}

export const AVAILABLE_GARMENTS: GarmentDefinition[] = [
  garments.tshirt,
  garments.hoodie,
  garments.sweatshirt,
  garments.jacket,
  garments.pants,
  garments.shorts,
]

export const GARMENT_CATALOG = AVAILABLE_GARMENTS

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
  return garments[resolveGarmentType(garmentType)] ?? garments.tshirt
}

export function registerGarment(definition: GarmentDefinition): void {
  garments[definition.id] = completeGarment(definition)
}

export function garmentsInCategory(category: GarmentCategory): GarmentDefinition[] {
  return AVAILABLE_GARMENTS.filter((garment) => garment.category === category)
}

export function garmentCatalogGroups(): {
  category: GarmentCategory
  label: string
  garments: GarmentDefinition[]
}[] {
  return (['tops', 'outerwear', 'bottoms'] as const).map((category) => ({
    category,
    label: GARMENT_CATEGORY_LABELS[category],
    garments: garmentsInCategory(category),
  }))
}
