import type { DesignMaterial } from '@/design/types'

export interface CatalogMaterial extends DesignMaterial {
  id: string
  name: string
  family: string
  finish: string
  grain: number
  sheen: number
}

/**
 * Local fabric catalog. Not a supplier list — just structured finishes
 * the renderer can show.
 */
export const MATERIAL_CATALOG: CatalogMaterial[] = [
  { id: 'cotton', name: 'Cotton', family: 'cotton', finish: 'matte', grain: 0.09, sheen: 0.03 },
  {
    id: 'heavy_cotton',
    name: 'Heavy Cotton',
    family: 'cotton',
    finish: 'dense',
    grain: 0.16,
    sheen: 0.015,
  },
  {
    id: 'polyester',
    name: 'Polyester',
    family: 'other',
    finish: 'smooth',
    grain: 0.025,
    sheen: 0.15,
  },
  { id: 'nylon', name: 'Nylon', family: 'nylon', finish: 'sheen', grain: 0.015, sheen: 0.26 },
  {
    id: 'softshell',
    name: 'Softshell',
    family: 'nylon',
    finish: 'technical',
    grain: 0.07,
    sheen: 0.19,
  },
  { id: 'fleece', name: 'Fleece', family: 'fleece', finish: 'napped', grain: 0.22, sheen: 0.05 },
  { id: 'denim', name: 'Denim', family: 'denim', finish: 'twill', grain: 0.18, sheen: 0.04 },
]

/** Visual finishes shown in the garment customization UI. */
export const VISUAL_FINISHES = ['cotton', 'fleece', 'nylon', 'softshell', 'polyester', 'denim'] as const

export function visualFinishCatalog(): CatalogMaterial[] {
  return VISUAL_FINISHES.map((id) => getCatalogMaterial(id)).filter(
    (material): material is CatalogMaterial => Boolean(material),
  )
}

export function getCatalogMaterial(id: string | undefined | null): CatalogMaterial | null {
  if (!id) {
    return null
  }
  return MATERIAL_CATALOG.find((material) => material.id === id) ?? null
}

export function toDesignMaterial(material: CatalogMaterial): DesignMaterial {
  return {
    id: material.id,
    name: material.name,
    family: material.family,
    finish: material.finish,
  }
}
