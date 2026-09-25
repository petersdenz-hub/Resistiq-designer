import { sanitizeConstruction } from '@/design/construction'
import { sanitizeActiveZone, sanitizeDesignObjects } from '@/design/designObjects'
import type { DesignColor, DesignDocument, DesignMaterial } from '@/design/types'
import { COLOR_ROLES } from '@/design/types'
import { resolveGarmentType } from '@/garments/registry'
import { normalizeHex } from '@/ui/color'

function sanitizeColors(value: DesignColor[]): DesignColor[] {
  return value
    .filter((color) => typeof color?.id === 'string' && color.id.length > 0 && typeof color.value === 'string')
    .map((color) => ({
      id: color.id,
      role: (COLOR_ROLES as readonly string[]).includes(color.role) ? color.role : 'panel',
      value: normalizeHex(color.value) ?? color.value,
    }))
}

function sanitizeMaterials(value: DesignMaterial[]): DesignMaterial[] {
  return value
    .filter((material) => typeof material?.id === 'string' && material.id.length > 0)
    .map((material) => ({
      id: material.id,
      name: typeof material.name === 'string' && material.name.length > 0 ? material.name : material.id,
      finish: typeof material.finish === 'string' ? material.finish : undefined,
      family: typeof material.family === 'string' ? material.family : undefined,
    }))
}

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
    colors: sanitizeColors(document.colors ?? []),
    materials: sanitizeMaterials(document.materials ?? []),
    ...(construction ? { construction } : { construction: undefined }),
    ...(designObjects ? { designObjects } : { designObjects: undefined }),
    ...(activeZone ? { activeZone } : { activeZone: undefined }),
  }
}
