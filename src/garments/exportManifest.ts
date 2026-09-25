import { getDesignObjects } from '@/design/designObjects'
import type { DesignDocument } from '@/design/types'
import { inferSupportedDesignZones, isPrintablePanel, panelDesignBounds, panelDesignZones, panelName } from './model'
import { getGarment } from './registry'
import type { GarmentRect, PercentRect } from './types'

/**
 * Internal export foundation. Describes views, panels, and design zones
 * so a later phase can emit front/back/sleeve/leg artwork without
 * inventing a second document model. Does not write files.
 */
export interface ExportPanel {
  id: string
  name: string
  type: string
  viewId: string
  printable: boolean
  frame: GarmentRect
  designBounds: PercentRect
  designZones: Array<{ id: string; name: string; bounds: PercentRect }>
}

export interface ExportView {
  viewId: string
  label: string
  panels: ExportPanel[]
}

export interface GarmentExportManifest {
  version: 1
  garmentType: string
  views: ExportView[]
  designZones: string[]
  colors: DesignDocument['colors']
  materialId?: string
  construction?: DesignDocument['construction']
  artwork: Array<{
    id: string
    type: string
    zone: string
    panelId?: string
    x: number
    y: number
    width: number
    height: number
    rotation: number
  }>
}

export function garmentExportManifest(document: DesignDocument): GarmentExportManifest {
  const garment = getGarment(document.garmentType)
  return {
    version: 1,
    garmentType: garment.id,
    views: garment.views.map((view) => ({
      viewId: view.id,
      label: view.label,
      panels: garment.panels
        .filter((panel) => panel.viewId === view.id)
        .map((panel) => ({
          id: panel.id,
          name: panelName(panel),
          type: panel.type,
          viewId: panel.viewId,
          printable: isPrintablePanel(panel),
          frame: panel.frame,
          designBounds: panelDesignBounds(panel),
          designZones: panelDesignZones(panel),
        })),
    })),
    designZones: inferSupportedDesignZones(garment),
    colors: document.colors,
    materialId: document.construction?.materialId,
    construction: document.construction,
    artwork: getDesignObjects(document).map((object) => ({
      id: object.id,
      type: object.type,
      zone: object.zone,
      panelId: object.anchor.panelId,
      x: object.x,
      y: object.y,
      width: object.width,
      height: object.height,
      rotation: object.rotation,
    })),
  }
}
