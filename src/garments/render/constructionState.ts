import type { ResolvedConstruction } from '@/design/construction'
import { pocketSlot } from '@/design/construction'
import type { DesignConstructionPart } from '@/design/types'
import { getCatalogMaterial } from '../materialCatalog'

export function isPresent(part: DesignConstructionPart | null | undefined): boolean {
  return Boolean(part && part.present !== false && part.style !== 'none')
}

export function visibleParts(parts: DesignConstructionPart[]): DesignConstructionPart[] {
  return parts.filter((part) => part.present !== false && part.style !== 'none')
}

export function fabricFilter(id: string, materialId?: string): string | undefined {
  return getCatalogMaterial(materialId) ? `url(#${id}-fabric)` : undefined
}

export function constructionStyle(
  construction: ResolvedConstruction | undefined,
  kind: 'zipper' | 'collar' | 'hood' | 'hem' | 'waistband' | 'drawstring' | 'beltLoops',
): string | null {
  const part = construction?.[kind]
  return isPresent(part) && part ? part.style : null
}

export function constructionVariant(
  construction: ResolvedConstruction | undefined,
  kind: 'zipper' | 'hood',
  fallback: string,
): string {
  const part = construction?.[kind]
  if (!isPresent(part) || !part) {
    return fallback
  }
  return part.variant ?? fallback
}

export function pocketStyle(
  construction: ResolvedConstruction | undefined,
  slot?: string,
  garmentType = 'hoodie',
): string | null {
  if (!construction) {
    return null
  }
  const parts = slot
    ? visibleParts(construction.pockets).filter((part) => pocketSlot(part, garmentType) === slot)
    : visibleParts(construction.pockets)
  return parts[0]?.style ?? null
}

export function cuffStyle(construction: ResolvedConstruction | undefined): string | null {
  const part = construction ? visibleParts(construction.cuffs)[0] : undefined
  return part?.style ?? null
}
