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
  { id: 'cotton', name: 'Cotton', family: 'cotton', finish: 'matte', grain: 0.08, sheen: 0.04 },
  {
    id: 'heavy_cotton',
    name: 'Heavy Cotton',
    family: 'cotton',
    finish: 'dense',
    grain: 0.14,
    sheen: 0.02,
  },
  {
    id: 'polyester',
    name: 'Polyester',
    family: 'other',
    finish: 'smooth',
    grain: 0.03,
    sheen: 0.12,
  },
  { id: 'nylon', name: 'Nylon', family: 'nylon', finish: 'sheen', grain: 0.02, sheen: 0.2 },
  {
    id: 'softshell',
    name: 'Softshell',
    family: 'nylon',
    finish: 'technical',
    grain: 0.06,
    sheen: 0.16,
  },
  { id: 'fleece', name: 'Fleece', family: 'fleece', finish: 'napped', grain: 0.18, sheen: 0.06 },
]

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
