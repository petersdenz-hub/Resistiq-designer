import { getGarment, resolveGarmentType } from '@/garments/registry'
import { inferSupportedDesignZones } from '@/garments/model'
import { documentChromeFromGarment } from './createDesign'
import { defaultZoneForView, isPlacementZone, type PlacementZone } from './designObjects'
import type { DesignDocument } from './types'

export function documentHasArtwork(document: DesignDocument): boolean {
  return (document.designObjects?.length ?? 0) > 0 || document.elements.length > 0
}

export function canSafelyTransferArtwork(
  document: DesignDocument,
  nextType: string,
): boolean {
  const next = getGarment(nextType)
  const nextPanels = new Set(next.panels.map((panel) => panel.id))
  const nextZones = new Set(inferSupportedDesignZones(next))

  for (const object of document.designObjects ?? []) {
    if (!nextZones.has(object.zone)) {
      return false
    }
    if (object.anchor.space === 'panel' && object.anchor.panelId && !nextPanels.has(object.anchor.panelId)) {
      return false
    }
  }

  for (const element of document.elements) {
    if (!nextPanels.has(element.panelId)) {
      return false
    }
  }

  return true
}

export function garmentSwitchRequiresConfirm(
  document: DesignDocument,
  nextType: string,
): boolean {
  if (resolveGarmentType(document.garmentType) === resolveGarmentType(nextType)) {
    return false
  }
  return documentHasArtwork(document)
}

/**
 * Load another garment definition onto the same Design Document.
 * Artwork is kept as-is and is never remapped or discarded.
 */
export function switchGarment(document: DesignDocument, nextType: string): DesignDocument {
  const garment = getGarment(nextType)
  if (garment.id === resolveGarmentType(document.garmentType) && document.garmentType === garment.id) {
    return document
  }

  const chrome = documentChromeFromGarment(garment)
  const activeView = chrome.views.some((view) => view.id === document.activeView)
    ? document.activeView
    : (chrome.views[0]?.id ?? 'front')
  const zones = inferSupportedDesignZones(garment)
  const currentZone: PlacementZone | undefined = isPlacementZone(document.activeZone)
    ? document.activeZone
    : undefined
  const activeZone =
    currentZone && zones.includes(currentZone)
      ? currentZone
      : (zones[0] ?? defaultZoneForView(activeView))
  const panelStillValid = chrome.panels.some(
    (panel) => panel.id === document.activePanelId && panel.viewId === activeView,
  )

  return {
    ...document,
    garmentType: garment.id,
    views: chrome.views,
    panels: chrome.panels,
    safeAreas: chrome.safeAreas,
    activeView,
    activePanelId: panelStillValid ? document.activePanelId : garment.defaultPanelId(activeView),
    activeZone,
    updatedAt: new Date().toISOString(),
  }
}
