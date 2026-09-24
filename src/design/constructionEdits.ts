import { pocketSlot, resolveConstruction, type ResolvedConstruction } from './construction'
import { constructionPartsForStyle } from '@/garments/constructionDefaults'
import { getCatalogMaterial, toDesignMaterial } from '@/garments/materialCatalog'
import { patchConstruction, setConstructionPart, upsertMaterial } from './construction'
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

export function styleOf(
  resolved: ResolvedConstruction,
  kind: ConstructionKind,
  slot?: string,
): string {
  if (kind === 'pocket') {
    const parts = slot
      ? resolved.pockets.filter((item) => pocketSlot(item, guessGarment(resolved)) === slot)
      : resolved.pockets
    return visibleStyle(parts)
  }
  if (kind === 'button') {
    return visibleStyle(resolved.buttons)
  }
  if (kind === 'cuff') {
    return visibleStyle(resolved.cuffs)
  }
  if (kind === 'belt_loop') {
    const part = resolved.beltLoops
    if (!part || part.present === false) {
      return 'none'
    }
    return part.style
  }
  const part = resolved[kind]
  if (!part || part.present === false) {
    return 'none'
  }
  return part.style
}

export function variantOf(
  resolved: ResolvedConstruction,
  kind: 'zipper' | 'hood',
  fallback: string,
): string {
  const part = resolved[kind]
  if (!part || part.present === false) {
    return fallback
  }
  return part.variant ?? fallback
}

function guessGarment(resolved: ResolvedConstruction): string {
  if (resolved.hood) return 'hoodie'
  if (resolved.zipper) return 'jacket'
  if (resolved.waistband) return 'pants'
  return 'tshirt'
}

function visibleStyle(parts: DesignConstructionPart[]): string {
  const part = parts.find((item) => item.present !== false && item.style !== 'none')
  return part?.style ?? 'none'
}

export function setConstructionStyle(
  document: DesignDocument,
  kind: ConstructionKind,
  style: string,
  slot?: string,
): DesignDocument {
  if (kind === 'pocket') {
    return setPocketStyle(document, style, slot)
  }

  if (style === 'none') {
    if (kind === 'button' || kind === 'cuff') {
      return patchConstruction(document, { [LIST_KIND_KEY[kind]]: [] })
    }
    const key = kind === 'belt_loop' ? 'beltLoops' : kind
    return patchConstruction(document, { [key]: null })
  }

  const parts = constructionPartsForStyle(document.garmentType, kind, style, slot)
  if (kind === 'button' || kind === 'cuff') {
    return patchConstruction(document, { [LIST_KIND_KEY[kind]]: parts })
  }
  const key = kind === 'belt_loop' ? 'beltLoops' : kind
  return patchConstruction(document, { [key]: parts[0] ?? null })
}

function setPocketStyle(document: DesignDocument, style: string, slot?: string): DesignDocument {
  const stored = document.construction?.pockets
  if (!slot) {
    if (style === 'none') {
      return patchConstruction(document, { pockets: [] })
    }
    return patchConstruction(document, {
      pockets: constructionPartsForStyle(document.garmentType, 'pocket', style),
    })
  }

  const current = stored ?? []
  const remaining = current.filter((part) => pocketSlot(part, document.garmentType) !== slot)
  if (style === 'none') {
    return patchConstruction(document, {
      pockets: [
        ...remaining,
        {
          id: `${slot}_pocket`,
          kind: 'pocket',
          style: 'none',
          present: false,
          slot,
        },
      ],
    })
  }
  return patchConstruction(document, {
    pockets: [...remaining, ...constructionPartsForStyle(document.garmentType, 'pocket', style, slot)],
  })
}

export function setConstructionVariant(
  document: DesignDocument,
  kind: 'zipper' | 'hood',
  variant: string,
): DesignDocument {
  const resolved = resolveConstruction(document)
  const current = resolved[kind]
  if (!current) {
    const created = constructionPartsForStyle(document.garmentType, kind, kind === 'hood' ? 'pullover' : 'center_front')
    const next = created[0]
    if (!next) {
      return document
    }
    return setConstructionPart(document, { ...next, variant })
  }
  return setConstructionPart(document, { ...current, variant })
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
