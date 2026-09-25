export {
  canvasRectToLocal,
  elementToCanvasRect,
  getGarmentPanel,
  getPanelsForView,
  localRectToCanvas,
  minLocalSize,
  panelToCanvas,
  toDisplayElement,
} from './coordinates'
export { garmentCapabilities } from './capabilities'
export { defaultConstructionFor } from './constructionDefaults'
export {
  constructionControlsFor,
  controlValue,
  editableConstructionControlIds,
  editableConstructionKinds,
  visibleConstructionControls,
} from './constructionOptions'
export { MATERIAL_CATALOG, VISUAL_FINISHES, getCatalogMaterial, visualFinishCatalog } from './materialCatalog'
export { colorRegionsFor, regionColor } from './colorRegions'
export { garmentExportManifest } from './exportManifest'
export type { ColorRegion } from './colorRegions'
export type { GarmentExportManifest } from './exportManifest'
export { GarmentPicker } from './GarmentPicker'
export { GarmentSelector } from './GarmentSelector'
export {
  AVAILABLE_GARMENTS,
  GARMENT_CATALOG,
  garmentCatalogGroups,
  garmentsInCategory,
  getGarment,
  hasGarment,
  PLANNED_GARMENT_LABELS,
  registerGarment,
  resolveGarmentType,
} from './registry'
export { GarmentRenderer } from './render/GarmentRenderer'
export { PanelGuides } from './render/PanelGuides'
export { hoodieGarment } from './hoodie'
export { jacketGarment } from './jacket'
export { pantsGarment } from './pants'
export { shortsGarment } from './shorts'
export { sweatshirtGarment } from './sweatshirt'
export { tshirtGarment } from './tshirt'
export {
  completeGarment,
  completePanel,
  garmentPreviewView,
  inferPanelSide,
  inferSupportedDesignZones,
  isGarmentDesignZone,
  isPrintablePanel,
  localFromPercent,
  panelDesignBounds,
  panelDesignBoundsLocal,
  panelBleedBounds,
  panelDesignZones,
  panelDisplayLabel,
  panelName,
  percentFromLocal,
} from './model'
export type { GarmentCapabilities } from './capabilities'
export type {
  DesignZoneDefinition,
  GarmentCategory,
  GarmentDefaults,
  GarmentDefinition,
  GarmentDesignZoneId,
  GarmentPanelDefinition,
  GarmentPanelSide,
  GarmentPanelType,
  GarmentPreview,
  GarmentRect,
  GarmentRenderProps,
  GarmentSafeAreaDefinition,
  GarmentViewDefinition,
  PercentRect,
} from './types'
