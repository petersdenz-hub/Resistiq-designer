import { getGarment } from '@/garments/registry'
import { inferSupportedDesignZones, panelName } from '@/garments/model'
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

/** Add any panels/safe areas the current garment definition exposes. */
export function mergeDocumentChrome(document: DesignDocument): DesignDocument {
  const garment = getGarment(document.garmentType)
  const chrome = documentChromeFromGarment(garment)
  const havePanels = new Set(document.panels.map((panel) => panel.id))
  const haveSafe = new Set(document.safeAreas.map((area) => area.id))
  const panels = [
    ...document.panels,
    ...chrome.panels.filter((panel) => !havePanels.has(panel.id)),
  ]
  const safeAreas = [
    ...document.safeAreas,
    ...chrome.safeAreas.filter((area) => !haveSafe.has(area.id)),
  ]
  return {
    ...document,
    views: chrome.views,
    panels,
    safeAreas,
  }
}

export function createNewDesign(garmentType = 'tshirt'): DesignDocument {
  const garment = getGarment(garmentType)
  const now = new Date().toISOString()
  const activeView = garment.preview?.viewId ?? garment.views[0]?.id ?? 'front'
  const chrome = documentChromeFromGarment(garment)
  const zones = inferSupportedDesignZones(garment)
  const activeZone = zones.includes(activeView)
    ? activeView
    : (zones[0] ?? (activeView === 'back' ? 'back' : 'front'))

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
    activeZone,
    createdAt: now,
    updatedAt: now,
  }
}
