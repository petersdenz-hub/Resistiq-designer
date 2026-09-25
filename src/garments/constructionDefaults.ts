import type { ConstructionKind, DesignConstruction, DesignConstructionPart } from '@/design/types'
import { constructionFromDefinition, partsForStyle } from './constructionCatalog'
import { getGarment } from './registry'

/**
 * Read-time defaults from the garment definition.
 * These are never written onto existing documents.
 */
export function defaultConstructionFor(garmentType: string): DesignConstruction {
  return constructionFromDefinition(getGarment(garmentType))
}

/** Parts written when the user picks a style. Not used for missing-data fallback. */
export function constructionPartsForStyle(
  garmentType: string,
  kind: ConstructionKind,
  style: string,
  slot?: string,
): DesignConstructionPart[] {
  return partsForStyle(getGarment(garmentType), kind, style, slot)
}
