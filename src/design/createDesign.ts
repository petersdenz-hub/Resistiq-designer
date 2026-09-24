import { getGarment } from '@/garments/registry'
import { createId } from './ids'
import type { DesignDocument } from './types'

export function createNewDesign(garmentType = 'tshirt'): DesignDocument {
  const garment = getGarment(garmentType)
  const now = new Date().toISOString()
  const activeView = garment.views[0]?.id ?? 'front'

  return {
    id: createId(),
    name: `Untitled ${garment.label}`,
    version: 1,
    status: 'draft',
    garmentType: garment.id,
    activeView,
    activePanelId: garment.defaultPanelId(activeView),
    views: garment.views.map((view) => ({ id: view.id, label: view.label })),
    panels: garment.panels.map((panel) => ({
      id: panel.id,
      label: panel.label,
      viewId: panel.viewId,
    })),
    safeAreas: garment.panels.flatMap((panel) =>
      panel.safeArea
        ? [
            {
              id: panel.safeArea.id,
              label: panel.safeArea.label,
              panelId: panel.id,
              x: panel.safeArea.x,
              y: panel.safeArea.y,
              width: panel.safeArea.width,
              height: panel.safeArea.height,
            },
          ]
        : [],
    ),
    colors: [{ id: 'body', role: 'body', value: '#e8e4dc' }],
    materials: [],
    elements: [],
    createdAt: now,
    updatedAt: now,
  }
}
