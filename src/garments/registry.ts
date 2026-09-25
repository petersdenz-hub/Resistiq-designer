import { hoodieGarment } from './hoodie'
import { jacketGarment } from './jacket'
import { completeGarment } from './model'
import { pantsGarment } from './pants'
import { shortsGarment } from './shorts'
import { sweatshirtGarment } from './sweatshirt'
import { tshirtGarment } from './tshirt'
import type { GarmentCategory, GarmentDefinition } from './types'
import { GARMENT_CATEGORY_ORDER, categoryLabel } from './types'

const garments: Record<string, GarmentDefinition> = {}
const builtinIds = [
  tshirtGarment.id,
  hoodieGarment.id,
  sweatshirtGarment.id,
  jacketGarment.id,
  pantsGarment.id,
  shortsGarment.id,
] as const

/**
 * Live catalog. `registerGarment` / `unregisterGarment` keep this array in
 * sync so the editor and picker never hard-code a garment list.
 */
export const AVAILABLE_GARMENTS: GarmentDefinition[] = []
export const GARMENT_CATALOG = AVAILABLE_GARMENTS

/**
 * Labels for categories that are architecturally supported but not shipped.
 * Do not implement these garments here — add a definition later.
 */
export const PLANNED_GARMENT_LABELS = [
  'Cap',
  'Beanie',
  'Gloves',
  'Socks',
  'Bag',
  'Backpack',
] as const

function refreshCatalog() {
  AVAILABLE_GARMENTS.length = 0
  const seen = new Set<string>()
  for (const id of builtinIds) {
    const garment = garments[id]
    if (garment) {
      AVAILABLE_GARMENTS.push(garment)
      seen.add(id)
    }
  }
  for (const [id, garment] of Object.entries(garments)) {
    if (!seen.has(id)) {
      AVAILABLE_GARMENTS.push(garment)
    }
  }
}

function putGarment(definition: GarmentDefinition) {
  garments[definition.id] = completeGarment(definition)
}

putGarment(tshirtGarment)
putGarment(hoodieGarment)
putGarment(sweatshirtGarment)
putGarment(jacketGarment)
putGarment(pantsGarment)
putGarment(shortsGarment)
refreshCatalog()

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

export function listGarments(): GarmentDefinition[] {
  return [...AVAILABLE_GARMENTS]
}

/**
 * Add a garment definition at runtime. The editor, picker, artwork zones,
 * regions, construction and renderer all read this registry — they do not
 * need a special case for the new type.
 */
export function registerGarment(definition: GarmentDefinition): void {
  putGarment(definition)
  refreshCatalog()
}

/** Remove a previously registered non-builtin garment. */
export function unregisterGarment(garmentType: string): boolean {
  if ((builtinIds as readonly string[]).includes(garmentType) || !garments[garmentType]) {
    return false
  }
  delete garments[garmentType]
  refreshCatalog()
  return true
}

export function garmentsInCategory(category: GarmentCategory): GarmentDefinition[] {
  return AVAILABLE_GARMENTS.filter((garment) => garment.category === category)
}

export function garmentCatalogGroups(): {
  category: GarmentCategory
  label: string
  garments: GarmentDefinition[]
}[] {
  return GARMENT_CATEGORY_ORDER.map((category) => ({
    category,
    label: categoryLabel(category),
    garments: garmentsInCategory(category),
  })).filter((group) => group.garments.length > 0)
}
