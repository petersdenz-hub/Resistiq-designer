import { getGarment } from '@/garments/registry'
import { panelName } from '@/garments/model'
import type { GarmentDefinition } from '@/garments/types'
import { createId } from './ids'
import type { DesignDocument, DesignPanel, DesignSafeArea, DesignView } from './types'

export function documentChromeFromGarment(garment: GarmentDefinition): {
  views: DesignView[]
  panels: DesignPanel[]
  safeAreas: DesignSafeArea[]
} {
  return {
    views: garment.views.map((view) => ({ id: view.id, label: view.label })),
    panels: garment.panels.map((panel) => ({
      id: panel.id,
      label: panelName(panel),
      viewId: panel.viewId,
      type: panel.type,
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
  }
}

export function createNewDesign(garmentType = 'tshirt'): DesignDocument {
  const garment = getGarment(garmentType)
  const now = new Date().toISOString()
  const activeView = garment.views[0]?.id ?? 'front'
  const chrome = documentChromeFromGarment(garment)

  return {
    id: createId(),
    name: `Untitled ${garment.label}`,
    version: 1,
    status: 'draft',
    garmentType: garment.id,
    activeView,
    activePanelId: garment.defaultPanelId(activeView),
    views: chrome.views,
    panels: chrome.panels,
    safeAreas: chrome.safeAreas,
    colors: [{ id: 'body', role: 'body', value: garment.defaults.bodyColor }],
    materials: [],
    elements: [],
    designObjects: [],
    activeZone: activeView === 'back' ? 'back' : 'front',
    createdAt: now,
    updatedAt: now,
  }
}
