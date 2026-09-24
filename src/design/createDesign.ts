import { getGarment } from '@/garments/registry'
import { createId } from './ids'
import type { DesignDocument } from './types'

export function createNewDesign(garmentType = 'tshirt'): DesignDocument {
  const garment = getGarment(garmentType)
  const now = new Date().toISOString()

  return {
    id: createId(),
    name: `Untitled ${garment.label}`,
    version: 1,
    status: 'draft',
    garmentType: garment.id,
    activeView: garment.views[0]?.id ?? 'front',
    views: garment.views.map((view) => ({ id: view.id, label: view.label })),
    colors: [{ id: 'body', role: 'body', value: '#e8e4dc' }],
    materials: [],
    elements: [],
    createdAt: now,
    updatedAt: now,
  }
}
