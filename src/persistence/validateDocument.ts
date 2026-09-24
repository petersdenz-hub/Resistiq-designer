import { sanitizeConstruction } from '@/design/construction'
import { sanitizeActiveZone, sanitizeDesignObjects } from '@/design/designObjects'
import type { DesignDocument } from '@/design/types'
import { resolveGarmentType } from '@/garments/registry'

export function isDesignDocument(value: unknown): value is DesignDocument {
  if (!value || typeof value !== 'object') {
    return false
  }

  const document = value as DesignDocument
  const garmentOk =
    document.garmentType === undefined || typeof document.garmentType === 'string'

  return (
    typeof document.id === 'string' &&
    typeof document.name === 'string' &&
    garmentOk &&
    Array.isArray(document.views) &&
    Array.isArray(document.panels) &&
    Array.isArray(document.safeAreas) &&
    Array.isArray(document.colors) &&
    Array.isArray(document.elements)
  )
}

/** Older drafts without garmentType are T-shirts. Unknown types also fall back. */
export function normalizeDocument(document: DesignDocument): DesignDocument {
  const construction = sanitizeConstruction(document.construction)
  const designObjects = sanitizeDesignObjects(document.designObjects)
  const activeZone = sanitizeActiveZone(document.activeZone)
  return {
    ...document,
    garmentType: resolveGarmentType(document.garmentType),
    ...(construction ? { construction } : { construction: undefined }),
    ...(designObjects ? { designObjects } : { designObjects: undefined }),
    ...(activeZone ? { activeZone } : { activeZone: undefined }),
  }
}
