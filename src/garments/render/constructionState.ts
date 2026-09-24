import type { ResolvedConstruction } from '@/design/construction'
import type { DesignConstructionPart } from '@/design/types'
import { getCatalogMaterial } from '../materialCatalog'

export function isPresent(part: DesignConstructionPart | null | undefined): boolean {
  return Boolean(part && part.present !== false)
}

export function visibleParts(parts: DesignConstructionPart[]): DesignConstructionPart[] {
  return parts.filter((part) => part.present !== false)
}

export function fabricFilter(id: string, materialId?: string): string | undefined {
  return getCatalogMaterial(materialId) ? `url(#${id}-fabric)` : undefined
}

export function constructionStyle(
  construction: ResolvedConstruction | undefined,
  kind: 'zipper' | 'collar' | 'hood' | 'hem' | 'waistband',
): string | null {
  const part = construction?.[kind]
  return isPresent(part) && part ? part.style : null
}

export function pocketStyle(construction: ResolvedConstruction | undefined): string | null {
  const part = construction ? visibleParts(construction.pockets)[0] : undefined
  return part?.style ?? null
}

export function cuffStyle(construction: ResolvedConstruction | undefined): string | null {
  const part = construction ? visibleParts(construction.cuffs)[0] : undefined
  return part?.style ?? null
}
