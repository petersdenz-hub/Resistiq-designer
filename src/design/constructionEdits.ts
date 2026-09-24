import { constructionPartsForStyle } from '@/garments/constructionDefaults'
import { getCatalogMaterial, toDesignMaterial } from '@/garments/materialCatalog'
import type { ResolvedConstruction } from './construction'
import { patchConstruction, upsertMaterial } from './construction'
import type {
  ConstructionKind,
  DesignConstructionPart,
  DesignDocument,
} from './types'

const LIST_KIND_KEY = {
  pocket: 'pockets',
  button: 'buttons',
  cuff: 'cuffs',
} as const

export function styleOf(resolved: ResolvedConstruction, kind: ConstructionKind): string {
  if (kind === 'pocket') {
    return visibleStyle(resolved.pockets)
  }
  if (kind === 'button') {
    return visibleStyle(resolved.buttons)
  }
  if (kind === 'cuff') {
    return visibleStyle(resolved.cuffs)
  }
  const part = resolved[kind]
  if (!part || part.present === false) {
    return 'none'
  }
  return part.style
}

function visibleStyle(parts: DesignConstructionPart[]): string {
  const part = parts.find((item) => item.present !== false)
  return part?.style ?? 'none'
}

export function setConstructionStyle(
  document: DesignDocument,
  kind: ConstructionKind,
  style: string,
): DesignDocument {
  if (style === 'none') {
    if (kind === 'pocket' || kind === 'button' || kind === 'cuff') {
      return patchConstruction(document, { [LIST_KIND_KEY[kind]]: [] })
    }
    return patchConstruction(document, { [kind]: null })
  }

  const parts = constructionPartsForStyle(document.garmentType, kind, style)
  if (kind === 'pocket' || kind === 'button' || kind === 'cuff') {
    return patchConstruction(document, { [LIST_KIND_KEY[kind]]: parts })
  }
  return patchConstruction(document, { [kind]: parts[0] ?? null })
}

export function setGarmentMaterial(document: DesignDocument, materialId: string): DesignDocument {
  const catalog = getCatalogMaterial(materialId)
  if (!catalog) {
    return document
  }
  const withMaterial = upsertMaterial(document, toDesignMaterial(catalog))
  return patchConstruction(withMaterial, { materialId: catalog.id })
}

export function resolvedMaterialId(document: DesignDocument): string | undefined {
  return document.construction?.materialId
}
